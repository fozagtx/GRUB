import Phaser from 'phaser';

export class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.createUI();
  }

  createUI() {
    // Score display
    this.scoreText = this.scene.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });

    // Timer display
    this.timerText = this.scene.add.text(1008, 16, 'Time: 30', {
      fontSize: '32px',
      fill: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(1, 0);

    // Lives display
    this.livesIcons = this.scene.add.group();

    this.updateLivesDisplay();
  }

  update() {
    this.scoreText.setText(`Score: ${this.scene.gameStateManager.score}`);

    if (this.scene.gameStateManager.unlimitedMode) {
      const minutes = Math.floor(this.scene.gameStateManager.elapsedTime / 60);
      const seconds = this.scene.gameStateManager.elapsedTime % 60;
      this.timerText.setText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`);
    } else {
      this.timerText.setText(`Time: ${this.scene.gameStateManager.gameTime}`);
    }
    
    this.updateLivesDisplay();
  }

  updateLivesDisplay() {
    this.livesIcons.clear(true, true); // Destroy old icons
    const lives = this.scene.gameStateManager.lives;
    const iconSpacing = 40;
    const startX = 512 - ((lives - 1) * iconSpacing) / 2;
    for (let i = 0; i < lives; i++) {
        const lifeIcon = this.scene.add.image(startX + (i * iconSpacing), 32, 'kaleSingle');
        lifeIcon.setScale(0.12).setDepth(1001);
        this.livesIcons.add(lifeIcon);
    }
  }

  showDifficultyIncrease() {
    const difficultyText = this.scene.add.text(512, 120, 'SPEED UP!', {
      fontSize: '36px',
      fill: '#FF4500',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(1001);

    this.scene.tweens.add({
      targets: difficultyText,
      alpha: 0,
      y: '+=50',
      duration: 1500,
      ease: 'Power2',
      onComplete: () => difficultyText.destroy()
    });
  }

  showFloatingScore(points, x, y, isGolden = false) {
    if (this.scene.goldenParticles && isGolden) {
        this.scene.goldenParticles.emitParticleAt(x, y);
    } else if (this.scene.successParticles) {
        this.scene.successParticles.emitParticleAt(x, y);
    }
    
    const scoreText = this.scene.add.text(x, y, `+${points}`, {
      fontSize: '24px',
      fill: isGolden ? '#FFD700' : '#00FF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: scoreText,
      y: y - 60,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => scoreText.destroy()
    });
  }
  
  showLifeUp(x, y) {
    const lifeUpText = this.scene.add.text(x, y, `+1 LIFE!`, {
      fontSize: '24px',
      fill: '#FF69B4',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: lifeUpText,
      y: y - 60,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => lifeUpText.destroy()
    });
  }
}