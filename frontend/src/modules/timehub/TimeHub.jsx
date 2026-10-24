import { useState, useEffect, useRef } from 'react';
import { Timer, Watch, Bell, Volume2, VolumeX, AlertCircle, Check, Clock } from 'lucide-react';
import TimerView from './components/TimerView';
import StopwatchView from './components/StopwatchView';
import AlarmView from './components/AlarmView';
import { startAlarmChime, stopAlarmChime } from './utils/sound';

export default function TimeHub() {
    const [activeTab, setActiveTab] = useState('timer'); // 'timer' | 'stopwatch' | 'alarm'
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [ringingAlarm, setRingingAlarm] = useState(null);

    const lastTriggeredMinuteRef = useRef('');

    // Background Alarm Monitor
    useEffect(() => {
        const checkAlarms = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const currentTimeStr = `${hours}:${minutes}`;
            const currentDay = now.getDay(); // 0 is Sunday, 6 is Saturday

            if (lastTriggeredMinuteRef.current === currentTimeStr) {
                return;
            }

            try {
                const saved = localStorage.getItem('timehub_alarms');
                if (!saved) return;
                const alarms = JSON.parse(saved);

                const triggered = alarms.find(a => {
                    if (!a.enabled || a.time !== currentTimeStr) return false;

                    if (a.repeat === 'weekdays' && (currentDay === 0 || currentDay === 6)) {
                        return false;
                    }
                    return true;
                });

                if (triggered) {
                    lastTriggeredMinuteRef.current = currentTimeStr;
                    setRingingAlarm(triggered);
                    if (soundEnabled) {
                        startAlarmChime();
                    }
                }
            } catch (e) {
                console.error("Alarm check error", e);
            }
        };

        const interval = setInterval(checkAlarms, 1000);
        return () => {
            clearInterval(interval);
            stopAlarmChime();
        };
    }, [soundEnabled]);

    const handleDismissAlarm = () => {
        stopAlarmChime();
        // If it was a 'once' alarm, disable it
        if (ringingAlarm && ringingAlarm.repeat === 'once') {
            try {
                const saved = localStorage.getItem('timehub_alarms');
                if (saved) {
                    const alarms = JSON.parse(saved);
                    const updated = alarms.map(a => a.id === ringingAlarm.id ? { ...a, enabled: false } : a);
                    localStorage.setItem('timehub_alarms', JSON.stringify(updated));
                }
            } catch (e) { }
        }
        setRingingAlarm(null);
    };

    const handleSnoozeAlarm = () => {
        stopAlarmChime();
        setRingingAlarm(null);

        // Schedule snooze 5 minutes from now
        const now = new Date(Date.now() + 5 * 60 * 1000);
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const snoozeTime = `${hours}:${minutes}`;

        try {
            const saved = localStorage.getItem('timehub_alarms');
            const alarms = saved ? JSON.parse(saved) : [];
            const snoozeAlarm = {
                id: `snooze-${Date.now()}`,
                time: snoozeTime,
                label: `(Snoozed) ${ringingAlarm?.label || 'Alarm'}`,
                enabled: true,
                repeat: 'once'
            };
            localStorage.setItem('timehub_alarms', JSON.stringify([...alarms, snoozeAlarm]));
        } catch (e) { }
    };

    const tabs = [
        { id: 'timer', label: 'Timer', icon: Timer },
        { id: 'stopwatch', label: 'Stopwatch', icon: Watch },
        { id: 'alarm', label: 'Alarm', icon: Bell },
    ];

    return (
        <div
            className="flex flex-col text-white pointer-events-auto resize overflow-hidden relative shadow-2xl"
            style={{
                width: '380px',
                height: '490px',
                minWidth: '340px',
                minHeight: '420px',
                backgroundColor: 'rgba(8, 16, 39, 0.95)',
                backdropFilter: 'blur(20px)'
            }}
        >
            {/* Top Module Header */}
            <div className="flex items-center justify-between p-2.5 mx-1 mt-0">
                <div className="flex items-center gap-2 ml-2">
                    <span className="font-serif font-bold text-lg text-white">Time Hub</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Sound Mute/Unmute Toggle */}
                    <button
                        onClick={() => {
                            if (soundEnabled) stopAlarmChime();
                            setSoundEnabled(!soundEnabled);
                        }}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                            soundEnabled ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-red-400/80 hover:bg-red-500/10'
                        }`}
                        title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
                    >
                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                </div>
            </div>

            {/* Active Alarm Ringing Alert Banner */}
            {ringingAlarm && (
                <div
                    className="mx-2 mt-2 p-2.5 rounded-lg border flex items-center justify-between animate-bounce z-50 shadow-lg"
                    style={{
                        backgroundColor: 'var(--color-widget-active)',
                        borderColor: 'var(--color-widget-active-hover)',
                        color: 'var(--color-widget-text)'
                    }}
                >
                    <div className="flex items-center gap-2">
                        <AlertCircle size={18} className="animate-pulse" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold leading-tight uppercase tracking-wider">Alarm Ringing!</span>
                            <span className="text-xs opacity-90 truncate max-w-35">{ringingAlarm.label}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleSnoozeAlarm}
                            className="px-2 py-1 rounded text-xs font-semibold bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                        >
                            +5m
                        </button>
                        <button
                            onClick={handleDismissAlarm}
                            className="px-2.5 py-1 rounded text-xs font-bold bg-white text-black hover:bg-white/90 transition-colors shadow cursor-pointer"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex px-3 pt-2 gap-1.5 border-b border-white/10 bg-white/5">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex-1 py-1.5 px-2 rounded-t font-serif text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-b-2 cursor-pointer"
                            style={{
                                borderBottomColor: isActive ? 'var(--color-widget-active)' : 'transparent',
                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                color: isActive ? 'var(--color-widget-text)' : 'rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            <Icon
                                size={14}
                                style={{
                                    color: isActive ? 'var(--color-widget-active)' : 'currentColor'
                                }}
                            />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Active Sub-view Container (Keep mounted to preserve state/timers) */}
            <div className="flex-1 overflow-hidden flex flex-col relative border-l border-white/10">
                <div className={`flex-1 flex flex-col ${activeTab === 'timer' ? '' : 'hidden'}`}>
                    <TimerView soundEnabled={soundEnabled} />
                </div>
                <div className={`flex-1 flex flex-col ${activeTab === 'stopwatch' ? '' : 'hidden'}`}>
                    <StopwatchView />
                </div>
                <div className={`flex-1 flex flex-col ${activeTab === 'alarm' ? '' : 'hidden'}`}>
                    <AlarmView />
                </div>
            </div>

            {/* Resizing grip indicator */}
            <div
                className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 pointer-events-none rounded-br-sm z-50 opacity-40"
                style={{ borderColor: 'var(--color-widget-active)' }}
            />
        </div>
    );
}
