// screens/GameOverScreen.js
import { submitScoreNow } from "/src/services/leaderboard.js";

export class GameOverScreen {
  constructor(scene, screenManager) {
    this.scene = scene;
    this.screenManager = screenManager;
  }

  show() {
    const gsm = this.scene.gameStateManager;
    const finalScore = gsm.score;

    // Save high score for unlimited mode (Stage 4) — unchanged behavior
    if (gsm.unlimitedMode) {
      const playTime = gsm.elapsedTime;
      this.screenManager.saveHighScore(finalScore, playTime);
    }

    // Main "Game Over" text — unchanged
    this.scene.add
      .text(
        512,
        384,
        `Game Over!\nFinal Score: ${finalScore}`,
        { fontSize: "48px", fill: "#003300", fontStyle: "bold", align: "center" }
      )
      .setOrigin(0.5);

    // Extra info for unlimited mode — unchanged
    if (gsm.unlimitedMode) {
      const minutes = Math.floor(gsm.elapsedTime / 60);
      const seconds = gsm.elapsedTime % 60;
      this.scene.add
        .text(512, 450, `Time Survived: ${minutes}:${seconds.toString().padStart(2, "0")}`, {
          fontSize: "24px",
          fill: "#666666",
          align: "center"
        })
        .setOrigin(0.5);

      this.scene.add
        .text(512, 480, "High score saved!", {
          fontSize: "20px",
          fill: "#FFD700",
          align: "center"
        })
        .setOrigin(0.5);
    }

    // Back to start — unchanged
    this.scene.add
      .text(512, 520, "Press SPACE to go back", {
        fontSize: "24px",
        fill: "#FFFFFF",
        fontStyle: "bold",
        align: "center"
      })
      .setOrigin(0.5);

    // 👉 ONLY show submit on Stage 4 / unlimited mode
    if (gsm.unlimitedMode) {
      const submitText = this.scene.add
        .text(512, 560, "Press S to submit score", {
          fontSize: "24px",
          fill: "#00FFC8",
          align: "center"
        })
        .setOrigin(0.5);

      this.scene.input.keyboard.once("keydown-S", async () => {
        submitText.setText("Submitting...");
        try {
          const result = await submitScoreNow(finalScore);
          console.log("Submit result:", result);
          submitText.setText("Submitted! (check leaderboard)");
        } catch (err) {
          console.error(err);
          submitText.setText(this.#friendlyError(err));
        }
      });
    }

    // Restart — unchanged
    this.scene.input.keyboard.once("keydown-SPACE", () => {
      this.scene.scene.restart();
    });
  }

  // Map server/client messages to something friendly on screen
  #friendlyError(err) {
    const m = String(err?.message || "").toLowerCase();

    if (m.includes("no fresh entry"))       return "No fresh entry — pay 1 KALE before the run";
    if (m.includes("tx already used"))      return "Already submitted — start a new run";
    if (m.includes("tx too old"))           return "Entry expired — pay 1 KALE and try again";
    if (m.includes("memos not allowed"))    return "Payment had a memo — pay again with NO memo";
    if (m.includes("no valid kale payment"))return "Couldn’t verify 1 KALE payment from your address";
    if (m.includes("rate_limited") || m.includes("429")) return "Too many tries — wait a minute";

    // Fallback (still useful)
    return "Submit failed — see console";
  }

  cleanup() {}
}
