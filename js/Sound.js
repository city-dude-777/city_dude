/**
 * Sound.js - Procedural sound effects for City Dude
 * Uses Web Audio API to generate sounds without audio files.
 */

export class SoundManager {
    constructor() {
        this.ctx = null; // AudioContext, created on first user interaction
        this.engineOsc = null;
        this.engineGain = null;
        this.engineActive = false;
        this.sirenOsc = null;
        this.sirenGain = null;
        this.sirenLfo = null;
        this.sirenLfoGain = null;
        this.sirenActive = false;
    }

    _ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Short noise burst with frequency sweep - sounds like a door
    playDoor() {
        this._ensureContext();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        // Create a short noise burst
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Door exit sound (slightly different pitch)
    playDoorExit() {
        this._ensureContext();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Vehicle enter - engine start (vroooom)
    playEngineStart() {
        this._ensureContext();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(40, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
    }

    // Continuous engine loop - call startEngine/stopEngine/updateEngine
    startEngine() {
        if (this.engineActive) return;
        this._ensureContext();
        const ctx = this.ctx;
        
        this.engineOsc = ctx.createOscillator();
        this.engineGain = ctx.createGain();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 60;
        this.engineGain.gain.value = 0.04;
        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(ctx.destination);
        this.engineOsc.start();
        this.engineActive = true;
    }

    // Update engine pitch based on speed (0-1 normalized)
    updateEngine(speedNorm) {
        if (!this.engineActive || !this.engineOsc) return;
        // Map speed to frequency: idle 50Hz -> full speed 150Hz
        const freq = 50 + speedNorm * 100;
        this.engineOsc.frequency.value = freq;
        // Volume also increases slightly
        this.engineGain.gain.value = 0.03 + speedNorm * 0.06;
    }

    stopEngine() {
        if (!this.engineActive) return;
        try {
            this.engineOsc.stop();
        } catch (e) { /* ignore */ }
        this.engineOsc = null;
        this.engineGain = null;
        this.engineActive = false;
    }

    // Siren - continuous wailing tone (two alternating frequencies)
    startSiren() {
        if (this.sirenActive) return;
        this._ensureContext();
        const ctx = this.ctx;

        this.sirenOsc = ctx.createOscillator();
        this.sirenGain = ctx.createGain();
        this.sirenLfo = ctx.createOscillator(); // modulates frequency
        this.sirenLfoGain = ctx.createGain();

        this.sirenOsc.type = 'sine';
        this.sirenOsc.frequency.value = 600;
        this.sirenLfo.type = 'sine';
        this.sirenLfo.frequency.value = 2; // wail rate
        this.sirenLfoGain.gain.value = 300; // frequency sweep range

        this.sirenLfo.connect(this.sirenLfoGain);
        this.sirenLfoGain.connect(this.sirenOsc.frequency);
        this.sirenOsc.connect(this.sirenGain);
        this.sirenGain.connect(ctx.destination);

        this.sirenGain.gain.value = 0.06;
        this.sirenOsc.start();
        this.sirenLfo.start();
        this.sirenActive = true;
    }

    stopSiren() {
        if (!this.sirenActive) return;
        try {
            this.sirenOsc.stop();
            this.sirenLfo.stop();
        } catch (e) { /* ignore */ }
        this.sirenOsc = null;
        this.sirenGain = null;
        this.sirenLfo = null;
        this.sirenLfoGain = null;
        this.sirenActive = false;
    }

    // Short dismiss sound - descending "whoosh"
    playDismiss() {
        this._ensureContext();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Pickup passenger - ascending bright tone
    playPickup() {
        this._ensureContext();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Dropoff / cash earned - cha-ching!
    playCashRegister() {
        this._ensureContext();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        // Two quick ascending tones
        for (let i = 0; i < 2; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const t = now + i * 0.1;
            osc.frequency.setValueAtTime(800 + i * 400, t);
            osc.frequency.exponentialRampToValueAtTime(1200 + i * 400, t + 0.08);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.15);
        }
    }

    // Buy item sound
    playBuy() {
        this._ensureContext();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Error / can't afford
    playError() {
        this._ensureContext();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Talk to NPC - short chirp
    playTalk() {
        this._ensureContext();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.setValueAtTime(600, now + 0.05);
        osc.frequency.setValueAtTime(500, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    // Hire sound - triumphant ascending
    playHire() {
        this._ensureContext();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        for (let i = 0; i < notes.length; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const t = now + i * 0.12;
            osc.frequency.setValueAtTime(notes[i], t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.2);
        }
    }

    // Game start
    playStart() {
        this._ensureContext();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
    }
}
