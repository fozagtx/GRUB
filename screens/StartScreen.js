export class StartScreen {
  constructor(scene, screenManager) {
    this.scene = scene;
    this.screenManager = screenManager;
    this.keyboardListeners = []; // Track keyboard listeners for cleanup
    this.remixButton = null;
    this.remixButtonGroup = [];
    this.interactiveElements = [];
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
    // Game title
    const titleText = this.scene.add.text(512, 200, 'KALE GRAB RUSH', {
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
        start: { shadow: 0x001100, border: 0x003300, topBorder: 0x00AA00, leftBorder: 0x008800, bg: 0x006600, stroke: '#003300', hover: { bg: 0x008800, topBorder: 0x00CC00, leftBorder: 0x00AA00 } },
        howTo: { shadow: 0x441100, border: 0x994400, topBorder: 0xFFAA44, leftBorder: 0xFF8822, bg: 0xFF6600, stroke: '#994400', hover: { bg: 0xFF8833, topBorder: 0xFFCC66, leftBorder: 0xFFAA44 } },
        leaderboard: { shadow: 0x221144, border: 0x442266, topBorder: 0x9966CC, leftBorder: 0x7744AA, bg: 0x663399, stroke: '#442266', hover: { bg: 0x7744AA, topBorder: 0xBB88EE, leftBorder: 0x9966CC } },
        remix: { shadow: 0x113322, border: 0x226644, topBorder: 0x66CC99, leftBorder: 0x44AA77, bg: 0x339966, stroke: '#226644', hover: { bg: 0x44AA77 } },
        reset: { shadow: 0x440000, border: 0x881111, topBorder: 0xDD5555, leftBorder: 0xBB3333, bg: 0xAA2222, stroke: '#660000', hover: { bg: 0xCC3333 } }
    };
    // Create Buttons
    this._createButton({ x: 512, y: 350, width: 240, height: 72, text: 'START GAME', style: buttonStyles.start, callback: () => { this.cleanup(); this.screenManager.showStageSelect(); } });
    this._createButton({ x: 512, y: 450, width: 220, height: 64, text: 'HOW TO PLAY', style: buttonStyles.howTo, callback: () => { this.cleanup(); this.screenManager.showHowToPlay(); } });
    this._createButton({ x: 512, y: 550, width: 240, height: 64, text: 'LEADERBOARD', style: buttonStyles.leaderboard, callback: () => { this.cleanup(); this.screenManager.showLeaderboard(); } });
    this._createButton({ x: 512, y: 650, width: 200, height: 64, text: 'OPTIONS', style: buttonStyles.remix, callback: () => { this.cleanup(); this.screenManager.showOptions(); } });
    // Keyboard shortcuts
    this.addKeyboardListener('keydown-ENTER', () => { this.cleanup(); this.screenManager.showStageSelect(); });
    this.addKeyboardListener('keydown-H', () => { this.cleanup(); this.screenManager.showHowToPlay(); });
    this.addKeyboardListener('keydown-L', () => { this.cleanup(); this.screenManager.showLeaderboard(); });
    this.addKeyboardListener('keydown-O', () => { this.cleanup(); this.screenManager.showOptions(); });
    // Instructions
    const instructText = this.scene.add.text(512, 720, 'Click START or press ENTER\nPress H for How to Play • Press L for Leaderboard • Press O for Options', {
      fontSize: '20px',
      fill: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    this.interactiveElements.push(instructText);
  }
  addKeyboardListener(key, callback) {
      this.scene.input.keyboard.on(key, callback);
      this.keyboardListeners.push({ key, callback });
  }
  cleanup() {
    this.cleanupKeyboardListeners();
    if (this.scene.gameTimer) {
      this.scene.gameTimer.destroy();
      this.scene.gameTimer = null;
    }
    if (this.scene.difficultyTimer) {
      this.scene.difficultyTimer.destroy();
      this.scene.difficultyTimer = null;
    }
    this.scene.tweens.killAll();
    if (this.interactiveElements) {
        this.interactiveElements.forEach(el => {
            if (el && typeof el.destroy === 'function' && !el.destroyed) {
                el.destroy();
            }
        });
        this.interactiveElements = [];
    }
    // The parent cleanupAllScreens handles the rest.
  }
  cleanupKeyboardListeners() {
    // Clean up all keyboard listeners
    this.keyboardListeners.forEach(listener => {
      this.scene.input.keyboard.off(listener.key, listener.callback);
    });
    this.keyboardListeners = [];
  }
}