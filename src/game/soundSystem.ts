// Sound system using Web Audio API
class SoundSystem {
  private context: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private isInitialized = false;
  
  async init() {
    if (this.isInitialized) return;
    
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      
      // Create synthesized sounds
      await this.createSynthSounds();
      
      // Start ambient forest sounds
      this.startAmbient();
    } catch (e) {
      console.error('Failed to initialize audio:', e);
    }
  }
  
  private async createSynthSounds() {
    if (!this.context) return;
    
    // Create various sound effects using oscillators
    this.sounds.set('gather', this.createToneBuffer(440, 0.1, 'sine'));
    this.sounds.set('hit', this.createToneBuffer(200, 0.15, 'sawtooth'));
    this.sounds.set('bow_shoot', this.createSwooshBuffer());
    this.sounds.set('arrow_hit', this.createToneBuffer(150, 0.2, 'triangle'));
    this.sounds.set('torch_light', this.createToneBuffer(300, 0.3, 'sine'));
    this.sounds.set('drink', this.createBubbleBuffer());
    this.sounds.set('eat', this.createCrunchBuffer());
    this.sounds.set('craft', this.createToneBuffer(600, 0.2, 'square'));
    this.sounds.set('menu_open', this.createToneBuffer(500, 0.1, 'sine'));
    this.sounds.set('menu_close', this.createToneBuffer(400, 0.1, 'sine'));
    this.sounds.set('step', this.createNoiseBuffer(0.05));
    this.sounds.set('animal_hit', this.createToneBuffer(180, 0.15, 'sawtooth'));
    this.sounds.set('wolf_growl', this.createGrowlBuffer());
  }
  
  private createToneBuffer(freq: number, duration: number, type: OscillatorType): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100, numberOfChannels: 1 });
    
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let value = 0;
      
      switch (type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * freq * t);
          break;
        case 'square':
          value = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.5 : -0.5;
          break;
        case 'sawtooth':
          value = 2 * (t * freq - Math.floor(t * freq + 0.5));
          break;
        case 'triangle':
          value = 2 * Math.abs(2 * (t * freq - Math.floor(t * freq + 0.5))) - 1;
          break;
      }
      
      // Apply envelope
      const envelope = Math.exp(-3 * t / duration);
      data[i] = value * envelope * 0.3;
    }
    
    return buffer;
  }
  
  private createNoiseBuffer(duration: number): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100, numberOfChannels: 1 });
    
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const envelope = 1 - (i / length);
      data[i] = (Math.random() * 2 - 1) * envelope * 0.1;
    }
    
    return buffer;
  }
  
  private createSwooshBuffer(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100, numberOfChannels: 1 });
    
    const sampleRate = this.context.sampleRate;
    const duration = 0.2;
    const length = sampleRate * duration;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const freq = 800 - t * 2000; // Descending pitch
      const value = Math.sin(2 * Math.PI * freq * t) + (Math.random() * 0.3);
      const envelope = Math.exp(-5 * t / duration);
      data[i] = value * envelope * 0.2;
    }
    
    return buffer;
  }
  
  private createBubbleBuffer(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100, numberOfChannels: 1 });
    
    const sampleRate = this.context.sampleRate;
    const duration = 0.4;
    const length = sampleRate * duration;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Multiple bubble sounds
      let value = 0;
      for (let b = 0; b < 3; b++) {
        const bubbleStart = b * 0.1;
        if (t > bubbleStart && t < bubbleStart + 0.15) {
          const bt = t - bubbleStart;
          const freq = 500 + Math.sin(bt * 30) * 200;
          value += Math.sin(2 * Math.PI * freq * bt) * Math.exp(-10 * bt);
        }
      }
      data[i] = value * 0.2;
    }
    
    return buffer;
  }
  
  private createCrunchBuffer(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100, numberOfChannels: 1 });
    
    const sampleRate = this.context.sampleRate;
    const duration = 0.3;
    const length = sampleRate * duration;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Crunchy noise
      const noise = Math.random() * 2 - 1;
      const crunch = Math.sin(t * 50) > 0 ? noise : noise * 0.3;
      const envelope = Math.exp(-8 * t);
      data[i] = crunch * envelope * 0.2;
    }
    
    return buffer;
  }
  
  private createGrowlBuffer(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100, numberOfChannels: 1 });
    
    const sampleRate = this.context.sampleRate;
    const duration = 0.5;
    const length = sampleRate * duration;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const freq = 80 + Math.sin(t * 20) * 30;
      const value = Math.sin(2 * Math.PI * freq * t) + (Math.random() * 0.5 - 0.25);
      const envelope = t < 0.1 ? t * 10 : Math.exp(-2 * (t - 0.1));
      data[i] = value * envelope * 0.3;
    }
    
    return buffer;
  }
  
  private createAmbientBuffer(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100, numberOfChannels: 1 });
    
    const sampleRate = this.context.sampleRate;
    const duration = 10; // 10 second loop
    const length = sampleRate * duration;
    const buffer = this.context.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        let value = 0;
        
        // Wind sound (filtered noise)
        const windFreq = 0.5 + Math.sin(t * 0.2) * 0.3;
        const wind = (Math.random() * 2 - 1) * 0.05 * (0.5 + 0.5 * Math.sin(t * windFreq));
        value += wind;
        
        // Bird chirps (occasional high-pitched tones)
        const birdChance = Math.sin(t * 2 + channel * 3) * Math.sin(t * 0.3);
        if (birdChance > 0.95) {
          const birdFreq = 2000 + Math.random() * 1000;
          value += Math.sin(2 * Math.PI * birdFreq * t) * 0.03 * (birdChance - 0.95) * 20;
        }
        
        // Distant rustling
        if (Math.random() > 0.998) {
          value += (Math.random() * 2 - 1) * 0.02;
        }
        
        data[i] = value;
      }
    }
    
    return buffer;
  }
  
  startAmbient() {
    if (!this.context || this.ambientSource) return;
    
    const buffer = this.createAmbientBuffer();
    this.ambientGain = this.context.createGain();
    this.ambientGain.gain.value = 0.3;
    this.ambientGain.connect(this.context.destination);
    
    const playAmbient = () => {
      if (!this.context || !this.ambientGain) return;
      
      this.ambientSource = this.context.createBufferSource();
      this.ambientSource.buffer = buffer;
      this.ambientSource.loop = true;
      this.ambientSource.connect(this.ambientGain);
      this.ambientSource.start();
    };
    
    playAmbient();
  }
  
  stopAmbient() {
    if (this.ambientSource) {
      this.ambientSource.stop();
      this.ambientSource = null;
    }
  }
  
  setAmbientVolume(volume: number) {
    if (this.ambientGain) {
      this.ambientGain.gain.value = volume;
    }
  }
  
  play(soundName: string, volume: number = 1) {
    if (!this.context || !this.isInitialized) return;
    
    const buffer = this.sounds.get(soundName);
    if (!buffer) return;
    
    try {
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      
      const gainNode = this.context.createGain();
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      source.start();
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  }
  
  resume() {
    if (this.context?.state === 'suspended') {
      this.context.resume();
    }
  }
}

export const soundSystem = new SoundSystem();
