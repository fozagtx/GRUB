import Phaser from 'phaser';
import { HandController } from './handController.js';
import { ItemManager } from './itemManager.js';
import { UIManager } from './ui.js';
import { SoundManager } from './soundManager.js';
import { ScreenManager } from './screenManager.js';
import { AssetLoader } from './assetLoader.js';
import { GameStateManager } from './gameStateManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // ==========================================
  // INITIALIZATION METHODS
  // ==========================================
  preload() {
    AssetLoader.loadAllAssets(this);
  }

  create() {
    this.gameStateManager = new GameStateManager(this);
    this.soundManager = new SoundManager(this);
    this.screenManager = new ScreenManager(this);

    // ensure no leftover state on hot-reloads
    this.gameTimer = null;
    this.difficultyTimer = null;
    this.truckSpawner = null;

    this.screenManager.showStartScreen();
    // The StartScreen now handles its own background and cloud creation.
    this.createTruckAnimation();
  }

  createBackground() {
    this.background = this.add.image(512, 384, 'farmbackground');
    this.background.setDisplaySize(1024, 768);
    this.background.setDepth(0);
  }

  createClouds() {
    // Generate a reusable cloud texture
    if (!this.textures.exists('generatedCloud')) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffffff, 1);
      // New cloud shape with a less flat top
      // Main body of the cloud
      graphics.fillEllipse(110, 95, 150, 80);
      graphics.fillEllipse(200, 100, 140, 70);
      // A prominent central top puff to avoid flatness
      graphics.fillEllipse(150, 50, 130, 100);
      // Flanking puffs at varied heights for a more natural, bumpy top
      graphics.fillEllipse(90, 60, 100, 80);
      graphics.fillEllipse(210, 65, 110, 90);
      // Small edge puffs for detail
      graphics.fillEllipse(40, 85, 70, 50);
      graphics.fillEllipse(260, 90, 60, 50);
      graphics.generateTexture('generatedCloud', 300, 150);
      graphics.destroy();
    }
    if (this.clouds) {
      this.clouds.destroy(true);
    }
    this.clouds = this.add.group();
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 150 + 50;
      const scale = Math.random() * 0.5 + 0.4;
      const speed = (Math.random() * 25 + 10);
      const alpha = Math.random() * 0.5 + 0.3;
      const cloud = this.add.image(x, y, 'generatedCloud');
      cloud.setScale(scale).setAlpha(alpha).setDepth(1);
      cloud.speed = speed;
      this.clouds.add(cloud);
    }
  }

  createTruckAnimation() {
    if (this.anims.exists('drive')) {
      return; // Animation already created
    }
    const frameKeys = [];
    for (let i = 0; i <= 60; i++) {
      const frameKey = `truckboy${i}`;
      if (this.textures.exists(frameKey)) {
        frameKeys.push({ key: frameKey });
      }
    }

    // Sort frames numerically to ensure correct animation sequence
    frameKeys.sort((a, b) => {
      const aNum = parseInt(a.key.replace('truckboy', ''), 10);
      const bNum = parseInt(b.key.replace('truckboy', ''), 10);
      return aNum - bNum;
    });
    if (frameKeys.length > 0) {
      this.anims.create({
        key: 'drive',
        frames: frameKeys,
        frameRate: 12,
        repeat: -1
      });
    }
  }

  spawnTruck() {
    const direction = Math.random() < 0.5 ? 'rightToLeft' : 'leftToRight';
    let startX, endX, yPos, flipX, scale;
    if (direction === 'rightToLeft') {
      // Original path: truck is further away and smaller
      startX = 1224;
      endX = -200;
      yPos = 390;
      flipX = false;
      scale = 0.12;
    } else {
      // New path: truck is closer and larger
      startX = -200;
      endX = 1224;
      yPos = 410; // Lower on the screen to appear closer
      flipX = true;
      scale = 0.1875;
    }
    const truck = this.add.sprite(startX, yPos, 'truckboy0').setDepth(2);
    truck.setScale(scale);
    truck.setFlipX(flipX);
    if (this.anims.exists('drive')) {
      truck.play('drive');
    }
    this.tweens.add({
      targets: truck,
      x: endX,
      duration: 8000,
      ease: 'Linear',
      onComplete: () => {
        truck.destroy();
      }
    });
  }

  createParticleEffects() {
    // Success particles
    this.successParticles = this.add.particles(0, 0, 'kaleSingle', {
      scale: { start: 0.15, end: 0 },
      speed: { min: 60, max: 120 },
      lifespan: 700,
      quantity: 5,
      tint: 0x90EE90, // Light green tint for a sparkle effect
      blendMode: 'ADD', // Makes particles glow
      alpha: { start: 0.8, end: 0 }
    });
    this.successParticles.stop();

    // Golden kale special particles
    this.goldenParticles = this.add.particles(0, 0, 'goldenKale', {
      scale: { start: 0.08, end: 0 },
      speed: { min: 100, max: 200 },
      lifespan: 900,
      quantity: 8,
      tint: 0xFFD700,
      blendMode: 'ADD',
      alpha: { start: 1, end: 0 }
    });
    this.goldenParticles.stop();
  }

  // ==========================================
  // SCREEN MANAGEMENT METHODS
  // ==========================================
  update() {
    // Move clouds, regardless of game state
    if (this.clouds) {
      this.clouds.children.each(cloud => {
        if (cloud && cloud.active) {
          cloud.x += cloud.speed * (this.sys.game.loop.delta / 1000);
          if (cloud.x > 1024 + cloud.displayWidth / 2) {
            cloud.x = -cloud.displayWidth / 2;
          }
          // Depth is handled on creation.
        }
      });
    }
    // Keep background behind all UI
    if (this.background) {
      this.children.sendToBack(this.background);
    }
    if (!this.gameStateManager.gameActive) return;

    // Update systems
    this.handController.update();
    this.itemManager.update();
    this.uiManager.update();
  }

  updateTimer() {
    this.gameStateManager.updateTimer();
  }
  increaseDifficulty() {
    this.gameStateManager.increaseDifficulty();
  }

  startGame() {
    // Reset game state first to ensure correct stage settings
    this.gameStateManager.resetForNewGame();

    // Start background music
    this.soundManager.startBackgroundMusic();

    // Clear existing UI
    this.children.removeAll();
    this.createBackground();
    this.createClouds();
    // createTruckAnimation already called in create()

    // Set game active
    this.gameStateManager.startGame();

    // Initialize systems
    this.handController = new HandController(this);
    this.itemManager = new ItemManager(this);
    this.uiManager = new UIManager(this);
    this.itemManager.collector.createChainBonusUI();

    // Ensure spawner starts with fresh difficulty settings
    this.itemManager.setDifficulty(1);

    // Setup input (avoid stacking listeners between runs)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('A,D');
    this.input.keyboard.off('keydown-S'); // remove any previous handler
    this.input.keyboard.on('keydown-S', () => {
      if (this.gameStateManager.gameActive) {
        this.screenManager.showStageSelect();
      }
    });

    // Clean up existing timers to prevent duplicates
    if (this.gameTimer) {
      this.gameTimer.destroy();
      this.gameTimer = null;
    }
    if (this.difficultyTimer) {
      this.difficultyTimer.destroy();
      this.difficultyTimer = null;
    }
    if (this.truckSpawner) {
      this.truckSpawner.destroy();
      this.truckSpawner = null;
    }

    // Setup game timer
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.gameStateManager.updateTimer,
      callbackScope: this.gameStateManager,
      loop: true
    });

    // Setup difficulty scaling - different intervals for unlimited mode
    const difficultyDelay = this.gameStateManager.unlimitedMode ? 15000 : 5000;
    this.difficultyTimer = this.time.addEvent({
      delay: difficultyDelay,
      callback: this.gameStateManager.increaseDifficulty,
      callbackScope: this.gameStateManager,
      loop: true
    });

    // Particle manager for effects
    this.createParticleEffects();

    // Setup truck spawner
    this.truckSpawner = this.time.addEvent({
      delay: 10000,
      callback: this.spawnTruck,
      callbackScope: this,
      loop: true
    });
  }

  showFireworks() {
    // Reduce number of simultaneous fireworks to improve performance
    const fireworkPositions = [
      { x: 200, y: 200 },
      { x: 512, y: 150 },
      { x: 824, y: 200 },
      { x: 350, y: 300 },
      { x: 674, y: 300 }
    ];
    fireworkPositions.forEach((pos, index) => {
      // Stagger the fireworks for dramatic effect and play sound
      this.time.delayedCall(index * 400, () => {
        this.createFireworkBurst(pos.x, pos.y);
        this.soundManager.playFireworkSound();
      });
    });
    // Show completion screen after fireworks finish
    this.time.delayedCall(2500, () => {
      this.screenManager.showStageCompletion();
    });
  }

  createFireworkBurst(x, y) {
    // Create colorful particle burst using kale assets - optimized for performance
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFD700, 0xFF69B4, 0x00FFFF, 0xFF4500];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Main firework burst - reduced particle count but maintained visual impact
    const firework = this.add.particles(x, y, 'kaleSingle', {
      scale: { start: 0.15, end: 0.05 },
      speed: { min: 120, max: 280 },
      lifespan: 1200,
      quantity: 10,
      tint: randomColor,
      blendMode: 'ADD',
      alpha: { start: 1, end: 0 },
      gravityY: 150
    });

    // Secondary sparkle burst - optimized
    const sparkles = this.add.particles(x, y, 'kaleSingle', {
      scale: { start: 0.08, end: 0.02 },
      speed: { min: 60, max: 130 },
      lifespan: 1500,
      quantity: 12,
      tint: 0xFFFFFF,
      blendMode: 'ADD',
      alpha: { start: 0.7, end: 0 },
      gravityY: 100
    });

    // Let particles emit for a brief moment before stopping
    this.time.delayedCall(100, () => {
      firework.stop();
      sparkles.stop();
    });

    // Clean up after particles finish their lifespan
    this.time.delayedCall(2000, () => {
      if (firework && !firework.destroyed) {
        firework.destroy();
      }
      if (sparkles && !sparkles.destroyed) {
        sparkles.destroy();
      }
    });
  }

  showTargetReached() {
    this.screenManager.showTargetReached();
  }

  // ==== FIX: safe, parameterized shutdown ====
  endGame(showGameOverScreen = true) {
    this.gameStateManager.endGame();

    // Stop gameplay timers
    if (this.gameTimer) { this.gameTimer.destroy(); this.gameTimer = null; }
    if (this.difficultyTimer) { this.difficultyTimer.destroy(); this.difficultyTimer = null; }
    if (this.truckSpawner) { this.truckSpawner.destroy(); this.truckSpawner = null; }

    // Stop/clean gameplay systems (defensive; methods may not exist)
    try { this.handController?.destroy?.(); } catch {}
    try { this.itemManager?.destroy?.(); } catch {}
    try { this.uiManager?.destroy?.(); } catch {}

    // Stop particles & kill tweens/time so nothing keeps running
    try { this.successParticles?.stop(); this.successParticles?.destroy?.(); this.successParticles = null; } catch {}
    try { this.goldenParticles?.stop(); this.goldenParticles?.destroy?.(); this.goldenParticles = null; } catch {}
    try { this.tweens.killAll(); } catch {}
    try { this.time.removeAllEvents(); } catch {}

    // Remove the hotkey if it was bound
    try { this.input?.keyboard?.off?.('keydown-S'); } catch {}

    // Stop background music
    this.soundManager.stopBackgroundMusic();

    if (showGameOverScreen) {
      this.screenManager.showGameOver();
    }
  }
}
