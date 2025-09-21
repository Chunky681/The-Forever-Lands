import { SIZES } from '../constants';
import { state } from '../state';
import { worldToScreen } from '../engine/camera';
import { isPlacementValid } from '../systems/systems';

export function drawPlacementPreview(ctx: CanvasRenderingContext2D, cam: any) {
  const pl = state.placing;
  if (!pl) return;
  const valid = isPlacementValid(pl.r);
  const ps = worldToScreen(state.planet.x, state.planet.y);
  // orbit ring
  ctx.save();
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = valid ? 'rgba(80,255,140,.85)' : 'rgba(255,90,90,.9)';
  ctx.beginPath();
  ctx.arc(ps.x, ps.y, pl.r * cam.zoom, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  // ghost body
  const gx = state.planet.x + Math.cos(pl.angle) * pl.r;
  const gy = state.planet.y + Math.sin(pl.angle) * pl.r;
  const gp = worldToScreen(gx, gy);
  const gr = (pl.kind === 'moon' ? SIZES.moon : SIZES.sat) * cam.zoom;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(gp.x, gp.y, gr, 0, Math.PI * 2);
  ctx.fillStyle = valid ? '#9fe3b1' : '#ff9aa2';
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawMissions(ctx:CanvasRenderingContext2D, now:number, ps:{x:number,y:number}, tpFromWorld:(x:number,y:number)=>{x:number,y:number}){
  if(!state.missions.length) return;
  ctx.lineWidth=1; ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(173,216,230,.6)';
  for(const m of state.missions){ const tp = tpFromWorld(m.target.x, m.target.y); ctx.beginPath(); ctx.moveTo(ps.x, ps.y); ctx.lineTo(tp.x, tp.y); ctx.stroke(); }
  ctx.setLineDash([]);
  for(const m of state.missions){
    const tp = tpFromWorld(m.target.x, m.target.y);
    let x=ps.x, y=ps.y;
    if(m.phase==='out'){
      const t = Math.min(1, (now - m.depart) / (m.arrive - m.depart)); x = ps.x + (tp.x - ps.x)*t; y = ps.y + (tp.y - ps.y)*t;
    } else if(m.phase==='collect'){
      x=tp.x; y=tp.y; const r = 10 + 2*Math.sin(now*0.006);
      ctx.beginPath(); ctx.arc(tp.x, tp.y, r, 0, Math.PI*2); ctx.strokeStyle='rgba(122,255,150,.6)'; ctx.lineWidth=2; ctx.stroke();
    } else if(m.phase==='back'){
      const t = Math.min(1, (now - m.leave) / (m.return - m.leave)); x = tp.x + (ps.x - tp.x)*t; y = tp.y + (ps.y - tp.y)*t;
    } else continue;
    ctx.save(); ctx.translate(x,y);
    let ang = 0; if(m.phase==='out'){ ang = Math.atan2(tp.y - ps.y, tp.x - ps.x); } else if(m.phase==='back'){ ang = Math.atan2(ps.y - tp.y, ps.x - tp.x); }
    ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(-6,4); ctx.lineTo(-6,-4); ctx.closePath(); ctx.fillStyle='rgba(173,216,230,.9)'; ctx.fill(); ctx.restore();
  }
}

export function drawBodies(ctx:CanvasRenderingContext2D, cam:any){
  const ps = worldToScreen(state.planet.x, state.planet.y);
  ctx.beginPath(); ctx.arc(ps.x, ps.y, state.territory*cam.zoom, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(80,200,255,0.08)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(80,200,255,.6)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(ps.x, ps.y, state.planet.radius*cam.zoom, 0, Math.PI*2);
  const grad = ctx.createRadialGradient(ps.x-6, ps.y-6, 6, ps.x, ps.y, state.planet.radius*cam.zoom);
  grad.addColorStop(0,'#4fd1c5'); grad.addColorStop(1,'#2563eb'); ctx.fillStyle = grad; ctx.fill();
  ctx.lineWidth = (state.selected && state.selected.kind==='planet') ? 4 : 2;
  ctx.strokeStyle = (state.selected && state.selected.kind==='planet') ? '#3cf' : 'rgba(0,0,0,.35)'; ctx.stroke();

  if(state.selected && state.selected.kind!=='planet'){
    const sel = state.selected; const list = (sel.kind==='moon'? state.moons : state.sats); const obj = list[sel.idx];
    if(obj){ ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(ps.x, ps.y, obj.r*cam.zoom, 0, Math.PI*2); ctx.stroke(); }
  }

  for(let i=0;i<state.moons.length;i++){
    const m=state.moons[i]; const x=state.planet.x + Math.cos(m.angle)*m.r; const y=state.planet.y + Math.sin(m.angle)*m.r; const p=worldToScreen(x,y);
    ctx.beginPath(); ctx.arc(p.x,p.y,SIZES.moon*cam.zoom,0,Math.PI*2); ctx.fillStyle='#bdbdbd'; ctx.fill();
    ctx.strokeStyle=(state.selected&&state.selected.kind==='moon'&&state.selected.idx===i)?'#3cf':'#8a8a8a';
    ctx.lineWidth=(state.selected&&state.selected.kind==='moon'&&state.selected.idx===i)?3:1.5; ctx.stroke();
  }
  for(let i=0;i<state.sats.length;i++){
    const s=state.sats[i]; const x=state.planet.x + Math.cos(s.angle)*s.r; const y=state.planet.y + Math.sin(s.angle)*s.r; const p=worldToScreen(x,y);
    ctx.beginPath(); ctx.arc(p.x,p.y,SIZES.sat*cam.zoom,0,Math.PI*2); ctx.fillStyle='#ffd54f'; ctx.fill();
    ctx.strokeStyle=(state.selected&&state.selected.kind==='sat'&&state.selected.idx===i)?'#3cf':'#c9a227';
    ctx.lineWidth=(state.selected&&state.selected.kind==='sat'&&state.selected.idx===i)?3:1.5; ctx.stroke();
  }
  return ps;
}
