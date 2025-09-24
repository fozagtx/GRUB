import Phaser from 'phaser';
import { ItemSpawner } from './itemSpawner.js';
import { ItemCollector } from './itemCollector.js';
import { HazardHandler } from './hazardHandler.js';
export class ItemManager {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.hazards = [];
    
    // Create spawner to handle item spawning
    this.spawner = new ItemSpawner(scene, this);
    
    // Create collector to handle item collection
    this.collector = new ItemCollector(scene, this);
    
    // Create hazard handler to handle hazard logic
    this.hazardHandler = new HazardHandler(scene, this);
  }
  spawnKale(x, type, points, isGolden, velocityX, velocityY) {
    const kale = this.scene.physics.add.image(x, -50, type);
    
    // Set appropriate scale and depth
    if (type === 'kaleSingle') {
      kale.setScale(0.25).setDepth(8);
    } else if (type === 'kaleBunch') {
      kale.setScale(0.12).setDepth(5);
    } else if (type === 'goldenKale') {
      kale.setScale(0.15).setDepth(5);
      
      // Add glow effect for golden kale
      kale.setTint(0xFFD700);
      this.scene.tweens.add({
        targets: kale,
        alpha: 0.7,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
    
    // Set angled velocity
    kale.setVelocity(velocityX, velocityY);
    
    // Add gravity for natural falling effect
    kale.body.setGravityY(300);
    
    kale.points = points;
    kale.isGolden = isGolden;
    kale.itemType = 'kale';
    
    this.items.push(kale);
  }
  spawnCrystalKale(x, velocityX, velocityY) {
    const crystal = this.scene.physics.add.image(x, -50, 'kalecrystal').setDepth(6);
    crystal.setScale(0.12);
    crystal.setVelocity(velocityX, velocityY);
    crystal.body.setGravityY(300);
    crystal.points = 4;
    crystal.itemType = 'crystal';
    // Add a pulsing glow effect
    this.scene.tweens.add({
      targets: crystal,
      alpha: 0.8,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.items.push(crystal);
  }
  spawnKaleShake(x, velocityX, velocityY) {
    const shake = this.scene.physics.add.image(x, -50, 'kaleshake').setDepth(3);
    shake.setScale(0.1);
    shake.setVelocity(velocityX, velocityY);
    shake.body.setGravityY(300);
    shake.itemType = 'kaleshake';
    this.items.push(shake);
  }
  spawnHazard(x, velocityX, velocityY) {
    this.hazardHandler.spawnHazard(x, velocityX, velocityY);
  }
  spawnRainbowKale(x, velocityX, velocityY) {
    const rainbow = this.scene.physics.add.image(x, -50, 'kalerainbow').setDepth(6);
    rainbow.setScale(0.2);
    rainbow.setVelocity(velocityX, velocityY);
    
    // Add gravity for natural falling effect
    rainbow.body.setGravityY(300);
    
    rainbow.points = 1; // Starting points
    rainbow.itemType = 'rainbow';
    rainbow.isRainbow = true;
    
    // Add chromatic color-changing effect with bright, vibrant colors
    const colors = [
      0xFFFFFF, // Bright White
      0xFFE4E1, // Misty Rose (Light Pink)
      0xF0FFFF, // Azure (Very Light Blue)
      0xFFFF00, // Bright Yellow
      0xFFFFE0, // Light Yellow
      0xF0FFF0, // Honeydew (Very Light Green)
      0xFFF0F5, // Lavender Blush (Very Light Pink)
      0xF5FFFA  // Mint Cream (Very Light Green-White)
    ];
    
    let colorIndex = 0;
    rainbow.colorTimer = this.scene.time.addEvent({
      delay: 150, // Faster color changes for more dynamic effect
      callback: () => {
        rainbow.setTint(colors[colorIndex]);
        colorIndex = (colorIndex + 1) % colors.length;
      },
      loop: true
    });
    
    // Add alpha sparkle effect (gentle, no movement)
    this.scene.tweens.add({
      targets: rainbow,
      alpha: 0.9,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Add sparkle particle effects with spread emission area
    const sparkles = this.scene.add.particles(rainbow.x, rainbow.y, 'kaleSingle', {
      scale: { start: 0.08, end: 0.01 },
      speed: { min: 30, max: 80 },
      lifespan: { min: 400, max: 1000 },
      quantity: 4,
      frequency: 80,
      tint: [0xFFFFFF, 0xFFD700, 0xFF69B4, 0x00FFFF, 0x90EE90, 0xFFB6C1],
      blendMode: 'ADD',
      alpha: { start: 1, end: 0 },
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 40)
      }
    });
    
    // Make sparkles follow the rainbow kale
    rainbow.sparkles = sparkles;
    
    this.items.push(rainbow);
  }
  // Removed setupItemCollision and setupHazardCollision methods
  // Now using timing-based checkGrabZone method only
  collectItem(item, hand) {
    this.collector.collectItem(item, hand);
  }

  hitHazard(hazard, handSide) {
    this.hazardHandler.hitHazard(hazard, handSide);
  }

  update() {
    // Update sparkle positions for rainbow kale
    this.items.forEach(item => {
      if (item.itemType === 'rainbow' && item.sparkles) {
        item.sparkles.setPosition(item.x, item.y);
      }
    });
    
    // Clean up items that have fallen off screen
    this.items = this.items.filter(item => {
      // Special handling for juggling rainbow kale
      if (item.itemType === 'rainbow' && item.isJuggling) {
        // If it goes too far down (missed), end juggling and remove
        if (item.y > 650) {
          // Chain broken - show message and lose life
          this.collector.showChainBrokenMessage(item.x, item.y);
          this.scene.gameStateManager.loseLife();
          if (item.sparkles) item.sparkles.destroy();
          item.destroy();
          return false;
        }
        // If it goes off screen horizontally, end juggling and remove
        if (item.x < -50 || item.x > 1074) {
          // Chain broken - show message and lose life
          this.collector.showChainBrokenMessage(item.x, item.y);
          this.scene.gameStateManager.loseLife();
          if (item.sparkles) item.sparkles.destroy();
          item.destroy();
          return false;
        }
        return true;
      }
      
      // Normal cleanup for other items - check for missed kale
      if (item.y > 800) {
        // Only count kale items as missed (not hazards)
        if (item.itemType === 'kale' || item.itemType === 'rainbow') {
          // Show chain broken message for rainbow kale
          if (item.itemType === 'rainbow' && this.scene.gameStateManager.rainbowChainCount > 0) {
            this.collector.showChainBrokenMessage(item.x, item.y);
          }
          this.scene.gameStateManager.loseLife();
        }
        
        if (item.itemType === 'rainbow' && item.sparkles) {
          item.sparkles.destroy();
        }
        item.destroy();
        return false;
      }
      return true;
    });
    
    // Update hazards using hazard handler
    this.hazardHandler.updateHazards();
  }

  checkGrabZone(hand, handSide) {
    const grabZoneSize = 140; // Increased from 120 to 140 for a larger grab area
    let itemGrabbed = false;
    
    // Check items first
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      const distance = Phaser.Math.Distance.Between(hand.x, hand.y, item.x, item.y);
      
      // Also check if item is within vertical range for better timing
      const verticalRange = Math.abs(item.y - hand.y) < 100;
      
      if (distance < grabZoneSize && verticalRange) {
        // Special handling for rainbow kale
        if (item.itemType === 'rainbow') {
          // Catch rainbow kale when it's coming down (first grab or juggling)
          if (!item.isJuggling || (item.isJuggling && item.body.velocity.y > 0)) {
            this.collectItem(item, hand);
            itemGrabbed = true;
            break;
          }
        } else {
          // Normal item collection for non-rainbow items
          this.collectItem(item, hand);
          itemGrabbed = true;
          break;
        }
      }
    }
    
    // Check hazards if no item was grabbed
    if (!itemGrabbed) {
      this.hazardHandler.checkHazardCollision(hand, handSide);
    }
  }
  setDifficulty(difficulty) {
    // Delegate to spawner
    this.spawner.setDifficulty(difficulty);
  }
}