import { useState, useEffect } from 'react';
import { Plus, Bell, Trash2, Check, X, Clock } from 'lucide-react';

const STORAGE_KEY = 'timehub_alarms';

export default function AlarmView({ onTriggerAlarm }) {
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

    const saveAlarms = (updated) => {
        setAlarms(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
        e.preventDefault();
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

    const nextAlarmInfo = getNextAlarmInfo();

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

    return (
        <div className="flex-1 flex flex-col justify-between p-3 select-none">
            {/* Top Status & Next Alarm Banner */}
            {nextAlarmInfo ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/20 border border-white/10 mb-2">
                    <div className="flex items-center gap-2">
                        <Clock size={14} style={{ color: 'var(--color-widget-active)' }} />
                        <span className="text-xs text-white/70">Next alarm in:</span>
                    </div>
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-widget-active)' }}>
                        {nextAlarmInfo.inTimeStr} ({formatAlarmTime(nextAlarmInfo.alarm.time).time} {formatAlarmTime(nextAlarmInfo.alarm.time).ampm})
                    </span>
                </div>
            ) : (
                <div className="px-3 py-2 rounded-lg bg-black/10 border border-white/5 mb-2 text-center text-xs text-white/40">
                    No active alarms
                </div>
            )}

            {/* Alarms List */}
            <div className="flex-1 overflow-y-auto scrollable flex flex-col gap-2 pr-0.5">
                {alarms.map(alarm => {
                    const formatted = formatAlarmTime(alarm.time);

                    return (
                        <div
                            key={alarm.id}
                            className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                                alarm.enabled
                                    ? 'bg-white/5 border-white/15'
                                    : 'bg-black/10 border-white/5 opacity-50'
                            }`}
                        >
                            {/* Left: Time & Label */}
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-1">
                                    <span className="font-mono text-2xl font-bold text-white tracking-tight">
                                        {formatted.time}
                                    </span>
                                    <span className="text-xs font-semibold text-white/60">
                                        {formatted.ampm}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs font-medium text-white/80">
                                        {alarm.label}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/50 capitalize">
                                        {alarm.repeat}
                                    </span>
                                </div>
                            </div>

                            {/* Right: Toggle Switch & Delete */}
                            <div className="flex items-center gap-2.5">
                                {/* Theme-reactive Toggle Switch */}
                                <button
                                    onClick={() => handleToggle(alarm.id)}
                                    className="w-10 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center cursor-pointer relative"
                                    style={{
                                        backgroundColor: alarm.enabled ? 'var(--color-widget-active)' : 'rgba(255, 255, 255, 0.15)'
                                    }}
                                    title={alarm.enabled ? "Turn alarm off" : "Turn alarm on"}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                                            alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>

                                <button
                                    onClick={() => handleDelete(alarm.id)}
                                    className="p-1 rounded text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                                    title="Delete alarm"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {alarms.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-white/40 text-xs">
                        <Bell size={24} className="opacity-30 mb-2" />
                        <span>No alarms created yet</span>
                    </div>
                )}
            </div>

            {/* Bottom: Add Alarm Form / Button */}
            {isAdding ? (
                <form
                    onSubmit={handleAddAlarm}
                    className="mt-2.5 p-3 rounded-lg bg-black/30 border border-white/15 flex flex-col gap-2.5 animate-in fade-in duration-200"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">New Alarm</span>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="text-white/40 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="bg-black/40 border border-white/20 focus:border-widget rounded px-2 py-1 text-sm text-white font-mono outline-none scheme-dark transition-colors"
                            required
                        />

                        <input
                            type="text"
                            placeholder="Alarm label..."
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="flex-1 bg-black/40 border border-white/20 focus:border-widget rounded px-2.5 py-1 text-xs text-white placeholder-white/30 outline-none transition-colors"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex gap-1 text-[11px]">
                            {['everyday', 'weekdays', 'once'].map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setNewRepeat(r)}
                                    className={`px-2 py-0.5 rounded capitalize transition-all cursor-pointer ${
                                        newRepeat === r
                                            ? 'bg-white/20 text-white font-semibold'
                                            : 'bg-white/5 text-white/50 hover:text-white'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-1 rounded text-xs font-bold shadow transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                                backgroundColor: 'var(--color-widget-active)',
                                color: 'var(--color-widget-text)',
                                border: '1px solid var(--color-widget-active-hover)'
                            }}
                        >
                            <Check size={13} />
                            <span>Save</span>
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mt-2 pt-2 border-t border-white/10">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        style={{
                            backgroundColor: 'var(--color-widget-active)',
                            color: 'var(--color-widget-text)',
                            border: '1px solid var(--color-widget-active-hover)'
                        }}
                    >
                        <Plus size={15} />
                        <span>Add Alarm</span>
                    </button>
                </div>
            )}
        </div>
    );
}
