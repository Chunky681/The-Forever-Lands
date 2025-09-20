import { state } from '../gameState.js';

export const cvs = document.getElementById('game');
export const ctx = cvs.getContext('2d');
export const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

export function resize(){
  cvs.width = Math.floor(innerWidth * DPR);
  cvs.height = Math.floor(innerHeight * DPR);
  cvs.style.width = innerWidth + 'px';
  cvs.style.height = innerHeight + 'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
addEventListener('resize', resize);

export const cam = state.cam;
export const screenToWorld = (sx, sy) => ({ x: sx/cam.zoom + cam.x, y: sy/cam.zoom + cam.y });
export const worldToScreen = (wx, wy) => ({ x: (wx - cam.x)*cam.zoom, y:(wy - cam.y)*cam.zoom });
