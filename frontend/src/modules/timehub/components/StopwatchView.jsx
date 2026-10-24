import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Trash2 } from 'lucide-react';

export default function StopwatchView() {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0); // in milliseconds
    const [laps, setLaps] = useState([]); // [{ id, lapTime, overallTime }]

    const startTimeRef = useRef(0);
    const accumulatedTimeRef = useRef(0);
    const requestRef = useRef(null);

    const updateTimer = () => {
        setElapsedTime(accumulatedTimeRef.current + (performance.now() - startTimeRef.current));
        requestRef.current = requestAnimationFrame(updateTimer);
    };

    const handleStart = () => {
        setIsRunning(true);
        startTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(updateTimer);
    };

    const handlePause = () => {
        setIsRunning(false);
        cancelAnimationFrame(requestRef.current);
        accumulatedTimeRef.current += performance.now() - startTimeRef.current;
        setElapsedTime(accumulatedTimeRef.current);
    };

    const handleReset = () => {
        setIsRunning(false);
        cancelAnimationFrame(requestRef.current);
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

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

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

    const currentFormatted = formatStopwatch(elapsedTime);

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

    return (
        <div className="flex-1 flex flex-col justify-between p-3 select-none">
            {/* Main Stopwatch Readout */}
            <div className="flex flex-col items-center justify-center my-3 py-4 rounded-xl bg-black/20 border border-white/10">
                <div className="flex items-baseline font-mono font-extrabold text-white tracking-tight">
                    <span className="text-4xl">{currentFormatted.minutes}</span>
                    <span className="text-3xl opacity-50 mx-0.5">:</span>
                    <span className="text-4xl">{currentFormatted.seconds}</span>
                    <span className="text-2xl font-bold ml-1.5" style={{ color: 'var(--color-widget-active)' }}>
                        .{currentFormatted.centis}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-white/40 uppercase font-sans tracking-widest mt-1">
                    <span>MIN</span>
                    <span>SEC</span>
                    <span>MS</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mb-3">
                {/* Reset button */}
                <button
                    onClick={handleReset}
                    disabled={elapsedTime === 0}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                        elapsedTime === 0
                            ? 'opacity-30 border-white/5 cursor-not-allowed text-white/30'
                            : 'bg-white/5 hover:bg-white/15 border-white/10 text-white/70 hover:text-white'
                    }`}
                    title="Reset Stopwatch"
                >
                    <RotateCcw size={16} />
                </button>

                {/* Primary Start / Pause */}
                <button
                    onClick={isRunning ? handlePause : handleStart}
                    className="px-8 py-2 rounded-lg font-bold text-sm shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                    style={{
                        backgroundColor: 'var(--color-widget-active)',
                        color: 'var(--color-widget-text)',
                        border: '1px solid var(--color-widget-active-hover)'
                    }}
                >
                    {isRunning ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
                    <span>{isRunning ? 'Pause' : (elapsedTime > 0 ? 'Resume' : 'Start')}</span>
                </button>

                {/* Lap button */}
                <button
                    onClick={handleLap}
                    disabled={!isRunning}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        !isRunning
                            ? 'opacity-30 border-white/5 cursor-not-allowed text-white/30'
                            : 'bg-white/5 hover:bg-white/15 border-white/10 text-white/80 hover:text-white'
                    }`}
                    title="Record Lap"
                >
                    <Flag size={14} />
                    <span>Lap</span>
                </button>
            </div>

            {/* Laps List */}
            <div className="flex-1 min-h-35 max-h-42.5 flex flex-col bg-black/15 border border-white/10 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/5 text-[11px] font-sans font-semibold text-white/50 uppercase tracking-wider">
                    <span>Lap #</span>
                    <span>Split Time</span>
                    <span>Overall</span>
                </div>

                <div className="flex-1 overflow-y-auto scrollable p-1.5 flex flex-col gap-1">
                    {laps.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-xs text-white/30 italic py-6">
                            No laps recorded yet
                        </div>
                    ) : (
                        laps.map((lap) => {
                            const splitFmt = formatStopwatch(lap.lapTime);
                            const overallFmt = formatStopwatch(lap.overallTime);
                            const isFastest = lap.id === fastestLapId;
                            const isSlowest = lap.id === slowestLapId;

                            return (
                                <div
                                    key={lap.id}
                                    className="flex items-center justify-between px-2.5 py-1 rounded bg-white/5 text-xs font-mono"
                                >
                                    <div className="flex items-center gap-1.5 font-sans font-bold text-white/70">
                                        <span>#{lap.id.toString().padStart(2, '0')}</span>
                                        {isFastest && (
                                            <span
                                                className="text-[9px] px-1 py-0.2 rounded font-sans font-bold"
                                                style={{
                                                    backgroundColor: 'var(--color-widget-active)',
                                                    color: 'var(--color-widget-text)'
                                                }}
                                            >
                                                FASTEST
                                            </span>
                                        )}
                                        {isSlowest && (
                                            <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-white/50 font-sans">
                                                SLOWEST
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-white/90">
                                        +{splitFmt.minutes}:{splitFmt.seconds}.{splitFmt.centis}
                                    </span>
                                    <span className="text-white/50">
                                        {overallFmt.minutes}:{overallFmt.seconds}.{overallFmt.centis}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
