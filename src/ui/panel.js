import { ECON } from '../constants.js';
import { state, save } from '../gameState.js';
import { upgradeCost } from '../systems/systems.js';

export function updatePanel(){
  const $panel = document.querySelector('#detailPanel');
  const sel = state.selected;
  if(!sel){ $panel.style.display='none'; return; }
  $panel.style.display='block';
  if(sel.kind==='planet'){
    document.querySelector('#panelTitle').textContent = 'Planet';
    document.querySelector('#bLvl').textContent = state.planet.level;
    document.querySelector('#bUpCost').textContent = (state.planet.level>=ECON.maxLevel? 'Max' : upgradeCost('planet', state.planet.level));
    document.querySelector('#prodLabel').textContent = 'Territory';
    document.querySelector('#bProd').textContent = state.territory + 'u';
    document.querySelector('#rowDemo').style.display = 'none';
    document.querySelector('#rowProd').style.display = 'flex';
    return;
  }
  const list = (sel.kind==='moon'? state.moons : state.sats);
  const obj = list[sel.idx];
  document.querySelector('#panelTitle').textContent = sel.kind==='moon' ? 'Moon' : 'Satellite';
  document.querySelector('#bLvl').textContent = obj.lvl;
  document.querySelector('#bUpCost').textContent = (obj.lvl>=ECON.maxLevel? 'Max' : upgradeCost(sel.kind, obj.lvl));
  document.querySelector('#prodLabel').textContent = 'Prod';
  document.querySelector('#bProd').textContent = '+'+obj.lvl+'/s';
  document.querySelector('#rowDemo').style.display = 'flex';
  document.querySelector('#rowProd').style.display = 'flex';
}
