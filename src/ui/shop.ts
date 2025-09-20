import { ECON, ORBIT } from '../constants';
import { state, save } from '../state';
import { updateHud, toggleShop, toast } from './hud';
import { isPlacementValid } from '../systems/systems';

export function wireShop(){
  (document.querySelector('#shopBtn') as HTMLElement).addEventListener('click',()=>toggleShop(true));
  (document.querySelector('#closeShop') as HTMLElement).addEventListener('click',()=>toggleShop(false));
  (document.querySelector('#startMoon') as HTMLElement).addEventListener('mousedown',()=>beginPlacing('moon'));
  (document.querySelector('#startSat') as HTMLElement).addEventListener('mousedown',()=>beginPlacing('sat'));
  (document.querySelector('#sellBasalt') as HTMLElement).addEventListener('click',()=>{
    const amt=Math.max(0, Math.floor(Number((document.querySelector('#sellBasaltAmt') as HTMLInputElement).value||0)));
    if(amt<=0) return; if(state.basalt<amt) return toast('Not enough basalt.');
    state.basalt-=amt; state.money += amt*ECON.sellUnit.basalt; updateHud(); save(state);
  });
  (document.querySelector('#sellEnergy') as HTMLElement).addEventListener('click',()=>{
    const amt=Math.max(0, Math.floor(Number((document.querySelector('#sellEnergyAmt') as HTMLInputElement).value||0)));
    if(amt<=0) return; if(state.energy<amt) return toast('Not enough energy.');
    state.energy-=amt; state.money += amt*ECON.sellUnit.energy; updateHud(); save(state);
  });
}

export function beginPlacing(kind:'moon'|'sat'){
  const base=(kind==='moon'?ECON.moonCost:ECON.satCost);
  if(state.money < base){ toast('Need '+base+' money.'); return; }
  toggleShop(false); state.selected=null;
  state.placing = { kind, r: Math.max(ORBIT.min, 90), angle: 0 };
}
