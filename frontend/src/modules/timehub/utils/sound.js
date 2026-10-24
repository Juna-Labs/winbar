// Web Audio API synthesized chimes for Timer and Alarm
// Self-contained, zero external asset dependencies

let audioCtx = null;
let activeAlarmInterval = null;

const getAudioContext = () => {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

export const playTone = (freq, startTime, duration, type = 'sine', gainVal = 0.15) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(gainVal, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    } catch (e) {
        console.warn("Tone playback error", e);
    }
};

export const playChime = (type = 'timer') => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'timer') {
        // Joyful 3-bell chime
        playTone(523.25, now, 0.4, 'sine', 0.2);          // C5
        playTone(659.25, now + 0.15, 0.4, 'sine', 0.2);   // E5
        playTone(783.99, now + 0.3, 0.7, 'sine', 0.25);   // G5
    } else if (type === 'break') {
        // Relaxing chime for break
        playTone(783.99, now, 0.4, 'sine', 0.18);         // G5
        playTone(659.25, now + 0.15, 0.4, 'sine', 0.18);   // E5
        playTone(523.25, now + 0.3, 0.8, 'sine', 0.2);    // C5
    } else if (type === 'alarm') {
        // Urgent 2-tone pulse
        playTone(880, now, 0.12, 'triangle', 0.25);       // A5
        playTone(880, now + 0.15, 0.12, 'triangle', 0.25);
        playTone(1046.5, now + 0.3, 0.25, 'triangle', 0.3); // C6
    } else if (type === 'click') {
        // Subtle UI feedback
        playTone(900, now, 0.05, 'sine', 0.05);
    }
};

export const startAlarmChime = () => {
    stopAlarmChime();
    playChime('alarm');
    activeAlarmInterval = setInterval(() => {
        playChime('alarm');
    }, 1200);
};

export const stopAlarmChime = () => {
    if (activeAlarmInterval) {
        clearInterval(activeAlarmInterval);
        activeAlarmInterval = null;
    }
};
