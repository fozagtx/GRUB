

export class OptionsScreen {
  constructor(scene, screenManager) {
    this.scene = scene;
    this.screenManager = screenManager;
    this.interactiveElements = [];
    this.remixButton = null;
    this.muteButton = null;
  }

  _createButton(config) {
    const { x, y, width, height, text, style, callback } = config;
    const shadow = this.scene.add.rectangle(x + (width * 0.035), y + (height * 0.1), width, height, style.shadow).setOrigin(0.5);
    const border = this.scene.add.rectangle(x, y, width, height, style.border).setOrigin(0.5);
    const topBorder = this.scene.add.rectangle(x, y - (height * 0.03), width * 0.98, height * 0.06, style.topBorder).setOrigin(0.5);
    const leftBorder = this.scene.add.rectangle(x - (width * 0.48), y, width * 0.02, height * 0.94, style.leftBorder).setOrigin(0.5);
    const bg = this.scene.add.rectangle(x, y, width * 0.96, height * 0.84, style.bg).setOrigin(0.5);
    const buttonText = this.scene.add.text(x, y, text, {
        fontSize: `${height * 0.5}px`,
        fill: '#FFFFFF',
        fontStyle: 'bold',
        strokeThickness: height * 0.03,
        stroke: style.stroke
    }).setOrigin(0.5);
    const buttonGroup = [buttonText, bg, border, topBorder, leftBorder, shadow];
    this.interactiveElements.push(...buttonGroup);
    buttonText.setInteractive({ useHandCursor: true });
    buttonText.on('pointerdown', callback);
    buttonText.on('pointerover', () => {
        buttonGroup.forEach(el => el.setScale(1.05));
        bg.setFillStyle(style.hover.bg);
        if (style.hover.topBorder) topBorder.setFillStyle(style.hover.topBorder);
        if (style.hover.leftBorder) leftBorder.setFillStyle(style.hover.leftBorder);
    });
    buttonText.on('pointerout', () => {
        buttonGroup.forEach(el => el.setScale(1.0));
        bg.setFillStyle(style.bg);
        if (style.topBorder) topBorder.setFillStyle(style.topBorder);
        if (style.leftBorder) leftBorder.setFillStyle(style.leftBorder);
    });
    return buttonGroup;
  }

