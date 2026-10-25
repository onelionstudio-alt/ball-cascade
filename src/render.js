import {W,H,clamp} from './math.js';
import {obstaclesAt,gravityAt} from './obstacles.js';
const colors={multi:'#a7ead7',split:'#e6acff',kick:'#ffbc86'};
function round(c,x,y,w,h,r,color){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();}
function text(c,t,x,y,size=18,color='#d8efea'){c.font=`600 ${size}px system-ui`;c.textAlign='center';c.fillStyle=color;c.fillText(t,x,y);}
export class Renderer{
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.particles=[];this.labels=[];this.selected=-1;}
  effect(type,data){
    if(type==='win'){for(let i=0;i<60&&this.particles.length<180;i++)this.particles.push({x:W/2,y:230,vx:Math.sin(i*2.4)*260,vy:Math.cos(i*2.4)*160,life:1.5,color:i%2?'#dbff70':'#a7ead7'});return;}
    if(!data||!Number.isFinite(data.x))return;if(['pocket','destroy','portal','chain','multi'].includes(type)){const color=type==='destroy'?'#ff6b79':type==='portal'?'#66dfff':type==='multi'?'#a7ead7':'#dbff70';for(let i=0;i<4&&this.particles.length<180;i++)this.particles.push({x:data.x,y:data.y,vx:Math.sin(i*2.3)*65,vy:Math.cos(i*2.3)*65,life:.6,color});if(this.labels.length<20&&type!=='pocket')this.labels.push({x:data.x,y:data.y,text:type==='destroy'?'✕':type==='chain'?'CHAIN!':type==='portal'?'↷':'×2',color,life:.8});}}
  draw(e,dt){
    const c=this.ctx;c.clearRect(0,0,W,H);const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#152c33');bg.addColorStop(1,'#102027');c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle='#668e9025';for(let x=20;x<W;x+=30)for(let y=20;y<500;y+=30)c.fillRect(x,y,1,1);
    for(const slot of e.level.targets){c.fillStyle='#dbff7008';c.fillRect(slot*192,110,192,390);}
    c.strokeStyle='#dbff7040';c.setLineDash([4,8]);c.beginPath();c.moveTo(e.aim,62);c.lineTo(e.aim,125);c.stroke();c.setLineDash([]);round(c,e.aim-31,13,62,31,8,'#dcff80');text(c,'↓',e.aim,37,22,'#173425');
    for(const o of obstaclesAt(e.level,e.time)){
      if(o.type==='wind'){c.fillStyle='#a2d4eb0a';c.fillRect(o.x,o.y,o.w,o.h);c.strokeStyle='#75cbe55a';c.lineWidth=2;for(let i=0;i<9;i++){const pos=((e.time*60+i*95)%o.w),x=o.force>0?o.x+pos:o.x+o.w-pos,y=o.y+25+(i%4)*45,dir=Math.sign(o.force);c.beginPath();c.moveTo(x,y);c.lineTo(x+dir*24,y);c.lineTo(x+dir*17,y-5);c.stroke();}text(c,o.force>0?'WIND →':'← WIND',o.x+o.w/2,o.y+o.h-10,12,'#75cbe5');continue;}
      if(o.type==='portal'){for(const [x,y,label] of [[o.x,o.y,'IN'],[o.ex,o.ey,'OUT ↓']]){c.beginPath();c.ellipse(x,y,o.r,o.r*.75,0,0,Math.PI*2);c.strokeStyle='#66dfff';c.lineWidth=5;c.stroke();text(c,label,x,y-33,13,'#66dfff');}continue;}
      if(o.type==='reactor'){c.beginPath();c.moveTo(o.x,o.y-o.r);c.lineTo(o.x+o.r,o.y);c.lineTo(o.x,o.y+o.r);c.lineTo(o.x-o.r,o.y);c.closePath();c.fillStyle='#e8ca6f';c.fill();text(c,'⚡',o.x,o.y+7,21,'#352c14');c.setLineDash([3,8]);c.strokeStyle='#e8ca6f40';c.beginPath();c.moveTo(o.x,o.y);c.lineTo(o.tx,o.ty);c.stroke();c.setLineDash([]);continue;}
      const danger=o.type==='trap'||o.type==='crusher'&&o.active,col=danger?'#e3606f':o.warning?'#ffcb70':o.type==='crusher'?'#55707755':'#79969f';round(c,o.x,o.y,o.w,o.h,4,col);
      if(o.type==='trap'||o.type==='crusher'){c.fillStyle=danger?'#ff8790':'#adc3c380';for(let x=o.x+6;x<o.x+o.w;x+=18){c.beginPath();c.moveTo(x,o.y);c.lineTo(x+8,o.y-9);c.lineTo(x+14,o.y);c.fill();}text(c,o.warning?'! CLOSING':o.type==='crusher'?(o.active?'✕ ACTIVE':'SAFE WINDOW'):'✕',o.x+o.w/2,o.y+o.h+18,12,danger?'#ff8e96':'#d7c89b');}else{c.strokeStyle='#d6e6e880';c.beginPath();c.moveTo(o.x+8,o.y+o.h/2);c.lineTo(o.x+o.w-8,o.y+o.h/2);c.stroke();}
    }
    for(const p of e.pegs){c.beginPath();c.arc(p.x,p.y,p.r+p.glow*2,0,Math.PI*2);c.fillStyle=p.glow?'#dcff80':'#5c7e84';c.fill();}
    for(const b of e.balls){c.beginPath();b.trail.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=b.v>1?'#dbff7040':'#a7ead730';c.lineWidth=4;c.stroke();c.beginPath();c.arc(b.x,b.y,b.r,0,Math.PI*2);c.fillStyle=b.v>1?'#e2ff80':'#a7ead7';c.shadowColor=c.fillStyle;c.shadowBlur=7;c.fill();c.shadowBlur=0;c.fillStyle='#fff9';c.beginPath();c.arc(b.x-2,b.y-2,2,0,7);c.fill();}
    for(const m of e.modules){if(m.id===this.selected){c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect(m.x-77,m.y-25,154,50);}round(c,m.x-72,m.y-21,144,42,9,colors[m.type]);text(c,m.type==='multi'?'×2 VALUE':m.type==='split'?'⑂ SPLIT':m.x<W/2?'KICK →':'← KICK',m.x,m.y+6,18,'#15312d');}
    if(e.level.id===0&&e.phase==='planning'&&!e.profile.tutorial.skipped){const step=e.lessonBoosted?1:0,x=step?530:e.aim,y=step?30:220;c.strokeStyle='#dbff70';c.lineWidth=2;c.setLineDash([6,6]);c.strokeRect(x-80,y-27,160,54);c.setLineDash([]);text(c,step?'AIM HERE':'MOVE ×2 HERE',x,y+45,14,'#dbff70');}
    for(let i=0;i<5;i++){const target=e.level.targets.includes(i);round(c,i*192+4,501,184,33,7,target?'#dcff80':'#29424a');text(c,target?'◎ TARGET '+(i+1):'×'+e.level.payouts[i],i*192+96,524,17,target?'#173425':'#b9d9d4');}
    const g=gravityAt(e.level,e.time);if(g.ax)text(c,g.remaining<1?`! GRAVITY ${g.next>0?'→':'←'} IN ${g.remaining.toFixed(1)}s`:`GRAVITY ${g.ax>0?'→':'←'}`,W/2,85,16,g.remaining<1?'#ffcb70':'#b1cad1');
    for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;c.globalAlpha=clamp(p.life/.6,0,1);c.fillStyle=p.color;c.fillRect(p.x,p.y,3,3);}this.particles=this.particles.filter(p=>p.life>0);for(const l of this.labels){l.y-=dt*25;l.life-=dt;c.globalAlpha=clamp(l.life/.8,0,1);text(c,l.text,l.x,l.y,18,l.color);}this.labels=this.labels.filter(l=>l.life>0);c.globalAlpha=1;
  }
}
