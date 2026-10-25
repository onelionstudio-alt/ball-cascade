export const W=960,H=540,DT=1/120,MAX_BALLS=220;
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const finite=(n,fallback=0)=>Number.isFinite(n)?n:fallback;
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function random(seed){let value=seed>>>0;return()=>((value=(Math.imul(value,1664525)+1013904223)>>>0)/4294967296);}
export function circleRect(ball,rect){
  const px=clamp(ball.x,rect.x,rect.x+rect.w),py=clamp(ball.y,rect.y,rect.y+rect.h);
  let dx=ball.x-px,dy=ball.y-py,d=Math.hypot(dx,dy);
  if(d>=ball.r)return null;
  if(d>.0001)return {nx:dx/d,ny:dy/d,depth:ball.r-d};
  const faces=[{v:ball.x-rect.x,nx:-1,ny:0},{v:rect.x+rect.w-ball.x,nx:1,ny:0},{v:ball.y-rect.y,nx:0,ny:-1},{v:rect.y+rect.h-ball.y,nx:0,ny:1}];
  faces.sort((a,b)=>a.v-b.v);const f=faces[0];return {nx:f.nx,ny:f.ny,depth:ball.r+f.v};
}
export function bounce(ball,contact,vx=0,vy=0,restitution=.65){
  ball.x+=contact.nx*(contact.depth+.01);ball.y+=contact.ny*(contact.depth+.01);
  const dot=(ball.vx-vx)*contact.nx+(ball.vy-vy)*contact.ny;
  if(dot<0){ball.vx-=(1+restitution)*dot*contact.nx;ball.vy-=(1+restitution)*dot*contact.ny;}
}
