"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const levelLabelEl = document.getElementById("level-label");
const shardLabelEl = document.getElementById("shard-label");
const shardBarEl = document.getElementById("shard-bar");
const dashLabelEl = document.getElementById("dash-label");
const dashBarEl = document.getElementById("dash-bar");
const shockwaveBoxEl = document.getElementById("shockwave-box");
const shockwaveLabelEl = document.getElementById("shockwave-label");
const shockwaveBarEl = document.getElementById("shockwave-bar");
const powerupOverlayEl = document.getElementById("powerup-overlay");
const powerupOption1El = document.getElementById("powerup-option-1");
const powerupOption2El = document.getElementById("powerup-option-2");
const inventoryOverlayEl = document.getElementById("inventory-overlay");
const inventoryListEl = document.getElementById("inventory-list");
const inventoryEmptyEl = document.getElementById("inventory-empty");
const lcOverlayEl = document.getElementById("levelcomplete-overlay");
const lcTitleEl = document.getElementById("lc-title");
const lcTimeTextEl = document.getElementById("lc-time-text");
const lcNextTextEl = document.getElementById("lc-next-text");
const lcContinueEl = document.getElementById("lc-continue");

const WORLD = {
  width: canvas.width,
  height: canvas.height,
};

const PLAYER_SPEED = 240;
const ENEMY_SPEED = 128;
const ENEMY_SPAWN_INTERVAL = 10;
const ENEMY_SEPARATION_RADIUS = 80;
const DASH_SPEED = 900;
const DASH_DURATION = 0.18;
const DASH_COOLDOWN = 5;
const AFTERIMAGE_INTERVAL = 0.025;
const AFTERIMAGE_LIFETIME = 0.16;
const SHARD_SIZE = 22;
const SHARD_SPAWN_INTERVAL = 2.8;
const BASE_XP_PER_LEVEL = 8;
const XP_LEVEL_SCALE = 1.35;
const BASE_PLAYER_SPEED = PLAYER_SPEED;
const BASE_DASH_SPEED = DASH_SPEED;
const BASE_DASH_DURATION = DASH_DURATION;
const BASE_DASH_COOLDOWN = DASH_COOLDOWN;
const SHOCKWAVE_COOLDOWN = 10;
const SHOCKWAVE_RADIUS = 230;
const SHOCKWAVE_PUSH = 180;
const SHARD_TYPES = [
  { id: "common", xp: 1, colors: ["#6fffe9", "#d4fff9"], glow: "rgba(111,255,233,ALPHA)" },
  { id: "rare", xp: 2, colors: ["#78a8ff", "#d7e5ff"], glow: "rgba(120,168,255,ALPHA)" },
  { id: "epic", xp: 4, colors: ["#d68bff", "#f3d6ff"], glow: "rgba(214,139,255,ALPHA)" },
];
const MAP_MINE_SIZE = 20;
const MAPS = [
  {
    name: "Ruinen",
    mineCount: 3,
    walls: [
      { x: 180, y: 200, w: 30, h: 350 },
      { x: 180, y: 200, w: 220, h: 30 },
      { x: 1390, y: 200, w: 30, h: 350 },
      { x: 1200, y: 200, w: 220, h: 30 },
      { x: 400, y: 680, w: 300, h: 30 },
      { x: 900, y: 680, w: 300, h: 30 },
      { x: 300, y: 380, w: 140, h: 140 },
      { x: 1160, y: 380, w: 140, h: 140 },
    ],
  },
  {
    name: "Korridor",
    mineCount: 3,
    walls: [
      // Hauptwand oben-links und oben-rechts mit schmalem Durchgang in der Mitte
      { x: 0, y: 420, w: 750, h: 30 },
      { x: 850, y: 420, w: 750, h: 30 },
      // Linke Säule oben
      { x: 320, y: 0, w: 30, h: 300 },
      // Rechte Säule unten
      { x: 1250, y: 600, w: 30, h: 300 },
      // Kleine Wand links unten
      { x: 100, y: 620, w: 250, h: 30 },
      // Kleine Wand rechts oben
      { x: 1250, y: 250, w: 250, h: 30 },
      // Block Mitte-links
      { x: 550, y: 560, w: 140, h: 30 },
      { x: 550, y: 560, w: 30, h: 160 },
      // Block Mitte-rechts
      { x: 910, y: 200, w: 140, h: 30 },
      { x: 1020, y: 200, w: 30, h: 160 },
    ],
  },
  {
    // Linke Lücke y:300-480 (180px), rechte Lücke y:270-480 (210px)
    name: "Festung",
    mineCount: 4,
    walls: [
      // Ecken-Dekorationen
      { x: 80, y: 80, w: 260, h: 30 },
      { x: 80, y: 80, w: 30, h: 220 },
      { x: 1260, y: 790, w: 260, h: 30 },
      { x: 1490, y: 590, w: 30, h: 220 },
      // Linke Vertikalwand mit 180px Lücke
      { x: 530, y: 0, w: 30, h: 300 },
      { x: 530, y: 480, w: 30, h: 420 },
      // Rechte Vertikalwand mit 210px Lücke
      { x: 1040, y: 0, w: 30, h: 270 },
      { x: 1040, y: 480, w: 30, h: 420 },
      // Horizontale Akzentwände (blockieren keine Durchgänge)
      { x: 0, y: 240, w: 400, h: 30 },
      { x: 1200, y: 660, w: 400, h: 30 },
      // Mittelstücke
      { x: 660, y: 160, w: 180, h: 30 },
      { x: 760, y: 710, w: 180, h: 30 },
    ],
  },
  {
    // Horizontale Barrieren mit klaren Durchgängen, keine Sackgassen
    name: "Labyrinth",
    mineCount: 4,
    walls: [
      // Obere Barriere: Lücke x:560-740 (180px)
      { x: 0, y: 230, w: 560, h: 30 },
      { x: 740, y: 230, w: 860, h: 30 },
      // Untere Barriere: Lücke x:820-1010 (190px)
      { x: 0, y: 670, w: 820, h: 30 },
      { x: 1010, y: 670, w: 590, h: 30 },
      // Linker Block
      { x: 220, y: 380, w: 30, h: 200 },
      { x: 220, y: 380, w: 200, h: 30 },
      // Rechter Block
      { x: 1180, y: 430, w: 200, h: 30 },
      { x: 1350, y: 430, w: 30, h: 160 },
      // Mittelwand oben
      { x: 1350, y: 80, w: 30, h: 200 },
      // Mittelwand unten
      { x: 220, y: 620, w: 30, h: 280 },
    ],
  },
  {
    name: "Minenfeld",
    mineCount: 4,
    walls: [
      { x: 300, y: 150, w: 30, h: 200 },
      { x: 300, y: 150, w: 200, h: 30 },
      { x: 1270, y: 550, w: 30, h: 200 },
      { x: 1070, y: 550, w: 230, h: 30 },
      { x: 620, y: 280, w: 120, h: 30 },
      { x: 860, y: 280, w: 120, h: 30 },
      { x: 620, y: 600, w: 120, h: 30 },
      { x: 860, y: 600, w: 120, h: 30 },
    ],
  },
];
const POWER_UP_POOL = [
  {
    id: "swift-steps",
    title: "Swift Steps",
    description: "Du bewegst dich 12% schneller.",
    rarity: "common",
    unique: false,
    apply: () => {
      playerSpeedCurrent *= 1.12;
    },
  },
  {
    id: "quick-recharge",
    title: "Quick Recharge",
    description: "Dash-Cooldown -0.45s (Minimum 2.0s).",
    rarity: "common",
    unique: false,
    apply: () => {
      dashCooldownCurrent = Math.max(2.0, dashCooldownCurrent - 0.45);
      dashCooldownLeft = Math.min(dashCooldownLeft, dashCooldownCurrent);
    },
  },
  {
    id: "phase-burst",
    title: "Phase Burst",
    description: "Dash laenger und schneller.",
    rarity: "common",
    unique: false,
    apply: () => {
      dashDurationCurrent += 0.025;
      dashSpeedCurrent *= 1.06;
    },
  },
  {
    id: "arcane-greed",
    title: "Arcane Greed",
    description: "Alle Shards geben 20% mehr XP.",
    rarity: "common",
    unique: false,
    apply: () => {
      shardXpMultiplier *= 1.2;
    },
  },
  {
    id: "teleport-dash",
    title: "Teleport Dash",
    description: "Dash teleportiert dich sofort in Laufrichtung.",
    rarity: "rare",
    unique: true,
    apply: () => {
      teleportDashUnlocked = true;
    },
  },
  {
    id: "shockwave",
    title: "Shockwave",
    description: "Taste F: Schockwelle stoesst Gegner weg (10s Cooldown).",
    rarity: "rare",
    unique: true,
    apply: () => {
      shockwaveUnlocked = true;
      shockwaveCooldownLeft = 0;
    },
  },
  {
    id: "shockwave-radius",
    title: "Wide Shockwave",
    description: "Shockwave-Radius wird groesser.",
    rarity: "common",
    unique: false,
    requires: () => shockwaveUnlocked,
    apply: () => {
      shockwaveRadiusCurrent *= 1.18;
    },
  },
  {
    id: "shockwave-force",
    title: "Force Surge",
    description: "Shockwave stoesst Gegner deutlich weiter weg.",
    rarity: "common",
    unique: false,
    requires: () => shockwaveUnlocked,
    apply: () => {
      shockwavePushCurrent *= 1.28;
    },
  },
  {
    id: "shard-magnet",
    title: "Shard Magnet",
    description: "Shards in der Naehe werden automatisch zu dir hingezogen.",
    rarity: "rare",
    unique: true,
    apply: () => {
      shardMagnetUnlocked = true;
    },
  },
  {
    id: "shockwave-on-dash",
    title: "Shockwave on Dash",
    description: "Jeder Dash erzeugt eine kleine Schockwelle um dich.",
    rarity: "epic",
    unique: true,
    apply: () => {
      dashShockwaveUnlocked = true;
    },
  },
  {
    id: "overclock",
    title: "Overclock",
    description: "Nach jedem Dash bist du fuer 5s 40% schneller.",
    rarity: "rare",
    unique: true,
    apply: () => {
      overclockUnlocked = true;
    },
  },
  {
    id: "magnet-range",
    title: "Wide Pull",
    description: "Shard Magnet zieht Shards aus groesserer Reichweite an (+70px).",
    rarity: "common",
    unique: false,
    requires: () => shardMagnetUnlocked,
    apply: () => {
      shardMagnetRadius += 70;
    },
  },
  {
    id: "dash-blast-radius",
    title: "Blast Radius",
    description: "Dash-Schockwelle hat einen groesseren Radius.",
    rarity: "common",
    unique: false,
    requires: () => dashShockwaveUnlocked,
    apply: () => {
      dashShockwaveRadius *= 1.3;
    },
  },
  {
    id: "overclock-speed",
    title: "Overclock Speed",
    description: "Overclock gibt 10% mehr Geschwindigkeit.",
    rarity: "common",
    unique: false,
    requires: () => overclockUnlocked,
    apply: () => {
      overclockSpeedBoost += 0.1;
    },
  },
  {
    id: "overclock-duration",
    title: "Overclock Duration",
    description: "Overclock haelt 2s laenger an.",
    rarity: "common",
    unique: false,
    requires: () => overclockUnlocked,
    apply: () => {
      overclockDuration += 2;
    },
  },
  {
    id: "teleport-range",
    title: "Long Blink",
    description: "Teleport-Dash geht weiter nach vorne.",
    rarity: "common",
    unique: false,
    requires: () => teleportDashUnlocked,
    apply: () => {
      teleportDashRangeMultiplier *= 1.18;
    },
  },
];

