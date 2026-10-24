import { useState, useEffect, useRef } from 'react';

export function useStopwatch() {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0); // in milliseconds
    const [laps, setLaps] = useState([]); // [{ id, lapTime, overallTime }]

    const startTimeRef = useRef(0);
    const accumulatedTimeRef = useRef(0);

    useEffect(() => {
        let interval = null;
        if (isRunning) {
            interval = setInterval(() => {
                setElapsedTime(accumulatedTimeRef.current + (performance.now() - startTimeRef.current));
            }, 30);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning]);

    const handleStart = () => {
        startTimeRef.current = performance.now();
        setIsRunning(true);
    };

    const handlePause = () => {
        setIsRunning(false);
        accumulatedTimeRef.current += performance.now() - startTimeRef.current;
        setElapsedTime(accumulatedTimeRef.current);
    };

    const handleReset = () => {
        setIsRunning(false);
        accumulatedTimeRef.current = 0;
        setElapsedTime(0);
        setLaps([]);
    };

    const handleLap = () => {
        const currentOverall = elapsedTime;
        const lastOverall = laps.length > 0 ? laps[0].overallTime : 0;
        const lapTime = currentOverall - lastOverall;

        const newLap = {
            id: laps.length + 1,
            lapTime,
            overallTime: currentOverall
        };

        setLaps([newLap, ...laps]);
    };

    // Format milliseconds into MM:SS.cs (centiseconds)
    const formatStopwatch = (ms) => {
        const totalSecs = Math.floor(ms / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        const centis = Math.floor((ms % 1000) / 10);

        return {
            minutes: mins.toString().padStart(2, '0'),
            seconds: secs.toString().padStart(2, '0'),
            centis: centis.toString().padStart(2, '0')
        };
    };

    // Calculate fastest and slowest laps
    let fastestLapId = null;
    let slowestLapId = null;
    if (laps.length >= 2) {
        let minTime = Infinity;
        let maxTime = -Infinity;
        laps.forEach(l => {
            if (l.lapTime < minTime) {
                minTime = l.lapTime;
                fastestLapId = l.id;
            }
            if (l.lapTime > maxTime) {
                maxTime = l.lapTime;
                slowestLapId = l.id;
            }
        });
    }

    return {
        isRunning,
        elapsedTime,
        laps,
        handleStart,
        handlePause,
        handleReset,
        handleLap,
        formatStopwatch,
        fastestLapId,
        slowestLapId
    };
}
