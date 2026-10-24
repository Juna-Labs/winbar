import { ArrowLeftRight, Copy, Check } from 'lucide-react';

export default function TemperatureConverter({
    tempValue,
    setTempValue,
    tempFrom,
    setTempFrom,
    tempTo,
    setTempTo,
    convertedTemp,
    swapUnits,
    copyText,
    copiedKey
}) {
    return (
        <div className="flex flex-col gap-2 animate-in fade-in duration-150">
            {/* FROM TEMP */}
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex flex-col gap-1.5 shadow-inner">
                <div className="flex items-center justify-between text-[11px] font-bold text-white/50 uppercase tracking-wider px-0.5">
                    <span>From</span>
                </div>

                <select
                    value={tempFrom}
                    onChange={(e) => setTempFrom(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 focus:border-widget-active rounded-lg px-2.5 py-1.5 font-bold text-xs text-white outline-none cursor-pointer"
                >
                    <option value="C" className="bg-slate-900 text-white">°C (Celsius)</option>
                    <option value="F" className="bg-slate-900 text-white">°F (Fahrenheit)</option>
                    <option value="K" className="bg-slate-900 text-white">K (Kelvin)</option>
                </select>

                <input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
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

            {/* TO TEMP */}
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex flex-col gap-1.5 shadow-inner">
                <div className="flex items-center justify-between text-[11px] font-bold text-white/50 uppercase tracking-wider px-0.5">
                    <span>To</span>
                </div>

                <select
                    value={tempTo}
                    onChange={(e) => setTempTo(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 focus:border-widget-active rounded-lg px-2.5 py-1.5 font-bold text-xs text-white outline-none cursor-pointer"
                >
                    <option value="C" className="bg-slate-900 text-white">°C (Celsius)</option>
                    <option value="F" className="bg-slate-900 text-white">°F (Fahrenheit)</option>
                    <option value="K" className="bg-slate-900 text-white">K (Kelvin)</option>
                </select>

                <div className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-white truncate mr-2">
                        {convertedTemp}
                    </span>
                    <button
                        type="button"
                        onClick={() => copyText(convertedTemp, 'temp')}
                        className="p-1 text-white/60 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                        title="Copy converted value"
                    >
                        {copiedKey === 'temp' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            {/* Key Reference Points */}
            <div className="rounded-xl bg-black/20 border border-white/10 p-2.5 flex flex-col gap-1.5 text-xs mt-1">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Key Reference Points</span>
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                    <div className="p-1.5 rounded bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40">Freezing</div>
                        <div className="font-bold text-white">0°C / 32°F</div>
                    </div>
                    <div className="p-1.5 rounded bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40">Room Temp</div>
                        <div className="font-bold text-white">21°C / 70°F</div>
                    </div>
                    <div className="p-1.5 rounded bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40">Boiling</div>
                        <div className="font-bold text-white">100°C / 212°F</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
