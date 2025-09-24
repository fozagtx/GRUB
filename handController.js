import Phaser from 'phaser';
export class HandController {
  constructor(scene) {
    this.scene = scene;
    this.leftHandStunned = false;
    this.rightHandStunned = false;
    this.leftHandOpen = true; // true = open, false = grabbing
    this.rightHandOpen = true;
    this.grabDuration = 200; // how long grab lasts
    
    this.createHands();
  }

  createHands() {
    // Create the farmer sprite positioned to show upper body only
    this.farmer = this.scene.add.image(512, 650, 'farmeridle');
    this.farmer.setScale(0.4);
    this.farmer.setDepth(10);
    
    // Create invisible grab zones aligned with farmer's actual hand positions
    // Farmer is at (512, 650) with scale 0.4, so hands are roughly +/- 120px horizontally
    this.leftHand = this.scene.add.rectangle(392, 580, 80, 80, 0x00ff00, 0);
    this.scene.physics.add.existing(this.leftHand);
    this.leftHand.body.setSize(80, 80);
    
    // Right hand grab zone  
    this.rightHand = this.scene.add.rectangle(632, 580, 80, 80, 0x00ff00, 0);
    this.scene.physics.add.existing(this.rightHand);
    this.rightHand.body.setSize(80, 80);
    
    // Track current farmer state
    this.currentState = 'idle';
    
    this.createIdleAnimations();
  }

  createIdleAnimations() {
    // Subtle bobbing animation for farmer (reduced movement to keep upper body visible)
    this.scene.tweens.add({
      targets: this.farmer,
      y: '+=5',
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update() {
    this.handleInput();
  }
  handleInput() {
    // Left hand grab (A key and Left Arrow) - only on key press, not held
    if (!this.leftHandStunned && this.leftHandOpen) {
      if (Phaser.Input.Keyboard.JustDown(this.scene.wasd.A) || 
          Phaser.Input.Keyboard.JustDown(this.scene.cursors.left)) {
        this.grabWithLeftHand();
      }
    }
    
    // Right hand grab (D key and Right Arrow) - only on key press, not held
    if (!this.rightHandStunned && this.rightHandOpen) {
      if (Phaser.Input.Keyboard.JustDown(this.scene.wasd.D) || 
          Phaser.Input.Keyboard.JustDown(this.scene.cursors.right)) {
        this.grabWithRightHand();
      }
    }
  }
  grabWithLeftHand() {
    this.leftHandOpen = false;
    this.updateFarmerSprite();
    
    // Play grab sound
    this.scene.soundManager.playGrabSound();
    
    // Check for items in grab zone
    this.scene.itemManager.checkGrabZone(this.leftHand, 'left');
    
    // Return to open state after grab duration
    this.scene.time.delayedCall(this.grabDuration, () => {
      this.leftHandOpen = true;
      this.updateFarmerSprite();
    });
  }
  grabWithRightHand() {
    this.rightHandOpen = false;
    this.updateFarmerSprite();
    
    // Play grab sound
    this.scene.soundManager.playGrabSound();
    
    // Check for items in grab zone
    this.scene.itemManager.checkGrabZone(this.rightHand, 'right');
    
    // Return to open state after grab duration
    this.scene.time.delayedCall(this.grabDuration, () => {
      this.rightHandOpen = true;
      this.updateFarmerSprite();
    });
  }

  stunLeftHand(duration) {
    if (this.leftHandStunned) return;
    
    this.leftHandStunned = true;
    this.showStunEffect();
    
    this.scene.time.delayedCall(duration, () => {
      this.leftHandStunned = false;
    });
  }

  stunRightHand(duration) {
    if (this.rightHandStunned) return;
    
    this.rightHandStunned = true;
    this.showStunEffect();
    
    this.scene.time.delayedCall(duration, () => {
      this.rightHandStunned = false;
    });
  }

  getHands() {
    return {
      left: this.leftHand,
      right: this.rightHand
    };
  }
  updateFarmerSprite() {
    let newTexture = 'farmeridle';
    
    // Determine which sprite to show based on hand states
    if (!this.leftHandOpen && !this.rightHandOpen) {
      newTexture = 'farmerboth';
    } else if (!this.leftHandOpen) {
      newTexture = 'farmerleft';
    } else if (!this.rightHandOpen) {
      newTexture = 'farmerright';
    }
    
    // Only change if different to avoid unnecessary updates
    if (this.farmer.texture.key !== newTexture) {
      this.farmer.setTexture(newTexture);
    }
  }
  showStunEffect() {
    // Make the farmer flash red to indicate a stun
    this.farmer.setTint(0xff0000);
    const flashDuration = 200; // Duration of one flash
    const totalDuration = 2000; // Corresponds to stun duration
    const repeatCount = Math.floor(totalDuration / (flashDuration * 2)) - 1;
    this.scene.tweens.add({
      targets: this.farmer,
      tint: 0xffffff, // Tween back to normal color
      duration: flashDuration,
      ease: 'Linear',
      yoyo: true, // Go back to red
      repeat: repeatCount,
      onComplete: () => {
        // Ensure the tint is cleared at the end
        if (this.farmer && !this.farmer.destroyed) {
          this.farmer.clearTint();
        }
      }
    });
  }
  showInvincibilityEffect(isActive) {
      if (isActive) {
          this.invincibilityTween = this.scene.tweens.add({
              targets: this.farmer,
              tint: 0x00BFFF, // Deep sky blue glow
              duration: 500,
              ease: 'Sine.easeInOut',
              yoyo: true,
              repeat: -1
          });
      } else {
          if (this.invincibilityTween) {
              this.invincibilityTween.stop();
          }
          if (this.farmer && !this.farmer.destroyed) {
              this.farmer.clearTint();
          }
      }
  }
}