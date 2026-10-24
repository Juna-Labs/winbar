import { Copy, Check } from 'lucide-react';

export default function ProgrammerConverter({
    baseValues,
    handleBaseChange,
    copyText,
    copiedKey
}) {
    return (
        <div className="flex flex-col gap-2 animate-in fade-in duration-150">
            {/* Decimal */}
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-white/50 tracking-wider">
                    <span>DECIMAL (DEC)</span>
                    <button
                        type="button"
                        onClick={() => copyText(baseValues.dec, 'dec')}
                        className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                        title="Copy Decimal"
                    >
                        {copiedKey === 'dec' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                </div>
                <input
                    type="text"
                    value={baseValues.dec}
                    onChange={(e) => handleBaseChange('dec', e.target.value)}
                    className="bg-transparent font-mono font-bold text-lg text-white outline-none w-full"
                    placeholder="0"
                />
            </div>

            {/* Hexadecimal */}
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-white/50 tracking-wider">
                    <span>HEXADECIMAL (HEX)</span>
                    <button
                        type="button"
                        onClick={() => copyText('0x' + baseValues.hex, 'hex')}
                        className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                        title="Copy Hexadecimal"
                    >
                        {copiedKey === 'hex' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold opacity-40">0x</span>
                    <input
                        type="text"
                        value={baseValues.hex}
                        onChange={(e) => handleBaseChange('hex', e.target.value)}
                        className="bg-transparent font-mono font-bold text-lg text-white outline-none w-full uppercase"
                        placeholder="0"
                    />
                </div>
            </div>

            {/* Binary */}
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-white/50 tracking-wider">
                    <span>BINARY (BIN)</span>
                    <button
                        type="button"
                        onClick={() => copyText(baseValues.rawBin, 'bin')}
                        className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                        title="Copy Binary"
                    >
                        {copiedKey === 'bin' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                </div>
                <input
                    type="text"
                    value={baseValues.bin}
                    onChange={(e) => handleBaseChange('bin', e.target.value)}
                    className="bg-transparent font-mono font-semibold text-sm text-cyan-300 outline-none w-full tracking-wider"
                    placeholder="0000"
                />
            </div>

            {/* Octal */}
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-white/50 tracking-wider">
                    <span>OCTAL (OCT)</span>
                    <button
                        type="button"
                        onClick={() => copyText(baseValues.oct, 'oct')}
                        className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                        title="Copy Octal"
                    >
                        {copiedKey === 'oct' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold opacity-40">0o</span>
                    <input
                        type="text"
                        value={baseValues.oct}
                        onChange={(e) => handleBaseChange('oct', e.target.value)}
                        className="bg-transparent font-mono font-bold text-lg text-white outline-none w-full"
                        placeholder="0"
                    />
                </div>
            </div>
        </div>
    );
}
