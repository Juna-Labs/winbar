import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Sparkles, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { playChime } from '../utils/sound';

// Vertical Sliding Number Picker Column
const WheelColumn = ({ value, min = 0, max = 59, label, onChange }) => {
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
};

export default function TimerView({ soundEnabled = true }) {
    const [mode, setMode] = useState('timer'); // 'timer' | 'pomodoro'

    // --- STANDARD TIMER CONFIGURATION (SLIDING WHEELS) ---
    const [hours, setHours] = useState(0);       // Max 23
    const [minutes, setMinutes] = useState(5);   // Max 59
    const [seconds, setSeconds] = useState(0);   // Max 59

    // --- ACTIVE COUNTDOWN STATE ---
    const [timerRemaining, setTimerRemaining] = useState(300);
    const [timerTotal, setTimerTotal] = useState(300);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isTimerActive, setIsTimerActive] = useState(false); // true when in countdown mode

    // --- POMODORO STATE ---
    const [pomoPhase, setPomoPhase] = useState('focus'); // 'focus' | 'short' | 'long'
    const [pomoRemaining, setPomoRemaining] = useState(25 * 60);
    const [pomoTotal, setPomoTotal] = useState(25 * 60);
    const [isPomoRunning, setIsPomoRunning] = useState(false);
    const [completedCycles, setCompletedCycles] = useState(0);

    const timerIntervalRef = useRef(null);
    const pomoIntervalRef = useRef(null);

    // Format seconds into MM:SS or HH:MM:SS
    const formatTime = (totalSecs) => {
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;

        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = setInterval(() => {
                setTimerRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerIntervalRef.current);
                        setIsTimerRunning(false);
                        if (soundEnabled) playChime('timer');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerIntervalRef.current);
        }
        return () => clearInterval(timerIntervalRef.current);
    }, [isTimerRunning, soundEnabled]);

    const handleStartFromPicker = () => {
        const total = hours * 3600 + minutes * 60 + seconds;
        if (total === 0) {
            // Default to 5 minutes if left at 00:00:00
            setMinutes(5);
            setTimerTotal(300);
            setTimerRemaining(300);
        } else {
            setTimerTotal(total);
            setTimerRemaining(total);
        }
        setIsTimerActive(true);
        setIsTimerRunning(true);
    };

    const handleCancelRunning = () => {
        setIsTimerRunning(false);
        setIsTimerActive(false);
        const h = Math.min(23, Math.floor(timerTotal / 3600));
        const m = Math.floor((timerTotal % 3600) / 60);
        const s = timerTotal % 60;
        setHours(h);
        setMinutes(m);
        setSeconds(s);
    };

    useEffect(() => {
        if (isPomoRunning) {
            pomoIntervalRef.current = setInterval(() => {
                setPomoRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(pomoIntervalRef.current);
                        setIsPomoRunning(false);

                        if (pomoPhase === 'focus') {
                            const newCycles = completedCycles + 1;
                            setCompletedCycles(newCycles);
                            if (soundEnabled) playChime('timer');
                            if (newCycles % 4 === 0) {
                                switchPomoPhase('long');
                            } else {
                                switchPomoPhase('short');
                            }
                        } else {
                            if (soundEnabled) playChime('break');
                            switchPomoPhase('focus');
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(pomoIntervalRef.current);
        }
        return () => clearInterval(pomoIntervalRef.current);
    }, [isPomoRunning, pomoPhase, completedCycles, soundEnabled]);

    const switchPomoPhase = (newPhase) => {
        setIsPomoRunning(false);
        setPomoPhase(newPhase);
        let duration = 25 * 60;
        if (newPhase === 'short') duration = 5 * 60;
        if (newPhase === 'long') duration = 15 * 60;
        setPomoTotal(duration);
        setPomoRemaining(duration);
    };

    const handleSkipPomoPhase = () => {
        setIsPomoRunning(false);
        if (pomoPhase === 'focus') {
            switchPomoPhase('short');
        } else {
            switchPomoPhase('focus');
        }
    };

    // SVG Circular calculations with spacious clearance
    const radius = 78;
    const circumference = 2 * Math.PI * radius;

    const currentRemaining = mode === 'timer' ? timerRemaining : pomoRemaining;
    const currentTotal = mode === 'timer' ? timerTotal : pomoTotal;
    const progressPercent = currentTotal > 0 ? (currentRemaining / currentTotal) : 0;
    const strokeDashoffset = circumference - (progressPercent * circumference);

    return (
        <div className="flex-1 flex flex-col items-center justify-between p-3 select-none">
            {/* Top Sub-tabs (Timer vs Pomodoro) */}
            <div className="flex bg-black/25 p-1 rounded-lg border border-white/10 gap-1 w-full max-w-70">
                <button
                    onClick={() => setMode('timer')}
                    className="flex-1 py-1 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{
                        backgroundColor: mode === 'timer' ? 'var(--color-widget-active)' : 'transparent',
                        color: mode === 'timer' ? 'var(--color-widget-text)' : 'rgba(255, 255, 255, 0.7)'
                    }}
                >
                    <Sparkles size={13} />
                    <span>Timer</span>
                </button>
                <button
                    onClick={() => setMode('pomodoro')}
                    className="flex-1 py-1 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{
                        backgroundColor: mode === 'pomodoro' ? 'var(--color-widget-active)' : 'transparent',
                        color: mode === 'pomodoro' ? 'var(--color-widget-text)' : 'rgba(255, 255, 255, 0.7)'
                    }}
                >
                    <Brain size={13} />
                    <span>Pomodoro</span>
                </button>
            </div>

            {/* Main Center Area */}
            {mode === 'timer' ? (
                !isTimerActive ? (
                    /* 1. SLIDING VERTICAL NUMBER PICKER (HOURS, MIN, SEC) */
                    <div className="flex flex-col items-center justify-center my-6 animate-in fade-in duration-200">
                        <div className="flex items-center justify-center gap-2">
                            <WheelColumn
                                value={hours}
                                min={0}
                                max={23}
                                label="Hours"
                                onChange={setHours}
                            />
                            <span className="font-mono text-2xl font-bold opacity-30 -mt-6">:</span>
                            <WheelColumn
                                value={minutes}
                                min={0}
                                max={59}
                                label="Min"
                                onChange={setMinutes}
                            />
                            <span className="font-mono text-2xl font-bold opacity-30 -mt-6">:</span>
                            <WheelColumn
                                value={seconds}
                                min={0}
                                max={59}
                                label="Sec"
                                onChange={setSeconds}
                            />
                        </div>
                    </div>
                ) : (
                    /* 2. CIRCULAR COUNTDOWN RING WHEN ACTIVE */
                    <div className="relative flex items-center justify-center my-3 animate-in fade-in duration-200">
                        <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 192 192">
                            <circle
                                cx="96"
                                cy="96"
                                r={radius}
                                stroke="rgba(255, 255, 255, 0.1)"
                                strokeWidth="7"
                                fill="transparent"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r={radius}
                                stroke="var(--color-widget-active)"
                                strokeWidth="7"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                                className="transition-all duration-300 ease-linear"
                            />
                        </svg>

                        {/* Smaller, properly proportioned timer text with ample clearance */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                            <span className="font-mono text-xl font-bold tracking-tight text-white drop-shadow-md">
                                {formatTime(timerRemaining)}
                            </span>
                            <span className="text-[10px] tracking-widest uppercase font-semibold text-white/50 mt-1">
                                {timerRemaining === 0 ? 'Completed' : (isTimerRunning ? 'Running' : 'Paused')}
                            </span>
                        </div>
                    </div>
                )
            ) : (
                /* POMODORO CIRCLE */
                <div className="relative flex items-center justify-center my-3 animate-in fade-in duration-200">
                    <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 192 192">
                        <circle
                            cx="96"
                            cy="96"
                            r={radius}
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="7"
                            fill="transparent"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r={radius}
                            stroke="var(--color-widget-active)"
                            strokeWidth="7"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-300 ease-linear"
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                        <span className="font-mono text-xl font-bold tracking-tight text-white drop-shadow-sm">
                            {formatTime(pomoRemaining)}
                        </span>
                        <span className="text-[10px] tracking-wider uppercase font-semibold text-white/50 mt-1">
                            {pomoPhase === 'focus' ? 'Focus Session' : (pomoPhase === 'short' ? 'Short Break' : 'Long Break')}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-white/70">
                            <CheckCircle2 size={11} style={{ color: 'var(--color-widget-active)' }} />
                            <span>{completedCycles} {completedCycles === 1 ? 'cycle' : 'cycles'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls Area - Completely Clean, No Presets */}
            {mode === 'timer' ? (
                !isTimerActive ? (
                    /* Config Controls (Sliders) */
                    <div className="w-full flex items-center justify-center gap-3 mb-2">
                        {(hours > 0 || minutes > 0 || seconds > 0) && (
                            <button
                                onClick={() => { setHours(0); setMinutes(0); setSeconds(0); }}
                                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white border border-white/10 transition-all cursor-pointer"
                                title="Reset time to 0"
                            >
                                <RotateCcw size={18} />
                            </button>
                        )}

                        <button
                            onClick={handleStartFromPicker}
                            className="px-12 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                            style={{
                                backgroundColor: 'var(--color-widget-active)',
                                color: 'var(--color-widget-text)',
                                border: '1px solid var(--color-widget-active-hover)'
                            }}
                        >
                            <Play size={18} fill="currentColor" />
                            <span>Start Timer</span>
                        </button>
                    </div>
                ) : (
                    /* Active Countdown Controls */
                    <div className="w-full flex items-center justify-center gap-3 mb-2">
                        <button
                            onClick={handleCancelRunning}
                            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
                            title="Cancel and return to time picker"
                        >
                            <RotateCcw size={18} />
                        </button>

                        <button
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            className="px-12 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                            style={{
                                backgroundColor: 'var(--color-widget-active)',
                                color: 'var(--color-widget-text)',
                                border: '1px solid var(--color-widget-active-hover)'
                            }}
                        >
                            {isTimerRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                            <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
                        </button>
                    </div>
                )
            ) : (
                /* Pomodoro Controls */
                <div className="w-full flex flex-col gap-3 mb-2">
                    <div className="flex justify-center gap-1.5">
                        <button
                            onClick={() => switchPomoPhase('focus')}
                            className="px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1 border"
                            style={{
                                backgroundColor: pomoPhase === 'focus' ? 'var(--color-widget-active)' : 'rgba(255,255,255,0.05)',
                                color: pomoPhase === 'focus' ? 'var(--color-widget-text)' : 'rgba(255,255,255,0.7)',
                                borderColor: pomoPhase === 'focus' ? 'var(--color-widget-active-hover)' : 'rgba(255,255,255,0.1)'
                            }}
                        >
                            <Brain size={12} />
                            <span>Focus (25m)</span>
                        </button>
                        <button
                            onClick={() => switchPomoPhase('short')}
                            className="px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1 border"
                            style={{
                                backgroundColor: pomoPhase === 'short' ? 'var(--color-widget-active)' : 'rgba(255,255,255,0.05)',
                                color: pomoPhase === 'short' ? 'var(--color-widget-text)' : 'rgba(255,255,255,0.7)',
                                borderColor: pomoPhase === 'short' ? 'var(--color-widget-active-hover)' : 'rgba(255,255,255,0.1)'
                            }}
                        >
                            <Coffee size={12} />
                            <span>Break (5m)</span>
                        </button>
                        <button
                            onClick={() => switchPomoPhase('long')}
                            className="px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1 border"
                            style={{
                                backgroundColor: pomoPhase === 'long' ? 'var(--color-widget-active)' : 'rgba(255,255,255,0.05)',
                                color: pomoPhase === 'long' ? 'var(--color-widget-text)' : 'rgba(255,255,255,0.7)',
                                borderColor: pomoPhase === 'long' ? 'var(--color-widget-active-hover)' : 'rgba(255,255,255,0.1)'
                            }}
                        >
                            <Coffee size={12} />
                            <span>Long (15m)</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => switchPomoPhase(pomoPhase)}
                            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
                            title="Reset phase"
                        >
                            <RotateCcw size={16} />
                        </button>

                        <button
                            onClick={() => setIsPomoRunning(!isPomoRunning)}
                            className="px-8 py-2 rounded-lg font-bold text-sm shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                            style={{
                                backgroundColor: 'var(--color-widget-active)',
                                color: 'var(--color-widget-text)',
                                border: '1px solid var(--color-widget-active-hover)'
                            }}
                        >
                            {isPomoRunning ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
                            <span>{isPomoRunning ? 'Pause' : 'Start Focus'}</span>
                        </button>

                        <button
                            onClick={handleSkipPomoPhase}
                            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/15 text-xs font-semibold text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer"
                            title="Skip to next phase"
                        >
                            <span>Skip</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
