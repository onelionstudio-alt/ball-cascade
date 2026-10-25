import {W,H,MAX_BALLS,clamp,circleRect,bounce} from './math.js';
import {obstaclesAt,gravityAt} from './obstacles.js';
// Extracted from the 0.2 fixed-step peg/module simulation. New contacts use relative
// obstacle velocity; stalled balls are lost, never teleported into a paid pocket.
export function addBall(e,data){
  if(e.balls.length>=MAX_BALLS)return null;
  const b={x:e.aim,y:48,vx:(e.rng()-.5)*e.scatter,vy:20,r:7,v:1,used:[],trail:[],age:0,root:null,hops:0,portalCooldown:0,chainDepth:0,reactorHits:[],...data};
  e.balls.push(b);if(b.root!==null)e.roots.get(b.root).pending++;return b;
}
export function removeBall(e,b,reason=null,slot=null){
  if(b.dead)return;b.dead=true;
  const root=e.roots.get(b.root);
  if(root){
    root.pending--;
    if(slot!==null){root.delivered=true;if(e.level.targets.includes(slot))root.targets.add(slot);root.score=Math.max(root.score,b.v*e.level.payouts[slot]);}
    if(reason){e.lostBalls++;e.lossCauses[reason]=(e.lossCauses[reason]||0)+1;}
  }
  e.event(reason?'destroy':'pocket',{x:b.x,y:b.y,reason,slot,value:b.v});
}
function portalContact(e,b,o){
  if(b.portalCooldown>0||Math.hypot(b.x-o.x,b.y-o.y)>o.r+b.r)return;
  if(b.hops>=3){removeBall(e,b,'portal loop');return;}
  b.x=o.ex;b.y=o.ey+o.r+9;b.vx=0;b.vy=70;b.hops++;b.portalCooldown=.6;
  const root=e.roots.get(b.root);if(root)root.portal=true;
  e.event('portal',{x:o.x,y:o.y,ex:o.ex,ey:o.ey});
}
function reactorContact(e,b,o){
  if(b.chainDepth>=3||b.reactorHits.includes(o.id)||Math.hypot(b.x-o.x,b.y-o.y)>o.r+b.r)return;
  b.reactorHits.push(o.id);const root=e.roots.get(b.root),depth=b.chainDepth+1;
  if(depth===3&&root&&!root.chain){root.chain=true;e.chains++;e.event('chain',{x:o.x,y:o.y});}
  if(depth<3){
    const flight=.65,dx=o.tx-o.x,dy=o.ty-o.y;
    addBall(e,{x:o.x,y:o.y-5,vx:dx/flight,vy:(dy-.5*355*flight*flight)/flight,root:b.root,v:b.v,used:[...b.used],age:b.age,chainDepth:depth,reactorHits:[o.id]});
  }
  e.event('reactor',{x:o.x,y:o.y,depth});
}
export function physicsStep(e,dt){
  const obstacles=obstaclesAt(e.level,e.time),gravity=gravityAt(e.level,e.time);
  // Iterating a snapshot prevents children being advanced twice in the same step.
  for(const b of [...e.balls]){
    if(b.dead)continue;b.age+=dt;b.portalCooldown=Math.max(0,b.portalCooldown-dt);
    b.trail.push({x:b.x,y:b.y});if(b.trail.length>5)b.trail.shift();
    let ax=gravity.ax;
    for(const o of obstacles)if(o.type==='wind'&&b.x>o.x&&b.x<o.x+o.w&&b.y>o.y&&b.y<o.y+o.h)ax+=o.force;
    b.vx=clamp(b.vx+ax*dt,-550,550);b.vy=clamp(b.vy+355*dt,-400,550);
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.x<12){b.x=12;b.vx=Math.abs(b.vx)*.8;}if(b.x>W-12){b.x=W-12;b.vx=-Math.abs(b.vx)*.8;}
    if(b.y<15){b.y=15;b.vy=Math.abs(b.vy)*.8;}
    for(const p of e.pegs){const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy),r=b.r+p.r;if(d<r){const nx=d>.001?dx/d:1,ny=d>.001?dy/d:0;bounce(b,{nx,ny,depth:r-d});b.vx+=(e.rng()-.5)*16;p.glow=1;}}
    for(const o of obstacles){
      if(b.dead)break;
      if(o.type==='portal'){portalContact(e,b,o);continue;}
      if(o.type==='reactor'){reactorContact(e,b,o);continue;}
      if(o.type==='wind'||o.type==='crusher'&&!o.active)continue;
      const contact=circleRect(b,o);if(!contact)continue;
      if(o.type==='trap'||o.type==='crusher'){removeBall(e,b,o.type==='trap'?'red trap':'active crusher');continue;}
      bounce(b,contact,o.vx,o.vy,.72);e.event('bounce',{x:b.x,y:b.y});
    }
    if(b.dead)continue;
    for(const m of e.modules){
      if(b.used.includes(m.id)||Math.abs(b.x-m.x)>70||Math.abs(b.y-m.y)>20)continue;
      b.used.push(m.id);
      if(m.type==='multi'){
        b.v=Math.min(8,b.v*2);const root=e.roots.get(b.root);if(root)root.boosted=true;
        if(e.level.id===0&&e.actions.moved)e.lessonBoosted=true;
      }else if(m.type==='split'){
        addBall(e,{x:b.x+12,y:b.y+22,v:b.v,vx:136,used:[...b.used],root:b.root,age:b.age,hops:b.hops,portalCooldown:b.portalCooldown,chainDepth:b.chainDepth});b.vx=-136;b.y+=22;
      }else{b.vx=m.x<W/2?245:-245;b.vy=-85;b.y-=22;}
      e.event(m.type,{x:m.x,y:m.y});
    }
    if(b.y>500)removeBall(e,b,null,clamp(Math.floor(b.x/(W/5)),0,4));
    else if(b.age>18)removeBall(e,b,'stalled for 18 seconds');
  }
  e.balls=e.balls.filter(b=>!b.dead);
  for(const p of e.pegs)p.glow=Math.max(0,p.glow-dt*3);
}
