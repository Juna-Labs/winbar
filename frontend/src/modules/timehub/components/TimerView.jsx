import { Play, Pause, RotateCcw, Coffee, Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import WheelColumn from './WheelColumn';

export default function TimerView({
    mode,
    setMode,

    // Picker
    hours,
    setHours,
    minutes,
    setMinutes,
    seconds,
    setSeconds,
    handleStartFromPicker,
    handleResetPicker,

    // Countdown Timer
    timerRemaining,
    isTimerRunning,
    isTimerActive,
    handleCancelRunning,
    toggleTimerRunning,

    // Pomodoro
    pomoPhase,
    pomoRemaining,
    isPomoRunning,
    completedCycles,
    switchPomoPhase,
    handleSkipPomoPhase,
    togglePomoRunning,

    // Helpers
    formatTime,
    radius,
    strokeDashoffset,
    circumference
}) {
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
                                {formatTime ? formatTime(timerRemaining) : timerRemaining}
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
                            {formatTime ? formatTime(pomoRemaining) : pomoRemaining}
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
                                onClick={handleResetPicker}
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
                            onClick={toggleTimerRunning}
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
                            onClick={togglePomoRunning}
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
