import { useState } from 'react';
import { Timer, Watch, Bell } from 'lucide-react';
import { useTimer } from './useTimer';
import { useStopwatch } from './useStopwatch';
import { useAlarms } from './useAlarms';

export default function useTimeHub() {
    const [activeTab, setActiveTab] = useState('timer'); // 'timer' | 'stopwatch' | 'alarm'
    const [soundEnabled, setSoundEnabled] = useState(true);

    const timer = useTimer({ soundEnabled });
    const stopwatch = useStopwatch();
    const alarms = useAlarms({ soundEnabled });

    const toggleSound = () => {
        if (soundEnabled) {
            alarms.stopAlarmSound();
        }
        setSoundEnabled(prev => !prev);
    };

    const tabs = [
        { id: 'timer', label: 'Timer', icon: Timer },
        { id: 'stopwatch', label: 'Stopwatch', icon: Watch },
        { id: 'alarm', label: 'Alarm', icon: Bell },
    ];

    return {
        // Module Shell State
        activeTab,
        setActiveTab,
        soundEnabled,
        toggleSound,
        tabs,

        // Sub-hook states & actions
        timer,
        stopwatch,
        alarms,

        // Direct alarm ringer banner props
        ringingAlarm: alarms.ringingAlarm,
        handleDismissAlarm: alarms.handleDismissAlarm,
        handleSnoozeAlarm: alarms.handleSnoozeAlarm
    };
}
