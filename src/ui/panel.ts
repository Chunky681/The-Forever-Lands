import { ECON } from '../constants';
import { state } from '../state';
import { upgradeCost } from '../systems/systems';

export function updatePanel(){
  const $panel = document.querySelector('#detailPanel') as HTMLElement;
  const sel = state.selected;
  if(!sel){ $panel.style.display='none'; return; }
  $panel.style.display='block';
  if(sel.kind==='planet'){
    (document.querySelector('#panelTitle') as HTMLElement).textContent = 'Planet';
    (document.querySelector('#bLvl') as HTMLElement).textContent = String(state.planet.level);
    (document.querySelector('#bUpCost') as HTMLElement).textContent = (state.planet.level>=ECON.maxLevel? 'Max' : String(upgradeCost('planet', state.planet.level)));
    (document.querySelector('#prodLabel') as HTMLElement).textContent = 'Territory';
    (document.querySelector('#bProd') as HTMLElement).textContent = state.territory + 'u';
    (document.querySelector('#rowDemo') as HTMLElement).style.display = 'none';
    (document.querySelector('#rowProd') as HTMLElement).style.display = 'flex';
    return;
  }
  const list = (sel.kind==='moon'? state.moons : state.sats);
  const obj = list[sel.idx];
  (document.querySelector('#panelTitle') as HTMLElement).textContent = sel.kind==='moon' ? 'Moon' : 'Satellite';
  (document.querySelector('#bLvl') as HTMLElement).textContent = String(obj.lvl);
  (document.querySelector('#bUpCost') as HTMLElement).textContent = (obj.lvl>=ECON.maxLevel? 'Max' : String(upgradeCost(sel.kind, obj.lvl)));
  (document.querySelector('#prodLabel') as HTMLElement).textContent = 'Prod';
  (document.querySelector('#bProd') as HTMLElement).textContent = '+'+obj.lvl+'/s';
  (document.querySelector('#rowDemo') as HTMLElement).style.display = 'flex';
  (document.querySelector('#rowProd') as HTMLElement).style.display = 'flex';
}
