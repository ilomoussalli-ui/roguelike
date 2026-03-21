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

## Konventionen
- Kommentare auf Englisch
- UI-Texte auf Deutsch
- Variablennamen auf Englisch (camelCase)
- Alle Spielzustands-Variablen werden in `resetGame()` initialisiert
