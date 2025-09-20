import { ECON } from '../constants';
import { state, save } from '../state';
import { capacityOf } from '../systems/systems';
import { worldToScreen } from '../engine/camera';
import { updateHud, toast } from './hud';

export function showScrapMenu(sc:any){
  const m=document.querySelector('#scrapMenu') as HTMLElement;
  const p=worldToScreen(sc.x, sc.y);
  m.style.left=(p.x)+'px'; m.style.top=(p.y)+'px'; m.style.display='block';
  state.selectedScrapId=sc.id;
  (document.querySelector('#collectInfo') as HTMLElement).textContent = `Scrap ${sc.id} — remaining: basalt ${Math.floor(sc.b)}, energy ${Math.floor(sc.e)}`;
}
export function hideScrapMenu(){ const m=document.querySelector('#scrapMenu') as HTMLElement; m.style.display='none'; state.selectedScrapId=null; }

export function wireCollect(){
  (document.querySelector('#scrapCollectBtn') as HTMLElement).addEventListener('click',()=>{
    const sc = state.scraps.find((s:any)=>s.id===state.selectedScrapId); if(!sc){ hideScrapMenu(); return; }
    const dlg = document.querySelector('#collect') as HTMLElement; dlg.style.display='block';
    function recalc(){
      const d=Math.max(0, Math.floor(Number((document.querySelector('#colD') as HTMLInputElement).value||0)));
      const b=Math.max(0, Math.floor(Number((document.querySelector('#colB') as HTMLInputElement).value||0)));
      (document.querySelector('#cap') as HTMLElement).textContent = String(capacityOf(d,b));
      const dx=sc.x-state.planet.x, dy=sc.y-state.planet.y; const dist=Math.hypot(dx,dy);
      const speed=Math.min(d?ECON.ships.drone.speed:Infinity, b?ECON.ships.battle.speed:Infinity);
      const t=(dist/(speed||Infinity)); (document.querySelector('#eta') as HTMLElement).textContent = (speed===Infinity? '—' : (t.toFixed(1)+'s one-way'));
    }
    recalc(); (document.querySelector('#colD') as HTMLInputElement).value='0'; (document.querySelector('#colB') as HTMLInputElement).value='0';
    (document.querySelector('#colD') as HTMLInputElement).oninput = (document.querySelector('#colB') as HTMLInputElement).oninput = recalc;
  });
  (document.querySelector('#closeCollect') as HTMLElement).addEventListener('click',()=>{ (document.querySelector('#collect') as HTMLElement).style.display='none'; });
  (document.querySelector('#sendFleet') as HTMLElement).addEventListener('click',()=>{
    const sc = state.scraps.find((s:any)=>s.id===state.selectedScrapId); if(!sc){ (document.querySelector('#collect') as HTMLElement).style.display='none'; return; }
    const d = Math.max(0, Math.floor(Number((document.querySelector('#colD') as HTMLInputElement).value||0)));
    const b = Math.max(0, Math.floor(Number((document.querySelector('#colB') as HTMLInputElement).value||0)));
    if(d<=0 && b<=0) return toast('Choose ships to send.');
    if(d>state.ships.drone || b>state.ships.battle) return toast('Not enough ships available.');
    state.ships.drone -= d; state.ships.battle -= b;
    const dx = sc.x - state.planet.x, dy = sc.y - state.planet.y; const dist = Math.hypot(dx,dy);
    const speed = Math.min(d?ECON.ships.drone.speed:Infinity, b?ECON.ships.battle.speed:Infinity);
    const now = Date.now(); const tTravel = dist / speed * 1000;
    const mission = { id: Math.random().toString(36).slice(2), target:{x:sc.x,y:sc.y}, drones:d, battles:b, speed, dist, scrapId: sc.id, depart: now, arrive: now + tTravel, phase:'out', collected:{b:0,e:0}, toCollect:{b:0,e:0} };
    state.missions.push(mission);
    (document.querySelector('#collect') as HTMLElement).style.display='none'; hideScrapMenu(); updateHud(); save(state); toast('Fleet dispatched!');
  });
}
