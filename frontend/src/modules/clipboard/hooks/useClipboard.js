import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'winbar_clipboard_history';
const MAX_TOTAL_ITEMS = 20;
const MAX_IMAGE_ITEMS = 5;

// Helper to convert Blob to base64 Data URL
function blobToDataUrl(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
    });
}

export default function useClipboard() {
    const [clips, setClips] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to parse clipboard history:', e);
            return [];
        }
    });

    const [copiedId, setCopiedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const lastCheckedRef = useRef(null);

    // Persist to localStorage whenever clips change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(clips));
        } catch (e) {
            console.error('Failed to save clipboard history:', e);
        }
    }, [clips]);

    // Add clip enforcing limits (max 20 total, max 5 images)
    const addClip = useCallback(({ type, content, charCount }) => {
        if (!content) return;

        setClips((prev) => {
            // Avoid adding if identical to the latest item
            if (prev.length > 0 && prev[0].content === content) {
                return prev;
            }

            // Remove any older duplicate so it moves to top
            let filtered = prev.filter((item) => item.content !== content);

            // If new item is an image, enforce image cap (max 5)
            if (type === 'image') {
                const currentImages = filtered.filter((i) => i.type === 'image');
                if (currentImages.length >= MAX_IMAGE_ITEMS) {
                    // Find the oldest image (last occurrence) and remove it
                    const oldestImg = currentImages[currentImages.length - 1];
                    filtered = filtered.filter((item) => item.id !== oldestImg.id);
                }
            }

            const newClip = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type,
                content,
                timestamp: Date.now(),
                charCount: charCount !== undefined ? charCount : (type === 'text' ? content.length : 0)
            };

            const updated = [newClip, ...filtered];

            // Enforce total max items limit (max 20)
            if (updated.length > MAX_TOTAL_ITEMS) {
                return updated.slice(0, MAX_TOTAL_ITEMS);
            }

            return updated;
        });
    }, []);

    // Read current system clipboard
    const readSystemClipboard = useCallback(async () => {
        if (!navigator.clipboard) return;

        try {
            // 1. Try modern navigator.clipboard.read() for rich items (images + text)
            if (typeof navigator.clipboard.read === 'function') {
                const items = await navigator.clipboard.read();
                for (const item of items) {
                    // Check for image types first
                    const imageType = item.types.find((t) => t.startsWith('image/'));
                    if (imageType) {
                        const blob = await item.getType(imageType);
                        const dataUrl = await blobToDataUrl(blob);
                        if (dataUrl && dataUrl !== lastCheckedRef.current) {
                            lastCheckedRef.current = dataUrl;
                            addClip({ type: 'image', content: dataUrl });
                            return;
                        }
                    }

                    // Check for plain text
                    if (item.types.includes('text/plain')) {
                        const blob = await item.getType('text/plain');
                        const text = await blob.text();
                        if (text && text.trim().length > 0 && text !== lastCheckedRef.current) {
                            lastCheckedRef.current = text;
                            addClip({ type: 'text', content: text, charCount: text.length });
                            return;
                        }
                    }
                }
            }
        } catch {
            // If .read() is blocked or rejected, fallback to readText()
            try {
                const text = await navigator.clipboard.readText();
                if (text && text.trim().length > 0 && text !== lastCheckedRef.current) {
                    lastCheckedRef.current = text;
                    addClip({ type: 'text', content: text, charCount: text.length });
                }
            } catch {
                // If browser clipboard is denied, try Wails runtime fallback
                if (window.runtime && window.runtime.ClipboardGetText) {
                    try {
                        const text = await window.runtime.ClipboardGetText();
                        if (text && text.trim().length > 0 && text !== lastCheckedRef.current) {
                            lastCheckedRef.current = text;
                            addClip({ type: 'text', content: text, charCount: text.length });
                        }
                    } catch {
                        // ignore
                    }
                }
            }
        }
    }, [addClip]);

    // Copy item back to system clipboard
    const copyClip = useCallback(async (clip) => {
        try {
            if (clip.type === 'text') {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(clip.content);
                } else if (window.runtime?.ClipboardSetText) {
                    await window.runtime.ClipboardSetText(clip.content);
                }
            } else if (clip.type === 'image') {
                const res = await fetch(clip.content);
                const blob = await res.blob();
                if (navigator.clipboard?.write) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ [blob.type || 'image/png']: blob })
                    ]);
                }
            }
            lastCheckedRef.current = clip.content;
            setCopiedId(clip.id);
            setTimeout(() => setCopiedId(null), 1500);
        } catch (e) {
            console.error('Failed to copy clip to clipboard:', e);
        }
    }, []);

    // Delete single clip
    const deleteClip = useCallback((id) => {
        setClips((prev) => prev.filter((c) => c.id !== id));
    }, []);

    // Clear all clips
    const clearAllClips = useCallback(() => {
        setClips([]);
        lastCheckedRef.current = null;
    }, []);

    // Periodic check and event listeners
    useEffect(() => {
        // Initial check on mount
        readSystemClipboard();

        // Check on window focus
        const handleFocus = () => {
            readSystemClipboard();
        };

        // Capture paste events in window
        const handlePaste = async (e) => {
            if (e.clipboardData) {
                const items = e.clipboardData.items;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.startsWith('image/')) {
                        const file = items[i].getAsFile();
                        if (file) {
                            const dataUrl = await blobToDataUrl(file);
                            if (dataUrl) {
                                lastCheckedRef.current = dataUrl;
                                addClip({ type: 'image', content: dataUrl });
                                return;
                            }
                        }
                    }
                }
                const text = e.clipboardData.getData('text');
                if (text && text.trim().length > 0) {
                    lastCheckedRef.current = text;
                    addClip({ type: 'text', content: text, charCount: text.length });
                }
            }
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('paste', handlePaste);

        // Polling interval when focused
        const interval = setInterval(() => {
            if (document.hasFocus()) {
                readSystemClipboard();
            }
        }, 1500);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('paste', handlePaste);
            clearInterval(interval);
        };
    }, [readSystemClipboard, addClip]);

    // Computed counts
    const totalCount = clips.length;
    const imageCount = clips.filter((c) => c.type === 'image').length;

    // Filtered clips
    const filteredClips = clips.filter((clip) => {
        if (!searchQuery) return true;
        if (clip.type === 'text') {
            return clip.content.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
    });

    return {
        clips: filteredClips,
        totalCount,
        imageCount,
        maxTotal: MAX_TOTAL_ITEMS,
        maxImages: MAX_IMAGE_ITEMS,
        copiedId,
        searchQuery,
        setSearchQuery,
        copyClip,
        deleteClip,
        clearAllClips,
        syncClipboard: readSystemClipboard
    };
}
