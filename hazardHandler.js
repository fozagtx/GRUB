import Phaser from 'phaser';

export class HazardHandler {
  constructor(scene, itemManager) {
    this.scene = scene;
    this.itemManager = itemManager;
  }

  spawnHazard(x, velocityX, velocityY) {
    const hazard = this.scene.physics.add.image(x, -50, 'cabbageworm').setDepth(3);
    hazard.setScale(0.12);
    hazard.setVelocity(velocityX, velocityY);
    
    // Add gravity to hazards too for consistent physics
    hazard.body.setGravityY(300);
    
    hazard.itemType = 'hazard';
    
    this.itemManager.hazards.push(hazard);
  }

  hitHazard(hazard, handSide) {
    if (this.scene.gameStateManager.isInvulnerable) {
      // If invulnerable, destroy hazard but don't stun
      this.itemManager.hazards = this.itemManager.hazards.filter(h => h !== hazard);
      hazard.destroy();
      return;
    }
    this.scene.gameStateManager.stunHand(handSide);
    
    // Remove from array
    this.itemManager.hazards = this.itemManager.hazards.filter(h => h !== hazard);
    hazard.destroy();
  }

  checkHazardCollision(hand, handSide) {
    const grabZoneSize = 140;
    
    for (let i = this.itemManager.hazards.length - 1; i >= 0; i--) {
      const hazard = this.itemManager.hazards[i];
      const distance = Phaser.Math.Distance.Between(hand.x, hand.y, hazard.x, hazard.y);
      
      if (distance < grabZoneSize) {
        this.hitHazard(hazard, handSide);
        return true; // Hazard was hit
      }
    }
    
    return false; // No hazard hit
  }

  updateHazards() {
    this.itemManager.hazards = this.itemManager.hazards.filter(hazard => {
      if (hazard.y > 800) {
        hazard.destroy();
        return false;
      }
      return true;
    });
  }
}