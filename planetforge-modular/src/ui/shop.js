import { ECON, ORBIT } from '../constants.js';
import { state, save } from '../gameState.js';
import { updateHud, toggleShop, toast } from './hud.js';
import { isPlacementValid } from '../systems/systems.js';

export function wireShop(){
  document.querySelector('#shopBtn').addEventListener('click',()=>toggleShop(true));
  document.querySelector('#closeShop').addEventListener('click',()=>toggleShop(false));
  document.querySelector('#startMoon').addEventListener('mousedown',()=>beginPlacing('moon'));
  document.querySelector('#startSat').addEventListener('mousedown',()=>beginPlacing('sat'));
  document.querySelector('#sellBasalt').addEventListener('click',()=>{
    const amt=Math.max(0, Math.floor(Number(document.querySelector('#sellBasaltAmt').value||0)));
    if(amt<=0) return; if(state.basalt<amt) return toast('Not enough basalt.');
    state.basalt-=amt; state.money += amt*ECON.sellUnit.basalt; updateHud(); save(state);
  });
  document.querySelector('#sellEnergy').addEventListener('click',()=>{
    const amt=Math.max(0, Math.floor(Number(document.querySelector('#sellEnergyAmt').value||0)));
    if(amt<=0) return; if(state.energy<amt) return toast('Not enough energy.');
    state.energy-=amt; state.money += amt*ECON.sellUnit.energy; updateHud(); save(state);
  });
}

export function beginPlacing(kind){
  const base=(kind==='moon'?ECON.moonCost:ECON.satCost);
  if(state.money < base){ toast('Need '+base+' money.'); return; }
  toggleShop(false); state.selected=null;
  state.placing = { kind, r: Math.max(ORBIT.min, 90), angle: 0 };
}
