# Roguelike Project

## Projektstruktur
- `index.html` — HTML-Struktur, Canvas (1600x900), UI-Elemente
- `style.css` — Alle Styles
- `script.js` — Gesamte Spiellogik (~1000 Zeilen)

## Spielmechanik
- Spieler bewegt sich mit WASD, Dash mit Leertaste, Shockwave mit F
- Gegner jagen den Spieler, spawnen alle 10 Sekunden
- Shards sammeln gibt XP → Level Up → Power-Up auswählen
- Kollision mit Gegner = Game Over

## Wichtige Konstanten (oben in script.js)
- `PLAYER_SPEED`, `ENEMY_SPEED`, `DASH_SPEED` etc. — nur ändern wenn explizit gewünscht
- `SHARD_TYPES` — common/rare/epic mit XP-Werten
- `POWER_UP_POOL` — alle verfügbaren Power-Ups
- `SHOCKWAVE_COOLDOWN` — aktuell 7s

## Power-Up-Pool (21 gesamt)

### Common (stackbar)
- **Swift Steps** — +12% Bewegungsgeschwindigkeit
- **Quick Recharge** — Dash-Cooldown −0.45s (min. 2.0s)
- **Phase Burst** — Dash länger & schneller
- **Arcane Greed** — Shards geben 20% mehr XP
- **Wide Shockwave** — Shockwave-Radius ×1.18 *(requires: shockwaveUnlocked)*
- **Force Surge** — Shockwave-Push ×1.28 *(requires: shockwaveUnlocked)*
- **Wide Pull** — Shard-Magnet-Radius +70px *(requires: shardMagnetUnlocked)*
- **Blast Radius** — Dash-Schockwelle-Radius ×1.3 *(requires: dashShockwaveUnlocked)*
- **Overclock Speed** — Overclock +10% Geschwindigkeit *(requires: overclockUnlocked)*
- **Overclock Duration** — Overclock +2s Dauer *(requires: overclockUnlocked)*
- **Long Blink** — Teleport-Dash-Reichweite ×1.18 *(requires: teleportDashUnlocked)*
- **Shard Storm** — Alle 5 Shards spawnt ein Bonus-Shard; jeder Stack senkt das Limit um 1 (`shardStormUnlocked`, stackbar)

### Rare (unique)
- **Teleport Dash** — Dash teleportiert sofort in Laufrichtung (`teleportDashUnlocked`)
- **Shockwave** — Taste F: Schockwelle stößt Gegner weg, 7s CD (`shockwaveUnlocked`)
- **Shard Magnet** — Shards in der Nähe automatisch anziehen (`shardMagnetUnlocked`)
- **Overclock** — Nach Dash 5s lang +40% Geschwindigkeit (`overclockUnlocked`)
- **Iron Dash** — Spieler ist während des Dash unverwundbar (`ironDashUnlocked`)
- **Shard Pulse** — Jeder gesammelte Shard stößt nahe Gegner weg, 180px Radius (`shardPulseUnlocked`)

### Epic (unique)
- **Shockwave on Dash** — Jeder Dash erzeugt kleine Schockwelle (`dashShockwaveUnlocked`)
- **Phantom** — Dash hinterlässt Köder für 2s, Gegner jagen ihn statt Spieler (`phantomDashUnlocked`)

### Legendary (unique)
- **Overdrive** — Dash hat keinen Cooldown (`overdriveUnlocked`)

## Rarity-Gewichte (pickPowerUpOptions)
- common: 1.0
- rare: 0.3
- epic: 0.15
- legendary: 0.06

## Neue State-Variablen (alle in resetGame() initialisiert)
- `ironDashUnlocked` / `dashImmunityLeft` — Iron Dash Unverwundbarkeit
- `shardStormUnlocked` / `shardStormCount` / `shardStormThreshold` — Shard Storm Zähler (Startwert 6, erste apply() → 5)
- `shardPulseUnlocked` — Shard Pulse aktiv
- `phantomDashUnlocked` / `decoys[]` — Phantom Köder-Array
- `overdriveUnlocked` — Overdrive aktiv

## Wichtige Implementierungsdetails

### Iron Dash
- `dashImmunityLeft` wird auf `dashDurationCurrent + 0.1` gesetzt beim Dash
- `checkPlayerEnemyCollision()` gibt früh `false` zurück wenn `dashImmunityLeft > 0`
- Teleport Dash: Kollisionsprüfung am Ende wird mit `if (!ironDashUnlocked)` geskippt

### Phantom
- Köder in `decoys[]` mit `{ x, y, size, life: 2, maxLife: 2 }`
- `applyChaseMovement()` leitet Gegner zu `decoys[0]` wenn vorhanden
- Blocker/Ankerer haben eigene Bewegungslogik → jagen Köder nicht
- `decoys = []` auch in `startNextStage()`

### Shard Storm
- `shardStormThreshold` startet bei 6; erste `apply()` bringt es auf 5
- Jeder weitere Stack −1, Minimum 2
- Beim Shard-Sammeln: `shardStormCount++`, bei Erreichen von Threshold → `spawnShard()` + Count reset

### Shard Pulse
- 180px Radius um Spieler beim Shard-Sammeln
- Ghosts immun, Swarms ×7 Kraft-Multiplikator

### Overdrive
- Setzt `dashCooldownLeft = 0` direkt nach dem normalen Cooldown-Set

## Konventionen
- Kommentare auf Englisch
- UI-Texte auf Deutsch
- Variablennamen auf Englisch (camelCase)
- Alle Spielzustands-Variablen werden in `resetGame()` initialisiert
- Rarity-Sortierung in Guide: common → rare → epic → legendary
