# Roguelike Project

## Projektstruktur
- `index.html` — HTML-Struktur, Canvas (1600x900), UI-Elemente
- `style.css` — Alle Styles
- `script.js` — Gesamte Spiellogik (~870 Zeilen)

## Spielmechanik
- Spieler bewegt sich mit WASD, Dash mit Leertaste, Shockwave mit F
- Gegner jagen den Spieler, spawnen alle 10 Sekunden
- Shards sammeln gibt XP → Level Up → Power-Up auswählen
- Kollision mit Gegner = Game Over

## Wichtige Konstanten (oben in script.js)
- `PLAYER_SPEED`, `ENEMY_SPEED`, `DASH_SPEED` etc. — nur ändern wenn explizit gewünscht
- `SHARD_TYPES` — common/rare/epic mit XP-Werten
- `POWER_UP_POOL` — alle verfügbaren Power-Ups

## Power-Up-Pool (16 gesamt)

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

### Rare (unique)
- **Teleport Dash** — Dash teleportiert sofort in Laufrichtung (`teleportDashUnlocked`)
- **Shockwave** — Taste F: Schockwelle stößt Gegner weg, 10s CD (`shockwaveUnlocked`)
- **Shard Magnet** — Shards in der Nähe automatisch anziehen (`shardMagnetUnlocked`)
- **Overclock** — Nach Dash 5s lang +40% Geschwindigkeit (`overclockUnlocked`)

### Epic (unique)
- **Shockwave on Dash** — Jeder Dash erzeugt kleine Schockwelle (`dashShockwaveUnlocked`)

## Konventionen
- Kommentare auf Englisch
- UI-Texte auf Deutsch
- Variablennamen auf Englisch (camelCase)
- Alle Spielzustands-Variablen werden in `resetGame()` initialisiert
