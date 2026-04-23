Roguelike Project
Projektstruktur
index.html — HTML-Struktur, Canvas (1520x855), UI-Elemente, alle Overlays
style.css — Alle Styles
script.js — Gesamte Spiellogik
Spielmechanik
Spieler bewegt sich mit WASD, Dash mit Leertaste, Shockwave mit F, Frost Nova mit E
Gegner jagen den Spieler, spawnen alle 10 Sekunden
Shards sammeln gibt XP → Level Up → Power-Up auswählen
Kollision mit Gegner oder Mine = Game Over
ESC oder P pausiert das Spiel
Wichtige Konstanten (oben in script.js)
PLAYER_SPEED, ENEMY_SPEED, DASH_SPEED etc. — nur ändern wenn explizit gewünscht
SHARD_TYPES — common/rare/epic mit XP-Werten
POWER_UP_POOL — alle verfügbaren Power-Ups
SHOCKWAVE_COOLDOWN — aktuell 7s
ENEMY_TYPE_NAMES — Mapping von enemy.type auf deutschen Namen (für Death Recap)
Power-Up-Pool (23 gesamt)
Common (stackbar)
Swift Steps — +12% Bewegungsgeschwindigkeit
Quick Recharge — Dash-Cooldown −1.0s (min. 2.0s); requires: !overdriveUnlocked
Phase Burst — Dash länger & schneller
Arcane Greed — Shards geben 20% mehr XP
Wide Shockwave — Shockwave-Radius ×1.18 (requires: shockwaveUnlocked)
Force Surge — Shockwave-Push ×1.28 (requires: shockwaveUnlocked)
Wide Pull — Shard-Magnet-Radius +70px (requires: shardMagnetUnlocked)
Blast Radius — Dash-Schockwelle-Radius ×1.3 (requires: dashShockwaveUnlocked)
Overclock Speed — Overclock +10% Geschwindigkeit (requires: overclockUnlocked)
Overclock Duration — Overclock +2s Dauer (requires: overclockUnlocked)
Long Blink — Teleport-Dash-Reichweite ×1.35 pro Stack (requires: teleportDashUnlocked)
Deep Freeze — Frost Nova Dauer +1s pro Stack (requires: frostNovaUnlocked)
Shard Storm — Alle 5 Shards spawnt ein Bonus-Shard; jeder Stack senkt das Limit um 1 (shardStormUnlocked, stackbar)
Rare (unique)
Teleport Dash — Dash teleportiert sofort in Laufrichtung (teleportDashUnlocked)
Shockwave — Taste F: Schockwelle stößt Gegner weg, 7s CD (shockwaveUnlocked)
Shard Magnet — Shards in der Nähe automatisch anziehen (shardMagnetUnlocked)
Overclock — Nach Dash 5s lang +40% Geschwindigkeit (overclockUnlocked)
Iron Dash — Spieler ist während des Dash unverwundbar (ironDashUnlocked); requires: !teleportDashUnlocked
Shard Pulse — Jeder gesammelte Shard stößt nahe Gegner weg, 180px Radius (shardPulseUnlocked)
Frost Nova — Taste E: Friert alle Gegner für 1s ein, 12s CD (frostNovaUnlocked); Ghosts immun
Epic (unique)
Shockwave on Dash — Jeder Dash erzeugt kleine Schockwelle (dashShockwaveUnlocked)
Phantom — Dash hinterlässt Köder für 2s, Gegner jagen ihn statt Spieler (phantomDashUnlocked)
Legendary (unique)
Overdrive — Dash hat keinen Cooldown (overdriveUnlocked)
Rarity-Gewichte (pickPowerUpOptions)
common: 1.0
rare: 0.3
epic: 0.15
legendary: 0.06
State-Variablen (alle in resetGame() initialisiert, relevante auch in startNextStage())
frostNovaUnlocked / frostNovaDuration / frostNovaCooldownLeft — Frost Nova Zustand
enemy.frozenTime — wie lange ein Gegner noch eingefroren ist (wird in updateEnemy übersprungen wenn > 0)
ironDashUnlocked / dashImmunityLeft — Iron Dash Unverwundbarkeit
shardStormUnlocked / shardStormCount / shardStormThreshold — Shard Storm Zähler (Startwert 6, erste apply() → 5)
shardPulseUnlocked — Shard Pulse aktiv
phantomDashUnlocked / decoys[] / phantomCooldownLeft — Phantom Köder-Array + Cooldown
overdriveUnlocked — Overdrive aktiv
isPaused — Pause-Zustand
deathCause — Typ des Killers ("normal", "rusher", "mine" etc.) für Death Recap
deathBuildSnapshot — Kopie von playerInventory zum Todeszeitpunkt
Wichtige Implementierungsdetails
Iron Dash
dashImmunityLeft wird auf dashDurationCurrent + 0.1 gesetzt beim Dash
checkPlayerEnemyCollision() gibt früh false zurück wenn dashImmunityLeft > 0
Teleport Dash: Kollisionsprüfung am Ende wird mit if (!ironDashUnlocked) geskippt — das ist korrekt (kein Bug)
Phantom
Köder in decoys[] mit { x, y, size, life: 1, maxLife: 1 }
applyChaseMovement() leitet Gegner zu decoys[0] wenn vorhanden
Blocker/Ankerer haben eigene Bewegungslogik → jagen Köder nicht
decoys = [] und phantomCooldownLeft = 0 auch in startNextStage()
Shard Storm
shardStormThreshold startet bei 6; erste apply() bringt es auf 5
Jeder weitere Stack −1, Minimum 2
Beim Shard-Sammeln: shardStormCount++, bei Erreichen von Threshold → spawnShard() + Count reset
Shard Pulse
180px Radius um Spieler beim Shard-Sammeln
Ghosts immun, Swarms ×7 Kraft-Multiplikator
Overdrive
Setzt dashCooldownLeft = 0 direkt nach dem normalen Cooldown-Set
Teleport Dash Fehlschlag
Wenn kein freier Platz vor oder hinter dem Ziel gefunden wird → Spieler kehrt zur Ausgangsposition zurück + "Blockiert!" floating text
Pause (isPaused)
togglePause() blockiert bei gameOver / isLevelComplete / isChoosingPowerUp
ESC schließt zuerst Inventar, dann pausiert; P pausiert direkt
Tab öffnet Inventar nicht wenn pausiert
Game Loop überspringt Updates bei isPaused, aber läuft weiter (kein cancelAnimationFrame)
Death Recap
deathCause wird in checkPlayerEnemyCollision() (enemy.type) und checkMineCollision() ("mine") gesetzt
deathBuildSnapshot = [...playerInventory] zum Todeszeitpunkt
showStartMenu() rendert Causa + Build-Tags nach Rarität wenn gameoverMsg vorhanden
HTML-Elemente: #startmenu-recap, #startmenu-cause, #startmenu-build
Highscore (localStorage)
Key: "shardrush_highscore" → JSON { level, time, upgrades }
saveHighscoreIfBetter() wird in triggerDeathTransition() aufgerufen
Nur gespeichert wenn mindestens ein Wert besser als Bisheriges
showStartMenu() liest Highscore und zeigt ihn im #startmenu-highscore Element an
Visuelle Indikatoren (drawScene(), vor drawRect(player))
Shard Magnet: gestrichelter blauer Kreis (rgba 100,200,255) mit Radius shardMagnetRadius
Shockwave: gestrichelter lila Kreis (rgba 200,130,255) nur wenn shockwaveCooldownLeft <= 0
Dash (normal): gestrichelte blaue Linie in Bewegungsrichtung + Punkt am Endpunkt
Teleport Dash: gestricheltes oranges Rechteck am Zielort (player.size Größe)
Alle Indikatoren nur sichtbar wenn Dash bereit und Spieler sich bewegt
Konventionen
Kommentare auf Englisch
UI-Texte auf Deutsch — immer echte Umlaute (ä ö ü ß), NIEMALS ae/oe/ue/ss als Ersatz
Variablennamen auf Englisch (camelCase)
Alle Spielzustands-Variablen werden in resetGame() initialisiert
Variablen die Stage-Übergänge überleben müssen auch in startNextStage() zurückgesetzt werden
Rarity-Sortierung in Guide: common → rare → epic → legendary
requires()-Funktion bei Power-Ups verhindert sinnlose Kombis (z.B. Iron Dash nach Teleport Dash, Quick Recharge nach Overdrive)
