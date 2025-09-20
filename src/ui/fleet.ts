import { enqueueShip } from '../systems/systems';
import { toast } from './hud';

export function wireFleet(){
  (document.querySelector('#fleetBtn') as HTMLElement).addEventListener('click',()=>{
    const el=document.querySelector('#fleet') as HTMLElement; el.style.display = (el.style.display==='block')?'none':'block';
  });
  (document.querySelector('#fleetClose') as HTMLElement).addEventListener('click',()=>{ (document.querySelector('#fleet') as HTMLElement).style.display='none'; });
  (document.querySelector('#qDrone') as HTMLElement).addEventListener('click',()=> enqueueShip('drone', toast, ()=>{}));
  (document.querySelector('#qBattle') as HTMLElement).addEventListener('click',()=> enqueueShip('battle', toast, ()=>{}));
}
