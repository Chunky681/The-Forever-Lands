# PlanetForge (Modular, ES Modules, no build)

Open `index.html` in a modern browser, or run any static server (e.g. `python -m http.server`) and navigate to it.

- `src/constants.js` — economy, sizes, orbit config
- `src/gameState.js` — singleton game state, save/load
- `src/engine/camera.js` — canvas, camera, transforms
- `src/systems/` — production, missions, placement rules, picking
- `src/render/` — stars, bodies, scraps, mission visuals
- `src/ui/` — HUD/Shop/Fleet/Scrap collect dialog logic
- `src/main.js` — wires everything, input + loop

This matches the features we built: production, upgrades, demolish, zoom scaling, scraps radial menu, fleet slotting with ETA/capacity, 60s collection window, moving ship icons, right‑click to cancel placement.
