// src/ui/collect.ts
import { ECON } from '../constants';
import { state, save } from '../state';
import { capacityOf } from '../systems/systems';
import { worldToScreen } from '../engine/camera';
import { updateHud, toast } from './hud';

export function showScrapMenu(sc:any){
  const m = document.querySelector('#scrapMenu') as HTMLElement;
  const p = worldToScreen(sc.x, sc.y);
  m.style.left = p.x + 'px';
  m.style.top  = p.y + 'px';
  m.style.display = 'block';
  state.selectedScrapId = sc.id;
  (document.querySelector('#collectInfo') as HTMLElement).textContent =
    `Scrap ${sc.id} — remaining: basalt ${Math.floor(sc.b)}, energy ${Math.floor(sc.e)}`;
}
export function hideScrapMenu(){
  (document.querySelector('#scrapMenu') as HTMLElement).style.display = 'none';
}

type ShipType = 'drone'|'battle';
type Slot = { type: ShipType, qty: number } | null;

const SLOT_COUNT = 8;
let slots: Slot[] = new Array(SLOT_COUNT).fill(null);

// -------- helpers

function sumSelected(){
  let d=0,b=0;
  for(const s of slots){
    if(!s) continue;
    if(s.type==='drone') d += s.qty;
    else b += s.qty;
  }
  return { d, b };
}
function remaining(type:ShipType){
  const { d, b } = sumSelected();
  return type==='drone' ? Math.max(0, state.ships.drone - d)
                        : Math.max(0, state.ships.battle - b);
}
function canUse(type:ShipType, want:number){
  return remaining(type) >= want;
}

function renderSlots(){
  const grid = document.querySelector('#slots') as HTMLElement;
  if(!grid) return;
  grid.innerHTML = '';
  slots.forEach((s, i)=>{
    const el = document.createElement('div');
    el.className = 'slot' + (s ? ' filled' : '');
    if(s?.type==='battle') el.classList.add('battle');
    el.dataset.index = String(i);
    el.innerHTML = s
      ? `<div class="icon"></div><strong>${s.type==='drone'?'Drone':'Battleship'}</strong><span class="badge">x${s.qty}</span>`
      : '<span>Drop unit / Click</span>';

    // DnD add type then open editor for quantity
    el.addEventListener('dragover', e=> e.preventDefault());
    el.addEventListener('drop', e=>{
      e.preventDefault();
      const type = (e.dataTransfer?.getData('text/plain')||'') as ShipType;
      if(type!=='drone' && type!=='battle') return;
      openEditor(i, type, s?.qty ?? 0);
    });

    // Click opens editor (choose type if empty -> default drone)
    el.addEventListener('click', ()=>{
      const type: ShipType = s?.type ?? 'drone';
      openEditor(i, type, s?.qty ?? 0);
    });

    // Right-click clears
    el.addEventListener('contextmenu', (e)=>{
      e.preventDefault();
      slots[i] = null;
      renderSlots(); updateSummary();
    });

    grid.appendChild(el);
  });
}

function wireInventoryPills(){
  const invD = document.querySelector('[data-type="drone"]') as HTMLElement;
  const invB = document.querySelector('[data-type="battle"]') as HTMLElement;
  invD?.addEventListener('dragstart', e=> e.dataTransfer?.setData('text/plain','drone'));
  invB?.addEventListener('dragstart', e=> e.dataTransfer?.setData('text/plain','battle'));
}
function updateInventoryLabels(){
  (document.querySelector('#invD') as HTMLElement).textContent = String(state.ships.drone);
  (document.querySelector('#invB') as HTMLElement).textContent = String(state.ships.battle);
}

function updateSummary(){
  const sel = sumSelected();
  (document.querySelector('#selD') as HTMLElement).textContent = String(sel.d);
  (document.querySelector('#selB') as HTMLElement).textContent = String(sel.b);
  (document.querySelector('#cap') as HTMLElement).textContent = String(capacityOf(sel.d, sel.b));

  const sc = state.scraps.find((s:any)=>s.id===state.selectedScrapId);
  const etaEl = document.querySelector('#eta') as HTMLElement;
  if(!sc){ etaEl.textContent = '—'; return; }

  // ETA from slowest chosen ship type
  let speed = Infinity;
  if(sel.d>0) speed = Math.min(speed, ECON.ships.drone.speed);
  if(sel.b>0) speed = Math.min(speed, ECON.ships.battle.speed);
  if(speed===Infinity){ etaEl.textContent = '—'; return; }

  const dx=sc.x-state.planet.x, dy=sc.y-state.planet.y;
  const dist=Math.hypot(dx,dy);
  const t=(dist/speed);
  etaEl.textContent = t.toFixed(1)+'s one-way';
}

