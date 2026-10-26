import {makePegs} from './levels.js';
// Cosmetic identities only. No collision bodies or simulation data are created.
export const SCENES=[
 {accent:'#baf5cf',shade:'#102d35',kind:'light'},
 {accent:'#80c6ef',shade:'#142d43',kind:'rails'},
 {accent:'#ff8993',shade:'#331f34',kind:'danger'},
 {accent:'#c4a1ff',shade:'#281e43',kind:'split'},
 {accent:'#72e5eb',shade:'#123947',kind:'wind'},
 {accent:'#ffba7b',shade:'#342735',kind:'press'},
 {accent:'#a898ff',shade:'#211d46',kind:'portal'},
 {accent:'#83bcff',shade:'#172d4c',kind:'gravity'},
 {accent:'#ffdd7b',shade:'#332e2a',kind:'energy'},
 {accent:'#81ddd0',shade:'#153239',kind:'maze'},
 {accent:'#f5ac86',shade:'#292a39',kind:'factory'},
 {accent:'#ffe497',shade:'#302341',kind:'master'}
];
export function sceneConstruction(c,level){
 const s=SCENES[level.id],accent=s.accent;c.save();
 // The solid-looking cabinet rails sit at the existing physical boundary.
 for(const x of [2,950]){
  const g=c.createLinearGradient(x,0,x+8,0);g.addColorStop(0,'#11243a');g.addColorStop(.45,'#6d879b');g.addColorStop(1,'#102134');c.fillStyle=g;c.fillRect(x,105,8,386);
  for(let y=120;y<485;y+=70){c.beginPath();c.arc(x+4,y,2.3,0,7);c.fillStyle='#bacad1';c.fill();c.fillStyle='#122035';c.fillRect(x+2,y-.5,4,1);}
 }
 // Rear-plane grooves connect real peg mounts; these are not extra reflectors.
 c.strokeStyle=accent+'14';c.lineWidth=1;
 const mounts=makePegs(level);for(let col=0;col<4&&mounts.length;col++){c.beginPath();mounts.filter((_,i)=>i%4===col).forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();}
 if(['rails','factory'].includes(s.kind))for(const o of level.obstacles.filter(o=>o.type==='mover')){
  c.setLineDash([3,5]);c.strokeStyle=accent+'35';c.lineWidth=3;c.beginPath();if(o.axis==='x'){c.moveTo(o.x-o.range,o.y+o.h/2);c.lineTo(o.x+o.range+o.w,o.y+o.h/2);}else{c.moveTo(o.x+o.w/2,o.y-o.range);c.lineTo(o.x+o.w/2,o.y+o.range+o.h);}c.stroke();c.setLineDash([]);
 }
 if(s.kind==='split'){for(const x of [288,672]){const g=c.createLinearGradient(0,170,0,490);g.addColorStop(0,accent+'00');g.addColorStop(1,accent+'15');c.fillStyle=g;c.fillRect(x-86,170,172,320);}}
 if(['danger','press','factory'].includes(s.kind)){c.strokeStyle=accent+'2c';c.lineWidth=3;for(let y=115;y<485;y+=24){c.beginPath();c.moveTo(15,y);c.lineTo(25,y+10);c.moveTo(945,y);c.lineTo(935,y+10);c.stroke();}}
 if(s.kind==='wind'){c.strokeStyle=accent+'3c';for(const x of [32,914])for(let y=150;y<390;y+=18){c.beginPath();c.moveTo(x,y);c.lineTo(x+13,y-4);c.stroke();}}
 if(s.kind==='portal'){for(const o of level.obstacles.filter(o=>o.type==='portal'))for(const[x,y]of[[o.x,o.y],[o.ex,o.ey]]){c.beginPath();c.ellipse(x,y,85,62,0,0,7);c.strokeStyle=accent+'12';c.lineWidth=18;c.stroke();}}
 if(s.kind==='maze'){c.strokeStyle=accent+'1b';c.lineWidth=2;for(const o of level.obstacles.filter(o=>o.type==='wall'))c.strokeRect(o.x-4,o.y-4,o.w+8,o.h+8);}
 if(s.kind==='energy'){c.strokeStyle=accent+'25';c.lineWidth=2;for(const o of level.obstacles.filter(o=>o.type==='reactor')){c.beginPath();c.moveTo(o.x,105);c.lineTo(o.x,o.y-45);c.stroke();}}
 if(s.kind==='master'){c.strokeStyle=accent+'55';c.lineWidth=3;for(const x of[28,932]){c.beginPath();c.moveTo(x,110);c.lineTo(x,460);c.stroke();}for(const[x,y]of[[28,95],[932,95],[28,478],[932,478]]){c.save();c.translate(x,y);c.rotate(Math.PI/4);c.strokeRect(-5,-5,10,10);c.restore();}}
 c.restore();
}
