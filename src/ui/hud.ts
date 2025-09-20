import { ECON } from '../constants';
import { state } from '../state';

export function updateHud(){
  (document.querySelector('#money') as HTMLElement).textContent = String(Math.floor(state.money));
  (document.querySelector('#basalt') as HTMLElement).textContent = String(Math.floor(state.basalt));
  (document.querySelector('#energy') as HTMLElement).textContent = String(Math.floor(state.energy));
  const moonRate = state.moons.reduce((s:number,m:any)=>s+m.lvl,0); const satRate = state.sats.reduce((s:number,m:any)=>s+m.lvl,0);
  (document.querySelector('#moons') as HTMLElement).textContent = String(state.moons.length); (document.querySelector('#bRate') as HTMLElement).textContent = String(moonRate);
  (document.querySelector('#sats') as HTMLElement).textContent = String(state.sats.length); (document.querySelector('#eRate') as HTMLElement).textContent = String(satRate);
  (document.querySelector('#pLv') as HTMLElement).textContent = String(state.planet.level); (document.querySelector('#terr') as HTMLElement).textContent = String(Math.floor(state.territory));
  (document.querySelector('#moonCost') as HTMLElement).textContent = String(ECON.moonCost); (document.querySelector('#satCost') as HTMLElement).textContent = String(ECON.satCost);
  (document.querySelector('#drCount') as HTMLElement).textContent = String(state.ships.drone); (document.querySelector('#bsCount') as HTMLElement).textContent = String(state.ships.battle); (document.querySelector('#msCount') as HTMLElement).textContent = String(state.missions.length);
  (document.querySelector('#queueLen') as HTMLElement).textContent = String(state.queue.length);
  document.body.style.cursor = state.placing ? 'crosshair' : 'default';
}
export function toast(msg:string){ const t=document.querySelector('#toast') as HTMLElement; t.textContent = msg; t.style.display='block'; clearTimeout((toast as any)._t); (toast as any)._t=setTimeout(()=>{ t.style.display='none'; },1600); }
export function toggleShop(force?:boolean){ const $shop=document.querySelector('#shop') as HTMLElement; if(typeof force==='boolean') $shop.style.display = force? 'block':'none'; else $shop.style.display = ($shop.style.display==='block'?'none':'block'); }
