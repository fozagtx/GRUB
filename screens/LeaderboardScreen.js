// screens/LeaderboardsScreen.js
// Retro-arcade styled global leaderboard with rock-solid “go back”

const API_URL = "https://kgr-leaderboard-api.onrender.com/leaderboard?limit=20";

export class LeaderboardsScreen {
  constructor(scene, screenManager) {
    this.scene = scene;
    this.screenManager = screenManager;
    this._all = [];
    this._tweens = [];
    this._timers = [];
    this._unsubBack = null;
    this._isLeaving = false;

    // shared layout (filled in show())
    this._cols = null;
  }

  async show() {
    const s = this.scene;
    const cam = s.cameras.main;
    const W = cam.width, H = cam.height;

    // Ensure cleanup runs if the scene shuts down/destroys for any reason
    const onShutdown = () => this.cleanup();
    s.events.once("shutdown", onShutdown);
    s.events.once("destroy", onShutdown);

    // Panel
    const panel = s.add.rectangle(W/2, H/2, Math.min(880, W-60), Math.min(580, H-60), 0x00140a, 0.72)
      .setStrokeStyle(2, 0x00ff88, 0.6)
      .setInteractive()
      .setDepth(1000);
    this._push(panel);

    // Title
    const title = s.add.text(W/2, 110, "GLOBAL LEADERBOARD", {
      fontSize: "42px",
      fontStyle: "bold",
      color: "#00ffc8",
      stroke: "#003322",
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(1001);
    title.setShadow(0,0,"#00ffc8", 16, true, true);
    this._push(title);

    // ---- Column positions (match rows exactly) ----
    const padX = 80;
    this._cols = {
      rankX: padX,           // "RANK"
      medalX: padX + 45,     // 🥇 column (for reference)
      scoreX: padX + 95,     // "SCORE"
      addrX: padX + 240,     // "ADDRESS"
      whenX: W - padX - 20,  // "WHEN" (right-aligned)
      startY: 200,
      rowH: 26
    };

    // Headers: use separate texts at precise X coords so they line up with rows
    const headerY = 160;
    const headerStyle = { fontSize: "20px", color: "#9fffe3", fontFamily: "monospace", fontStyle: "bold" };

    const hRank = s.add.text(this._cols.rankX, headerY, "RANK", headerStyle).setOrigin(0,0.5).setDepth(1001);
    const hScore = s.add.text(this._cols.scoreX, headerY, "SCORE", headerStyle).setOrigin(0,0.5).setDepth(1001);
    const hAddr = s.add.text(this._cols.addrX, headerY, "ADDRESS", headerStyle).setOrigin(0,0.5).setDepth(1001);
    const hWhen = s.add.text(this._cols.whenX, headerY, "WHEN", headerStyle).setOrigin(1,0.5).setDepth(1001);

    [hRank, hScore, hAddr, hWhen].forEach(h => {
      h.setShadow(0,0,"#003322",8,true,true);
      this._push(h);
    });

    // Scanlines
    this._addScanlines();

    // Loading
    const loading = s.add.text(W/2, 200, "Fetching…", {
      fontSize: "20px",
      color: "#ffffff",
    }).setOrigin(0.5).setDepth(1001);
    this._push(loading);

    const dotTimer = s.time.addEvent({
      delay: 280, loop: true,
      callback: () => {
        if (!loading || !loading.active) return;
        loading.text = loading.text.length < 12 ? loading.text + "." : "Fetching…";
      }
    });
    this._timers.push(dotTimer);

    // Optional wallet (for highlight)
    const myAddr = await this._getWalletAddrSafe();
    const top = await this._fetchTopSafe().catch(() => []);

    // stop the loading dot timer BEFORE destroying the text
    try { dotTimer.remove?.(); } catch {}
    this._timers = this._timers.filter(t => t !== dotTimer);
    loading.destroy();

    if (!top.length) {
      const empty = s.add.text(W/2, 220, "No entries yet — be the first!", {
        fontSize: "22px", color: "#cfd6d3"
      }).setOrigin(0.5).setDepth(1001);
      this._push(empty);
    } else {
      this._drawRows(top, myAddr);
    }

    // Back hint
    const back = s.add.text(W/2, H - 48, "Press SPACE (or click) to go back", {
      fontSize: "22px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setInteractive().setDepth(1001);
    back.setShadow(0,0,"#00ffc8",10,true,true);
    this._push(back);

    const backPulse = s.tweens.add({
      targets: back, alpha: { from: 0.8, to: 1 },
      yoyo: true, repeat: -1, duration: 900,
    });
    this._tweens.push(backPulse);

    // ——— back wiring (multiple paths + fallback) ———
    const goBack = () => this._forceBack();
    const k = s.input.keyboard;

    k.once("keydown-SPACE", goBack);
    k.once("keydown-ENTER", goBack);
    k.once("keydown-ESC", goBack);
    panel.on("pointerup", goBack);
    back.on("pointerup", goBack);
    s.input.once("pointerup", goBack);

    const domKey = (e) => {
      if (e.code === "Space" || e.code === "Enter" || e.code === "Escape" ||
          e.keyCode === 32 || e.keyCode === 13 || e.keyCode === 27) {
        goBack();
      }
    };
    window.addEventListener("keydown", domKey, { once: true });

    this._unsubBack = () => {
      try { panel.removeAllListeners?.(); } catch {}
      try { back.removeAllListeners?.(); } catch {}
      try { s.input.removeAllListeners?.(); } catch {}
      try { k.removeAllListeners?.(); } catch {}
      try { window.removeEventListener("keydown", domKey); } catch {}
    };

    s.events.once("shutdown", () => this._unsubBack?.());
  }

  _forceBack() {
    if (this._isLeaving) return;
    this._isLeaving = true;

    this.cleanup();

    if (this.screenManager && typeof this.screenManager.showStart === "function") {
      try { this.screenManager.showStart(); return; } catch {}
    }
    try { this.scene.scene.restart(); return; } catch {}
    setTimeout(() => { try { location.reload(); } catch {} }, 120);
  }

  async _fetchTopSafe() {
    const r = await fetch(API_URL, { headers: { "Accept": "application/json" } });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j?.top) ? j.top : [];
  }

  async _getWalletAddrSafe() {
    try {
      const api = window.freighterApi;
      if (!api?.getAddress) return null;
      const { address } = await api.getAddress();
      return address || null;
    } catch { return null; }
  }

  _drawRows(top, myAddr) {
    const s = this.scene;
    const cam = s.cameras.main;
    const W = cam.width;

    const cols = this._cols || {
      rankX: 80, medalX: 125, scoreX: 175, addrX: 320, whenX: W - 100, startY: 200, rowH: 26
    };

    const short = a => (a ? a.slice(0,6) + "..." + a.slice(-4) : "");
    const when = iso => {
      if (!iso) return "";
      const ms = Date.now() - new Date(iso).getTime();
      if (ms < 0) return "just now";
      const sec = Math.floor(ms/1000), min = Math.floor(sec/60), hr = Math.floor(sec/3600), day = Math.floor(hr/24);
      if (day>0) return `${day}d ago`; if (hr>0) return `${hr}h ago`; if (min>0) return `${min}m ago`; return `${sec}s ago`;
    };
    const medals = ["🥇","🥈","🥉"];

    for (let i=0; i<top.length && i<20; i++) {
      const r = top[i];
      const y = cols.startY + i*cols.rowH;
      const isMe = myAddr && r.address && r.address.toUpperCase() === myAddr.toUpperCase();

      if (i % 2 === 0) this._push(s.add.rectangle(W/2, y, Math.min(820, W-100), cols.rowH+6, 0x003322, 0.18).setDepth(1001));

      // RANK
      this._push(s.add.text(cols.rankX, y, String(i+1).padStart(2," "), {
        fontSize:"20px", fontFamily:"monospace", color: isMe ? "#fffb8f" : "#b9ffe9"
      }).setOrigin(0,0.5).setDepth(1001));

      // Medal
      if (i<medals.length) this._push(s.add.text(cols.medalX, y-1, medals[i], { fontSize:"20px" }).setOrigin(0,0.5).setDepth(1001));

      // SCORE
      const score = s.add.text(cols.scoreX, y, String(r.score).padStart(6," "), {
        fontSize:"22px", fontFamily:"monospace", color: isMe ? "#ffffff" : "#e0fff6"
      }).setOrigin(0,0.5).setDepth(1001);
      score.setShadow(0,0, isMe ? "#00ffc8" : "#003322", isMe ? 14 : 6, true, true);
      this._push(score);

      // ADDRESS
      this._push(s.add.text(cols.addrX, y, short(r.address), {
        fontSize:"20px", fontFamily:"monospace", color: isMe ? "#00ffc8" : "#a9e7d6"
      }).setOrigin(0,0.5).setDepth(1001));

      // WHEN (right-aligned)
      this._push(s.add.text(cols.whenX, y, when(r.paidAtISO), {
        fontSize:"18px", fontFamily:"monospace", color:"#b2c9c1"
      }).setOrigin(1,0.5).setDepth(1001));
    }

    // Fade-in
    this._all.forEach((obj, i) => {
      if (!obj || typeof obj.alpha !== "number") return;
      const tween = this.scene.tweens.add({
        targets: obj, alpha: { from: 0, to: 1 },
        delay: Math.min(30*i, 600), duration: 220, ease: "Quad.easeOut"
      });
      this._tweens.push(tween);
    });
  }

  _addScanlines() {
    const s = this.scene;
    const cam = s.cameras.main;
    const W = cam.width, H = cam.height;

    if (!s.textures.exists("scanline-tex")) {
      const g = s.make.graphics({ add: false });
      g.fillStyle(0xffffff, 0.08);
      g.fillRect(0, 2, 4, 1);
      g.generateTexture("scanline-tex", 4, 4);
      g.destroy();
    }

    const scan = s.add.tileSprite(W/2, H/2, W, H, "scanline-tex")
      .setAlpha(0.12)
      .setBlendMode("ADD")
      .setDepth(900);
    this._push(scan);

    const t = s.tweens.add({
      targets: scan, alpha: { from: 0.09, to: 0.16 }, yoyo: true, repeat: -1, duration: 900
    });
    this._tweens.push(t);
  }

  _push(obj) { this._all.push(obj); }

  cleanup() {
    const s = this.scene;

    // Unsubscribe inputs
    try { this._unsubBack?.(); } catch {}

    // Kill timers (and a defensive nuke just in case)
    this._timers.forEach(t => { try { t.remove?.(); } catch {} });
    try { s.time.removeAllEvents?.(); } catch {}
    this._timers = [];

    // Stop/kill tweens (defensive)
    this._tweens.forEach(t => { try { t.remove ? t.remove() : t.stop?.(); } catch {} });
    try { s.tweens.killAll?.(); } catch {}
    this._tweens = [];

    // Destroy display objects
    this._all.forEach(o => { try { o?.destroy?.(); } catch {} });
    this._all = [];
  }
}

// Compat exports
export { LeaderboardsScreen as LeaderboardScreen };
export default LeaderboardsScreen;
