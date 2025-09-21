import { ECON } from '../constants';
import { state, RecruitmentSlot, ShipType, save } from '../state';
import { updateHud } from '../ui/hud';

// Support multiple shapes of constants + a sane default
function _slotsFromECON(): number {
  return (
    (ECON as any)?.recruit?.slots ??
    (ECON as any)?.recruitSlots ??
    4 // default
  );
}

export function recruitSlotsMax(): number {
  const n = Number(_slotsFromECON());
  return Number.isFinite(n) && n > 0 ? n : 4;
}

export function freeRecruitSlots(): number {
  const list = (state.recruitment ||= []); // ensure array
  return Math.max(0, recruitSlotsMax() - list.length);
}

export function previewRecruit(type: ShipType, qty: number) {
  qty = Math.max(1, Math.floor(qty));
  // Your ECON ships use { cost, build, speed, cap }
  const unit = (ECON as any).ships[type] as {
    cost: number;
    build: number; // seconds per unit
    speed: number;
    cap: number;
  };

  return {
    totalCost: unit.cost * qty,
    totalTime: unit.build * qty,
    unit
  };
}

export function startRecruit(type: ShipType, qty: number) {
  qty = Math.max(1, Math.floor(qty));

  if (freeRecruitSlots() <= 0) return { ok: false, err: 'No recruitment slots available.' };

  const { totalCost, unit } = previewRecruit(type, qty);
  if (state.money < totalCost) return { ok: false, err: 'Not enough money.' };

  state.money -= totalCost;

  const slot: RecruitmentSlot = {
    id: Math.random().toString(36).slice(2),
    type,
    remaining: qty,
    unitTime: unit.build, // seconds per unit
    unitCost: unit.cost,
    progress: 0
  };

  // leftmost is the active slot
  (state.recruitment as RecruitmentSlot[]).unshift(slot);
  updateHud();
  save(state);
  return { ok: true };
}

/** Advance production; produces ONE unit at a time per slot. */
export function tickRecruitment(dt: number) {
  const slots = (state.recruitment ||= []); // ensure array
  if (!slots.length) return;

  // iterate from leftmost (active) to right
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (!slot || slot.remaining <= 0) continue;

    slot.progress += dt;
    while (slot.progress >= slot.unitTime && slot.remaining > 0) {
      slot.progress -= slot.unitTime;
      slot.remaining -= 1;

      if (slot.type === 'drone') state.ships.drone += 1;
      else                       state.ships.battle += 1;

      updateHud();
    }
  }

  // remove finished slots
  for (let i = slots.length - 1; i >= 0; i--) {
    if (slots[i].remaining <= 0) slots.splice(i, 1);
  }
  save(state);
}

/** Optional RAF wrapper so progress keeps ticking even if main loop doesn’t call us. */
let _booted = false;
export function bootRecruitmentLoop() {
  if (_booted) return; _booted = true;
  state.recruitment ||= []; // ensure array on boot

  let last = performance.now();
  function step() {
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    try {
      tickRecruitment(dt);
    } catch (e) {
      console.error('[tickRecruitment]', e);
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
