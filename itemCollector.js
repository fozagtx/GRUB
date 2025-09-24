import Phaser from 'phaser';

export class ItemCollector {
  constructor(scene, itemManager) {
    this.scene = scene;
    this.itemManager = itemManager;
    this.chainBonusText = null;
    this.chainBonusTween = null;
  }

  collectItem(item, hand) {
    if (item.itemType === 'rainbow') {
      this.handleRainbowKaleCollection(item, hand);
      return;
    }
    if (item.itemType === 'kaleshake') {
      if (this.scene.gameStateManager.restoreLife()) {
        this.scene.uiManager.showLifeUp(item.x, item.y);
      }
    } else if (item.itemType === 'crystal') {
      this.scene.gameStateManager.activateInvincibility();
    }
    
    // Kale shake doesn't give points unless we want it to.
    if (item.itemType !== 'kaleshake') {
        this.scene.gameStateManager.addScore(item.points);
        this.scene.uiManager.showFloatingScore(item.points * this.scene.gameStateManager.chainMultiplier, item.x, item.y, item.isGolden || item.itemType === 'crystal');
    }
    // Clean up sparkles if it's rainbow kale
    if (item.itemType === 'rainbow' && item.sparkles) {
      item.sparkles.destroy();
    }
    
    // Remove from array
    this.itemManager.items = this.itemManager.items.filter(i => i !== item);
    item.destroy();
  }

  handleRainbowKaleCollection(item, hand) {
    // Increase global chain count
    this.scene.gameStateManager.incrementRainbowChain();
    
    // Hand positions
    const leftHandX = 392;
    const rightHandX = 632;
    const handY = 580;
    
    // Determine which hand grabbed it and target the opposite hand
    let targetX;
    if (hand.x < 512) { // Left hand grabbed it
      targetX = rightHandX;
    } else { // Right hand grabbed it
      targetX = leftHandX;
    }
    
    // Create juggling arc trajectory to opposite hand with pronounced upside-down U shape
    const horizontalDistance = targetX - item.x;
    
    // Longer flight time for more pronounced arc
    const flightTimeSeconds = 1.5; // Longer flight time
    
    // Calculate horizontal velocity to reach target (reduced slightly to prevent overshoot)
    const velocityX = (horizontalDistance / flightTimeSeconds) * 0.56; // 44% reduction to hit center of hand
    
    // Much stronger upward velocity for pronounced upside-down U arc
    const velocityY = -550; // Even stronger upward launch for higher dramatic arc
    
    item.setVelocity(velocityX, velocityY);
    item.isJuggling = true;
    
    // Moderate gravity to maintain the arc shape
    item.body.setGravityY(400);
    
    // Award a small, fixed score for the juggle itself
    const jugglePoints = 1; 
    this.scene.gameStateManager.addScore(jugglePoints, true); // true indicates it's a juggle and shouldn't be multiplied
    this.scene.uiManager.showFloatingScore(jugglePoints, item.x, item.y, true);
    
    // Show chain bonus text
    this.showChainBonusText(item);
  }
  createChainBonusUI() {
    this.chainBonusText = this.scene.add.text(512, 180, '', {
      fontSize: '36px',
      fill: '#FF69B4',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5).setDepth(1001).setVisible(false);
  }
  showChainBonusText() {
    const chainCount = this.scene.gameStateManager.rainbowChainCount;
    if (!this.chainBonusText || chainCount < 2) return;
    this.chainBonusText.setText(`${chainCount}x MULTIPLIER!`);
    this.chainBonusText.setVisible(true);
    // Create a pulsing animation
    if (this.chainBonusTween) {
      this.chainBonusTween.stop();
      this.chainBonusText.setScale(1);
    }
    this.chainBonusTween = this.scene.tweens.add({
      targets: this.chainBonusText,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  showChainBrokenMessage(x, y) {
    const chainCount = this.scene.gameStateManager.rainbowChainCount;
    if (chainCount > 1) {
      const brokenText = this.scene.add.text(x, y, `CHAIN BROKEN!\n(${chainCount}x)`, {
        fontSize: '24px',
        fill: '#FF0000',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: brokenText,
        y: y - 60,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => brokenText.destroy()
      });
    }
    if (this.chainBonusText) {
        this.chainBonusText.setVisible(false);
    }
    if (this.chainBonusTween) {
        this.chainBonusTween.stop();
        this.chainBonusText.setScale(1);
    }
    this.scene.gameStateManager.resetChainMultiplier();
  }
}