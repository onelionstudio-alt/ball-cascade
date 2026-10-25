const multi=(x,y)=>({type:'multi',x,y}),split=(x,y)=>({type:'split',x,y}),kick=(x,y)=>({type:'kick',x,y});
const wall=(x,y,w,h=18)=>({type:'wall',x,y,w,h});
const trap=(x,y,w,h=22)=>({type:'trap',x,y,w,h});
const mover=(x,y,w,axis='x',range=80,period=7,phase=0)=>({type:'mover',x,y,w,h:16,axis,range,period,phase});
const wind=(x,y,w,h,force)=>({type:'wind',x,y,w,h,force});
const crusher=(x,y,w=180)=>({type:'crusher',x,y,w,h:24,range:65,period:7,duty:.35});
const portals=(x,y,ex,ey)=>({type:'portal',x,y,ex,ey,r:27});
const reactor=(x,y,tx,ty)=>({type:'reactor',x,y,tx,ty,r:25});
// The old cascade, modules and pockets remain; campaigns now have finite attempts.
export const LEVELS=[
  {name:'First Light',subtitle:'Build your first working cascade',budget:36,targets:[2],need:12,boosted:8,modules:[multi(160,220)],obstacles:[],hint:'Drag ×2 under the stream. Then aim slightly right.',solution:{aim:530,modules:[[480,220]]},pegs:'tutorial'},
  {name:'Moving Walls',subtitle:'Choose a lane that stays open',budget:90,targets:[1,3],need:28,modules:[multi(110,245),kick(820,365)],obstacles:[mover(270,255,130,'x',65,7),mover(620,350,110,'x',60,8,3)],hint:'The side pockets are targets. Lead the moving walls.',solution:{aim:280,modules:[[280,180],[820,365]]}},
  {name:'Danger Zone',subtitle:'Protect the stream',budget:72,targets:[1],need:27,minEfficiency:.6,modules:[multi(750,220),kick(820,370)],obstacles:[trap(405,285,150,32),trap(650,395,170,26)],hint:'Red teeth destroy balls. The left lane is safe.',solution:{aim:285,modules:[[285,200],[820,370]]}},
  {name:'Split Decision',subtitle:'Supply both sides',budget:90,targets:[1,3],needEach:14,modules:[split(130,180),multi(160,335),multi(805,335)],obstacles:[wall(415,380,130)],hint:'Split early, then support both branches.',solution:{aim:480,modules:[[480,175],[340,335],[620,335]]}},
  {name:'Wind Tunnel',subtitle:'Compensate for the crosswind',budget:90,targets:[2],need:45,minEfficiency:.65,modules:[multi(790,230),kick(130,385)],obstacles:[wind(50,145,860,270,300)],hint:'Wind pushes right. Start left of your target.',solution:{aim:370,modules:[[430,245],[130,385]]}},
  {name:'The Crusher',subtitle:'Build a safe route or time the launch',budget:110,targets:[2],need:30,maxLoss:.35,modules:[multi(800,180),kick(800,380)],obstacles:[crusher(365,275,230)],hint:'Route beside the press, then kick toward the center.',solution:{aim:220,modules:[[220,195],[220,380]]}},
  {name:'Portal Lab',subtitle:'Reach the remote pocket',budget:80,targets:[4],need:24,portalNeed:24,modules:[multi(700,200),kick(600,400)],obstacles:[portals(265,245,850,345),wall(735,170,24,230)],hint:'Aim at the blue entry. The exit always points down.',solution:{aim:265,modules:[[265,170],[600,400]]}},
  {name:'Gravity Shift',subtitle:'Prepare for both directions',budget:120,targets:[1,3],needEach:20,modules:[split(140,180),multi(140,350),multi(820,350)],obstacles:[],gravity:65,gravityPeriod:7,hint:'A warning precedes each shift. Split into two lanes.',solution:{aim:480,modules:[[480,175],[330,345],[630,345]]}},
  {name:'Chain Reaction',subtitle:'Link three activator hits',budget:80,targets:[1,2,3],need:18,chains:8,modules:[multi(790,190),kick(800,410)],obstacles:[reactor(320,285,640,360),reactor(640,360,320,285)],hint:'Hit the left activator to start a bounded three-hit chain.',solution:{aim:320,modules:[[320,190],[800,410]]}},
  {name:'The Maze',subtitle:'Find either of two safe corridors',budget:110,targets:[1,3],need:46,minEfficiency:.9,maxLoss:.3,modules:[multi(480,180),kick(480,400)],obstacles:[wall(0,215,235),wall(415,215,130),wall(725,215,235),wall(0,355,230),wall(415,355,130),wall(730,355,230)],hint:'There is a broad route on each side of the middle wall.',solution:{aim:300,modules:[[300,185],[850,400]]},alternate:{aim:660,modules:[[660,185],[120,400]]},pegs:'none'},
  {name:'Chaos Factory',subtitle:'Separate the flow before the danger',budget:130,targets:[1,3],needEach:21,maxLoss:.3,modules:[split(135,180),multi(130,350),multi(830,350)],obstacles:[mover(150,265,110,'x',45,7),mover(700,310,100,'x',40,8,3),trap(420,355,120,25),wind(350,180,260,130,45)],hint:'Split above the red zone. Watch the moving barriers.',solution:{aim:480,modules:[[480,170],[325,365],[635,365]]}},
  {name:'Cascade Master',subtitle:'A balanced machine, not a bigger bank',budget:140,targets:[1,3],needEach:24,minEfficiency:.6,maxLoss:.25,modules:[split(130,175),multi(120,350),multi(830,350),kick(130,410)],obstacles:[crusher(425,285,110),trap(430,395,100,22),mover(90,300,80,'x',35,9),wind(350,160,260,100,30),portals(155,300,650,380)],gravity:28,gravityPeriod:8,hint:'Split above the crusher and keep both target lanes supplied.',solution:{aim:480,modules:[[480,170],[325,355],[635,355],[120,430]]}}
].map((l,id)=>({...l,id,seed:452+id*997,bursts:3,payouts:[1,2,5,2,1],pegs:l.pegs||'sparse'}));
export function makePegs(level){
  if(level.pegs==='none')return [];
  const pegs=[];
  // Keep broad reproducible lanes while retaining the 0.2 peg-and-bounce mechanic.
  const xs=level.pegs==='tutorial'?[90,185,760,855]:[90,185,775,870];
  for(let row=0;row<5;row++)for(const x of xs)pegs.push({x:x+(row%2?12:0),y:155+row*62,r:5,glow:0});
  return pegs;
}
export function defaultLayout(level){return level.modules.map((m,id)=>({...m,id}));}
