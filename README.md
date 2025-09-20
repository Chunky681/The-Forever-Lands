# The-Forever-Lands (PlanetForge)

Canvas-based idle/strategy prototype (planet, moons, satellites, scraps, fleets) built with **Vite + TypeScript** and ES modules.

---

## Prerequisites

- **Node.js 18+** (LTS recommended)  
  Check: `node -v`
- **npm** (bundled with Node)  
  Check: `npm -v`

> If you change Node versions, reinstall deps: `rm -rf node_modules && npm ci`

---

## Quick Start (Local Dev)

```bash
# install dependencies (uses package-lock for reproducible installs)
npm i

# start dev server with hot reload (http://localhost:5173)
npm run dev
```

### Controls

- **Right-drag** = pan
- **Mouse wheel** = zoom
- **H** = toggle Shop
- **Click planet/buildings** = open upgrade/demolish panel
- **Shop → Select** = start placing a building; **Right-click** cancels placement
- **Click scraps** = open radial action → **Collect Resources**
- **Fleet panel** = queue drones/battleships

### Saves

Progress is stored in **localStorage**.  
Reset from DevTools Console:

```js
localStorage.removeItem('planetforge:vite-ts-1'); 
location.reload();
```

---

## Build & Preview Production

```bash
# bundle to /dist
npm run build

# serve the production build locally
npm run preview
```

---

## Deploy

Any static host works (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

- **Netlify**: connect the repo  
  Build command: `npm run build`  
  Publish directory: `dist`
- **Vercel**: Import → Framework: **Vite**  
  Build: `npm run build`  
  Output: `dist`

---

## Project Structure

```
.
├─ index.html                # Vite HTML entry (must be at repo root)
├─ public/
│  └─ styles.css            # global styles (served at /styles.css)
├─ src/
│  ├─ constants.ts          # economy, orbit, sizes, tuning knobs
│  ├─ state.ts              # game state + save/load (localStorage)
│  ├─ engine/
│  │  └─ camera.ts          # canvas setup, transforms, zoom/pan
│  ├─ render/
│  │  ├─ draw.ts            # planet, buildings, territory, missions
│  │  ├─ stars.ts           # starfield creation/draw
│  │  └─ scraps.ts          # scrap spawn/draw
│  ├─ systems/
│  │  ├─ systems.ts         # production, queue, missions, costs, placement rules
│  │  └─ pick.ts            # picking buildings/scraps
│  ├─ ui/
│  │  ├─ hud.ts             # HUD values, shop toggle, toasts
│  │  ├─ shop.ts            # building placement + trading
│  │  ├─ panel.ts           # upgrades/demolish + planet upgrades
│  │  ├─ fleet.ts           # ship build queue
│  │  └─ collect.ts         # radial menu + send dialog
│  └─ main.ts               # input wiring, loop, autosave
├─ vite.config.ts
├─ tsconfig.json
├─ package.json
└─ package-lock.json
```

---

## Git Hygiene

Lockfiles **should be committed**.

**Commit:**
- `package.json`, `package-lock.json`
- `tsconfig.json`, `vite.config.ts`
- `src/**`, `public/**`, `index.html`, `styles.css`
- `README.md` and any lint/format config files

**Ignore:**
```
node_modules/
dist/
.vite/
coverage/
.env
.env.*.local
.vscode/
.idea/
*.log
.DS_Store
Thumbs.db
*.swp
*.tmp
```

Add the ignore rules above to `.gitignore` (at the repo root).

---

## Troubleshooting

### “Could not resolve entry module `index.html`”
Vite expects **`/index.html` at the repo root**. Move it out of `public/` if it’s there.

### TypeScript error about `vitest/importMeta`
Use these `types` in `tsconfig.json`:
```json
"types": ["vite/client", "vitest"]
```
(or just `"vite/client"` if you’re not running tests). In VS Code, run **TypeScript: Restart TS server** after editing.

### Port already in use
Change dev port in `vite.config.ts`:
```ts
import { defineConfig } from 'vite';
export default defineConfig({ server: { port: 5174, open: true } });
```

### White screen / nothing drawn
Open DevTools Console. Common fixes:
- Ensure `index.html` is at project root.
- Clear old saves: `localStorage.removeItem('planetforge:vite-ts-1')`.

---

## Next Steps

- Add ESLint/Prettier for linting/formatting.
- Add Vitest tests for economy math, mission timing, and orbit placement rules.
- Ship changes as small PRs for safer deploys.

---
