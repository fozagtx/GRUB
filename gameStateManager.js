import Phaser from 'phaser';

export class GameStateManager {
  constructor(scene) {
    this.scene = scene;
    this.initializeGameState();
  }

  initializeGameState() {
    // Game state
    this.gameTime = 30;
    this.elapsedTime = 0; // Track elapsed time for unlimited mode
    this.score = 0;
    this.gameActive = false;
    this.difficulty = 1;
    this.rainbowKaleSpawned = false;
    this.lives = 3;
    this.maxLives = 3;
    this.chainMultiplier = 1;
    this.rainbowChainCount = 0;
    this.isInvulnerable = false;
    
    // Stage system
    this.currentStage = parseInt(localStorage.getItem('currentStage') || '1');
    this.maxUnlockedStage = parseInt(localStorage.getItem('maxUnlockedStage') || '1');
    this.stageTargets = [150, 300, 500, 0]; // 0 = unlimited mode for stage 4
    this.maxStages = 4;
    this.unlimitedMode = (this.currentStage === 4); // Set unlimited mode based on current stage
    this.stageCompleted = false;
    this.isRemixMode = JSON.parse(localStorage.getItem('isRemixMode') || 'false');
    this.isMuted = JSON.parse(localStorage.getItem('isMuted') || 'false');
    
    // Apply mute state immediately when initializing
    if (this.scene.sound) {
      this.scene.sound.setMute(this.isMuted);
    }
  }

  updateTimer() {
    if (!this.gameActive) return;
    
    if (this.unlimitedMode) {
      // In unlimited mode, count elapsed time upward
      this.elapsedTime++;
    } else {
      // In timed modes, count down
      this.gameTime--;
      
      if (this.gameTime <= 0) {
        // If stage was completed during play, show completion screen
        if (this.stageCompleted) {
          this.gameActive = false;
          this.scene.screenManager.showStageCompletion();
        } else {
          this.endGame();
          this.scene.screenManager.showGameOver();
        }
      }
    }
  }

  increaseDifficulty() {
    if (!this.gameActive) return;
    
    this.difficulty += 0.3;
    if (this.scene.itemManager) {
      this.scene.itemManager.setDifficulty(this.difficulty);
    }
    
    // Show visual feedback for difficulty increase in unlimited mode
    if (this.unlimitedMode && this.scene.uiManager) {
      this.scene.uiManager.showDifficultyIncrease();
    }
  }

  addScore(basePoints, isRainbowJuggled = false) {
    if (!isRainbowJuggled) {
      this.score += basePoints * this.chainMultiplier;
    } else {
      this.score += basePoints;
    }
    this.checkStageProgression();
  }
  incrementRainbowChain() {
    this.rainbowChainCount++;
    this.chainMultiplier = this.rainbowChainCount + 1;
  }
  resetChainMultiplier() {
    this.chainMultiplier = 1;
    this.rainbowChainCount = 0;
  }

  checkStageProgression() {
    // Skip target checking for unlimited mode (stage 4)
    if (this.unlimitedMode) {
      return; // No target to reach in unlimited mode
    }
    
    // Check if player has reached the target for current stage
    if (this.currentStage <= this.maxStages && !this.stageCompleted) {
      const targetScore = this.stageTargets[this.currentStage - 1];
      
      if (this.score >= targetScore) {
        this.markStageComplete();
      }
    }
  }

  markStageComplete() {
    this.stageCompleted = true;
    
    // End the game immediately when target is reached
    this.gameActive = false;
    
    // Stop all timers
    if (this.scene.gameTimer) this.scene.gameTimer.destroy();
    if (this.scene.difficultyTimer) this.scene.difficultyTimer.destroy();
    
    // Stop item spawning
    if (this.scene.itemManager && this.scene.itemManager.spawner && this.scene.itemManager.spawner.destroy) {
      this.scene.itemManager.spawner.destroy();
    }
    
    // Unlock next stage if available
    if (this.currentStage < this.maxStages) {
      const nextStage = this.currentStage + 1;
      const currentMaxUnlocked = Math.max(this.maxUnlockedStage, nextStage);
      localStorage.setItem('maxUnlockedStage', currentMaxUnlocked.toString());
      this.maxUnlockedStage = currentMaxUnlocked;
    }
    
    // Trigger fireworks celebration
    this.scene.showFireworks();
  }
  toggleRemixMode() {
    this.isRemixMode = !this.isRemixMode;
    localStorage.setItem('isRemixMode', JSON.stringify(this.isRemixMode));
  }
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('isMuted', JSON.stringify(this.isMuted));
    
    // Apply mute state using Phaser's built-in sound system
    this.scene.sound.setMute(this.isMuted);
    
    // Also apply to soundManager if it has mute methods
    if (this.scene.soundManager) {
      if (typeof this.scene.soundManager.setMute === 'function') {
        this.scene.soundManager.setMute(this.isMuted);
      }
    }
  }
  activateInvincibility(duration = 5000) {
      if (this.isInvulnerable) return; // Already active
      this.isInvulnerable = true;
      this.scene.handController.showInvincibilityEffect(true);
      // Set a timer to end invincibility
      this.scene.time.delayedCall(duration, () => {
          this.isInvulnerable = false;
          this.scene.handController.showInvincibilityEffect(false);
      });
  }
  loseLife() {
    if (this.isInvulnerable) return;
    this.lives--;
    
    // Visual feedback for losing a life
    this.scene.cameras.main.flash(300, 255, 100, 100);
    
    if (this.lives <= 0) {
      this.endGame();
      this.scene.screenManager.showGameOver();
    }
  }
  
  restoreLife() {
    if (this.lives < this.maxLives) {
      this.lives++;
      return true;
    }
    return false;
  }
  stunHand(hand, duration = 2000) {
    if (hand === 'left') {
      this.scene.handController.stunLeftHand(duration);
    } else {
      this.scene.handController.stunRightHand(duration);
    }
    
    // Visual feedback
    this.scene.cameras.main.shake(200, 0.02);
  }

  resetForNewGame() {
    this.gameTime = 30;
    this.elapsedTime = 0;
    this.score = 0;
    this.gameActive = false;
    this.difficulty = 1;
    this.rainbowKaleSpawned = false;
    this.lives = 3;
    this.stageCompleted = false;
    this.isInvulnerable = false;
    this.resetChainMultiplier();
    this.isRemixMode = JSON.parse(localStorage.getItem('isRemixMode') || 'false');
    this.isMuted = JSON.parse(localStorage.getItem('isMuted') || 'false');
    
    // Apply mute state when resetting for new game
    if (this.scene.sound) {
      this.scene.sound.setMute(this.isMuted);
    }
    
    // Update current stage from localStorage
    this.currentStage = parseInt(localStorage.getItem('currentStage') || '1');
    this.maxUnlockedStage = parseInt(localStorage.getItem('maxUnlockedStage') || '1');
    
    // Recalculate unlimited mode based on current stage
    this.unlimitedMode = (this.currentStage === 4);
  }

  startGame() {
    this.gameActive = true;
    // Check if current stage is unlimited mode (stage 4)
    this.unlimitedMode = (this.currentStage === 4);
  }

  endGame() {
    this.gameActive = false;
  }
}