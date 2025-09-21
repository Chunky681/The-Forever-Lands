// src/ui/fleet.ts
import { enqueueShip } from '../systems/systems';
import { toast } from './hud';

/**
 * Wire the (legacy) Fleet panel.
 * This guard makes it safe to call even when the Fleet UI isn't in the DOM
 * (e.g., newer builds that use the Recruit UI instead).
 */
export function wireFleet() {
  const btn     = document.querySelector('#fleetBtn')   as HTMLElement | null;
  const panel   = document.querySelector('#fleet')      as HTMLElement | null;
  const close   = document.querySelector('#fleetClose') as HTMLElement | null;
  const qDrone  = document.querySelector('#qDrone')     as HTMLElement | null;
  const qBattle = document.querySelector('#qBattle')    as HTMLElement | null;

  // If the Fleet UI doesn't exist in this build, exit gracefully.
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
  });

  close?.addEventListener('click', () => { panel.style.display = 'none'; });

  qDrone?.addEventListener('click',  () => enqueueShip('drone',  toast, () => {}));
  qBattle?.addEventListener('click', () => enqueueShip('battle', toast, () => {}));
}
