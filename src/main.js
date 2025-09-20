import { ECON, ORBIT } from './constants.js';
import { state, save } from './gameState.js';
import { cvs, ctx, cam, screenToWorld, worldToScreen, resize } from './engine/camera.js';
import { createStars, drawStars } from './render/stars.js';
import { createScraps, drawScraps } from './render/scraps.js';
import { drawBodies, drawMissions } from './render/draw.js';
import { accrue, orbitSpeed, isPlacementValid, upgradeCost } from './systems/systems.js';
import { pickScrap, pickBuilding } from './systems/pick.js';
import { updateHud, toggleShop, toast } from './ui/hud.js';
import { wireShop, beginPlacing } from './ui/shop.js';
import { wireFleet } from './ui/fleet.js';
import { wireCollect, showScrapMenu, hideScrapMenu } from './ui/collect.js';
import { updatePanel } from './ui/panel.js';

resize(); createStars(); createScraps(); updateHud(); wireShop(); wireFleet(); wireCollect();
setInterval(()=>updateHud(), 1000); // HUD tick
setInterval(()=>save(state), 4000); // autosave

// Input
let panning=false, last={x:0,y:0};
cvs.addEventListener('contextmenu', e => e.preventDefault());

cvs.addEventListener('mousedown', (e)=>{
  if(e.button===2){
    if(state.placing){ state.placing=null; updateHud(); toast('Placement canceled'); return; }
    panning=true; last.x=e.clientX; last.y=e.clientY; hideScrapMenu(); return;
  }
  if(e.button===0){
    if(state.placing){
      if(isPlacementValid(state.placing.r)){
        const k=state.placing.kind; const base=(k==='moon'?ECON.moonCost:ECON.satCost);
        if(state.money<base){ toast('Not enough money.'); return; }
        state.money-=base; const obj={r:state.placing.r, angle:state.placing.angle, speed:orbitSpeed(state.placing.r), lvl:1, spent:base};
        (k==='moon'?state.moons:state.sats).push(obj); state.placing=null; updateHud(); save(state);
      } else toast('Invalid orbit — overlaps or outside territory.');
      return;
    }
    const world = screenToWorld(e.clientX, e.clientY);
    const sc = pickScrap(world.x, world.y); if(sc){ showScrapMenu(sc); return; }
    hideScrapMenu();
    const hit = pickBuilding(world.x, world.y); if(hit){ state.selected = hit; updatePanel(); return; }
    const dx = world.x - state.planet.x, dy = world.y - state.planet.y;
    if(Math.hypot(dx,dy) <= state.planet.radius + 8/cam.zoom){ state.selected = {kind:'planet'}; updatePanel(); return; }
    state.selected=null; updatePanel();
  }
});
cvs.addEventListener('mousemove', (e)=>{
  if(panning){ const dx=(e.clientX-last.x)/cam.zoom, dy=(e.clientY-last.y)/cam.zoom; cam.x-=dx; cam.y-=dy; last.x=e.clientX; last.y=e.clientY; return; }
  if(state.placing){ const w=screenToWorld(e.clientX,e.clientY); const dx=w.x-state.planet.x, dy=w.y-state.planet.y; state.placing.r=Math.hypot(dx,dy); state.placing.angle=Math.atan2(dy,dx); }
});
cvs.addEventListener('mouseup', (e)=>{ if(e.button===2) panning=false; });
cvs.addEventListener('wheel', (e)=>{ const factor=Math.exp(-e.deltaY*0.001); const mx=e.clientX, my=e.clientY; const before=screenToWorld(mx,my); cam.zoom=Math.min(3, Math.max(0.25, cam.zoom*factor)); const after=screenToWorld(mx,my); cam.x += before.x-after.x; cam.y += before.y-after.y; }, { passive:true });
addEventListener('keydown', (e)=>{ if(e.key.toLowerCase()==='h') toggleShop(); });

// Panel buttons
document.querySelector('#bClose').addEventListener('click',()=>{ state.selected=null; updatePanel(); });
document.querySelector('#bUpgrade').addEventListener('click',()=>{
  const sel=state.selected; if(!sel) return;
  if(sel.kind==='planet'){
    if(state.planet.level>=ECON.maxLevel) return toast('Planet is max level.');
    const cost=upgradeCost('planet', state.planet.level); if(state.money<cost) return toast('Need '+cost+' money.');
    state.money-=cost; state.planet.level++; state.territory = ECON.territory.base + (state.planet.level-1)*ECON.territory.perLevel; updateHud(); updatePanel(); save(state); return;
  }
  const list=(sel.kind==='moon'?state.moons:state.sats); const obj=list[sel.idx];
  if(obj.lvl>=ECON.maxLevel) return toast('Max level.'); const cost=upgradeCost(sel.kind, obj.lvl);
  if(state.money<cost) return toast('Need '+cost+' money.'); state.money-=cost; obj.lvl++; obj.spent+=cost; updatePanel(); updateHud(); save(state);
});
document.querySelector('#bDemo').addEventListener('click',()=>{
  const sel=state.selected; if(!sel || sel.kind==='planet') return;
  const list=(sel.kind==='moon'?state.moons:state.sats); const obj=list[sel.idx];
  const refund=Math.floor(obj.spent*0.75); state.money+=refund; list.splice(sel.idx,1);
  state.selected=null; updatePanel(); updateHud(); save(state); toast('Demolished. Refunded '+refund+'.');
});

// Game loop
function frame(){
  accrue(updateHud);
  const now=Date.now(); const dt=(now - state.lastFrame)/1000; state.lastFrame=now;
  for(const m of state.moons){ m.angle += m.speed * dt; }
  for(const s of state.sats){ s.angle += s.speed * dt; }

  ctx.clearRect(0,0,innerWidth,innerHeight);
  drawStars(ctx, cam, now);
  const ps = drawBodies(ctx, cam);
  drawScraps(ctx);
  drawMissions(ctx, now, ps, worldToScreen);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Init stars if none
if(!state.stars.length) createStars();
