import { state } from '../state';
import { worldToScreen } from '../engine/camera';

const EPS = 1e-3;

export function createScraps(N=40){
  if(state.scraps.length) return;
  let id=1; const range=4000;
  for(let i=0;i<N;i++){
    const x=(Math.random()*2-1)*range; const y=(Math.random()*2-1)*range;
    const total=120+Math.floor(Math.random()*360);
    const b=Math.floor(total*(0.3+Math.random()*0.5)); const e=total-b;
    state.scraps.push({id:id++, x,y, b,e});
  }
}

export function drawScraps(ctx:CanvasRenderingContext2D){
  ctx.save();
  for(const sc of state.scraps){
    // Skip depleted scraps; systems.ts already removes, this is extra safety.
    const rem = (Number(sc.b||0) + Number(sc.e||0));
    if (rem <= EPS) continue;

    const p=worldToScreen(sc.x, sc.y);
    ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2);
    ctx.fillStyle='#9ae6b4'; ctx.fill();
    ctx.lineWidth=1.5; ctx.strokeStyle='#68d391'; ctx.stroke();

    if(state.selectedScrapId===sc.id){
      ctx.beginPath(); ctx.arc(p.x,p.y,12,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,.6)'; ctx.lineWidth=2; ctx.stroke();
    }
  }
  ctx.restore();
}
