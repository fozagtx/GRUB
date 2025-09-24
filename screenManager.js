import { StartScreen } from './screens/StartScreen.js';
import { StageSelectScreen } from './screens/StageSelectScreen.js';
import { CountdownScreen } from './screens/CountdownScreen.js';
import { HowToPlayScreen } from './screens/HowToPlayScreen.js';
import { GameOverScreen } from './screens/GameOverScreen.js';
import { LeaderboardScreen } from './screens/LeaderboardScreen.js';
import { StageCompletionScreen } from './screens/StageCompletionScreen.js';
import { OptionsScreen } from './screens/OptionsScreen.js';

export class ScreenManager {
  constructor(scene) {
    this.scene = scene;

    // Initialize screen components
    this.startScreen = new StartScreen(scene, this);
    this.stageSelectScreen = new StageSelectScreen(scene, this);
    this.countdownScreen = new CountdownScreen(scene, this);
    this.howToPlayScreen = new HowToPlayScreen(scene, this);
    this.gameOverScreen = new GameOverScreen(scene, this);
    this.leaderboardScreen = new LeaderboardScreen(scene, this);
    this.stageCompletionScreen = new StageCompletionScreen(scene, this);
    this.optionsScreen = new OptionsScreen(scene, this);
  }

  showStartScreen() {
    this.cleanupAllScreens();
    this.startScreen.show();
  }

  showStageSelect() {
    this.cleanupAllScreens();
    this.stageSelectScreen.show();
  }

  showCountdown() {
    this.cleanupAllScreens();
    this.countdownScreen.show();
  }

  showHowToPlay() {
    this.cleanupAllScreens();
    this.howToPlayScreen.show();
  }

  showStageCompletion() {
    this.cleanupAllScreens();
    this.stageCompletionScreen.show();
  }

  showTargetReached() {
    // Brief message; gameplay continues
    const targetText = this.scene.add.text(512, 200, 'TARGET REACHED!', {
      fontSize: '32px',
      fill: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const continueText = this.scene.add.text(512, 240, 'Keep playing until time runs out!', {
      fontSize: '20px',
      fill: '#00FF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: [targetText, continueText],
      alpha: 0,
      duration: 1000,
      delay: 2000,
      onComplete: () => {
        targetText.destroy();
        continueText.destroy();
      }
    });
  }

  showGameOver() {
    // NOTE: cleanupAllScreens() quietly ends gameplay first (no extra Game Over loop)
    this.cleanupAllScreens();
    this.gameOverScreen.show();
  }

  showLeaderboard() {
    this.cleanupAllScreens();
    this.leaderboardScreen.show();
  }

  showOptions() {
    this.cleanupAllScreens();
    this.optionsScreen.show();
  }

  getHighScores() {
    const stored = localStorage.getItem('unlimitedHighScores');
    return stored ? JSON.parse(stored) : [];
  }

  saveHighScore(score, time) {
    const highScores = this.getHighScores();
    highScores.push({ score, time });
    highScores.sort((a, b) => b.score - a.score);
    const topScores = highScores.slice(0, 10);
    localStorage.setItem('unlimitedHighScores', JSON.stringify(topScores));
    return topScores;
  }

  cleanupAllScreens() {
    // --- IMPORTANT FIX: if gameplay is active, end it QUIETLY before swapping UI ---
    // This stops timers/spawners/music WITHOUT triggering another Game Over.
    if (this.scene?.gameStateManager?.gameActive) {
      this.scene.endGame(false);
    }

    // Screen-specific cleanups BEFORE removing children (prevents leaks/listeners)
    this.stageSelectScreen?.cleanup?.();
    this.startScreen?.cleanup?.();
    this.howToPlayScreen?.cleanup?.();
    this.countdownScreen?.cleanup?.();
    this.leaderboardScreen?.cleanup?.();
    this.gameOverScreen?.cleanup?.();
    this.stageCompletionScreen?.cleanup?.();
    this.optionsScreen?.cleanup?.();

    // Stop all tweens to prevent animation conflicts
    this.scene.tweens.killAll();

    // Aggressively clean up keyboard listeners to prevent cross-screen contamination
    this.scene.input.keyboard.removeAllListeners();

    // Also remove specific key bindings that might persist
    for (let i = 1; i <= 4; i++) {
      this.scene.input.keyboard.removeAllListeners(`keydown-${i}`);
    }
    this.scene.input.keyboard.removeAllListeners('keydown-ESC');
    this.scene.input.keyboard.removeAllListeners('keydown-ENTER');
    this.scene.input.keyboard.removeAllListeners('keydown-H');
    this.scene.input.keyboard.removeAllListeners('keydown-L');
    this.scene.input.keyboard.removeAllListeners('keydown-S');

    // Remove all UI elements AFTER individual cleanups are complete
    this.scene.children.removeAll();

    // Recreate background/clouds to reset the visual layer for the next screen
    this.scene.createBackground();
    this.scene.createClouds();
  }
}
