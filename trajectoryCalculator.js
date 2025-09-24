import Phaser from 'phaser';
export class TrajectoryCalculator {
  static calculateTrajectory(targetX, targetY, fallSpeed, difficulty) {
    // Random spawn position at top of screen with some horizontal spread
    const startX = targetX + Phaser.Math.Between(-200, 200);
    const startY = -50;
    
    // With gravity = 300, calculate proper trajectory
    const gravity = 300;
    const deltaY = targetY - startY;
    const deltaX = targetX - startX;
    
    // Initial vertical velocity to reach target height with gravity
    const initialVelocityY = fallSpeed * difficulty;
    
    // Calculate time to reach target using physics equation
    // deltaY = v0*t + 0.5*g*t^2, solve for t
    const a = 0.5 * gravity;
    const b = initialVelocityY;
    const c = -deltaY;
    
    // Use quadratic formula to find positive time
    const discriminant = b * b - 4 * a * c;
    
    // Handle negative discriminant (no real solution)
    if (discriminant < 0) {
      // Fallback to simple trajectory calculation
      const fallTime = Math.sqrt(2 * Math.abs(deltaY) / gravity);
      const velocityX = deltaX / Math.max(fallTime, 0.5); // Ensure minimum time
      const velocityY = Math.abs(deltaY) / Math.max(fallTime, 0.5);
      
      return {
        startX: startX,
        velocityX: velocityX,
        velocityY: velocityY
      };
    }
    
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const fallTime = Math.max(t1, t2); // Take positive time
    
    // Ensure fallTime is valid and not too small
    const validFallTime = Math.max(fallTime, 0.5);
    
    // Calculate horizontal velocity to reach target in that time
    const velocityX = deltaX / validFallTime;
    
    return {
      startX: startX,
      velocityX: velocityX,
      velocityY: initialVelocityY
    };
  }
}