let player;
let enemies;
let keys;
let gameOver;
let lastTime;
let surviveTime;
let spawnTimer;
let dashCooldownLeft;
let dashTimeLeft;
let dashDir;
let lastMoveDir;
let afterimages;
let afterimageTimer;
let shards;
let shardSpawnTimer;
let playerLevel;
let playerXp;
let xpToNextLevel;
let playerSpeedCurrent;
let dashSpeedCurrent;
let dashDurationCurrent;
let dashCooldownCurrent;
let shardXpMultiplier;
let isChoosingPowerUp;
let pendingPowerUpChoices;
let currentPowerUpOptions;
let availablePowerUps;
let teleportDashUnlocked;
let shockwaveUnlocked;
let shockwaveCooldownLeft;
let shockwaveRadiusCurrent;
let shockwavePushCurrent;
let teleportDashRangeMultiplier;
let visualBursts;
let shardMagnetUnlocked;
let shardMagnetRadius;
let dashShockwaveUnlocked;
let dashShockwaveRadius;
let overclockUnlocked;
let overclockTimeLeft;
let overclockDuration;
let overclockSpeedBoost;
let currentMapIndex;
let currentMap;
let mines;
let stageNumber;
let stageGoalTime;
let isLevelComplete;
let pendingStageTransition;
let playerInventory;
let isInventoryOpen;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnMines() {
  mines = [];
  const spawnCX = WORLD.width / 2;
  const spawnCY = WORLD.height / 2;
  for (let i = 0; i < currentMap.mineCount; i++) {
    let x, y, tries = 0;
    do {
      x = randomBetween(30, WORLD.width - MAP_MINE_SIZE - 30);
      y = randomBetween(30, WORLD.height - MAP_MINE_SIZE - 30);
      tries++;
    } while (tries < 80 && (
      currentMap.walls.some(w => x < w.x + w.w && x + MAP_MINE_SIZE > w.x && y < w.y + w.h && y + MAP_MINE_SIZE > w.y) ||
      Math.hypot(x + MAP_MINE_SIZE / 2 - spawnCX, y + MAP_MINE_SIZE / 2 - spawnCY) < 200 ||
      mines.some(m => Math.hypot(x - m.x, y - m.y) < 120)
    ));
    mines.push({ x, y });
  }
}

