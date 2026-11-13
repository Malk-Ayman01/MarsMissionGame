class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private stormNoiseNode: AudioNode | null = null;
  private stormGain: GainNode | null = null;
  private stormFilter: BiquadFilterNode | null = null;
  private lastFootstepTime = 0;

  private cinematicOscs: OscillatorNode[] = [];
  private cinematicSources: AudioBufferSourceNode[] = [];
  private cinematicGains: GainNode[] = [];
  private cinematicTimers: number[] = [];

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playObjectiveStinger() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(110, t);
    subOsc.frequency.exponentialRampToValueAtTime(45, t + 0.8);

    subGain.gain.setValueAtTime(0.4, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.9);

    const chords = [330, 440, 554];
    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + 0.05 * idx);

      gain.gain.setValueAtTime(0.2, t + 0.05 * idx);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + 0.05 * idx);
      osc.stop(t + 1.2);
    });
  }

  public playRadioBeep() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.setValueAtTime(2100, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playTypewriterTick() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, t);

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.025);
  }

  public playFootstep() {
    const now = Date.now();
    if (now - this.lastFootstepTime < 280) return;
    this.lastFootstepTime = now;

    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450 + Math.random() * 100, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  public updateEngine(speedRatio: number, isDriving: boolean) {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted || !isDriving) {
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      }
      return;
    }

    const t = this.ctx.currentTime;
    if (!this.engineOsc) {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      this.engineOsc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, t);

      this.engineGain.gain.setValueAtTime(0, t);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);
      this.engineOsc.start(t);
    }

    const targetFreq = 55 + speedRatio * 90;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, t, 0.08);
    const targetVolume = 0.08 + speedRatio * 0.16;
    this.engineGain!.gain.setTargetAtTime(targetVolume, t, 0.05);
  }

  public stopEngine() {
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }

  public playCrash() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.4);

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(600, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);
  }

  public playPickup() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0.18, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.35);
    });
  }

  public playRepairHum() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 2.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 2.2);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 1.8);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 2.5);
  }

  public playWarningAlarm() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(659, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  public setStormWind(active: boolean) {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    if (active && !this.stormNoiseNode) {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.2;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      this.stormFilter = this.ctx.createBiquadFilter();
      this.stormFilter.type = 'bandpass';
      this.stormFilter.frequency.setValueAtTime(320, t);
      this.stormFilter.Q.setValueAtTime(3.0, t);

      this.stormGain = this.ctx.createGain();
      this.stormGain.gain.setValueAtTime(0, t);
      this.stormGain.gain.setTargetAtTime(0.28, t, 1.5);

      noise.connect(this.stormFilter);
      this.stormFilter.connect(this.stormGain);
      this.stormGain.connect(this.masterGain);

      noise.start(t);
      this.stormNoiseNode = noise;
    } else if (!active && this.stormGain && this.ctx) {
      this.stormGain.gain.setTargetAtTime(0, t, 1.0);
    }
  }

  public playMissionSuccess() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const chords = [
      { freq: 261.63, delay: 0 },
      { freq: 329.63, delay: 0.12 },
      { freq: 392.00, delay: 0.24 },
      { freq: 523.25, delay: 0.36 },
      { freq: 659.25, delay: 0.6 },
      { freq: 783.99, delay: 0.8 },
      { freq: 1046.5, delay: 1.0 },
    ];

    chords.forEach(({ freq, delay }) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + delay);

      gain.gain.setValueAtTime(0.22, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + delay);
      osc.stop(t + delay + 1.3);
    });
  }

  public playMissionFailed() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const tones = [440, 415.3, 370, 311.13, 220];
    tones.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t + idx * 0.3);

      gain.gain.setValueAtTime(0.25, t + idx * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.3 + 0.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.3);
      osc.stop(t + idx * 0.3 + 0.85);
    });
  }

  public playSonarPing(strengthRatio: number = 0.5) {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 800 + strengthRatio * 1200;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, t + 0.12);

    const vol = 0.04 + strengthRatio * 0.15;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playBeaconDeploy() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.4);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.45);

    const notes = [659, 880, 1318];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const chOsc = this.ctx.createOscillator();
      const chGain = this.ctx.createGain();
      chOsc.type = 'sine';
      chOsc.frequency.setValueAtTime(freq, t + 0.2 + idx * 0.07);

      chGain.gain.setValueAtTime(0.12, t + 0.2 + idx * 0.07);
      chGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2 + idx * 0.07 + 0.18);

      chOsc.connect(chGain);
      chGain.connect(this.masterGain);
      chOsc.start(t + 0.2 + idx * 0.07);
      chOsc.stop(t + 0.2 + idx * 0.07 + 0.2);
    });
  }

  public playDrillSound() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(340, t + 0.2);
    osc.frequency.linearRampToValueAtTime(280, t + 0.4);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, t);
    filter.Q.setValueAtTime(4, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  public playSeismicRumble() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, t);
    osc.frequency.linearRampToValueAtTime(38, t + 0.8);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.9);
  }

  public playSwitchClick() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.setValueAtTime(1400, t + 0.02);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  public playRocketThruster(intensity: number = 0.5) {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.linearRampToValueAtTime(90, t + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);

    gain.gain.setValueAtTime(Math.min(0.45, 0.15 + intensity * 0.3), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playStageSeparation() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.55);

    const pOsc = this.ctx.createOscillator();
    const pGain = this.ctx.createGain();
    pOsc.type = 'sawtooth';
    pOsc.frequency.setValueAtTime(1800, t + 0.05);
    pOsc.frequency.exponentialRampToValueAtTime(600, t + 0.35);

    pGain.gain.setValueAtTime(0.15, t + 0.05);
    pGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    pOsc.connect(pGain);
    pGain.connect(this.masterGain);
    pOsc.start(t + 0.05);
    pOsc.stop(t + 0.36);
  }

  public playRcsPuff() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playDockingSuccess() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.35);

    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const cOsc = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      cOsc.type = 'sine';
      cOsc.frequency.setValueAtTime(freq, t + 0.25 + idx * 0.08);

      cGain.gain.setValueAtTime(0.2, t + 0.25 + idx * 0.08);
      cGain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

      cOsc.connect(cGain);
      cGain.connect(this.masterGain);
      cOsc.start(t + 0.25 + idx * 0.08);
      cOsc.stop(t + 1.6);
    });
  }

  public stopCinematicAudio() {
    this.cinematicTimers.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
    this.cinematicTimers = [];

    const now = this.ctx ? this.ctx.currentTime : 0;
    this.cinematicGains.forEach((gain) => {
      try {
        if (this.ctx) {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setTargetAtTime(0, now, 0.03);
        }
      } catch {

      }
    });

    this.cinematicOscs.forEach((osc) => {
      try {
        osc.stop(now + 0.08);
      } catch {

      }
    });

    this.cinematicSources.forEach((src) => {
      try {
        src.stop(now + 0.08);
      } catch {

      }
    });

    this.cinematicOscs = [];
    this.cinematicSources = [];
    this.cinematicGains = [];
  }

  public startPeacefulSpaceMusic() {
    this.stopCinematicAudio();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const masterPadGain = this.ctx.createGain();
    masterPadGain.gain.setValueAtTime(0.001, t);
    masterPadGain.gain.linearRampToValueAtTime(0.22, t + 1.6);
    masterPadGain.connect(this.masterGain);
    this.cinematicGains.push(masterPadGain);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(620, t);
    filter.frequency.linearRampToValueAtTime(980, t + 6.5);
    filter.connect(masterPadGain);

    const padFreqs = [130.81, 196.0, 246.94, 293.66, 329.63];
    padFreqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.detune.setValueAtTime((idx - 2) * 4, t);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(idx === 0 ? 0.35 : 0.16, t);
      osc.connect(g);
      g.connect(filter);
      osc.start(t);
      this.cinematicOscs.push(osc);
      this.cinematicGains.push(g);
    });
  }

  public playCabinWarningAlarm() {
    this.stopCinematicAudio();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const triggerPulse = () => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.setValueAtTime(680, now + 0.16);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1750, now);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.24, now + 0.02);
      g.gain.setValueAtTime(0.22, now + 0.28);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(filter);
      filter.connect(g);
      g.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.44);
    };

    triggerPulse();
    const intervalId = window.setInterval(triggerPulse, 850);
    this.cinematicTimers.push(intervalId);
  }

  public playSpacecraftExplosion() {
    this.stopCinematicAudio();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(95, t);
    sub.frequency.exponentialRampToValueAtTime(24, t + 1.8);
    subGain.gain.setValueAtTime(0.55, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(t);
    sub.stop(t + 2.25);
    this.cinematicOscs.push(sub);
    this.cinematicGains.push(subGain);

    const duration = 2.4;
    const bufSize = Math.floor(this.ctx.sampleRate * duration);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.35));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1400, t);
    lowpass.frequency.exponentialRampToValueAtTime(140, t + 2.0);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.55, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 2.3);

    noise.connect(lowpass);
    lowpass.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(t);
    this.cinematicSources.push(noise);
    this.cinematicGains.push(nGain);

    const sparkOffsets = [0.18, 0.52, 0.95, 1.45, 2.3];
    sparkOffsets.forEach((offset) => {
      if (!this.ctx || !this.masterGain) return;
      const zap = this.ctx.createOscillator();
      const zapGain = this.ctx.createGain();
      zap.type = 'square';
      zap.frequency.setValueAtTime(1800, t + offset);
      zap.frequency.exponentialRampToValueAtTime(220, t + offset + 0.14);
      zapGain.gain.setValueAtTime(0.16, t + offset);
      zapGain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.16);
      zap.connect(zapGain);
      zapGain.connect(this.masterGain);
      zap.start(t + offset);
      zap.stop(t + offset + 0.18);
      this.cinematicOscs.push(zap);
      this.cinematicGains.push(zapGain);
    });

    const drone = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    const droneFilter = this.ctx.createBiquadFilter();
    drone.type = 'sawtooth';
    drone.frequency.setValueAtTime(55, t + 0.2);
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(220, t + 0.2);
    droneGain.gain.setValueAtTime(0.001, t + 0.2);
    droneGain.gain.linearRampToValueAtTime(0.28, t + 1.2);
    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.masterGain);
    drone.start(t + 0.2);
    this.cinematicOscs.push(drone);
    this.cinematicGains.push(droneGain);
  }

  public playEmergencySilenceTone() {
    this.stopCinematicAudio();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const ping = () => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1180, now);
      g.gain.setValueAtTime(0.06, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.38);
    };

    const firstTimeout = window.setTimeout(ping, 600);
    const intervalId = window.setInterval(ping, 2600);
    this.cinematicTimers.push(firstTimeout, intervalId);
  }

  public playEmotionalHomeTheme() {
    this.stopCinematicAudio();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const masterThemeGain = this.ctx.createGain();
    masterThemeGain.gain.setValueAtTime(0.001, t);
    masterThemeGain.gain.linearRampToValueAtTime(0.24, t + 2.0);
    masterThemeGain.gain.setValueAtTime(0.24, t + 12.5);
    masterThemeGain.gain.linearRampToValueAtTime(0.001, t + 17.5);
    masterThemeGain.connect(this.masterGain);
    this.cinematicGains.push(masterThemeGain);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(540, t);
    filter.frequency.linearRampToValueAtTime(860, t + 8.0);
    filter.frequency.linearRampToValueAtTime(420, t + 16.0);
    filter.connect(masterThemeGain);

    const bassNotes = [
      { freq: 73.42, start: 0, dur: 5.5 },
      { freq: 58.27, start: 5.5, dur: 5.0 },
      { freq: 65.41, start: 10.5, dur: 7.0 },
    ];
    bassNotes.forEach(({ freq, start, dur }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + start);
      g.gain.setValueAtTime(0.001, t + start);
      g.gain.linearRampToValueAtTime(0.32, t + start + 0.8);
      g.gain.linearRampToValueAtTime(0.001, t + start + dur);
      osc.connect(g);
      g.connect(filter);
      osc.start(t + start);
      osc.stop(t + start + dur + 0.1);
      this.cinematicOscs.push(osc);
      this.cinematicGains.push(g);
    });

    const upperVoices = [220.0, 261.63, 329.63, 440.0];
    upperVoices.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.4);
      g.gain.setValueAtTime(0.001, t + idx * 0.4);
      g.gain.linearRampToValueAtTime(0.14, t + idx * 0.4 + 1.5);
      g.gain.setValueAtTime(0.14, t + 11);
      g.gain.linearRampToValueAtTime(0.001, t + 17);
      osc.connect(g);
      g.connect(filter);
      osc.start(t + idx * 0.4);
      osc.stop(t + 17.5);
      this.cinematicOscs.push(osc);
      this.cinematicGains.push(g);
    });
  }
}

export const sounds = new SoundManager();
