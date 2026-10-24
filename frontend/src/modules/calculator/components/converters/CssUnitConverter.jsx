import { Copy, Check } from 'lucide-react';

const COMMON_CSS_SIZES = [
    { px: 8, rem: '0.5' },
    { px: 12, rem: '0.75' },
    { px: 14, rem: '0.875' },
    { px: 16, rem: '1' },
    { px: 20, rem: '1.25' },
    { px: 24, rem: '1.5' },
    { px: 32, rem: '2' },
    { px: 48, rem: '3' }
];

export default function CssUnitConverter({
    cssPx,
    setCssPx,
    cssRoot,
    setCssRoot,
    cssRem,
    handleRemChange,
    copyText,
    copiedKey
}) {
    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
            {/* Root Font Size Setting */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/10 text-xs">
                <span className="text-white/60 font-medium">Root Font Size:</span>
                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        value={cssRoot}
                        onChange={(e) => setCssRoot(e.target.value)}
                        className="w-14 bg-white/10 rounded px-1.5 py-0.5 font-mono text-center text-white outline-none"
                    />
                    <span className="text-white/50 text-xs font-mono">px</span>
                </div>
            </div>

            {/* Stacked Inputs: Pixels on top, REM below */}
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">PIXELS (PX)</span>
                <input
                    type="number"
                    value={cssPx}
                    onChange={(e) => setCssPx(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-widget-active rounded-lg px-3 py-1.5 font-mono font-bold text-2xl text-white outline-none"
                    placeholder="16"
                />
            </div>

            <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-white/50 uppercase tracking-wider">
                    <span>REM</span>
                    <button
                        type="button"
                        onClick={() => copyText(cssRem, 'css')}
                        className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                        title="Copy REM"
                    >
                        {copiedKey === 'css' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                </div>
                <input
                    type="number"
                    step="0.125"
                    value={cssRem}
                    onChange={(e) => handleRemChange(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 focus:border-widget-active rounded-lg px-3 py-1.5 font-mono font-bold text-2xl text-white outline-none"
                    placeholder="1"
                />
            </div>

            {/* Quick Reference Table for Common CSS Sizes */}
            <div className="rounded-xl bg-black/20 border border-white/10 p-2.5 flex flex-col gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Quick Reference</span>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono text-center">
                    {COMMON_CSS_SIZES.map(item => (
                        <div
                            key={item.px}
                            onClick={() => setCssPx(item.px.toString())}
                            className="p-1 rounded bg-white/5 hover:bg-white/15 cursor-pointer transition-colors border border-white/5 flex flex-col"
                        >
                            <span className="text-white/60 text-[10px]">{item.px}px</span>
                            <span className="font-bold text-white">{item.rem}rem</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