function getXpForLevel(level) {
  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(XP_LEVEL_SCALE, level - 1));
}

function chooseShardType() {
  const roll = Math.random();
  if (roll < 0.62) {
    return SHARD_TYPES[0];
  }
  if (roll < 0.9) {
    return SHARD_TYPES[1];
  }
  return SHARD_TYPES[2];
}

function createEnemy() {
  let x = randomBetween(20, WORLD.width - 50);
  let y = randomBetween(20, WORLD.height - 50);
  let tries = 0;

  // Avoid spawning right on top of the player.
  while (tries < 25) {
    const dx = x - player.x;
    const dy = y - player.y;
    if (Math.hypot(dx, dy) > 220) {
      break;
    }
    x = randomBetween(20, WORLD.width - 50);
    y = randomBetween(20, WORLD.height - 50);
    tries++;
  }

  return {
    x,
    y,
    size: 30,
    color: "#ff5d5d",
    speedFactor: randomBetween(0.9, 1.08),
    targetOffsetX: randomBetween(-140, 140),
    targetOffsetY: randomBetween(-140, 140),
    driftStrength: randomBetween(0.12, 0.35),
    driftSeed: randomBetween(0, Math.PI * 2),
  };
}

function resetGame() {
  currentMapIndex = 0;
  currentMap = MAPS[currentMapIndex];
  stageNumber = 1;
  stageGoalTime = 30;
  isLevelComplete = false;
  pendingStageTransition = false;
  playerInventory = [];
  isInventoryOpen = false;
  inventoryOverlayEl.classList.add("hidden");
  lcOverlayEl.classList.add("hidden");

  player = {
    x: WORLD.width / 2 - 15,
    y: WORLD.height / 2 - 15,
    size: 30,
    color: "#4aa3ff",
  };

  enemies = [createEnemy()];

  keys = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  gameOver = false;
  surviveTime = 0;
  spawnTimer = 0;
  dashCooldownLeft = 0;
  dashTimeLeft = 0;
  dashDir = { x: 1, y: 0 };
  lastMoveDir = { x: 1, y: 0 };
  afterimages = [];
  afterimageTimer = 0;
  shards = [];
  shardSpawnTimer = 0;
  playerLevel = 1;
  playerXp = 0;
  xpToNextLevel = getXpForLevel(playerLevel);
  playerSpeedCurrent = BASE_PLAYER_SPEED;
  dashSpeedCurrent = BASE_DASH_SPEED;
  dashDurationCurrent = BASE_DASH_DURATION;
  dashCooldownCurrent = BASE_DASH_COOLDOWN;
  shardXpMultiplier = 1;
  teleportDashUnlocked = false;
  shockwaveUnlocked = false;
  shockwaveCooldownLeft = 0;
  shockwaveRadiusCurrent = SHOCKWAVE_RADIUS;
  shockwavePushCurrent = SHOCKWAVE_PUSH;
  teleportDashRangeMultiplier = 1;
  shardMagnetUnlocked = false;
  shardMagnetRadius = 220;
  dashShockwaveUnlocked = false;
  dashShockwaveRadius = 160;
  overclockUnlocked = false;
  overclockTimeLeft = 0;
  overclockDuration = 5;
  overclockSpeedBoost = 1.4;
  visualBursts = [];
  isChoosingPowerUp = false;
  pendingPowerUpChoices = 0;
  currentPowerUpOptions = [];
  availablePowerUps = POWER_UP_POOL.map((powerup) => ({ ...powerup }));
  powerupOverlayEl.classList.add("hidden");
  shockwaveBoxEl.classList.add("hidden");
  spawnMines();
  lastTime = performance.now();
  statusText.textContent = "Laufe weg vor dem Gegner.";

  for (let i = 0; i < 4; i++) {
    spawnShard();
  }
}

