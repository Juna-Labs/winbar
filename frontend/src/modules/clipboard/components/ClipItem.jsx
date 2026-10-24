import { Copy, Check, Trash2, Type, Image as ImageIcon } from 'lucide-react';

function formatTimeAgo(timestamp) {
    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsed < 30) return 'just now';
    if (elapsed < 60) return `${elapsed}s ago`;
    const mins = Math.floor(elapsed / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function ClipItem({ clip, isCopied, onCopy, onDelete }) {
    const isText = clip.type === 'text';
    const lines = isText ? clip.content.split('\n').length : 0;

    return (
        <div
            className={`group relative p-2.5 rounded-xl bg-black/25 hover:bg-black/40 border transition-all duration-150 flex flex-col gap-2 shadow-sm ${
                isCopied
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-white/10 hover:border-white/25'
            }`}
        >
            {/* Top Row: Type Badge, Stats, Time & Actions */}
            <div className="flex items-center justify-between text-[11px] text-white/50">
                <div className="flex items-center gap-1.5 font-medium">
                    {isText ? (
                        <>
                            <Type size={12} className="text-white/60" />
                            <span className="uppercase tracking-wider font-bold text-[10px] text-white/70">
                                Text
                            </span>
                            <span className="text-white/30">•</span>
                            <span>{clip.charCount || clip.content.length} chars</span>
                            {lines > 1 && (
                                <>
                                    <span className="text-white/30">•</span>
                                    <span>{lines} lines</span>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <ImageIcon size={12} style={{ color: 'var(--color-widget-active)' }} />
                            <span
                                className="uppercase tracking-wider font-bold text-[10px]"
                                style={{ color: 'var(--color-widget-active)' }}
                            >
                                Image
                            </span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-white/40 mr-1">
                        {formatTimeAgo(clip.timestamp)}
                    </span>

                    {/* Copy Button */}
                    <button
                        type="button"
                        onClick={() => onCopy(clip)}
                        className={`p-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                            isCopied
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'hover:bg-white/15 text-white/60 hover:text-white'
                        }`}
                        title="Copy to clipboard"
                    >
                        {isCopied ? (
                            <>
                                <Check size={13} className="text-emerald-400" />
                                <span className="text-[10px] font-bold text-emerald-400">Copied!</span>
                            </>
                        ) : (
                            <Copy size={13} />
                        )}
                    </button>

                    {/* Delete Button */}
                    <button
                        type="button"
                        onClick={() => onDelete(clip.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete item"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {/* Content Preview */}
            {isText ? (
                <div
                    onClick={() => onCopy(clip)}
                    className="font-mono text-xs text-white/90 bg-black/20 p-2 rounded-lg border border-white/5 line-clamp-3 whitespace-pre-wrap wrap-break-word cursor-pointer hover:border-white/15 transition-colors select-text"
                    title="Click to copy"
                >
                    {clip.content}
                </div>
            ) : (
                <div
                    onClick={() => onCopy(clip)}
                    className="relative flex items-center justify-center p-1.5 rounded-lg bg-black/30 border border-white/5 cursor-pointer hover:border-white/20 transition-all overflow-hidden max-h-36"
                    title="Click to copy image"
                >
                    <img
                        src={clip.content}
                        alt="Clipboard capture"
                        className="max-h-32 max-w-full object-contain rounded"
                    />
                </div>
            )}
        </div>
    );
}
