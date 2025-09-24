export class StageCompletionScreen {
  constructor(scene, screenManager) {
    this.scene = scene;
    this.screenManager = screenManager;
  }

  show() {
    // Stop timers
    if (this.scene.gameTimer) {
      this.scene.gameTimer.destroy();
      this.scene.gameTimer = null;
    }
    if (this.scene.difficultyTimer) {
      this.scene.difficultyTimer.destroy();
      this.scene.difficultyTimer = null;
    }
    
    // Stop item spawning timers
    if (this.scene.itemManager && this.scene.itemManager.spawner) {
      if (this.scene.itemManager.spawner.spawnTimer) {
        this.scene.itemManager.spawner.spawnTimer.destroy();
        this.scene.itemManager.spawner.spawnTimer = null;
      }
      if (this.scene.itemManager.spawner.rainbowGuaranteeTimer) {
        this.scene.itemManager.spawner.rainbowGuaranteeTimer.destroy();
        this.scene.itemManager.spawner.rainbowGuaranteeTimer = null;
      }
      if (this.scene.itemManager.spawner.unlimitedRainbowTimer) {
        this.scene.itemManager.spawner.unlimitedRainbowTimer.destroy();
        this.scene.itemManager.spawner.unlimitedRainbowTimer = null;
      }
    }
    
    // Clean up all tweens to prevent memory leaks and errors
    this.scene.tweens.killAll();
    
    // Clean up farmer idle animation specifically if handController exists
    if (this.scene.handController && this.scene.handController.farmer) {
      this.scene.tweens.killTweensOf(this.scene.handController.farmer);
    }
    
    // Clean up item effect tweens
    if (this.scene.itemManager) {
      this.scene.itemManager.items.forEach(item => {
        if (item.colorTimer) {
          item.colorTimer.destroy();
          item.colorTimer = null;
        }
        // Kill any tweens on the item (glow effects, etc.)
        this.scene.tweens.killTweensOf(item);
        if (item.sparkles) {
          this.scene.tweens.killTweensOf(item.sparkles);
        }
      });
    }
    
    // Stop background music
    this.scene.soundManager.stopBackgroundMusic();
    
    // Re-create the background to ensure it's visible
    // this.scene.createBackground(); // No longer needed, gameScene.update handles this
    
    const completionText = this.scene.add.text(512, 300, `STAGE ${this.scene.gameStateManager.currentStage} COMPLETE!`, {
      fontSize: '48px',
      fill: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const scoreText = this.scene.add.text(512, 380, `Final Score: ${this.scene.gameStateManager.score}`, {
      fontSize: '32px',
      fill: '#00FF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    let continueText;
    if (this.scene.gameStateManager.currentStage < this.scene.gameStateManager.maxStages) {
      continueText = this.scene.add.text(512, 450, 'Press SPACE for next stage', {
        fontSize: '24px',
        fill: '#006600'
      }).setOrigin(0.5);
    } else {
      continueText = this.scene.add.text(512, 450, 'All stages complete!\nPress SPACE to return to Stage 1', {
        fontSize: '24px',
        fill: '#006600',
        align: 'center'
      }).setOrigin(0.5);
    }
    
    // Add stage select option
    const selectText = this.scene.add.text(512, 520, 'Press S for Stage Select', {
      fontSize: '20px',
      fill: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Handle continue input
    this.scene.input.keyboard.once('keydown-SPACE', () => {
      if (this.scene.gameStateManager.currentStage < this.scene.gameStateManager.maxStages) {
        localStorage.setItem('currentStage', (this.scene.gameStateManager.currentStage + 1).toString());
      } else {
        localStorage.setItem('currentStage', '1');
      }
      this.scene.scene.restart();
    });
    
    // Handle stage select input
    this.scene.input.keyboard.once('keydown-S', () => {
      this.screenManager.showStageSelect();
    });
  }

  cleanup() {
    // This screen has no complex elements to clean up beyond what screenManager does
  }
}