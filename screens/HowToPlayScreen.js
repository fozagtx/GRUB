export class HowToPlayScreen {
  constructor(scene, screenManager) {
    this.scene = scene;
    this.screenManager = screenManager;
  }

  show() {
    // Aggressive cleanup to prevent input bleed from other screens
    this.cleanup(); 
    this.scene.createBackground();
    
    // Title
    const titleText = this.scene.add.text(512, 80, 'HOW TO PLAY', {
      fontSize: '48px',
      fill: '#00FF00',
      fontStyle: 'bold',
      stroke: '#1a3009',
      strokeThickness: 6,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#0f1805',
        blur: 2,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);
    
    // Game instructions
    const instructionsText = this.scene.add.text(512, 280, 
      'CONTROLS:\n\n' +
      '• Use A key or ← Arrow to grab with LEFT hand\n' +
      '• Use D key or → Arrow to grab with RIGHT hand\n' +
      '• Press S during gameplay for Stage Select\n\n' +
      'SCORING:\n\n' +
      '• Golden Kale = 5 points\n' +
      '• Kale Bunch = 3 points\n' +
      '• Single Kale = 1 point\n' +
      '• Rainbow Kale = Chain multiplier (1x, 2x, 3x...)\n\n' +
      'HAZARDS:\n\n' +
      '• Avoid Cabbage Worms - they stun your hands!\n' +
      '• Missing kale costs a life\n' +
      '• Dropping rainbow kale breaks the chain', {
      fontSize: '20px',
      fill: '#FFFFFF',
      fontStyle: 'bold',
      align: 'left',
      stroke: '#1a3009',
      strokeThickness: 4,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#0f1805',
        blur: 1,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);
    
    // Stage info
    const stageInfoText = this.scene.add.text(512, 560, 
      'STAGES:\n\n' +
      'Stage 1: Score 50 points (30 seconds)\n' +
      'Stage 2: Score 100 points (30 seconds)\n' +
      'Stage 3: Score 150 points (30 seconds)\n' +
      'Stage 4: Unlimited Mode - Survive as long as possible!', {
      fontSize: '18px',
      fill: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#1a3009',
      strokeThickness: 4,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#0f1805',
        blur: 1,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);
    
    // Add back button with 3D styling
    // Bottom shadow layer
    const backButtonShadow = this.scene.add.rectangle(100 + 4, 100 + 4, 140, 48, 0x111111);
    backButtonShadow.setOrigin(0.5);
    // Dark border layer
    const backButtonBorder = this.scene.add.rectangle(100, 100, 140, 48, 0x333333);
    backButtonBorder.setOrigin(0.5);
    // Light top border for 3D effect
    const backButtonTopBorder = this.scene.add.rectangle(100, 100 - 1, 136, 3, 0x666666);
    backButtonTopBorder.setOrigin(0.5);
    // Left light border
    const backButtonLeftBorder = this.scene.add.rectangle(100 - 66, 100, 3, 44, 0x555555);
    backButtonLeftBorder.setOrigin(0.5);
    // Main button background
    const backButtonBg = this.scene.add.rectangle(100, 100, 132, 40, 0x444444);
    backButtonBg.setOrigin(0.5);
    // Back button text
    const backButton = this.scene.add.text(100, 100, '← BACK', {
      fontSize: '24px',
      fill: '#FFFFFF',
      fontStyle: 'bold',
      strokeThickness: 1,
      stroke: '#222222'
    }).setOrigin(0.5);
    // Group all button elements for interactive behavior
    const backButtonGroup = [backButton, backButtonBg, backButtonBorder, backButtonTopBorder, backButtonLeftBorder, backButtonShadow];
    // Make back button interactive
    backButton.setInteractive({ useHandCursor: true });
    // Button hover effects
    backButton.on('pointerover', () => {
      backButtonGroup.forEach(element => element.setScale(1.05));
      backButtonBg.setFillStyle(0x555555);
      backButtonTopBorder.setFillStyle(0x777777);
      backButtonLeftBorder.setFillStyle(0x666666);
    });
    backButton.on('pointerout', () => {
      backButtonGroup.forEach(element => element.setScale(1.0));
      backButtonBg.setFillStyle(0x444444);
      backButtonTopBorder.setFillStyle(0x666666);
      backButtonLeftBorder.setFillStyle(0x555555);
    });
    // Back button click
    backButton.on('pointerdown', () => {
      this.cleanup();
      this.screenManager.showStartScreen();
    });
    
    // Keyboard shortcut for back
    this.scene.input.keyboard.once('keydown-ESC', () => {
      this.cleanup();
      this.screenManager.showStartScreen();
    });
    
    const instructText = this.scene.add.text(512, 650, 'Click BACK button or press ESC to return', {
      fontSize: '20px',
      fill: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#1a3009',
      strokeThickness: 2
    }).setOrigin(0.5);
  }
  
  cleanup() {
    // Clear all UI elements explicitly
    this.scene.children.removeAll();
    // Ensure all tweens are stopped
    this.scene.tweens.killAll();
    // Stop all timers to prevent any leftover processes
    if (this.scene.gameTimer) {
      this.scene.gameTimer.destroy();
      this.scene.gameTimer = null;
    }
    if (this.scene.difficultyTimer) {
      this.scene.difficultyTimer.destroy();
      this.scene.difficultyTimer = null;
    }
    // Explicitly remove any lingering keyboard listeners from other screens
    this.scene.input.keyboard.removeAllListeners();
    // Make sure specific problematic keys are cleared
    for (let i = 1; i <= 4; i++) {
        this.scene.input.keyboard.removeKey(48 + i, false); // key codes for '1' through '4'
        this.scene.input.keyboard.removeAllListeners(`keydown-${i}`);
    }
  }
}