function startNextStage() {
  stageNumber += 1;
  stageGoalTime = 30 + (stageNumber - 1) * 10;
  currentMapIndex = (currentMapIndex + 1) % MAPS.length;
  currentMap = MAPS[currentMapIndex];

  player.x = WORLD.width / 2 - 15;
  player.y = WORLD.height / 2 - 15;
  enemies = [createEnemy()];
  shards = [];
  afterimages = [];
  visualBursts = [];
  surviveTime = 0;
  spawnTimer = 0;
  shardSpawnTimer = 0;
  dashCooldownLeft = 0;
  dashTimeLeft = 0;
  shockwaveCooldownLeft = 0;
  gameOver = false;
  isLevelComplete = false;
  isChoosingPowerUp = false;
  pendingPowerUpChoices = 0;
  powerupOverlayEl.classList.add("hidden");
  lcOverlayEl.classList.add("hidden");
  spawnMines();
  lastTime = performance.now();
  statusText.textContent = `Stage ${stageNumber} — Ziel: ${stageGoalTime}s überleben!`;

  for (let i = 0; i < 4; i++) {
    spawnShard();
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function checkPlayerEnemyCollision() {
  for (const enemy of enemies) {
    if (isColliding(player, enemy)) {
      gameOver = true;
      triggerDeathTransition(`Erwischt! Überlebt: ${surviveTime.toFixed(1)}s`);
      return true;
    }
  }
  return false;
}

function movePlayerWithCollision(moveX, moveY) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(moveX), Math.abs(moveY)) / 8));
  const stepX = moveX / steps;
  const stepY = moveY / steps;

  for (let i = 0; i < steps; i++) {
    const prevX = player.x;
    const prevY = player.y;

    player.x += stepX;
    player.x = clamp(player.x, 0, WORLD.width - player.size);
    if (currentMap.walls.some((w) => isCollidingWithWall(player, w))) {
      player.x = prevX;
    }

    player.y += stepY;
    player.y = clamp(player.y, 0, WORLD.height - player.size);
    if (currentMap.walls.some((w) => isCollidingWithWall(player, w))) {
      player.y = prevY;
    }

    if (checkPlayerEnemyCollision()) {
      return;
    }
  }
}

function spawnAfterimage() {
  afterimages.push({
    x: player.x,
    y: player.y,
    size: player.size,
    life: AFTERIMAGE_LIFETIME,
    maxLife: AFTERIMAGE_LIFETIME,
  });
}

function updateAfterimages(deltaSeconds) {
  for (let i = afterimages.length - 1; i >= 0; i--) {
    const img = afterimages[i];
    img.life -= deltaSeconds;
    if (img.life <= 0) {
      afterimages.splice(i, 1);
    }
  }
}

function spawnVisualBurst(x, y, color, maxRadius = 90, lifetime = 0.2) {
  visualBursts.push({
    x,
    y,
    color,
    radius: 8,
    maxRadius,
    life: lifetime,
    maxLife: lifetime,
  });
}

function updateVisualBursts(deltaSeconds) {
  for (let i = visualBursts.length - 1; i >= 0; i--) {
    const burst = visualBursts[i];
    burst.life -= deltaSeconds;
    if (burst.life <= 0) {
      visualBursts.splice(i, 1);
      continue;
    }
    const progress = 1 - burst.life / burst.maxLife;
    burst.radius = 8 + (burst.maxRadius - 8) * progress;
  }
}

function spawnShard() {
  let x = randomBetween(16, WORLD.width - SHARD_SIZE - 16);
  let y = randomBetween(16, WORLD.height - SHARD_SIZE - 16);
  let tries = 0;

  while (tries < 40) {
    const dx = x - player.x;
    const dy = y - player.y;
    const tooClose = Math.hypot(dx, dy) < 140;
    const inWall = currentMap.walls.some(
      (w) => x < w.x + w.w && x + SHARD_SIZE > w.x && y < w.y + w.h && y + SHARD_SIZE > w.y
    );
    const nearMine = mines.some(
      (m) => Math.hypot(x + SHARD_SIZE / 2 - (m.x + MAP_MINE_SIZE / 2), y + SHARD_SIZE / 2 - (m.y + MAP_MINE_SIZE / 2)) < 80
    );
    if (!tooClose && !inWall && !nearMine) {
      break;
    }
    x = randomBetween(16, WORLD.width - SHARD_SIZE - 16);
    y = randomBetween(16, WORLD.height - SHARD_SIZE - 16);
    tries++;
  }

  const type = chooseShardType();
  shards.push({
    x,
    y,
    size: SHARD_SIZE,
    pulseSeed: randomBetween(0, Math.PI * 2),
    type,
  });
}

function drawShard(shard, time) {
  const cx = shard.x + shard.size / 2;
  const cy = shard.y + shard.size / 2;
  const pulse = 0.86 + (Math.sin(time * 5 + shard.pulseSeed) + 1) * 0.09;
  const outer = (shard.size * 0.52) * pulse;
  const inner = (shard.size * 0.26) * pulse;

  const glow = 0.22 + (Math.sin(time * 6 + shard.pulseSeed) + 1) * 0.08;
  const glowColor = shard.type.glow.replace("ALPHA", glow.toFixed(3));
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.arc(cx, cy, outer * 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Crystal-like diamond (instead of classic round coin).
  ctx.fillStyle = shard.type.colors[0];
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  ctx.lineTo(cx + outer, cy);
  ctx.lineTo(cx, cy + outer);
  ctx.lineTo(cx - outer, cy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = shard.type.colors[1];
  ctx.beginPath();
  ctx.moveTo(cx, cy - inner);
  ctx.lineTo(cx + inner, cy);
  ctx.lineTo(cx, cy + inner);
  ctx.lineTo(cx - inner, cy);
  ctx.closePath();
  ctx.fill();
}

function collectShards() {
  for (let i = shards.length - 1; i >= 0; i--) {
    const shard = shards[i];
    if (isColliding(player, shard)) {
      shards.splice(i, 1);
      const gainedXp = Math.max(1, Math.round(shard.type.xp * shardXpMultiplier));
      playerXp += gainedXp;
      statusText.textContent = `+${gainedXp} XP (${playerXp}/${xpToNextLevel})`;

      while (playerXp >= xpToNextLevel) {
        playerXp -= xpToNextLevel;
        playerLevel += 1;
        xpToNextLevel = getXpForLevel(playerLevel);
        pendingPowerUpChoices += 1;
        statusText.textContent = `Level Up! Waehle ein Power-Up (Level ${playerLevel}).`;
      }
    }
  }
}

function pickPowerUpOptions() {
  const pool = availablePowerUps.filter((powerup) => !powerup.requires || powerup.requires());
  if (pool.length <= 2) {
    return pool;
  }

  const picked = [];
  while (picked.length < 2 && pool.length > 0) {
    const weights = pool.map((powerup) => powerup.rarity === "epic" ? 0.15 : powerup.rarity === "rare" ? 0.3 : 1);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = Math.random() * totalWeight;
    let chosenIndex = 0;
    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        chosenIndex = i;
        break;
      }
    }
    picked.push(pool[chosenIndex]);
    pool.splice(chosenIndex, 1);
  }

  return picked;
}

