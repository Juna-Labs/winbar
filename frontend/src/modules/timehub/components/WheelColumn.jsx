import { ChevronUp, ChevronDown } from 'lucide-react';

export default function WheelColumn({ value, min = 0, max = 59, label, onChange }) {
    const range = max - min + 1;
    const prevValue = (value - 1 - min + range) % range + min;
    const nextValue = (value + 1 - min) % range + min;

    const handleWheel = (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            // Mouse wheel up -> increment
            onChange((value + 1 - min) % range + min);
        } else if (e.deltaY > 0) {
            // Mouse wheel down -> decrement
            onChange((value - 1 - min + range) % range + min);
        }
    };

    const stepUp = () => onChange((value + 1 - min) % range + min);
    const stepDown = () => onChange((value - 1 - min + range) % range + min);

    return (
        <div
            onWheel={handleWheel}
            className="flex flex-col items-center select-none w-16 py-1 px-1 rounded-xl bg-black/20 border border-white/5 hover:border-white/15 transition-all group"
        >
            {/* Top Chevron Up */}
            <button
                type="button"
                onClick={stepUp}
                className="text-white/30 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                title={`Increase ${label}`}
            >
                <ChevronUp size={16} />
            </button>

            {/* Upper number (Bigger / Next) */}
            <div
                onClick={stepUp}
                className="text-white/30 hover:text-white/70 font-mono text-sm py-0.5 cursor-pointer transition-colors"
                title={`Click to set ${nextValue.toString().padStart(2, '0')}`}
            >
                {nextValue.toString().padStart(2, '0')}
            </div>

            {/* Current Active Selected Number */}
            <div
                className="my-1 py-1 px-2.5 rounded-lg border font-mono text-2xl font-black tracking-tight text-white transition-all shadow-md"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'var(--color-widget-active)',
                    color: 'var(--color-widget-text)',
                    boxShadow: '0 0 14px rgba(9, 119, 147, 0.35)'
                }}
            >
                {value.toString().padStart(2, '0')}
            </div>

            {/* Lower number (Smaller / Previous) */}
            <div
                onClick={stepDown}
                className="text-white/30 hover:text-white/70 font-mono text-sm py-0.5 cursor-pointer transition-colors"
                title={`Click to set ${prevValue.toString().padStart(2, '0')}`}
            >
                {prevValue.toString().padStart(2, '0')}
            </div>

            {/* Bottom Chevron Down */}
            <button
                type="button"
                onClick={stepDown}
                className="text-white/30 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                title={`Decrease ${label}`}
            >
                <ChevronDown size={16} />
            </button>

            {/* Column Label */}
            <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider mt-1">
                {label}
            </span>
        </div>
    );
}
