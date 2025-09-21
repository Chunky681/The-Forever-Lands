// src/ui/recruit.ts
import { ECON } from '../constants';
import { state, ShipType, RecruitmentSlot } from '../state';
import { updateHud, toast } from './hud';
import {
  bootRecruitmentLoop,
  freeRecruitSlots,
  recruitSlotsMax,
  previewRecruit,
  startRecruit
} from '../systems/recruit';

const $ = (s: string) => document.querySelector(s) as HTMLElement;

function fmtTime(sec: number) {
  if (sec < 60) return `${sec.toFixed(0)}s`;
  const m = Math.floor(sec / 60),
    s = Math.floor(sec % 60);
  return `${m}m ${s}s`;
}

function renderSlots() {
  const host = $('#rcSlots');
  host.innerHTML = '';

  const slots = state.recruitment as RecruitmentSlot[]; // <-- tell TS what this is
  if (!slots || slots.length === 0) {
    host.innerHTML = '<div class="muted">No active recruitment. Choose a troop and start a batch.</div>';
    return;
  }

  slots.forEach((slot: RecruitmentSlot) => { // <-- annotate param (or rely on the cast above)
    const pct = slot.unitTime ? Math.min(1, slot.progress / slot.unitTime) : 0;
    const el = document.createElement('div');
    el.className = `rc-slot ${slot.type === 'battle' ? 'battle' : ''}`;
    el.innerHTML = `
      <div class="rc-kind"><div class="icon"></div><strong>${slot.type === 'drone' ? 'Drone' : 'Battleship'}</strong></div>
      <div class="bar"><div style="width:${(pct * 100).toFixed(1)}%"></div></div>
      <div class="meta">
        <div>Left in batch: <strong>${slot.remaining}</strong></div>
        <div>Unit time: ${slot.unitTime}s</div>
      </div>
    `;
    host.appendChild(el);
  });
}

let pick: ShipType = 'drone';

function refreshPreview() {
  const qtyEl = document.getElementById('rcQty') as HTMLInputElement;
  const rngEl = document.getElementById('rcRange') as HTMLInputElement;

  let qty = Math.max(1, Math.floor(Number(qtyEl.value || '1')));
  const unit = (ECON as any).ships[pick]; // cost + build on your ECON
  const maxAffordable = Math.max(1, Math.floor(state.money / unit.cost));
  rngEl.max = String(Math.max(1, Math.min(1000, maxAffordable)));
  qty = Math.min(qty, Number(rngEl.max));

  const { totalCost, totalTime } = previewRecruit(pick, qty);

  $('#rcCost').textContent = String(totalCost);
  $('#rcTime').textContent = fmtTime(totalTime);
  $('#rcFree').textContent = String(freeRecruitSlots());
  $('#rcMaxSlots').textContent = String(recruitSlotsMax());

  qtyEl.value = String(qty);
  rngEl.value = String(qty);
}

export function wireRecruit() {
  // open
  $('#recruitBtn').addEventListener('click', () => {
    $('#recruit').style.display = 'block';
    $('#rcDroneCost').textContent = String((ECON as any).ships.drone.cost);
    $('#rcDroneTime').textContent = String((ECON as any).ships.drone.build);
    $('#rcBattleCost').textContent = String((ECON as any).ships.battle.cost);
    $('#rcBattleTime').textContent = String((ECON as any).ships.battle.build);
    (document.getElementById('rcQty') as HTMLInputElement).value = '10';
    (document.getElementById('rcRange') as HTMLInputElement).value = '10';
    refreshPreview();
    renderSlots();
  });
  $('#recruitClose').addEventListener('click', () => {
    $('#recruit').style.display = 'none';
  });

  // pick type
  document.querySelectorAll('.ship-pill.pick').forEach((el) => {
    el.addEventListener('click', () => {
      pick = (el as HTMLElement).dataset.pick as ShipType;
      refreshPreview();
    });
  });

  // qty & range
  const qtyEl = document.getElementById('rcQty') as HTMLInputElement;
  const rngEl = document.getElementById('rcRange') as HTMLInputElement;
  qtyEl.addEventListener('input', () => {
    rngEl.value = qtyEl.value;
    refreshPreview();
  });
  rngEl.addEventListener('input', () => {
    qtyEl.value = rngEl.value;
    refreshPreview();
  });

  // max
  document.getElementById('rcMax')?.addEventListener('click', () => {
    const unit = (ECON as any).ships[pick];
    const maxAffordable = Math.max(1, Math.floor(state.money / unit.cost));
    qtyEl.value = String(maxAffordable);
    rngEl.value = String(maxAffordable);
    refreshPreview();
  });

  // confirm
  document.getElementById('rcConfirm')?.addEventListener('click', () => {
    const qty = Math.max(1, Math.floor(Number(qtyEl.value || '1')));
    const res = startRecruit(pick, qty);
    if (!res.ok) {
      toast(res.err || 'Unable to start recruitment');
      return;
    }
    renderSlots();
    refreshPreview();
    updateHud();
    toast('Recruitment started');
  });

  // run background loop for progress UI
  bootRecruitmentLoop();

  // keep UI fresh while open
  const obs = new MutationObserver(() => {
    if ($('#recruit').style.display !== 'none') renderSlots();
  });
  obs.observe($('#recruit'), { attributes: true, attributeFilter: ['style'] });

  // initial render if panel already open
  if ($('#recruit').style.display !== 'none') renderSlots();
}