function renderPowerUpOptions() {
  if (currentPowerUpOptions.length < 2) {
    isChoosingPowerUp = false;
    powerupOverlayEl.classList.add("hidden");
    return;
  }
  const [a, b] = currentPowerUpOptions;
  powerupOption1El.className = `powerup-option ${a.rarity}`;
  powerupOption2El.className = `powerup-option ${b.rarity}`;
  powerupOption1El.innerHTML = `<span class="powerup-rarity">${a.rarity}</span><strong>1) ${a.title}</strong>${a.description}`;
  powerupOption2El.innerHTML = `<span class="powerup-rarity">${b.rarity}</span><strong>2) ${b.title}</strong>${b.description}`;
}

function openPowerUpChoice() {
  currentPowerUpOptions = pickPowerUpOptions();
  renderPowerUpOptions();
  isChoosingPowerUp = true;
  powerupOverlayEl.classList.remove("hidden");
}

function maybeOpenPowerUpChoice() {
  if (!isChoosingPowerUp && pendingPowerUpChoices > 0 && !gameOver) {
    openPowerUpChoice();
  }
}

function openInventory() {
  if (playerInventory.length === 0) {
    inventoryListEl.innerHTML = "";
    inventoryEmptyEl.classList.remove("hidden");
  } else {
    inventoryEmptyEl.classList.add("hidden");
    inventoryListEl.innerHTML = playerInventory.map((e) => `
      <div class="inventory-item ${e.rarity}">
        <div class="inventory-item-header">
          <span class="powerup-rarity">${e.rarity}</span>
          <span class="inventory-item-name">${e.title}</span>
          ${e.count > 1 ? `<span class="inventory-item-count">x${e.count}</span>` : ""}
        </div>
        <div class="inventory-item-desc">${e.description}</div>
      </div>`).join("");
  }
  isInventoryOpen = true;
  inventoryOverlayEl.classList.remove("hidden");
}

function closeInventory() {
  isInventoryOpen = false;
  inventoryOverlayEl.classList.add("hidden");
}

function proceedFromLevelComplete() {
  isLevelComplete = false;
  lcOverlayEl.classList.add("hidden");
  const options = pickPowerUpOptions();
  if (options.length < 2) {
    startNextStage();
    return;
  }
  pendingStageTransition = true;
  currentPowerUpOptions = options;
  renderPowerUpOptions();
  isChoosingPowerUp = true;
  powerupOverlayEl.classList.remove("hidden");
}

function choosePowerUpByIndex(index) {
  if (!isChoosingPowerUp || !currentPowerUpOptions[index]) {
    return;
  }
  const chosen = currentPowerUpOptions[index];
  chosen.apply();
  if (chosen.unique) {
    availablePowerUps = availablePowerUps.filter((powerup) => powerup.id !== chosen.id);
  }
  const existing = playerInventory.find((e) => e.id === chosen.id);
  if (existing) {
    existing.count += 1;
  } else {
    playerInventory.push({ id: chosen.id, title: chosen.title, description: chosen.description, rarity: chosen.rarity, count: 1 });
  }
  pendingPowerUpChoices = Math.max(0, pendingPowerUpChoices - 1);
  isChoosingPowerUp = false;
  powerupOverlayEl.classList.add("hidden");
  statusText.textContent = `Power-Up aktiv: ${chosen.title}`;
  if (pendingStageTransition) {
    pendingStageTransition = false;
    startNextStage();
    return;
  }
  maybeOpenPowerUpChoice();
}

function updatePlayer(deltaSeconds) {
  let vx = 0;
  let vy = 0;

  if (keys.w) vy -= 1;
  if (keys.s) vy += 1;
  if (keys.a) vx -= 1;
  if (keys.d) vx += 1;

  if (vx !== 0 && vy !== 0) {
    const inv = 1 / Math.sqrt(2);
    vx *= inv;
    vy *= inv;
  }

  if (vx !== 0 || vy !== 0) {
    lastMoveDir.x = vx;
    lastMoveDir.y = vy;
  }

  if (dashTimeLeft > 0) {
    dashTimeLeft = Math.max(0, dashTimeLeft - deltaSeconds);
    afterimageTimer += deltaSeconds;
    while (afterimageTimer >= AFTERIMAGE_INTERVAL) {
      afterimageTimer -= AFTERIMAGE_INTERVAL;
      spawnAfterimage();
    }
    movePlayerWithCollision(
      dashDir.x * dashSpeedCurrent * deltaSeconds,
      dashDir.y * dashSpeedCurrent * deltaSeconds
    );
    return;
  }

  const overclockBoost = overclockTimeLeft > 0 ? overclockSpeedBoost : 1;
  movePlayerWithCollision(vx * playerSpeedCurrent * overclockBoost * deltaSeconds, vy * playerSpeedCurrent * overclockBoost * deltaSeconds);
}

