import { SIZES } from '../constants';
import { state } from '../state';

export function pickScrap(wx:number, wy:number){
  for(const sc of state.scraps){ if(Math.hypot(wx-sc.x, wy-sc.y) < 12/state.cam.zoom) return sc; }
  return null;
}
export function pickBuilding(wx:number, wy:number){
  for(let i=0;i<state.moons.length;i++){
    const m=state.moons[i]; const x=state.planet.x + Math.cos(m.angle)*m.r; const y=state.planet.y + Math.sin(m.angle)*m.r;
    if(Math.hypot(wx-x, wy-y) < SIZES.moon) return {kind:'moon', idx:i};
  }
  for(let i=0;i<state.sats.length;i++){
    const s=state.sats[i]; const x=state.planet.x + Math.cos(s.angle)*s.r; const y=state.planet.y + Math.sin(s.angle)*s.r;
    if(Math.hypot(wx-x, wy-y) < SIZES.sat) return {kind:'sat', idx:i};
  }
  return null;
}