  show() {
    this.interactiveElements = [];
    
    // Clear existing UI
    this.scene.children.removeAll();
    this.scene.createBackground();
    this.scene.createClouds();

    // Title
    const titleText = this.scene.add.text(512, 200, 'OPTIONS', {
      fontSize: '64px',
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
    this.interactiveElements.push(titleText);

    const buttonStyles = {
        remix: { shadow: 0x113322, border: 0x226644, topBorder: 0x66CC99, leftBorder: 0x44AA77, bg: 0x339966, stroke: '#226644', hover: { bg: 0x44AA77, topBorder: 0x88DDBB, leftBorder: 0x66CC99 } },
        reset: { shadow: 0x440000, border: 0x881111, topBorder: 0xDD5555, leftBorder: 0xBB3333, bg: 0xAA2222, stroke: '#660000', hover: { bg: 0xCC3333, topBorder: 0xFF7777, leftBorder: 0xDD5555 } },
        back: { shadow: 0x111111, border: 0x333333, topBorder: 0x666666, leftBorder: 0x555555, bg: 0x444444, stroke: '#222222', hover: { bg: 0x555555, topBorder: 0x777777, leftBorder: 0x666666 } },
        mute: { shadow: 0x664400, border: 0xCC8800, topBorder: 0xFFDD44, leftBorder: 0xFFCC22, bg: 0xFFBB00, stroke: '#996600', hover: { bg: 0xFFCC22, topBorder: 0xFFEE66, leftBorder: 0xFFDD44 } },
        chromatic: { shadow: 0x440044, border: 0xFF0080, topBorder: 0x00FFFF, leftBorder: 0xFF8000, bg: 0x8000FF, stroke: '#FF0080', hover: { bg: 0xFF0080, topBorder: 0x80FF00, leftBorder: 0x00FFFF } }
    };
    // Create REMIX button only if stage 4 is unlocked
    if (this.scene.gameStateManager.maxUnlockedStage >= 4) {
      const remixGroup = this._createButton({ 
        x: 512, y: 350, width: 320, height: 64, text: '', 
        style: buttonStyles.chromatic, 
        callback: () => { 
          this.scene.gameStateManager.toggleRemixMode(); 
          this.updateRemixButton(); 
        } 
      });
      this.remixButton = remixGroup[0]; 
      this.remixButtonGroup = remixGroup; // Store the entire button group for animation
      this.updateRemixButton();
      this.startChromaticAnimation();
    }
    // Create MUTE button
    const muteGroup = this._createButton({ 
      x: 512, y: 430, width: 260, height: 64, text: '', 
      style: buttonStyles.mute, 
      callback: () => { 
        this.scene.gameStateManager.toggleMute(); 
        this.updateMuteButton(); 
      } 
    });
    this.muteButton = muteGroup[0]; 
    this.updateMuteButton();
    // Create RESET DATA button
    this._createButton({ 
      x: 512, y: 510, width: 260, height: 64, text: 'RESET DATA', 
      style: buttonStyles.reset, 
      callback: () => this.showResetConfirmation() 
    });
    // Create BACK button
    this._createButton({ 
      x: 512, y: 590, width: 200, height: 64, text: '← BACK', 
      style: buttonStyles.back, 
      callback: () => { 
        this.cleanup(); 
        this.screenManager.showStartScreen(); 
      } 
    });

    // Keyboard shortcut for back
    this.scene.input.keyboard.once('keydown-ESC', () => {
      this.cleanup();
      this.screenManager.showStartScreen();
    });

    // Instructions
    const instructText = this.scene.add.text(512, 680, 'Press ESC or Back to return', {
      fontSize: '20px',
      fill: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#0f1805',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.interactiveElements.push(instructText);
  }

  updateRemixButton() {
    if (this.remixButton) {
      const mode = this.scene.gameStateManager.isRemixMode ? "ON" : "OFF";
      this.remixButton.setText(`REMIX MODE: ${mode}`);
    }
  }
  updateMuteButton() {
    if (this.muteButton) {
      const mode = this.scene.gameStateManager.isMuted ? "ON" : "OFF";
      this.muteButton.setText(`MUTE: ${mode}`);
    }
  }
  showResetConfirmation() {
    // Disable all other buttons
    this.interactiveElements.forEach(el => el.disableInteractive ? el.disableInteractive() : null);
    
    // Create a semi-transparent background overlay
    const overlay = this.scene.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7).setInteractive();
    overlay.setDepth(1000);
    
    // Create the confirmation dialog box
    const dialogBg = this.scene.add.rectangle(512, 384, 500, 250, 0x1a1a1a).setStrokeStyle(2, 0x888888);
    dialogBg.setDepth(1001);
    
    const confirmationText = this.scene.add.text(512, 320, 'Delete all game data?\nThis cannot be undone.', {
      fontSize: '24px',
      fill: '#FFFFFF',
      align: 'center',
      wordWrap: { width: 480 }
    }).setOrigin(0.5).setDepth(1001);
    
    // Create "YES" button
    const yesButtonBg = this.scene.add.rectangle(412, 420, 120, 50, 0xAA2222).setDepth(1001);
    const yesButton = this.scene.add.text(412, 420, 'YES', { fontSize: '24px', fill: '#FFFFFF' }).setOrigin(0.5).setDepth(1001);
    yesButton.setInteractive({ useHandCursor: true });
    yesButton.on('pointerdown', () => {
      localStorage.removeItem('currentStage');
      localStorage.removeItem('maxUnlockedStage');
      localStorage.removeItem('unlimitedHighScores');
      localStorage.removeItem('isRemixMode');
      this.scene.time.delayedCall(100, () => this.scene.scene.restart());
    });
    
    // Create "NO" button
    const noButtonBg = this.scene.add.rectangle(612, 420, 120, 50, 0x444444).setDepth(1001);
    const noButton = this.scene.add.text(612, 420, 'NO', { fontSize: '24px', fill: '#FFFFFF' }).setOrigin(0.5).setDepth(1001);
    noButton.setInteractive({ useHandCursor: true });
    noButton.on('pointerdown', () => {
      // Remove confirmation UI and re-enable buttons
      overlay.destroy();
      dialogBg.destroy();
      confirmationText.destroy();
      yesButtonBg.destroy();
      yesButton.destroy();
      noButtonBg.destroy();
      noButton.destroy();
      this.interactiveElements.forEach(el => el.setInteractive ? el.setInteractive({ useHandCursor: true }) : null);
    });
  }

  cleanup() {
    if (this.interactiveElements) {
      this.interactiveElements.forEach(el => {
        if (el && typeof el.destroy === 'function' && !el.destroyed) {
          el.destroy();
        }
      });
      this.interactiveElements = [];
    }
    
    // Remove all keyboard listeners
    this.scene.input.keyboard.removeAllListeners();
    this.scene.tweens.killAll();
  }
  startChromaticAnimation() {
    if (!this.remixButtonGroup || this.remixButtonGroup.length === 0 || this.scene.gameStateManager.maxUnlockedStage < 4) return;
    
    // Define color sequence for smooth chromatic transition
    const colorSequence = [
      { bg: 0xFF0080, topBorder: 0x00FFFF, leftBorder: 0xFF8000 }, // Pink/Cyan/Orange
      { bg: 0x8000FF, topBorder: 0x80FF00, leftBorder: 0x00FFFF }, // Purple/Green/Cyan
      { bg: 0x00FF80, topBorder: 0xFF0080, leftBorder: 0x8000FF }, // Green/Pink/Purple
      { bg: 0xFF8000, topBorder: 0x0080FF, leftBorder: 0xFF0080 }, // Orange/Blue/Pink
      { bg: 0x0080FF, topBorder: 0xFF8000, leftBorder: 0x80FF00 }, // Blue/Orange/Green
      { bg: 0xFF0080, topBorder: 0x00FF80, leftBorder: 0x0080FF }  // Pink/Green/Blue
    ];
    
    let currentColorIndex = 0;
    
    // Get button elements: [text, bg, border, topBorder, leftBorder, shadow]
    const bgElement = this.remixButtonGroup[1];
    const topBorderElement = this.remixButtonGroup[3];
    const leftBorderElement = this.remixButtonGroup[4];
    
    const animateColors = () => {
      const currentColors = colorSequence[currentColorIndex];
      const nextColors = colorSequence[(currentColorIndex + 1) % colorSequence.length];
      
      // Create smooth color transitions for each element
      this.scene.tweens.add({
        targets: { bgColor: currentColors.bg },
        bgColor: nextColors.bg,
        duration: 1000,
        ease: 'Sine.easeInOut',
        onUpdate: (tween) => {
          const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.IntegerToColor(currentColors.bg),
            Phaser.Display.Color.IntegerToColor(nextColors.bg),
            1,
            tween.progress
          );
          bgElement.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
        }
      });
      
      this.scene.tweens.add({
        targets: { topColor: currentColors.topBorder },
        topColor: nextColors.topBorder,
        duration: 1000,
        ease: 'Sine.easeInOut',
        onUpdate: (tween) => {
          const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.IntegerToColor(currentColors.topBorder),
            Phaser.Display.Color.IntegerToColor(nextColors.topBorder),
            1,
            tween.progress
          );
          topBorderElement.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
        }
      });
      
      this.scene.tweens.add({
        targets: { leftColor: currentColors.leftBorder },
        leftColor: nextColors.leftBorder,
        duration: 1000,
        ease: 'Sine.easeInOut',
        onUpdate: (tween) => {
          const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.IntegerToColor(currentColors.leftBorder),
            Phaser.Display.Color.IntegerToColor(nextColors.leftBorder),
            1,
            tween.progress
          );
          leftBorderElement.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
        },
        onComplete: () => {
          currentColorIndex = (currentColorIndex + 1) % colorSequence.length;
          animateColors(); // Continue the loop
        }
      });
    };
    
    // Start the animation
    animateColors();
  }
}