function tryDash() {
  if (gameOver) {
    return;
  }
  if (dashCooldownLeft > 0) {
    statusText.textContent = `Dash bereit in ${dashCooldownLeft.toFixed(1)}s`;
    return;
  }

  let dx = 0;
  let dy = 0;
  if (keys.w) dy -= 1;
  if (keys.s) dy += 1;
  if (keys.a) dx -= 1;
  if (keys.d) dx += 1;

  if (dx === 0 && dy === 0) {
    dx = lastMoveDir.x;
    dy = lastMoveDir.y;
  }

  const len = Math.hypot(dx, dy);
  if (len === 0) {
    dx = 1;
    dy = 0;
  } else {
    dx /= len;
    dy /= len;
  }

  dashDir.x = dx;
  dashDir.y = dy;

  const preDashCX = player.x + player.size / 2;
  const preDashCY = player.y + player.size / 2;

  if (teleportDashUnlocked) {
    const originX = player.x;
    const originY = player.y;
    const teleportDistance = dashSpeedCurrent * dashDurationCurrent * teleportDashRangeMultiplier;
    const destX = clamp(originX + dashDir.x * teleportDistance, 0, WORLD.width - player.size);
    const destY = clamp(originY + dashDir.y * teleportDistance, 0, WORLD.height - player.size);
    player.x = destX;
    player.y = destY;
    if (currentMap.walls.some((w) => isCollidingWithWall(player, w))) {
      let freed = false;
      for (let push = 8; push <= 200; push += 8) {
        player.x = clamp(destX + dashDir.x * push, 0, WORLD.width - player.size);
        player.y = clamp(destY + dashDir.y * push, 0, WORLD.height - player.size);
        if (!currentMap.walls.some((w) => isCollidingWithWall(player, w))) {
          freed = true;
          break;
        }
      }
      if (!freed) {
        for (let push = 8; push <= teleportDistance; push += 8) {
          player.x = clamp(destX - dashDir.x * push, 0, WORLD.width - player.size);
          player.y = clamp(destY - dashDir.y * push, 0, WORLD.height - player.size);
          if (!currentMap.walls.some((w) => isCollidingWithWall(player, w))) {
            break;
          }
        }
      }
    }
    spawnVisualBurst(originX + player.size / 2, originY + player.size / 2, "255,165,80", 70, 0.16);
    spawnVisualBurst(player.x + player.size / 2, player.y + player.size / 2, "255,205,130", 95, 0.2);
    checkPlayerEnemyCollision();
  } else {
    dashTimeLeft = dashDurationCurrent;
    afterimageTimer = 0;
    spawnAfterimage();
  }
  dashCooldownLeft = dashCooldownCurrent;

  if (dashShockwaveUnlocked) {
    for (const enemy of enemies) {
      const ex = enemy.x + enemy.size / 2;
      const ey = enemy.y + enemy.size / 2;
      const dx2 = ex - preDashCX;
      const dy2 = ey - preDashCY;
      const dist = Math.hypot(dx2, dy2);
      if (dist <= dashShockwaveRadius && dist > 0.001) {
        const force = (1 - dist / dashShockwaveRadius) * 140;
        enemy.x = clamp(enemy.x + (dx2 / dist) * force, 0, WORLD.width - enemy.size);
        enemy.y = clamp(enemy.y + (dy2 / dist) * force, 0, WORLD.height - enemy.size);
      }
    }
    spawnVisualBurst(preDashCX, preDashCY, "214,139,255", dashShockwaveRadius, 0.18);
  }

  if (overclockUnlocked) {
    overclockTimeLeft = overclockDuration;
  }

  statusText.textContent = "Dash benutzt!";
}

function tryShockwave() {
  if (!shockwaveUnlocked || gameOver || isChoosingPowerUp) {
    return;
  }
  if (shockwaveCooldownLeft > 0) {
    statusText.textContent = `Shockwave bereit in ${shockwaveCooldownLeft.toFixed(1)}s`;
    return;
  }

  const px = player.x + player.size / 2;
  const py = player.y + player.size / 2;
  let hitCount = 0;
  for (const enemy of enemies) {
    const ex = enemy.x + enemy.size / 2;
    const ey = enemy.y + enemy.size / 2;
    const dx = ex - px;
    const dy = ey - py;
    const dist = Math.hypot(dx, dy);
    if (dist <= shockwaveRadiusCurrent && dist > 0.001) {
      const force = (1 - dist / shockwaveRadiusCurrent) * shockwavePushCurrent;
      enemy.x += (dx / dist) * force;
      enemy.y += (dy / dist) * force;
      enemy.x = clamp(enemy.x, 0, WORLD.width - enemy.size);
      enemy.y = clamp(enemy.y, 0, WORLD.height - enemy.size);
      hitCount++;
    }
  }

  shockwaveCooldownLeft = SHOCKWAVE_COOLDOWN;
  spawnVisualBurst(px, py, "255,170,90", Math.min(340, shockwaveRadiusCurrent), 0.26);
  statusText.textContent = `Shockwave! ${hitCount} Gegner weggestossen.`;
}

