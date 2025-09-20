import { enqueueShip } from '../systems/systems.js';
import { toast } from './hud.js';

export function wireFleet(){
  document.querySelector('#fleetBtn').addEventListener('click',()=>{
    const el=document.querySelector('#fleet'); el.style.display = (el.style.display==='block')?'none':'block';
  });
  document.querySelector('#fleetClose').addEventListener('click',()=>{ document.querySelector('#fleet').style.display='none'; });
  document.querySelector('#qDrone').addEventListener('click',()=> enqueueShip('drone', toast, ()=>{}));
  document.querySelector('#qBattle').addEventListener('click',()=> enqueueShip('battle', toast, ()=>{}));
}
