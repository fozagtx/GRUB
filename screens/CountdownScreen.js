export class CountdownScreen {
  constructor(scene, screenManager) {
    this.scene = scene;
    this.screenManager = screenManager;
  }

  show() {
    // Clear existing UI
    this.scene.children.removeAll();
    this.scene.createBackground();
    
    // Show stage info
    const stageNum = parseInt(localStorage.getItem('currentStage') || '1');
    const stageText = this.scene.add.text(512, 200, `STAGE ${stageNum}`, {
      fontSize: '48px',
      fill: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const stageTarget = this.scene.gameStateManager.stageTargets[stageNum - 1];
    const targetDisplay = stageTarget === 0 ? 'Unlimited' : `Target: ${stageTarget} points`;
    const targetText = this.scene.add.text(512, 260, targetDisplay, {
      fontSize: '24px',
      fill: '#FFFFFF'
    }).setOrigin(0.5);
    
    // Create countdown text
    const countdownText = this.scene.add.text(512, 350, '3', {
      fontSize: '120px',
      fill: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    let count = 3;
    
    // Play initial beep for "3"
    this.scene.soundManager.playCountdownBeep();
    
    // Countdown timer
    const countdownTimer = this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        count--;
        if (count > 0) {
          // Play beep sound for numbers
          this.scene.soundManager.playCountdownBeep();
          
          countdownText.setText(count.toString());
          // Scale animation for countdown
          countdownText.setScale(1.5);
          this.scene.tweens.add({
            targets: countdownText,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            ease: 'Bounce.easeOut'
          });
        } else {
          // Play GO sound
          this.scene.soundManager.playGoSound();
          
          countdownText.setText('GO!');
          countdownText.setFill('#00FF00');
          // Final GO! animation
          countdownText.setScale(2);
          this.scene.tweens.add({
            targets: countdownText,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
              // Start the game after GO! animation
              this.scene.time.delayedCall(300, () => {
                this.cleanup();
                this.scene.startGame();
              });
            }
          });
          countdownTimer.destroy();
        }
      },
      repeat: 2
    });
    
    // Initial scale animation for first number
    countdownText.setScale(1.5);
    this.scene.tweens.add({
      targets: countdownText,
      scaleX: 1,
      scaleY: 1,
      duration: 800,
      ease: 'Bounce.easeOut'
    });
  }
  
  cleanup() {
    // Stop all timers to prevent any leftover processes
    if (this.scene.gameTimer) {
      this.scene.gameTimer.destroy();
      this.scene.gameTimer = null;
    }
    if (this.scene.difficultyTimer) {
      this.scene.difficultyTimer.destroy();
      this.scene.difficultyTimer = null;
    }
    
    // Ensure all tweens are stopped
    this.scene.tweens.killAll();
    
    // Clear all UI elements explicitly
    this.scene.children.removeAll();
  }
}