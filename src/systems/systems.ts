import { ECON, ORBIT } from '../constants';
import { state, save } from '../state';

export function orbitSpeed(r:number){ return ORBIT.speedBase * (100 / Math.max(50, r)); }
export function upgradeCost(kind:'moon'|'sat'|'planet', lvl:number){
  if(kind==='moon') return Math.floor(ECON.upgrade.moonBase * Math.pow(ECON.upgrade.mult, Math.max(0,lvl-1)));
  if(kind==='sat')  return Math.floor(ECON.upgrade.satBase  * Math.pow(ECON.upgrade.mult, Math.max(0,lvl-1)));
  if(kind==='planet') return Math.floor(ECON.upgrade.planetBase * Math.pow(ECON.upgrade.planetMult, Math.max(0,lvl-1)));
  return 999999;
}
export function capacityOf(d:number,b:number){ return d*ECON.ships.drone.cap + b*ECON.ships.battle.cap; }

export function accrue(updateHud:()=>void){
  const now = Date.now();
  const dt = (now - state.lastProd)/1000; if (dt <= 0) return;
  state.lastProd = now;
  const moonRate = state.moons.reduce((s:number,m:any)=>s+m.lvl,0);
  const satRate  = state.sats.reduce((s:number,m:any)=>s+m.lvl,0);
  state.basalt += moonRate * dt;
  state.energy += satRate * dt;
  state.basalt = Math.round(state.basalt * 1000)/1000;
  state.energy = Math.round(state.energy * 1000)/1000;

  let changed=false;
  while(state.queue.length && state.queue[0].doneAt <= now){
    const it = state.queue.shift();
    if(it.type==='drone') state.ships.drone++; else state.ships.battle++;
    changed=true;
  }
  if(changed) updateHud();

  for(const m of state.missions){
    if(m.phase==='out' && now >= m.arrive){
      m.phase='collect'; m.collectEnd = m.arrive + ECON.collectionSeconds*1000; m.toCollect = {b:0,e:0};
      const sc = state.scraps.find((s:any)=>s.id===m.scrapId);
      if(sc){
        const capacity = capacityOf(m.drones, m.battles);
        const avail = Math.max(0, sc.b + sc.e);
        const take=Math.min(capacity, avail);
        const takeB=Math.min(sc.b, Math.round(take*(sc.b/(sc.b+sc.e||1))));
        const takeE=Math.min(sc.e, take-takeB);
        m.toCollect={b:takeB,e:takeE};
        m.collected=m.collected||{b:0,e:0};
        m._rateB=takeB/ECON.collectionSeconds; m._rateE=takeE/ECON.collectionSeconds;
      } else { m.collectEnd=now; m._rateB=m._rateE=0; }
    }
    if(m.phase==='collect'){
      const sc = state.scraps.find((s:any)=>s.id===m.scrapId);
      const stepB=Math.min(m._rateB*dt, Math.max(0,m.toCollect.b-(m.collected?.b||0)));
      const stepE=Math.min(m._rateE*dt, Math.max(0,m.toCollect.e-(m.collected?.e||0)));
      if(sc){
        sc.b=Math.max(0, sc.b-stepB); sc.e=Math.max(0, sc.e-stepE);
        if(sc.b<=0 && sc.e<=0){ state.scraps = state.scraps.filter((s:any)=>s.id!==sc.id); }
      }
      m.collected.b=(m.collected.b||0)+stepB; m.collected.e=(m.collected.e||0)+stepE;
      if(now>=m.collectEnd){ m.phase='back'; m.leave=m.collectEnd; m.return=m.leave + (m.arrive - m.depart); }
    }
    if(m.phase==='back' && now>=m.return) m.phase='done';
  }
  if(state.missions.some((m:any)=>m.phase==='done')){
    for(const m of state.missions.filter((m:any)=>m.phase!=='done')){}
    for(const m of state.missions.filter((m:any)=>m.phase==='done')){
      state.basalt += Math.round(m.collected?.b||0);
      state.energy += Math.round(m.collected?.e||0);
      state.ships.drone += m.drones; state.ships.battle += m.battles;
    }
    state.missions = state.missions.filter((m:any)=>m.phase!=='done'); updateHud();
  }
}

export function enqueueShip(type:'drone'|'battle', toast:(m:string)=>void, updateHud:()=>void){
  const cfg = ECON.ships[type];
  if(state.money < cfg.cost) return toast('Need '+cfg.cost+' money for '+type+'.');
  state.money -= cfg.cost;
  const now = Date.now(); const lastEnd = state.queue.length ? state.queue[state.queue.length-1].doneAt : now; const doneAt = Math.max(now, lastEnd) + cfg.build*1000; state.queue.push({type, doneAt});
  updateHud(); save(state);
}

export function isPlacementValid(r:number){
  if(r < ORBIT.min || r > state.territory - 10) return false;
  const near=(a:number,b:number)=> Math.abs(a-b) < ORBIT.gap;
  for(const m of state.moons){ if(near(r, m.r)) return false; }
  for(const s of state.sats){ if(near(r, s.r)) return false; }
  return true;
}
