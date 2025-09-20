import { STAR_COLORS } from '../constants';
import { state } from '../state';
import { worldToScreen } from '../engine/camera';

export function createStars(N=900){
  state.stars=[]; const range=6000;
  for(let i=0;i<N;i++){
    const x=(Math.random()*2-1)*range; const y=(Math.random()*2-1)*range;
    const r=Math.random()*1.2+0.3; const color=STAR_COLORS[(Math.random()*STAR_COLORS.length)|0];
    const phase=Math.random()*Math.PI*2;
    state.stars.push({x,y,r,color,phase});
  }
}
export function drawStars(ctx:CanvasRenderingContext2D, cam:any, time:number){
  const left=cam.x, top=cam.y, right=cam.x+innerWidth/cam.zoom, bottom=cam.y+innerHeight/cam.zoom;
  for(const s of state.stars){
    if(s.x<left-100||s.x>right+100||s.y<top-100||s.y>bottom+100) continue;
    const p=worldToScreen(s.x,s.y); const tw=0.7+0.3*Math.sin(time*0.001+s.phase);
    ctx.globalAlpha=0.6+0.4*tw; ctx.fillStyle=s.color; ctx.beginPath(); ctx.arc(p.x,p.y,s.r*cam.zoom,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha=1;
}
