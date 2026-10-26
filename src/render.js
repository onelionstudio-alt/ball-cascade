import {W,H,clamp} from './math.js';
import {obstaclesAt,gravityAt} from './obstacles.js';

export const PALETTE={mint:'#a4f4d5',lime:'#d3ff68',cyan:'#69e9ef',purple:'#c3a0ff',gold:'#ffd17c',red:'#ff718b'};
const moduleColors={multi:[PALETTE.mint,'#55bca7'],split:[PALETTE.purple,'#8464bb'],kick:[PALETTE.gold,'#d58d48']};
const round=(c,x,y,w,h,r)=>{c.beginPath();c.roundRect(x,y,w,h,r);};
function text(c,value,x,y,size=16,color='#d9ebff',align='center'){
 c.font=`750 ${size}px "Segoe UI",system-ui,sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(value,x,y);
}
export function plate(c,x,y,w,h,r,top,bottom,edge,depth=4){
 round(c,x,y+depth,w,h,r);c.fillStyle='#020917b0';c.fill();
 const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,top);g.addColorStop(1,bottom);
 round(c,x,y,w,h,r);c.fillStyle=g;c.fill();c.strokeStyle=edge;c.lineWidth=1;c.stroke();
 c.beginPath();c.moveTo(x+r,y+2);c.lineTo(x+w-r,y+2);c.strokeStyle='#ffffff38';c.stroke();
}
export function ballSprite(color){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d');
 const halo=c.createRadialGradient(32,32,5,32,32,31);halo.addColorStop(0,color+'80');halo.addColorStop(.4,color+'35');halo.addColorStop(1,color+'00');c.fillStyle=halo;c.fillRect(0,0,64,64);
 const pearl=c.createRadialGradient(28,27,1,32,33,12);pearl.addColorStop(0,'#ffffff');pearl.addColorStop(.25,'#f3ffff');pearl.addColorStop(.55,color);pearl.addColorStop(1,'#245678');c.beginPath();c.arc(32,32,10.5,0,Math.PI*2);c.fillStyle=pearl;c.fill();c.beginPath();c.arc(28.5,28,2.6,0,7);c.fillStyle='#ffffffcc';c.fill();return canvas;
}
function backdrop(){
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const c=canvas.getContext('2d');
 const base=c.createLinearGradient(0,0,W,H);base.addColorStop(0,'#0d2438');base.addColorStop(.48,'#0a192f');base.addColorStop(1,'#141b36');c.fillStyle=base;c.fillRect(0,0,W,H);
 for(const [x,y,color]of [[110,130,'#37d4d31c'],[850,430,'#a48aff17']]){const g=c.createRadialGradient(x,y,5,x,y,430);g.addColorStop(0,color);g.addColorStop(1,color.slice(0,7)+'00');c.fillStyle=g;c.fillRect(0,0,W,H);}
 c.strokeStyle='#92cae208';c.lineWidth=1;for(let y=115;y<500;y+=40)for(let x=24;x<W;x+=40){c.beginPath();c.moveTo(x-2,y);c.lineTo(x+2,y);c.moveTo(x,y-2);c.lineTo(x,y+2);c.stroke();}
 c.strokeStyle='#a5cfea15';round(c,9,8,W-18,H-16,17);c.stroke();c.strokeStyle='#020916';round(c,13,12,W-26,H-24,14);c.stroke();
 for(const x of [24,W-24]){c.fillStyle='#031022';round(c,x-5,120,10,350,5);c.fill();c.fillStyle='#47829b';for(let y=135;y<460;y+=55){round(c,x-1,y,2,15,1);c.fill();}}
 return canvas;
}

export class Renderer{
 constructor(canvas){
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.particles=[];this.labels=[];this.pulses=[];this.selected=-1;this.clock=0;this.frameEffects=0;
  this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.background=backdrop();this.ballSprites=[ballSprite('#72eadd'),ballSprite('#d4ff73')];
 }
 effect(type,data){
  if(this.motion.matches)return;
  if(type==='win'){for(let i=0;i<80&&this.particles.length<180;i++)this.particles.push({x:W/2,y:190,vx:Math.sin(i*2.4)*240,vy:Math.cos(i*2.4)*140-55,life:1.5,max:1.5,color:[PALETTE.lime,PALETTE.cyan,PALETTE.gold,PALETTE.purple][i%4],size:3});return;}
  if(!data||!Number.isFinite(data.x)||this.frameEffects++>=10)return;
  const colors={multi:PALETTE.mint,split:PALETTE.purple,kick:PALETTE.gold,portal:PALETTE.cyan,destroy:PALETTE.red,chain:PALETTE.gold,reactor:PALETTE.gold,pocket:PALETTE.lime,bounce:'#a8c6ff'};
  const color=colors[type];if(!color)return;
  if(['multi','split','kick','portal','reactor','chain'].includes(type)&&this.pulses.length<12)this.pulses.push({x:data.x,y:data.y,life:.5,color,type});
  const count=type==='destroy'?10:type==='chain'?12:4;
  for(let i=0;i<count&&this.particles.length<180;i++)this.particles.push({x:data.x,y:data.y,vx:Math.sin(i*2.3+this.clock)*85,vy:Math.cos(i*2.3+this.clock)*85-22,life:.55,max:.55,color,size:type==='destroy'?3:2});
  if(['chain','destroy','portal'].includes(type)&&this.labels.length<14)this.labels.push({x:data.x,y:data.y,text:type==='chain'?'CHAIN!':type==='destroy'?'×':'↷',color,life:.7});
 }
 draw(e,dt){
  const c=this.ctx,motion=this.motion.matches?0:dt;this.clock+=motion;c.globalAlpha=1;c.setLineDash([]);c.drawImage(this.background,0,0);
  if(this.motion.matches){this.particles=[];this.labels=[];this.pulses=[];}
  for(const slot of e.level.targets){const g=c.createLinearGradient(0,180,0,500);g.addColorStop(0,'#b8ff7600');g.addColorStop(1,'#aaff7616');c.fillStyle=g;c.fillRect(slot*192+5,150,182,350);}
  this.drawEmitter(e);
  for(const o of obstaclesAt(e.level,e.time))this.drawObstacle(o);
  for(const p of e.pegs){
   c.beginPath();c.arc(p.x,p.y+2,p.r+2.5,0,7);c.fillStyle='#020b1c';c.fill();
   const g=c.createRadialGradient(p.x-2,p.y-2,0,p.x,p.y,p.r+1);g.addColorStop(0,p.glow?'#ffffff':'#b0d9e9');g.addColorStop(.4,p.glow?PALETTE.lime:'#608ba5');g.addColorStop(1,'#243f59');c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.fillStyle=g;c.fill();
   if(p.glow&&!this.motion.matches){c.beginPath();c.arc(p.x,p.y,8+(1-p.glow)*8,0,7);c.strokeStyle=`rgba(184,255,113,${p.glow*.5})`;c.lineWidth=1;c.stroke();}
  }
  for(const b of e.balls){c.beginPath();b.trail.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=b.v>1?'#d3ff6845':'#69e9ef38';c.lineWidth=3;c.stroke();c.drawImage(this.ballSprites[b.v>1?1:0],b.x-22,b.y-22,44,44);}
  for(const m of e.modules)this.drawModule(m);
  this.drawTutorial(e);this.drawPockets(e);
  const g=gravityAt(e.level,e.time);if(g.ax){plate(c,362,77,236,26,9,'#203554','#12263f','#5c86a957',0);text(c,g.remaining<1?`! SHIFT ${g.next>0?'→':'←'} IN ${g.remaining.toFixed(1)}s`:`GRAVITY ${g.ax>0?'→':'←'}`,480,95,13,g.remaining<1?PALETTE.gold:PALETTE.cyan);}
  this.drawEffects(motion);this.frameEffects=0;
 }
 drawEmitter(e){
  const c=this.ctx;plate(c,45,24,870,9,4,'#25425a','#0a182b','#41648066',1);c.strokeStyle='#7ce8e42d';c.lineWidth=1;c.beginPath();c.moveTo(45,26);c.lineTo(915,26);c.stroke();
  for(const x of [29,931])text(c,x<480?'‹':'›',x,36,23,'#89c7d9');
  c.setLineDash([3,7]);c.beginPath();c.moveTo(e.aim,77);c.lineTo(e.aim,126);c.strokeStyle='#d3ff684a';c.stroke();c.setLineDash([]);
  if(this.selected<0){c.shadowColor='#c4ff6650';c.shadowBlur=14;}
  plate(c,e.aim-43,11,86,38,11,'#e5ffa0','#9fd151','#e7ffb0',4);c.shadowBlur=0;
  text(c,'↓',e.aim,37,27,'#213c2c');text(c,'‹',e.aim-27,35,22,'#3c6439');text(c,'›',e.aim+27,35,22,'#3c6439');
  text(c,'DRAG TO AIM',clamp(e.aim,80,880),68,10,'#b4d6c9');
 }
 drawModule(m){
  const c=this.ctx,[top,bottom]=moduleColors[m.type];
  if(m.id===this.selected){c.strokeStyle=top+'90';c.lineWidth=2;round(c,m.x-78,m.y-26,156,52,14);c.stroke();}
  c.shadowColor=top+'30';c.shadowBlur=12;plate(c,m.x-72,m.y-21,144,42,11,top,bottom,top,5);c.shadowBlur=0;
  round(c,m.x-65,m.y-15,34,30,8);c.fillStyle='#112b3fbb';c.fill();c.strokeStyle='#ffffff24';c.lineWidth=1;c.stroke();
  const symbol=m.type==='multi'?'×':m.type==='split'?'⑂':m.x<W/2?'→':'←';text(c,symbol,m.x-48,m.y+7,24,top);
  text(c,m.type==='multi'?'×2':m.type==='split'?'SPLIT':'REDIRECT',m.x+16,m.y+1,m.type==='multi'?24:m.type==='split'?17:13,'#173349');
  text(c,m.type==='multi'?'BOOST':m.type==='split'?'TWO STREAMS':m.x<W/2?'SEND RIGHT':'SEND LEFT',m.x+16,m.y+14,8,'#24495c');
  for(const x of [m.x-67,m.x+67]){c.beginPath();c.arc(x,m.y,1.4,0,7);c.fillStyle='#183a4b66';c.fill();}
 }
 drawObstacle(o){
  const c=this.ctx,t=this.motion.matches?0:this.clock;
  if(o.type==='wind'){
   const g=c.createLinearGradient(o.x,0,o.x+o.w,0);g.addColorStop(0,'#62dce900');g.addColorStop(.5,'#62dce910');g.addColorStop(1,'#62dce900');c.fillStyle=g;c.fillRect(o.x,o.y,o.w,o.h);
   c.save();c.beginPath();c.rect(o.x,o.y,o.w,o.h);c.clip();c.lineWidth=2;
   for(let i=0;i<12;i++){const pos=(t*65+i*91)%o.w,x=o.force>0?o.x+pos:o.x+o.w-pos,y=o.y+27+(i%4)*48,d=Math.sign(o.force);c.beginPath();c.moveTo(x,y);c.lineTo(x+d*35,y);c.moveTo(x+d*28,y-5);c.lineTo(x+d*35,y);c.lineTo(x+d*28,y+5);c.strokeStyle='#6edfe948';c.stroke();}c.restore();text(c,o.force>0?'WIND →':'← WIND',o.x+o.w/2,o.y+o.h-10,10,'#72ccda');return;
  }
  if(o.type==='portal'){
   for(const [x,y,label]of [[o.x,o.y,'IN'],[o.ex,o.ey,'OUT ↓']]){
    c.save();c.translate(x,y);c.scale(1,.8);c.shadowColor=PALETTE.cyan;c.shadowBlur=14;c.beginPath();c.arc(0,0,o.r,0,7);c.strokeStyle='#5bdcec66';c.lineWidth=8;c.stroke();c.shadowBlur=0;
    c.beginPath();c.arc(0,0,o.r-4,0,7);c.fillStyle='#07142cdc';c.fill();
    c.rotate(t*.6);for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,o.r,i*2.1,i*2.1+1.45);c.strokeStyle=i%2?'#b8fcff':'#60caff';c.lineWidth=3;c.stroke();}c.restore();text(c,label,x,y-o.r-9,11,PALETTE.cyan);
   }return;
  }
  if(o.type==='reactor'){
   c.setLineDash([3,8]);c.beginPath();c.moveTo(o.x,o.y);c.lineTo(o.tx,o.ty);c.strokeStyle='#ffdc7e30';c.lineWidth=1;c.stroke();c.setLineDash([]);
   c.save();c.translate(o.x,o.y);c.shadowColor='#ffd37555';c.shadowBlur=15;c.rotate(Math.PI/4);plate(c,-o.r*.74,-o.r*.74,o.r*1.48,o.r*1.48,5,'#ffedac','#d89842','#fff1bd',3);c.restore();text(c,'ϟ',o.x,o.y+8,26,'#62411a');return;
  }
  const hazard=o.type==='trap'||o.type==='crusher',danger=hazard&&(o.type==='trap'||o.active);
  if(hazard){
   const top=danger?'#ff8e9f':o.warning?'#ffd98e':'#485a76',bottom=danger?'#b84469':o.warning?'#ad7c47':'#24334d';
   c.shadowColor=danger?'#ff647c40':'#0000';c.shadowBlur=12;plate(c,o.x,o.y,o.w,o.h,5,top,bottom,top+'aa',3);c.shadowBlur=0;
   c.save();round(c,o.x+2,o.y+2,o.w-4,o.h-4,3);c.clip();c.strokeStyle='#1d123244';c.lineWidth=6;for(let x=o.x-20;x<o.x+o.w+20;x+=20){c.beginPath();c.moveTo(x,o.y+o.h);c.lineTo(x+18,o.y);c.stroke();}c.restore();
   c.fillStyle=danger?'#ff98ab':o.warning?'#ffe09b':'#64778f';for(let x=o.x+6;x<o.x+o.w-6;x+=18){c.beginPath();c.moveTo(x,o.y);c.lineTo(x+7,o.y-7);c.lineTo(x+14,o.y);c.fill();}
   text(c,o.warning?'! CLOSING':o.type==='trap'?'× DANGER':o.active?'× CRUSHER':'SAFE WINDOW',o.x+o.w/2,o.y+o.h+16,10,danger?'#ffb3bf':o.warning?PALETTE.gold:'#9cb6d0');
  }else{
   plate(c,o.x,o.y,o.w,o.h,5,'#93afcc','#455f84','#b0cbe5a0',3);c.beginPath();c.moveTo(o.x+8,o.y+o.h/2);c.lineTo(o.x+o.w-8,o.y+o.h/2);c.strokeStyle='#172d4b75';c.lineWidth=3;c.stroke();
   if(o.type==='mover')text(c,'↔',o.x+o.w/2,o.y+o.h/2+4,14,'#dcf5ff');
  }
 }
 drawTutorial(e){
  if(e.level.id!==0||e.phase!=='planning'||e.profile.tutorial.skipped||e.profile.complete[0])return;const c=this.ctx;
  if(!e.actions.moved){c.setLineDash([5,6]);round(c,e.aim-78,193,156,54,13);c.strokeStyle='#cfff6c90';c.lineWidth=2;c.stroke();c.setLineDash([]);text(c,'DRAG BOOST HERE',e.aim,270,11,'#d3ff68');}
  else if(e.lessonBoosted&&!e.actions.aimed){plate(c,332,84,296,28,10,'#233c4b','#162a40','#81acbe44',1);text(c,'DRAG THE NOZZLE RIGHT →',480,103,12,'#cfff85');}
 }
 drawPockets(e){
  const c=this.ctx;
  for(let i=0;i<5;i++){
   const x=i*192+5,target=e.level.targets.includes(i);plate(c,x,501,182,32,8,target?'#defda0':'#2c4763',target?'#99ce50':'#182c49',target?'#e4ffb5':'#48627f',4);
   c.fillStyle=target?'#d3ff68':'#55799b';round(c,x+12,498,158,3,2);c.fill();
   text(c,target?'◎ TARGET '+(i+1):'×'+e.level.payouts[i],i*192+96,522,13,target?'#28412a':'#9fbbd6');
  }
 }
 drawEffects(dt){
  const c=this.ctx;
  for(const p of this.pulses){p.life-=dt;c.globalAlpha=Math.max(0,p.life/.5)*.7;c.strokeStyle=p.color;c.lineWidth=2;if(['multi','split','kick'].includes(p.type)){const d=(.5-p.life)*14;round(c,p.x-75-d,p.y-24-d,150+d*2,48+d*2,13);c.stroke();}else{c.beginPath();c.arc(p.x,p.y,25+(1-p.life/.5)*24,0,7);c.stroke();}}
  this.pulses=this.pulses.filter(p=>p.life>0);c.globalAlpha=1;
  for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=45*dt;c.globalAlpha=clamp(p.life/p.max,0,1);c.fillStyle=p.color;c.fillRect(p.x,p.y,p.size,p.size);}
  this.particles=this.particles.filter(p=>p.life>0);
  for(const l of this.labels){l.life-=dt;l.y-=dt*25;c.globalAlpha=clamp(l.life/.7,0,1);text(c,l.text,l.x,l.y,16,l.color);}this.labels=this.labels.filter(l=>l.life>0);c.globalAlpha=1;
 }
}
