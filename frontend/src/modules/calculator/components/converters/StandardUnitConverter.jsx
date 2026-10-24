import { ArrowLeftRight, Copy, Check } from 'lucide-react';

export default function StandardUnitConverter({
    unitDefinition,
    fromValue,
    setFromValue,
    fromUnit,
    setFromUnit,
    toUnit,
    setToUnit,
    convertedUnitValue,
    quickGrid = [],
    swapUnits,
    copyText,
    copiedKey
}) {
    if (!unitDefinition) return null;

    return (
        <div className="flex flex-col gap-2 animate-in fade-in duration-150">
            {/* FROM CARD */}
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex flex-col gap-1.5 shadow-inner">
                <div className="flex items-center justify-between text-[11px] font-bold text-white/50 uppercase tracking-wider px-0.5">
                    <span>From</span>
                </div>

                <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 focus:border-widget-active rounded-lg px-2.5 py-1.5 font-bold text-xs text-white outline-none cursor-pointer"
                >
                    {unitDefinition.units.map(u => (
                        <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                            {u.label}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-widget-active rounded-lg px-3 py-1.5 font-mono text-2xl font-bold text-white outline-none"
                    placeholder="0"
                />
            </div>

            {/* SWAP BUTTON */}
            <div className="flex justify-center -my-0.5">
                <button
                    type="button"
                    onClick={swapUnits}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:rotate-180 cursor-pointer border border-white/10 hover:border-white/25 shadow-sm"
                    title="Swap Units"
                >
                    <ArrowLeftRight size={13} />
                </button>
            </div>

            {/* TO CARD */}
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex flex-col gap-1.5 shadow-inner">
                <div className="flex items-center justify-between text-[11px] font-bold text-white/50 uppercase tracking-wider px-0.5">
                    <span>To</span>
                </div>

                <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 focus:border-widget-active rounded-lg px-2.5 py-1.5 font-bold text-xs text-white outline-none cursor-pointer"
                >
                    {unitDefinition.units.map(u => (
                        <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                            {u.label}
                        </option>
                    ))}
                </select>

                <div className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-white truncate mr-2">
                        {convertedUnitValue}
                    </span>
                    <button
                        type="button"
                        onClick={() => copyText(convertedUnitValue, 'unit')}
                        className="p-1 text-white/60 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                        title="Copy converted value"
                    >
                        {copiedKey === 'unit' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            {/* Quick Reference Table for all units in this category */}
            <div className="rounded-xl bg-black/20 border border-white/10 p-2.5 flex flex-col gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">All Equivalents</span>
                <div className="flex flex-col gap-1">
                    {quickGrid.map(item => (
                        <div
                            key={item.id}
                            onClick={() => copyText(item.val, item.id)}
                            className="flex items-center justify-between px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 cursor-pointer transition-colors text-xs font-mono"
                            title="Click to copy"
                        >
                            <span className="text-white/60">{item.label}</span>
                            <div className="flex items-center gap-1.5 font-bold text-white">
                                <span>{item.val}</span>
                                {copiedKey === item.id ? (
                                    <Check size={11} className="text-emerald-400" />
                                ) : (
                                    <Copy size={11} className="opacity-30 hover:opacity-100" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
