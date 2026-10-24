import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Coffee, Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import { playChime } from '../utils/sound';

const PRESETS = [
    { label: '+1m', seconds: 60 },
    { label: '+5m', seconds: 300 },
    { label: '+10m', seconds: 600 },
    { label: '+15m', seconds: 900 },
    { label: '+25m', seconds: 1500 },
    { label: '+30m', seconds: 1800 },
    { label: '+1h', seconds: 3600 },
];

export default function TimerView({ soundEnabled = true }) {
    const [mode, setMode] = useState('timer'); // 'timer' | 'pomodoro'

    // --- STANDARD TIMER STATE ---
    const [timerInputSeconds, setTimerInputSeconds] = useState(300); // 5m default
    const [timerRemaining, setTimerRemaining] = useState(300);
    const [timerTotal, setTimerTotal] = useState(300);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // --- POMODORO STATE ---
    const [pomoPhase, setPomoPhase] = useState('focus'); // 'focus' | 'short' | 'long'
    const [pomoRemaining, setPomoRemaining] = useState(25 * 60);
    const [pomoTotal, setPomoTotal] = useState(25 * 60);
    const [isPomoRunning, setIsPomoRunning] = useState(false);
    const [completedCycles, setCompletedCycles] = useState(0);

    // References for intervals
    const timerIntervalRef = useRef(null);
    const pomoIntervalRef = useRef(null);

    // -------------------------------------------------------------
    // STANDARD TIMER LOGIC
    // -------------------------------------------------------------
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

    const handleStartTimer = () => {
        if (timerRemaining === 0) {
            const next = timerInputSeconds > 0 ? timerInputSeconds : 300;
            setTimerTotal(next);
            setTimerRemaining(next);
        }
        setIsTimerRunning(true);
    };

    const handlePauseTimer = () => {
        setIsTimerRunning(false);
    };

    const handleResetTimer = () => {
        setIsTimerRunning(false);
        setTimerRemaining(timerTotal);
    };

    const handleAddPreset = (secs) => {
        if (!isTimerRunning && timerRemaining === 0) {
            setTimerTotal(secs);
            setTimerRemaining(secs);
            setTimerInputSeconds(secs);
        } else {
            setTimerTotal(prev => prev + secs);
            setTimerRemaining(prev => prev + secs);
        }
    };

    const setExactTimer = (secs) => {
        setIsTimerRunning(false);
        setTimerTotal(secs);
        setTimerRemaining(secs);
        setTimerInputSeconds(secs);
    };

    // -------------------------------------------------------------
    // POMODORO LOGIC
    // -------------------------------------------------------------
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
                            // After 4 cycles, suggest long break
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

    // Format seconds into HH:MM:SS or MM:SS
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // SVG Circular Progress calculation
    const radius = 68;
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

            {/* Main Circular Timer Display */}
            <div className="relative flex items-center justify-center my-3">
                <svg className="w-44 h-44 -rotate-90 transform">
                    {/* Background track circle */}
                    <circle
                        cx="88"
                        cy="88"
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    {/* Dynamic progress circle */}
                    <circle
                        cx="88"
                        cy="88"
                        r={radius}
                        stroke="var(--color-widget-active)"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-300 ease-linear"
                    />
                </svg>

                {/* Inner Content Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-mono text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                        {formatTime(currentRemaining)}
                    </span>
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-white/50 mt-1">
                        {mode === 'timer' ? (
                            timerRemaining === 0 ? 'Completed' : (isTimerRunning ? 'Running' : 'Ready')
                        ) : (
                            pomoPhase === 'focus' ? 'Focus Session' : (pomoPhase === 'short' ? 'Short Break' : 'Long Break')
                        )}
                    </span>
                    {mode === 'pomodoro' && (
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-white/70">
                            <CheckCircle2 size={11} style={{ color: 'var(--color-widget-active)' }} />
                            <span>{completedCycles} {completedCycles === 1 ? 'cycle' : 'cycles'}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Sub-view specific controls */}
            {mode === 'timer' ? (
                /* Standard Timer Section */
                <div className="w-full flex flex-col gap-2.5">
                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 px-2">
                        {PRESETS.map((p) => (
                            <button
                                key={p.label}
                                onClick={() => handleAddPreset(p.seconds)}
                                className="px-2 py-1 rounded text-xs font-medium bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                                title={`Add ${p.label}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <button
                            onClick={handleResetTimer}
                            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
                            title="Reset Timer"
                        >
                            <RotateCcw size={16} />
                        </button>

                        <button
                            onClick={isTimerRunning ? handlePauseTimer : handleStartTimer}
                            className="px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                            style={{
                                backgroundColor: 'var(--color-widget-active)',
                                color: 'var(--color-widget-text)',
                                border: '1px solid var(--color-widget-active-hover)'
                            }}
                        >
                            {isTimerRunning ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
                            <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                        </button>

                        <button
                            onClick={() => handleAddPreset(60)}
                            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/15 text-xs font-semibold text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer flex items-center gap-1"
                            title="Add 1 minute"
                        >
                            <Plus size={14} />
                            <span>1m</span>
                        </button>
                    </div>
                </div>
            ) : (
                /* Pomodoro Section */
                <div className="w-full flex flex-col gap-2.5">
                    {/* Phase switchers */}
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

                    {/* Action Controls */}
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <button
                            onClick={() => switchPomoPhase(pomoPhase)}
                            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
                            title="Reset phase"
                        >
                            <RotateCcw size={16} />
                        </button>

                        <button
                            onClick={() => setIsPomoRunning(!isPomoRunning)}
                            className="px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
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
