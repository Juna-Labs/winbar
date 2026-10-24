import { useState, useEffect, useRef } from 'react';
import { startAlarmChime, stopAlarmChime } from '../utils/sound';

const STORAGE_KEY = 'timehub_alarms';

export function useAlarms({ soundEnabled = true } = {}) {
    const [alarms, setAlarms] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return [
            { id: '1', time: '08:00', label: 'Morning Wakeup', enabled: true, repeat: 'everyday' },
            { id: '2', time: '12:30', label: 'Lunch Break', enabled: false, repeat: 'weekdays' },
        ];
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newTime, setNewTime] = useState('09:00');
    const [newLabel, setNewLabel] = useState('');
    const [newRepeat, setNewRepeat] = useState('everyday'); // 'everyday' | 'weekdays' | 'once'
    const [ringingAlarm, setRingingAlarm] = useState(null);

    const lastTriggeredMinuteRef = useRef('');

    const saveAlarms = (updated) => {
        setAlarms(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

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
        };

        const interval = setInterval(checkAlarms, 1000);
        return () => {
            clearInterval(interval);
            stopAlarmChime();
        };
    }, [alarms, soundEnabled]);

    const handleDismissAlarm = () => {
        stopAlarmChime();
        // If it was a 'once' alarm, disable it automatically
        if (ringingAlarm && ringingAlarm.repeat === 'once') {
            const updated = alarms.map(a => a.id === ringingAlarm.id ? { ...a, enabled: false } : a);
            saveAlarms(updated);
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

        const snoozeAlarm = {
            id: `snooze-${Date.now()}`,
            time: snoozeTime,
            label: `(Snoozed) ${ringingAlarm?.label || 'Alarm'}`,
            enabled: true,
            repeat: 'once'
        };
        saveAlarms([...alarms, snoozeAlarm]);
    };

    const stopAlarmSound = () => {
        stopAlarmChime();
    };

    const handleToggle = (id) => {
        const updated = alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
        saveAlarms(updated);
    };

    const handleDelete = (id) => {
        const updated = alarms.filter(a => a.id !== id);
        saveAlarms(updated);
    };

    const handleAddAlarm = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!newTime) return;

        const newAlarm = {
            id: Date.now().toString(),
            time: newTime,
            label: newLabel.trim() || 'Alarm',
            enabled: true,
            repeat: newRepeat
        };

        saveAlarms([...alarms, newAlarm]);
        setIsAdding(false);
        setNewLabel('');
    };

    // Calculate time until next enabled alarm
    const getNextAlarmInfo = () => {
        const enabledAlarms = alarms.filter(a => a.enabled);
        if (enabledAlarms.length === 0) return null;

        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTotalMinutes = currentHours * 60 + currentMinutes;

        let closestMinutes = Infinity;
        let closestAlarm = null;

        enabledAlarms.forEach(alarm => {
            const [h, m] = alarm.time.split(':').map(Number);
            const alarmTotalMinutes = h * 60 + m;

            let diff = alarmTotalMinutes - currentTotalMinutes;
            if (diff <= 0) diff += 24 * 60; // next day

            if (diff < closestMinutes) {
                closestMinutes = diff;
                closestAlarm = alarm;
            }
        });

        if (!closestAlarm) return null;

        const diffHours = Math.floor(closestMinutes / 60);
        const diffMins = closestMinutes % 60;
        const inTimeStr = diffHours > 0 ? `${diffHours}h ${diffMins}m` : `${diffMins}m`;

        return {
            alarm: closestAlarm,
            inTimeStr
        };
    };

    // Format 24h 'HH:MM' into friendly format (e.g. 08:30 AM)
    const formatAlarmTime = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return {
            time: `${displayH}:${m.toString().padStart(2, '0')}`,
            ampm
        };
    };

    return {
        alarms,
        saveAlarms,
        isAdding,
        setIsAdding,
        newTime,
        setNewTime,
        newLabel,
        setNewLabel,
        newRepeat,
        setNewRepeat,
        handleToggle,
        handleDelete,
        handleAddAlarm,
        nextAlarmInfo: getNextAlarmInfo(),
        formatAlarmTime,
        ringingAlarm,
        handleDismissAlarm,
        handleSnoozeAlarm,
        stopAlarmSound
    };
}
