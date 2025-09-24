import Phaser from 'phaser';
import { TrajectoryCalculator } from './trajectoryCalculator.js';

export class ItemSpawner {
  constructor(scene, itemManager) {
    this.scene = scene;
    this.itemManager = itemManager;
    this.baseSpawnRate = 1000; // Store the original base rate
    this.spawnRate = 1000; // Reduced from 1500 to 1000 for faster spawning
    this.fallSpeed = 150;
    this.difficulty = 1;
    this.crystalKaleOnCooldown = false;
    
    this.setupSpawning();
    this.setupGuaranteedRainbowSpawn();
    // Remove immediate unlimited mode setup - will be handled in setDifficulty
  }

  setupSpawning() {
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.spawnRate,
      callback: this.spawnItem,
      callbackScope: this,
      loop: true
    });
  }

  setupGuaranteedRainbowSpawn() {
    // Ensure rainbow kale spawns within first 5 seconds if it hasn't spawned naturally
    this.rainbowGuaranteeTimer = this.scene.time.delayedCall(5000, () => {
      if (!this.scene.gameStateManager.rainbowKaleSpawned) {
        // Force spawn rainbow kale
        const leftHandX = 392;
        const rightHandX = 632;
        const handY = 580;
        
        const targetHand = Math.random() < 0.5 ? 'left' : 'right';
        const targetX = targetHand === 'left' ? leftHandX : rightHandX;
        
        const trajectory = this.calculateTrajectory(targetX, handY);
        this.itemManager.spawnRainbowKale(trajectory.startX, trajectory.velocityX, trajectory.velocityY);
        this.scene.gameStateManager.rainbowKaleSpawned = true;
      }
    });
  }
  setupUnlimitedModeRainbowSpawn() {
    // Only set up for unlimited mode (stage 4) - always create the timer when called
    if (!this.unlimitedRainbowTimer) {
      this.unlimitedRainbowTimer = this.scene.time.addEvent({
        delay: 30000, // 30 seconds
        callback: this.spawnUnlimitedRainbow,
        callbackScope: this,
        loop: true
      });
    }
  }
  spawnUnlimitedRainbow() {
    if (!this.scene.gameStateManager.gameActive || !this.scene.gameStateManager.unlimitedMode) return;
    
    const leftHandX = 392;
    const rightHandX = 632;
    const handY = 580;
    
    const targetHand = Math.random() < 0.5 ? 'left' : 'right';
    const targetX = targetHand === 'left' ? leftHandX : rightHandX;
    
    const trajectory = this.calculateTrajectory(targetX, handY);
    this.itemManager.spawnRainbowKale(trajectory.startX, trajectory.velocityX, trajectory.velocityY);
  }

  spawnItem() {
    if (!this.scene.gameStateManager.gameActive) return;
    
    // Hand positions from handController (updated to match new positions)
    const leftHandX = 392;
    const rightHandX = 632;
    const handY = 580;
    
    // Choose target hand randomly
    const targetHand = Math.random() < 0.5 ? 'left' : 'right';
    const targetX = targetHand === 'left' ? leftHandX : rightHandX;
    
    // Calculate spawn position and trajectory
    const trajectory = this.calculateTrajectory(targetX, handY);
    
    const rand = Math.random();
    
    // Adjust spawn probabilities based on current stage
    const currentStage = this.scene.gameStateManager.currentStage;
    let rainbowChance, hazardChance, goldenChance, bunchChance, crystalChance, kaleShakeChance;
    
    if (currentStage === 3) {
      // Stage 3: More kale, fewer hazards
      kaleShakeChance = 0.01; // 1% (Rarer)
      crystalChance = kaleShakeChance + 0.01; // 1% (Rarer)
      rainbowChance = crystalChance + 0.07; // 7%
      hazardChance = rainbowChance + 0.05; // 5%
      goldenChance = hazardChance + 0.20; // 20%
      bunchChance = goldenChance + 0.40; // 40%
      // Singles: 26%
    } else {
      // Stages 1-2: Original probabilities
      kaleShakeChance = 0.01; // 1% (Rarer)
      crystalChance = kaleShakeChance + 0.01; // 1% (Rarer)
      rainbowChance = crystalChance + 0.05; // 5%
      hazardChance = rainbowChance + 0.1; // 10%
      goldenChance = hazardChance + 0.15; // 15%
      bunchChance = goldenChance + 0.35; // 35%
      // Singles: 33%
    }
    if (rand < kaleShakeChance) {
        this.itemManager.spawnKaleShake(trajectory.startX, trajectory.velocityX, trajectory.velocityY);
    }
    else if (rand < crystalChance && !this.crystalKaleOnCooldown) {
      this.itemManager.spawnCrystalKale(trajectory.startX, trajectory.velocityX, trajectory.velocityY);
      this.crystalKaleOnCooldown = true;
      this.scene.time.delayedCall(10000, () => {
        this.crystalKaleOnCooldown = false;
      });
    }
    // 5-7% chance for rainbow kale (only in timed modes, not unlimited mode)
    else if (rand < rainbowChance && !this.scene.gameStateManager.unlimitedMode) {
      // Only spawn if not already spawned in timed modes
      if (!this.scene.gameStateManager.rainbowKaleSpawned) {
        this.itemManager.spawnRainbowKale(trajectory.startX, trajectory.velocityX, trajectory.velocityY);
        this.scene.gameStateManager.rainbowKaleSpawned = true;
      }
    }
    // 5-10% chance for hazard (reduced for stage 3)
    else if (rand < hazardChance) {
      this.itemManager.spawnHazard(trajectory.startX, trajectory.velocityX, trajectory.velocityY);
    }
    // 15-20% chance for golden kale (increased for stage 3)
    else if (rand < goldenChance) {
      this.itemManager.spawnKale(trajectory.startX, 'goldenKale', 5, true, trajectory.velocityX, trajectory.velocityY);
    }
    // 35-40% chance for bunch (increased for stage 3)
    else if (rand < bunchChance) {
      this.itemManager.spawnKale(trajectory.startX, 'kaleBunch', 3, false, trajectory.velocityX, trajectory.velocityY);
    }
    // 25-32% chance for single
    else {
      this.itemManager.spawnKale(trajectory.startX, 'kaleSingle', 1, false, trajectory.velocityX, trajectory.velocityY);
    }
  }

  calculateTrajectory(targetX, targetY) {
    return TrajectoryCalculator.calculateTrajectory(targetX, targetY, this.fallSpeed, this.difficulty);
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    
    // Check if we need to set up unlimited mode rainbow spawning for Stage 4
    if (this.scene.gameStateManager.unlimitedMode && !this.unlimitedRainbowTimer) {
      this.setupUnlimitedModeRainbowSpawn();
    }
    
    // Always calculate from base spawn rate to prevent accumulating changes
    let newSpawnRate = Math.max(400, this.baseSpawnRate - (difficulty * 150));
    
    // Stage-specific spawn rate adjustments
    const currentStage = this.scene.gameStateManager.currentStage;
    
    if (currentStage === 1) {
      // Stage 1: Slower spawning for easier gameplay
      newSpawnRate = Math.max(800, newSpawnRate * 1.8); // 80% slower spawning in Stage 1
    } else if (currentStage === 3) {
      // Stage 3: Faster spawning for more kale
      newSpawnRate = Math.max(300, newSpawnRate * 0.7); // 30% faster spawning in Stage 3
    }
    // Stage 2 uses normal spawn rates
    
    this.spawnTimer.delay = newSpawnRate;
  }

  destroy() {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
    if (this.rainbowGuaranteeTimer) {
      this.rainbowGuaranteeTimer.destroy();
    }
    if (this.unlimitedRainbowTimer) {
      this.unlimitedRainbowTimer.destroy();
    }
  }
}