import { Sun } from 'lucide-react';

export default function BrightnessControl({ brightness, onBrightnessChange }) {
    return (
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
            <Sun
                size={20}
                className="text-widget-active shrink-0"
                style={{ color: 'var(--color-widget-active)' }}
            />
            <div className="flex flex-1 gap-1 h-2 items-center">
                {[...Array(10)].map((_, i) => {
                    const level = (i + 1) * 10;
                    const isActive = brightness >= level - 5;
                    return (
                        <div
                            key={level}
                            onClick={() => onBrightnessChange(level)}
                            className={`flex-1 h-full rounded-sm cursor-pointer transition-all ${
                                isActive ? 'bg-widget-active hover:bg-widget-active-hover' : 'bg-white/20 hover:bg-white/40'
                            }`}
                            style={isActive ? { backgroundColor: 'var(--color-widget-active)' } : {}}
                        />
                    );
                })}
            </div>
            <span className="text-xs font-bold w-8 text-right shrink-0">{brightness}%</span>
        </div>
    );
}
