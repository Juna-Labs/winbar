import { useState, useEffect, useRef } from 'react';
import { playChime } from '../utils/sound';

export const formatTime = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function useTimer({ soundEnabled = true } = {}) {
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

    // -------------------------------------------------------------
    // COUNTDOWN TIMER LOGIC
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

    const toggleTimerRunning = () => {
        setIsTimerRunning(prev => !prev);
    };

    const handleResetPicker = () => {
        setHours(0);
        setMinutes(0);
        setSeconds(0);
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

    const togglePomoRunning = () => {
        setIsPomoRunning(prev => !prev);
    };

    // SVG Circular calculations
    const radius = 78;
    const circumference = 2 * Math.PI * radius;

    const currentRemaining = mode === 'timer' ? timerRemaining : pomoRemaining;
    const currentTotal = mode === 'timer' ? timerTotal : pomoTotal;
    const progressPercent = currentTotal > 0 ? (currentRemaining / currentTotal) : 0;
    const strokeDashoffset = circumference - (progressPercent * circumference);

    return {
        mode,
        setMode,

        // Picker states
        hours,
        setHours,
        minutes,
        setMinutes,
        seconds,
        setSeconds,
        handleStartFromPicker,
        handleResetPicker,

        // Countdown timer states
        timerRemaining,
        timerTotal,
        isTimerRunning,
        isTimerActive,
        handleCancelRunning,
        toggleTimerRunning,

        // Pomodoro states
        pomoPhase,
        pomoRemaining,
        pomoTotal,
        isPomoRunning,
        completedCycles,
        switchPomoPhase,
        handleSkipPomoPhase,
        togglePomoRunning,

        // Helpers & SVGs
        formatTime,
        radius,
        circumference,
        strokeDashoffset,
        currentRemaining
    };
}
