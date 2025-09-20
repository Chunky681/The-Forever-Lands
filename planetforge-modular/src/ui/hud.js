import { ECON } from '../constants.js';
import { state, save } from '../gameState.js';

export function updateHud(){
  document.querySelector('#money').textContent = Math.floor(state.money);
  document.querySelector('#basalt').textContent = Math.floor(state.basalt);
  document.querySelector('#energy').textContent = Math.floor(state.energy);
  const moonRate = state.moons.reduce((s,m)=>s+m.lvl,0); const satRate = state.sats.reduce((s,m)=>s+m.lvl,0);
  document.querySelector('#moons').textContent = state.moons.length; document.querySelector('#bRate').textContent = moonRate;
  document.querySelector('#sats').textContent = state.sats.length; document.querySelector('#eRate').textContent = satRate;
  document.querySelector('#pLv').textContent = state.planet.level; document.querySelector('#terr').textContent = Math.floor(state.territory);
  document.querySelector('#moonCost').textContent = ECON.moonCost; document.querySelector('#satCost').textContent = ECON.satCost;
  document.querySelector('#drCount').textContent = state.ships.drone; document.querySelector('#bsCount').textContent = state.ships.battle; document.querySelector('#msCount').textContent = state.missions.length;
  document.querySelector('#queueLen').textContent = state.queue.length;
  document.body.style.cursor = state.placing ? 'crosshair' : 'default';
}
export function toast(msg){ const t=document.querySelector('#toast'); t.textContent = msg; t.style.display='block'; clearTimeout(toast._t); toast._t=setTimeout(()=>{ t.style.display='none'; },1600); }
export function toggleShop(force){ const $shop=document.querySelector('#shop'); if(typeof force==='boolean') $shop.style.display = force? 'block':'none'; else $shop.style.display = ($shop.style.display==='block'?'none':'block'); }
