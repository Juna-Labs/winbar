import { useState } from 'react';
import { Settings, Check } from 'lucide-react';

const REFRESH_OPTIONS = [
    { label: 'Realtime (1s)', value: 1000 },
    { label: '5s', value: 5000 },
    { label: '10s', value: 10000 },
    { label: '30s', value: 30000 },
    { label: '1m', value: 60000 },
    { label: '5m', value: 300000 },
];

export default function SysInfoHeader({ refreshRate, setRefreshRate }) {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">System Resources</h2>
                <div className="relative">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                        <Settings size={18} />
                    </button>
                    {showSettings && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-top-2">
                            {REFRESH_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        setRefreshRate(opt.value);
                                        setShowSettings(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-white/10 transition-colors"
                                >
                                    <span
                                        className={refreshRate === opt.value ? "text-widget-active font-medium" : "text-white/80"}
                                        style={refreshRate === opt.value ? { color: 'var(--color-widget-active)' } : {}}
                                    >
                                        {opt.label}
                                    </span>
                                    {refreshRate === opt.value && (
                                        <Check
                                            size={14}
                                            className="text-widget-active"
                                            style={{ color: 'var(--color-widget-active)' }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {showSettings && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSettings(false)}
                />
            )}
        </>
    );
}