function updateEnemy(enemy, enemyIndex, deltaSeconds) {
  const time = surviveTime;
  const playerCenterX = player.x + player.size / 2;
  const playerCenterY = player.y + player.size / 2;
  const enemyCenterX = enemy.x + enemy.size / 2;
  const enemyCenterY = enemy.y + enemy.size / 2;

  // Give each enemy its own moving aim point near the player.
  const dynamicOffsetX =
    enemy.targetOffsetX + Math.sin(time * (0.75 + enemy.driftStrength) + enemy.driftSeed) * 35;
  const dynamicOffsetY =
    enemy.targetOffsetY + Math.cos(time * (0.6 + enemy.driftStrength) + enemy.driftSeed * 1.3) * 35;

  const distToPlayer = Math.hypot(enemyCenterX - playerCenterX, enemyCenterY - playerCenterY);
  const offsetScale = distToPlayer > 120 ? 1 : distToPlayer / 120;
  const targetX = playerCenterX + dynamicOffsetX * offsetScale;
  const targetY = playerCenterY + dynamicOffsetY * offsetScale;

  let dx = targetX - enemyCenterX;
  let dy = targetY - enemyCenterY;

  // Keep enemies from stacking too tightly.
  let separationX = 0;
  let separationY = 0;
  for (let i = 0; i < enemies.length; i++) {
    if (i === enemyIndex) {
      continue;
    }
    const other = enemies[i];
    const ox = enemyCenterX - (other.x + other.size / 2);
    const oy = enemyCenterY - (other.y + other.size / 2);
    const dist = Math.hypot(ox, oy);
    if (dist > 0 && dist < ENEMY_SEPARATION_RADIUS) {
      const force = (ENEMY_SEPARATION_RADIUS - dist) / ENEMY_SEPARATION_RADIUS;
      separationX += (ox / dist) * force;
      separationY += (oy / dist) * force;
    }
  }

  dx += separationX * 1.7;
  dy += separationY * 1.7;
  const len = Math.hypot(dx, dy);

  if (len > 0) {
    dx /= len;
    dy /= len;
  }

  const wobbleX = Math.sin(time * 2.2 + enemy.driftSeed) * enemy.driftStrength;
  const wobbleY = Math.cos(time * 2.0 + enemy.driftSeed * 0.8) * enemy.driftStrength;
  const speed = ENEMY_SPEED * enemy.speedFactor;

  enemy.x += (dx + wobbleX) * speed * deltaSeconds;
  enemy.y += (dy + wobbleY) * speed * deltaSeconds;

  enemy.x = clamp(enemy.x, 0, WORLD.width - enemy.size);
  enemy.y = clamp(enemy.y, 0, WORLD.height - enemy.size);
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}

function isCollidingWithWall(entity, wall) {
  return (
    entity.x < wall.x + wall.w &&
    entity.x + entity.size > wall.x &&
    entity.y < wall.y + wall.h &&
    entity.y + entity.size > wall.y
  );
}

function checkMineCollision() {
  for (const mine of mines) {
    if (
      player.x < mine.x + MAP_MINE_SIZE &&
      player.x + player.size > mine.x &&
      player.y < mine.y + MAP_MINE_SIZE &&
      player.y + player.size > mine.y
    ) {
      gameOver = true;
      triggerDeathTransition(`Mine getroffen! Überlebt: ${surviveTime.toFixed(1)}s`);
      return;
    }
  }
}

function drawRect(entity) {
  ctx.fillStyle = entity.color;
  ctx.fillRect(entity.x, entity.y, entity.size, entity.size);
}

