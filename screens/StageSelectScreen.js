export class StageSelectScreen {
  constructor(scene, screenManager) {
    this.scene = scene;
    this.screenManager = screenManager;
    this.stageKeyListeners = [];
    this.interactiveElements = [];
    this._paying = false; // debounce for stage 4 clicks

    this.stageButtonStyles = [
      { shadow: 0x001100, border: 0x003300, topBorder: 0x00AA00, leftBorder: 0x008800, bg: 0x006600, stroke: '#003300', hover: { bg: 0x008800, topBorder: 0x00CC00, leftBorder: 0x00AA00 } },
      { shadow: 0x001144, border: 0x003366, topBorder: 0x0099CC, leftBorder: 0x0077AA, bg: 0x0066AA, stroke: '#003366', hover: { bg: 0x0088CC, topBorder: 0x00BBEE, leftBorder: 0x0099CC } },
      { shadow: 0x330044, border: 0x662288, topBorder: 0xBB66DD, leftBorder: 0x9944BB, bg: 0x8833AA, stroke: '#662288', hover: { bg: 0xAA44CC, topBorder: 0xDD88FF, leftBorder: 0xBB66DD } },
      { shadow: 0x440011, border: 0x882233, topBorder: 0xDD6688, leftBorder: 0xBB4466, bg: 0xAA3355, stroke: '#882233', hover: { bg: 0xCC4477, topBorder: 0xFF88AA, leftBorder: 0xDD6688 } }
    ];
  }

  // Small HUD message
  toast(msg, color = '#ffffff') {
    const t = this.scene.add.text(512, 700, msg, {
      fontSize: '18px',
      color,
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(9999);
    this.scene.time.delayedCall(2200, () => t.destroy());
  }

  // Unified entry for stage start; Stage 4 requires payment first
  async startStage(i) {
    try {
      if (i === 4) {
        if (this._paying) return; // debounce
        this._paying = true;

        // Require wallet + confirm
        if (!window.kaleChain) throw new Error("Wallet API not loaded.");
        await window.kaleChain.ensureConnected();

        const ok = confirm("Stage 4 requires a 1 KALE entry fee. Continue?");
        if (!ok) { this._paying = false; return; }

        // Pay entry fee via Freighter, throws on failure
        this.toast("Awaiting wallet confirmation…");
        await window.kaleChain.payEntryFee();
        this.toast("Payment successful! Entering Stage 4…");
      }

      // Store and launch
      localStorage.setItem('currentStage', String(i));
      this.screenManager.showCountdown();
    } catch (e) {
      console.error(e);
      const msg = (e && e.message) ? e.message : String(e);
      this.toast(`Payment failed: ${msg}`, '#ff6666');
    } finally {
      this._paying = false;
    }
  }

  createStyledButton(x, y, width, height, text, styleConfig, callback) {
    const shadow = this.scene.add.rectangle(x + (width * 0.03), y + (height * 0.08), width, height, styleConfig.shadow).setOrigin(0.5);
    const border = this.scene.add.rectangle(x, y, width, height, styleConfig.border).setOrigin(0.5);
    const topBorder = this.scene.add.rectangle(x, y - (height * 0.03), width * 0.98, height * 0.06, styleConfig.topBorder).setOrigin(0.5);
    const leftBorder = this.scene.add.rectangle(x - (width * 0.48), y, width * 0.02, height * 0.92, styleConfig.leftBorder).setOrigin(0.5);
    const bg = this.scene.add.rectangle(x, y, width * 0.96, height * 0.84, styleConfig.bg).setOrigin(0.5);
    const buttonText = this.scene.add.text(x, y, text, {
      fontSize: `${height * 0.5}px`,
      fill: '#FFFFFF',
      fontStyle: 'bold',
      strokeThickness: height * 0.03,
      stroke: styleConfig.stroke
    }).setOrigin(0.5);

    const buttonGroup = [buttonText, bg, border, topBorder, leftBorder, shadow];
    this.interactiveElements.push(...buttonGroup);

    buttonText.setInteractive({ useHandCursor: true });
    buttonText.on('pointerdown', callback);

    buttonText.on('pointerover', () => {
      buttonGroup.forEach(el => el.setScale(1.05));
      bg.setFillStyle(styleConfig.hover.bg);
      if (styleConfig.hover.topBorder) topBorder.setFillStyle(styleConfig.hover.topBorder);
      if (styleConfig.hover.leftBorder) leftBorder.setFillStyle(styleConfig.hover.leftBorder);
    });
    buttonText.on('pointerout', () => {
      buttonGroup.forEach(el => el.setScale(1.0));
      bg.setFillStyle(styleConfig.bg);
      if (styleConfig.topBorder) topBorder.setFillStyle(styleConfig.topBorder);
      if (styleConfig.leftBorder) leftBorder.setFillStyle(styleConfig.leftBorder);
    });

    return buttonText;
  }

  show() {
    // Basic cleanup of the current scene artifacts (non-destructive)
    this.scene.children.removeAll();
    this.scene.createBackground();
    this.scene.createClouds();

    const titleText = this.scene.add.text(512, 150, 'SELECT STAGE', {
      fontSize: '48px',
      fill: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.interactiveElements.push(titleText);

    for (let i = 1; i <= this.scene.gameStateManager.maxStages; i++) {
      const isUnlocked = i <= this.scene.gameStateManager.maxUnlockedStage;
      const yPos = 250 + (i - 1) * 100;

      if (isUnlocked) {
        const style = this.stageButtonStyles[i - 1];
        this.createStyledButton(512, yPos, 200, 56, `Stage ${i}`, style, () => this.startStage(i));

        // Number key shortcuts (1–4)
        const keyCallback = () => this.startStage(i);
        this.scene.input.keyboard.on(`keydown-${i}`, keyCallback);
        this.stageKeyListeners.push({ key: i, callback: keyCallback });

      } else {
        const lockedButton = this.scene.add.text(512, yPos, `Stage ${i}`, {
          fontSize: '32px',
          fill: '#888888',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        this.interactiveElements.push(lockedButton);
      }

      const stageTarget = this.scene.gameStateManager.stageTargets[i - 1];
      const targetDisplay = stageTarget === 0 ? 'Unlimited' : `Target: ${stageTarget} points`;
      const targetText = this.scene.add.text(512, yPos + 50, targetDisplay, {
        fontSize: '20px',
        fill: isUnlocked ? '#FFFFFF' : '#666666',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.interactiveElements.push(targetText);
    }

    // Back button
    const backButtonStyle = {
      shadow: 0x111111, border: 0x333333, topBorder: 0x666666, leftBorder: 0x555555, bg: 0x444444, stroke: '#222222',
      hover: { bg: 0x555555, topBorder: 0x777777, leftBorder: 0x666666 }
    };
    this.createStyledButton(100, 100, 140, 48, '← BACK', backButtonStyle, () => {
      this.cleanup();
      this.screenManager.showStartScreen();
    });

    // Helper text
    const instructText = this.scene.add.text(512, 650, 'Click stage button or press number keys 1–4\nPress ESC or Back to return', {
      fontSize: '20px',
      fill: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#0f1805',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.interactiveElements.push(instructText);

    // ESC to go back
    this.scene.input.keyboard.once('keydown-ESC', () => {
      this.cleanup();
      this.screenManager.showStartScreen();
    });
  }

  cleanup() {
    // Remove number key listeners
    this.stageKeyListeners.forEach(l => this.scene.input.keyboard.off(`keydown-${l.key}`, l.callback));
    this.stageKeyListeners = [];

    // Destroy UI elements
    if (this.interactiveElements) {
      this.interactiveElements.forEach(el => {
        if (el && typeof el.destroy === 'function' && !el.destroyed) el.destroy();
      });
      this.interactiveElements = [];
    }
  }
}
