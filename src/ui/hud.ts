// src/ui/hud.ts
import { ECON } from '../constants';
import { state } from '../state';

// Small helpers so missing elements never crash the loop
const $ = (s: string) => document.querySelector(s) as HTMLElement | null;
const setText = (el: HTMLElement | null, v: string | number) => { if (el) el.textContent = String(v); };

export function updateHud() {
  // production rates: default level to 1 if missing
  const moonRate = state.moons.reduce((s: number, m: any) => s + (m?.lvl ?? m?.level ?? 1), 0);
  const satRate  = state.sats .reduce((s: number, sObj: any) => s + (sObj?.lvl ?? sObj?.level ?? 1), 0);

  setText($('#money'),  Math.floor(state.money));
  setText($('#basalt'), Math.floor(state.basalt));
  setText($('#energy'), Math.floor(state.energy));

  setText($('#moons'),  state.moons.length);
  setText($('#bRate'),  moonRate);
  setText($('#sats'),   state.sats.length);
  setText($('#eRate'),  satRate);

  setText($('#pLv'),    state.planet.level);
  setText($('#terr'),   Math.floor(state.territory));

  setText($('#moonCost'), ECON.moonCost);
  setText($('#satCost'),  ECON.satCost);

  setText($('#drCount'), state.ships?.drone ?? 0);
  setText($('#bsCount'), state.ships?.battle ?? 0);
  setText($('#msCount'), state.missions?.length ?? 0);

  setText($('#queueLen'), (state as any).queue?.length ?? 0);

  // cursor
  document.body.style.cursor = state.placing ? 'crosshair' : 'default';
}

export function toast(msg: string) {
  const t = $('#toast');
  if (!t) { console.log('[toast]', msg); return; }
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout((toast as any)._t);
  (toast as any)._t = setTimeout(() => { t.style.display = 'none'; }, 1600);
}

export function toggleShop(force?: boolean) {
  const shop = $('#shop');
  if (!shop) return;
  if (typeof force === 'boolean') {
    shop.style.display = force ? 'block' : 'none';
  } else {
    shop.style.display = (shop.style.display === 'block' ? 'none' : 'block');
  }
}