function autofill(){
  // fill with battleships first, then drones; spread evenly
  slots = new Array(SLOT_COUNT).fill(null);
  let b = state.ships.battle, d = state.ships.drone;
  let i=0;
  while(b>0 && i<SLOT_COUNT){ const take=Math.min(b, Math.ceil(b/(SLOT_COUNT-i))); slots[i++]={type:'battle', qty:take}; b-=take; }
  while(d>0 && i<SLOT_COUNT){ const take=Math.min(d, Math.ceil(d/(SLOT_COUNT-i))); slots[i++]={type:'drone', qty:take}; d-=take; }
  renderSlots(); updateSummary();
}
function clearAll(){ slots = new Array(SLOT_COUNT).fill(null); renderSlots(); updateSummary(); }

// ------- slot editor
let editIndex: number | null = null;
function openEditor(index:number, type:ShipType, currentQty:number){
  editIndex = index;
  const editor = document.querySelector('#slotEditor') as HTMLElement;
  const seType = document.querySelector('#seType') as HTMLElement;
  const seAvail = document.querySelector('#seAvail') as HTMLElement;
  const seQty = document.querySelector('#seQty') as HTMLInputElement;
  const seRange = document.querySelector('#seRange') as HTMLInputElement;

  seType.textContent = (type==='drone' ? 'Drone' : 'Battleship');

  // max = remaining + current (so you can edit an existing slot upward within stock)
  const max = remaining(type) + currentQty;
  seAvail.textContent = String(max);
  seQty.value = String(Math.min(currentQty, max));
  seQty.min = '0'; seQty.max = String(max);
  seRange.min = '0'; seRange.max = String(max); seRange.value = seQty.value;

  // sync
  seQty.oninput = ()=>{ const v = clampInt(seQty.value, 0, max); seQty.value=String(v); seRange.value=String(v); };
  seRange.oninput = ()=>{ seQty.value = seRange.value; };

  // buttons
  (document.querySelector('#seMax') as HTMLElement).onclick = ()=>{ seQty.value=String(max); seRange.value=String(max); };
  (document.querySelector('#seCancel') as HTMLElement).onclick = ()=>{ editor.style.display='none'; };

  (document.querySelector('#seApply') as HTMLElement).onclick = ()=>{
    const qty = clampInt(seQty.value, 0, max);
    if(qty<=0){ slots[index]=null; } else { slots[index] = { type, qty }; }
    editor.style.display='none';
    renderSlots(); updateSummary();
  };

  // show
  editor.style.display='block';
}
function clampInt(v:string|number, min:number, max:number){
  let n = typeof v==='number' ? v : parseInt(v||'0',10);
  if(Number.isNaN(n)) n=0;
  return Math.max(min, Math.min(max, n));
}

function openCollectDialog(){
  const sc = state.scraps.find((s:any)=>s.id===state.selectedScrapId);
  if(!sc){ hideScrapMenu(); return; }
  hideScrapMenu();
  (document.querySelector('#collect') as HTMLElement).style.display='block';
  updateInventoryLabels();
  clearAll();
  renderSlots();
  wireInventoryPills();

  (document.querySelector('#autoFill') as HTMLElement).onclick = ()=>autofill();
  (document.querySelector('#clearSlots') as HTMLElement).onclick = ()=>clearAll();
  updateSummary();
}

export function wireCollect(){
  // Radial action → open dialog
  document.addEventListener('click', (e)=>{
    const btn = (e.target as HTMLElement)?.closest('#scrapCollectBtn');
    if(btn){ e.preventDefault(); openCollectDialog(); }
  });

  // Close
  (document.querySelector('#closeCollect') as HTMLElement)?.addEventListener('click',()=>{
    (document.querySelector('#collect') as HTMLElement).style.display='none';
    (document.querySelector('#slotEditor') as HTMLElement).style.display='none';
  });

  // Send
  (document.querySelector('#sendFleet') as HTMLElement)?.addEventListener('click',()=>{
    const sc = state.scraps.find((s:any)=>s.id===state.selectedScrapId);
    if(!sc){ (document.querySelector('#collect') as HTMLElement).style.display='none'; return; }

    const { d, b } = sumSelected();
    if(d<=0 && b<=0) return toast('Choose ships to send.');
    if(d>state.ships.drone || b>state.ships.battle) return toast('Not enough ships available.');

    // Deduct and create mission
    state.ships.drone -= d; state.ships.battle -= b;

    const dx=sc.x-state.planet.x, dy=sc.y-state.planet.y; const dist=Math.hypot(dx,dy);
    let speed = Infinity; if(d>0) speed=Math.min(speed, ECON.ships.drone.speed); if(b>0) speed=Math.min(speed, ECON.ships.battle.speed);
    const now = Date.now(); const tTravel = dist / speed * 1000;

    state.missions.push({
      id: Math.random().toString(36).slice(2),
      target:{x:sc.x,y:sc.y},
      drones:d, battles:b, speed, dist, scrapId: sc.id,
      depart: now, arrive: now + tTravel, phase:'out',
      collected:{b:0,e:0}, toCollect:{b:0,e:0}
    });

    (document.querySelector('#collect') as HTMLElement).style.display='none';
    (document.querySelector('#slotEditor') as HTMLElement).style.display='none';
    updateHud(); save(state); toast('Fleet dispatched!');
  });
}
