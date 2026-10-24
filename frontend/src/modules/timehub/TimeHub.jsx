import { Volume2, VolumeX, AlertCircle } from 'lucide-react';
import useTimeHub from './hooks/useTimeHub';
import TimerView from './components/TimerView';
import StopwatchView from './components/StopwatchView';
import AlarmView from './components/AlarmView';

export default function TimeHub() {
    const {
        activeTab,
        setActiveTab,
        soundEnabled,
        toggleSound,
        tabs,
        timer,
        stopwatch,
        alarms,
        ringingAlarm,
        handleDismissAlarm,
        handleSnoozeAlarm
    } = useTimeHub();

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
                        onClick={toggleSound}
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

            {/* Sub-view Container (Keep mounted to preserve state across tab switches, fully driven by useTimeHub props) */}
            <div className="flex-1 overflow-hidden flex flex-col relative border-l border-white/10">
                <div className={`flex-1 flex flex-col ${activeTab === 'timer' ? '' : 'hidden'}`}>
                    <TimerView {...timer} />
                </div>
                <div className={`flex-1 flex flex-col ${activeTab === 'stopwatch' ? '' : 'hidden'}`}>
                    <StopwatchView {...stopwatch} />
                </div>
                <div className={`flex-1 flex flex-col ${activeTab === 'alarm' ? '' : 'hidden'}`}>
                    <AlarmView {...alarms} />
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
