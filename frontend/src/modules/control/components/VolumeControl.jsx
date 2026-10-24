import { Volume2, VolumeX } from 'lucide-react';

export default function VolumeControl({ volume, onVolumeChange }) {
    return (
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
            {volume === 0 ? (
                <VolumeX size={20} className="text-white/40" />
            ) : (
                <Volume2
                    size={20}
                    className="text-widget-active"
                    style={{ color: 'var(--color-widget-active)' }}
                />
            )}
            <input
                type="range"
                min="0" max="100"
                value={volume}
                onChange={onVolumeChange}
                className="w-full accent-widget-active h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: 'var(--color-widget-active)' }}
            />
            <span className="text-xs font-bold w-8 text-right">{volume}%</span>
        </div>
    );
}
