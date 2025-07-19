import PitchFinder from "pitchfinder";

export default class Tuner {
    constructor(sampleRate = 22050, bufferSize = 4096) {
        this.sampleRate = sampleRate;
        this.bufferSize = bufferSize;
        this.pitchFinder = new PitchFinder.YIN({
            sampleRate: this.sampleRate,
            probabilityThreshold: 0.9, // Increased for stricter pitch confidence
            threshold: 0.05, // Kept low for sensitivity
        });
        this.lastFrequency = null;
        this.audioContext = null;
        this.microphone = null;
        this.analyser = null;
        this.gainNode = null;
        this.lowPassFilter = null;
        this.dataArray = null;
        this.detectPitch = null;
        this.minAmplitude = 0.03; // Increased to filter out more noise
        this.minFrequency = 70; // Narrowed for guitar/ukulele
        this.maxFrequency = 450; // Narrowed for guitar/ukulele
        this.oscillator = null;
    }

    start(onNoteDetected) {
        navigator.mediaDevices
            .getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }) // Added autoGainControl: false
            .then((stream) => {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: this.sampleRate });
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 2048;
                this.analyser.smoothingTimeConstant = 0.2;
                this.microphone = this.audioContext.createMediaStreamSource(stream);
                this.gainNode = this.audioContext.createGain();
                this.gainNode.gain.setValueAtTime(2.5, this.audioContext.currentTime);
                this.lowPassFilter = this.audioContext.createBiquadFilter();
                this.lowPassFilter.type = 'lowpass';
                this.lowPassFilter.frequency.setValueAtTime(450, this.audioContext.currentTime); // Tightened to 450 Hz
                this.microphone.connect(this.gainNode);
                this.gainNode.connect(this.lowPassFilter);
                this.lowPassFilter.connect(this.analyser);
                this.dataArray = new Float32Array(this.bufferSize);

                this.detectPitch = () => {
                    this.analyser.getFloatTimeDomainData(this.dataArray);
                    const amplitude = Math.max(...this.dataArray.map(Math.abs));
                    console.log(`Amplitude: ${amplitude.toFixed(4)}, Frequency: ${this.lastFrequency ? this.lastFrequency.toFixed(2) : 'N/A'} Hz`); // Enhanced logging
                    if (amplitude < this.minAmplitude) {
                        requestAnimationFrame(this.detectPitch);
                        return;
                    }
                    const frequency = this.pitchFinder(this.dataArray);

                    if (frequency && this.isValidFrequency(frequency) && this.isStableFrequency(frequency)) {
                        const note = this.getNoteData(frequency);
                        onNoteDetected(note);
                    }
                    requestAnimationFrame(this.detectPitch);
                };

                this.detectPitch();
            })
            .catch((err) => console.error("Microphone access denied:", err));
    }

    stop() {
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
        if (this.lowPassFilter) {
            this.lowPassFilter.disconnect();
            this.lowPassFilter = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        if (this.detectPitch) {
            cancelAnimationFrame(this.detectPitch);
            this.detectPitch = null;
        }
        this.stopNote();
    }

    isValidFrequency(frequency) {
        return frequency >= this.minFrequency && frequency <= this.maxFrequency;
    }

    isStableFrequency(frequency) {
        if (!this.lastFrequency) {
            this.lastFrequency = frequency;
            return true;
        }
        const stabilityThreshold = 0.5;
        const stable = Math.abs(this.lastFrequency - frequency) < stabilityThreshold;
        this.lastFrequency = frequency;
        return stable;
    }

    getNoteData(frequency) {
        const A4 = 440;
        const noteIndex = Math.round(12 * Math.log2(frequency / A4)) + 69;
        const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        return {
            name: noteNames[noteIndex % 12],
            frequency,
            cents: this.getCents(frequency, noteIndex),
            octave: Math.floor(noteIndex / 12) - 1,
        };
    }

    getCents(frequency, noteIndex) {
        const standardFreq = 440 * Math.pow(2, (noteIndex - 69) / 12);
        return Math.floor(1200 * Math.log2(frequency / standardFreq));
    }

    playNote(frequency) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: this.sampleRate });
        }
        this.stopNote();
        this.oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        this.oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        this.oscillator.start();
        setTimeout(() => this.stopNote(), 2000);
    }

    stopNote() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
    }
}