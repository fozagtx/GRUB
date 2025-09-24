export class SoundManager {
  constructor(scene) {
    this.scene = scene;
  }

  // ==========================================
  // COUNTDOWN SOUND EFFECTS
  // ==========================================

  playCountdownBeep() {
    // Generate a quick, soft, cool electronic blip for countdown numbers
    const duration = 0.2;
    const volume = 0.25;
    
    const oscillator = this.scene.sound.context.createOscillator();
    const gainNode = this.scene.sound.context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.scene.sound.context.destination);
    
    // Cool, modern frequency - clean and minimal
    oscillator.frequency.setValueAtTime(800, this.scene.sound.context.currentTime); // High, crisp tone
    oscillator.type = 'square'; // Digital, modern sound
    
    // Quick, soft envelope - very minimal
    gainNode.gain.setValueAtTime(0, this.scene.sound.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.scene.sound.context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.scene.sound.context.currentTime + duration);
    
    oscillator.start(this.scene.sound.context.currentTime);
    oscillator.stop(this.scene.sound.context.currentTime + duration);
  }

  playGoSound() {
    // Generate a quick, soft, cool "GO!" swoosh sound
    const duration = 0.3;
    const volume = 0.3;
    
    const oscillator = this.scene.sound.context.createOscillator();
    const gainNode = this.scene.sound.context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.scene.sound.context.destination);
    
    // Cool frequency sweep - low to high for modern "swoosh" effect
    oscillator.frequency.setValueAtTime(400, this.scene.sound.context.currentTime); // Start low
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.scene.sound.context.currentTime + duration); // Quick sweep up
    oscillator.type = 'triangle'; // Smoother than square, cooler than sine
    
    // Quick, soft envelope with smooth attack
    gainNode.gain.setValueAtTime(0, this.scene.sound.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.scene.sound.context.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.scene.sound.context.currentTime + duration);
    
    oscillator.start(this.scene.sound.context.currentTime);
    oscillator.stop(this.scene.sound.context.currentTime + duration);
  }

  playGrabSound() {
    // Generate a quick "pluck" sound - like picking fruit or vegetables
    const duration = 0.12;
    const volume = 0.35;
    
    const oscillator = this.scene.sound.context.createOscillator();
    const gainNode = this.scene.sound.context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.scene.sound.context.destination);
    
    // Quick frequency "pluck" - starts medium, quick dip, then bounce back up
    oscillator.frequency.setValueAtTime(450, this.scene.sound.context.currentTime); // Start medium
    oscillator.frequency.exponentialRampToValueAtTime(200, this.scene.sound.context.currentTime + 0.03); // Quick dip
    oscillator.frequency.exponentialRampToValueAtTime(350, this.scene.sound.context.currentTime + duration); // Bounce back up
    oscillator.type = 'sawtooth'; // More organic sound for plucking
    
    // Sharp attack with quick decay for pluck effect
    gainNode.gain.setValueAtTime(0, this.scene.sound.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.scene.sound.context.currentTime + 0.008); // Very quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.scene.sound.context.currentTime + duration);
    
    oscillator.start(this.scene.sound.context.currentTime);
    oscillator.stop(this.scene.sound.context.currentTime + duration);
  }

  // ==========================================
  // BACKGROUND MUSIC MANAGEMENT
  // ==========================================

  startBackgroundMusic() {
    // Always check for the correct song, even if music object exists
    if (this.scene.backgroundMusic) {
        this.scene.backgroundMusic.stop();
        this.scene.backgroundMusic.destroy();
    }
    const isRemix = this.scene.gameStateManager.unlimitedMode && this.scene.gameStateManager.isRemixMode;
    const songKey = isRemix ? 'remixsong' : 'kalesong';
    this.scene.backgroundMusic = this.scene.sound.add(songKey, { loop: true, volume: 0.6 });
    
    // Apply current mute state to the background music
    if (this.scene.gameStateManager.isMuted) {
      this.scene.backgroundMusic.setMute(true);
    }
    
    if (!this.scene.backgroundMusic.isPlaying) {
        this.scene.backgroundMusic.play();
    }
  }

  stopBackgroundMusic() {
    if (this.scene.backgroundMusic) {
      this.scene.backgroundMusic.stop();
    }
  }
  playFireworkSound() {
    // Generate an exciting firework "pop" and "sparkle" sound
    const duration = 0.8;
    const volume = 0.4;
    
    // Create the main "pop" sound
    const popOscillator = this.scene.sound.context.createOscillator();
    const popGain = this.scene.sound.context.createGain();
    
    popOscillator.connect(popGain);
    popGain.connect(this.scene.sound.context.destination);
    
    // Sharp pop with quick frequency burst
    popOscillator.frequency.setValueAtTime(150, this.scene.sound.context.currentTime);
    popOscillator.frequency.exponentialRampToValueAtTime(800, this.scene.sound.context.currentTime + 0.1);
    popOscillator.frequency.exponentialRampToValueAtTime(200, this.scene.sound.context.currentTime + 0.2);
    popOscillator.type = 'square';
    
    // Quick attack for the pop
    popGain.gain.setValueAtTime(0, this.scene.sound.context.currentTime);
    popGain.gain.linearRampToValueAtTime(volume, this.scene.sound.context.currentTime + 0.01);
    popGain.gain.exponentialRampToValueAtTime(0.01, this.scene.sound.context.currentTime + 0.3);
    
    popOscillator.start(this.scene.sound.context.currentTime);
    popOscillator.stop(this.scene.sound.context.currentTime + 0.3);
    
    // Create sparkle/whistle effect
    const sparkleOscillator = this.scene.sound.context.createOscillator();
    const sparkleGain = this.scene.sound.context.createGain();
    
    sparkleOscillator.connect(sparkleGain);
    sparkleGain.connect(this.scene.sound.context.destination);
    
    // High frequency sparkle that trails off
    sparkleOscillator.frequency.setValueAtTime(1200, this.scene.sound.context.currentTime + 0.1);
    sparkleOscillator.frequency.exponentialRampToValueAtTime(2400, this.scene.sound.context.currentTime + 0.2);
    sparkleOscillator.frequency.exponentialRampToValueAtTime(600, this.scene.sound.context.currentTime + duration);
    sparkleOscillator.type = 'triangle';
    
    // Sparkle envelope - starts after the pop
    sparkleGain.gain.setValueAtTime(0, this.scene.sound.context.currentTime + 0.1);
    sparkleGain.gain.linearRampToValueAtTime(volume * 0.6, this.scene.sound.context.currentTime + 0.15);
    sparkleGain.gain.exponentialRampToValueAtTime(0.01, this.scene.sound.context.currentTime + duration);
    
    sparkleOscillator.start(this.scene.sound.context.currentTime + 0.1);
    sparkleOscillator.stop(this.scene.sound.context.currentTime + duration);
  }
}