function drawScene() {
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);

  ctx.fillStyle = "#151b26";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  // Draw walls
  ctx.fillStyle = "#4a5568";
  for (const wall of currentMap.walls) {
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
  }
  ctx.strokeStyle = "#718096";
  ctx.lineWidth = 2;
  for (const wall of currentMap.walls) {
    ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
  }

  // Draw mines
  for (const mine of mines) {
    const cx = mine.x + MAP_MINE_SIZE / 2;
    const cy = mine.y + MAP_MINE_SIZE / 2;
    ctx.fillStyle = "#ff3030";
    ctx.beginPath();
    ctx.arc(cx, cy, MAP_MINE_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ff8080";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Cross
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 5); ctx.lineTo(cx + 5, cy + 5);
    ctx.moveTo(cx + 5, cy - 5); ctx.lineTo(cx - 5, cy + 5);
    ctx.stroke();
  }

  for (const shard of shards) {
    drawShard(shard, surviveTime);
  }

  for (const img of afterimages) {
    const alpha = (img.life / img.maxLife) * 0.45;
    ctx.fillStyle = `rgba(74,163,255,${alpha.toFixed(3)})`;
    ctx.fillRect(img.x, img.y, img.size, img.size);
  }

  for (const burst of visualBursts) {
    const alpha = (burst.life / burst.maxLife) * 0.75;
    ctx.strokeStyle = `rgba(${burst.color},${alpha.toFixed(3)})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawRect(player);
  for (const enemy of enemies) {
    drawRect(enemy);
  }

  ctx.fillStyle = "#d6e4ff";
  ctx.font = "18px Arial";
  ctx.fillText(`Zeit: ${surviveTime.toFixed(1)}s / ${stageGoalTime}s`, 12, 26);
  ctx.fillText(`Gegner: ${enemies.length}`, 12, 50);
  ctx.fillText(`Stage ${stageNumber} — ${currentMap.name}`, 12, 74);
  if (overclockTimeLeft > 0) {
    ctx.fillStyle = "#f0c0ff";
    ctx.fillText(`⚡ OVERCLOCK ${overclockTimeLeft.toFixed(1)}s`, 12, 98);
  }

}

function updateUiBars() {
  const shardProgress = (playerXp / xpToNextLevel) * 100;
  shardBarEl.style.width = `${shardProgress.toFixed(2)}%`;
  levelLabelEl.textContent = `Level ${playerLevel}`;
  shardLabelEl.textContent = `XP ${playerXp} / ${xpToNextLevel}`;

  const dashReadyRatio = ((dashCooldownCurrent - dashCooldownLeft) / dashCooldownCurrent) * 100;
  const clampedDashRatio = clamp(dashReadyRatio, 0, 100);
  dashBarEl.style.width = `${clampedDashRatio.toFixed(2)}%`;
  dashLabelEl.textContent =
    dashCooldownLeft <= 0 ? "Dash bereit" : `Dash in ${dashCooldownLeft.toFixed(1)}s`;

  if (shockwaveUnlocked) {
    shockwaveBoxEl.classList.remove("hidden");
    const shockwaveReadyRatio =
      ((SHOCKWAVE_COOLDOWN - shockwaveCooldownLeft) / SHOCKWAVE_COOLDOWN) * 100;
    shockwaveBarEl.style.width = `${clamp(shockwaveReadyRatio, 0, 100).toFixed(2)}%`;
    shockwaveLabelEl.textContent =
      shockwaveCooldownLeft <= 0
        ? "Shockwave bereit"
        : `Shockwave in ${shockwaveCooldownLeft.toFixed(1)}s`;
  } else {
    shockwaveBoxEl.classList.add("hidden");
  }
}

function gameLoop(now) {
  if (!gameLoopRunning) return;
  const deltaSeconds = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  if (!gameOver && !isChoosingPowerUp && !isLevelComplete && !isInventoryOpen) {
    surviveTime += deltaSeconds;
    spawnTimer += deltaSeconds;
    shardSpawnTimer += deltaSeconds;
    dashCooldownLeft = Math.max(0, dashCooldownLeft - deltaSeconds);
    shockwaveCooldownLeft = Math.max(0, shockwaveCooldownLeft - deltaSeconds);
    overclockTimeLeft = Math.max(0, overclockTimeLeft - deltaSeconds);
    updateAfterimages(deltaSeconds);
    updateVisualBursts(deltaSeconds);
    updatePlayer(deltaSeconds);

    if (shardMagnetUnlocked) {
      const px = player.x + player.size / 2;
      const py = player.y + player.size / 2;
      for (const shard of shards) {
        const sx = shard.x + shard.size / 2;
        const sy = shard.y + shard.size / 2;
        const dist = Math.hypot(sx - px, sy - py);
        if (dist < shardMagnetRadius && dist > 1) {
          shard.x += ((px - sx) / dist) * 280 * deltaSeconds;
          shard.y += ((py - sy) / dist) * 280 * deltaSeconds;
        }
      }
    }

    collectShards();
    maybeOpenPowerUpChoice();
    for (let i = 0; i < enemies.length; i++) {
      updateEnemy(enemies[i], i, deltaSeconds);
    }

    if (spawnTimer >= ENEMY_SPAWN_INTERVAL) {
      spawnTimer -= ENEMY_SPAWN_INTERVAL;
      enemies.push(createEnemy());
      statusText.textContent = `Neuer Gegner gespawnt! (${enemies.length} insgesamt)`;
    }

    if (shardSpawnTimer >= SHARD_SPAWN_INTERVAL) {
      shardSpawnTimer -= SHARD_SPAWN_INTERVAL;
      if (shards.length < 12) {
        spawnShard();
      }
    }

    checkPlayerEnemyCollision();
    checkMineCollision();

    if (!gameOver && surviveTime >= stageGoalTime) {
      isLevelComplete = true;
      lcTitleEl.textContent = `Stage ${stageNumber} geschafft!`;
      lcTimeTextEl.textContent = `Überlebt: ${surviveTime.toFixed(1)}s`;
      lcNextTextEl.textContent = `Nächstes Ziel: ${stageGoalTime + 10}s überleben`;
      lcOverlayEl.classList.remove("hidden");
    }
  }

  drawScene();
  updateUiBars();
  requestAnimationFrame(gameLoop);
}

powerupOption1El.addEventListener("click", () => {
  choosePowerUpByIndex(0);
});

powerupOption2El.addEventListener("click", () => {
  choosePowerUpByIndex(1);
});

lcContinueEl.addEventListener("click", () => {
  proceedFromLevelComplete();
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  tryShockwave();
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (event.code === "Tab") {
    event.preventDefault();
    isInventoryOpen ? closeInventory() : openInventory();
    return;
  }

  if (event.shiftKey && event.code >= "Digit1" && event.code <= "Digit5") {
    const targetStage = parseInt(event.code.replace("Digit", ""));
    stageNumber = targetStage - 1;
    currentMapIndex = targetStage - 2;
    startNextStage();
    return;
  }

  if (isLevelComplete) {
    if (event.key === "Enter" || event.code === "Space") {
      event.preventDefault();
      proceedFromLevelComplete();
    }
    return;
  }

  if (isChoosingPowerUp) {
    if (key === "1") {
      choosePowerUpByIndex(0);
      return;
    }
    if (key === "2") {
      choosePowerUpByIndex(1);
      return;
    }
    if (key !== "r") {
      return;
    }
  }

  if (key in keys) {
    keys[key] = true;
  }
  if (event.code === "Space") {
    event.preventDefault();
    tryDash();
  }
  if (key === "f") {
    tryShockwave();
  }
  if (key === "r") {
    resetGame();
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (key in keys) {
    keys[key] = false;
  }
});

// --- Start Menu ---
const startmenuEl       = document.getElementById("startmenu");
const gameContainerEl   = document.getElementById("game-container");
const startmenuBtnEl    = document.getElementById("startmenu-btn");
const startmenuSubEl    = document.getElementById("startmenu-sub");
const startmenuGameoverEl = document.getElementById("startmenu-gameover");
const transitionOverlayEl = document.getElementById("transition-overlay");

let gameLoopRunning = false;

function startGame() {
  startmenuEl.classList.add("hidden");
  gameContainerEl.classList.remove("hidden");
  resetGame();
  gameLoopRunning = true;
  requestAnimationFrame(gameLoop);
}

function showStartMenu(gameoverMsg) {
  if (gameoverMsg) {
    startmenuSubEl.classList.add("hidden");
    startmenuGameoverEl.textContent = gameoverMsg;
    startmenuGameoverEl.classList.remove("hidden");
    startmenuBtnEl.textContent = "Nochmal spielen";
  } else {
    startmenuSubEl.classList.remove("hidden");
    startmenuGameoverEl.classList.add("hidden");
    startmenuBtnEl.textContent = "Spielen";
  }
  startmenuEl.classList.remove("hidden");
  startmenuEl.classList.remove("fade-in");
  void startmenuEl.offsetWidth; // reflow to restart animation
  startmenuEl.classList.add("fade-in");
  gameContainerEl.classList.add("hidden");
}

function triggerDeathTransition(msg) {
  gameLoopRunning = false;
  transitionOverlayEl.classList.remove("death-animate");
  void transitionOverlayEl.offsetWidth;
  transitionOverlayEl.classList.add("death-animate");
  setTimeout(() => {
    showStartMenu(msg);
    transitionOverlayEl.classList.remove("death-animate");
  }, 950);
}

startmenuBtnEl.addEventListener("click", startGame);
