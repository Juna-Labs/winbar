import { ClipboardList, Trash2, RefreshCw, Search, X } from 'lucide-react';
import useClipboard from './hooks/useClipboard';
import ClipItem from './components/ClipItem';

export default function Clipboard() {
    const {
        clips,
        totalCount,
        imageCount,
        maxTotal,
        maxImages,
        copiedId,
        searchQuery,
        setSearchQuery,
        copyClip,
        deleteClip,
        clearAllClips,
        syncClipboard
    } = useClipboard();

    return (
        <div
            className="flex flex-col text-white pointer-events-auto resize overflow-hidden relative shadow-2xl select-none"
            style={{
                width: '360px',
                height: '480px',
                minWidth: '320px',
                minHeight: '350px',
                backgroundColor: 'rgba(8, 16, 39, 0.95)',
                backdropFilter: 'blur(20px)'
            }}
        >
            <style>{`
                .scrollable::-webkit-scrollbar { width: 6px; }
                .scrollable::-webkit-scrollbar-track { background: transparent; }
                .scrollable::-webkit-scrollbar-thumb { background: var(--color-widget); border-radius: 10px; }
            `}</style>

            {/* Top Module Header */}
            <div className="flex items-center justify-between p-2.5 mx-1 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 ml-1">
                    <ClipboardList size={18} style={{ color: 'var(--color-widget-active)' }} />
                    <span className="font-serif font-bold text-base text-white tracking-wide">Clipboard</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                        {totalCount}/{maxTotal}
                        {imageCount > 0 && ` • ${imageCount}/${maxImages} 🖼️`}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Manual Sync Button */}
                    <button
                        type="button"
                        onClick={syncClipboard}
                        className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                        title="Sync / Read system clipboard"
                    >
                        <RefreshCw size={14} />
                    </button>

                    {/* Clear All Button */}
                    {totalCount > 0 && (
                        <button
                            type="button"
                            onClick={clearAllClips}
                            className="p-1.5 rounded hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors cursor-pointer"
                            title="Clear clipboard history"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Search Bar (Shown when history has items) */}
            {totalCount > 3 && (
                <div className="px-3 pt-2 shrink-0">
                    <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg px-2.5 py-1 text-xs">
                        <Search size={13} className="text-white/40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter copied text..."
                            className="bg-transparent text-white outline-none w-full placeholder:text-white/30"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="text-white/40 hover:text-white cursor-pointer"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Scrollable Clips List */}
            <div className="flex-1 overflow-y-auto scrollable p-3 flex flex-col gap-2 min-h-0">
                {clips.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/40">
                        <ClipboardList size={38} className="mb-2 opacity-30 stroke-1" />
                        <p className="text-sm font-semibold text-white/60">Clipboard is empty</p>
                        <p className="text-xs text-white/35 mt-1 max-w-50">
                            {searchQuery ? 'No items match your search' : 'Recently copied text and images will appear here'}
                        </p>
                    </div>
                ) : (
                    clips.map((clip) => (
                        <ClipItem
                            key={clip.id}
                            clip={clip}
                            isCopied={copiedId === clip.id}
                            onCopy={copyClip}
                            onDelete={deleteClip}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
