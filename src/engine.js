import {DT,clamp,random,distance} from './math.js';
import {LEVELS,defaultLayout,makePegs} from './levels.js';
import {addBall,physicsStep} from './physics.js';
import {interval,scatter,burstSize,purchase,reward,stars} from './economy.js';
import {metrics,failures} from './goals.js';
export class Engine{
  constructor(profile,{onEvent=()=>{},onSave=()=>{}}={}){this.profile=profile;this.onEvent=onEvent;this.onSave=onSave;this.load(0);}
  unlocked(){const i=this.profile.complete.findIndex(v=>!v);return i<0?11:i;}
  replayUnlocked(){return this.profile.complete.every(Boolean);}
  load(id){
    if(!Number.isInteger(id)||id<0||id>this.unlocked())return false;
    if(this.phase==='running')this.finish('Attempt left before completion. Rebuild and try again.');
    this.level=LEVELS[id];const layout=this.profile.layouts[id];
    this.modules=defaultLayout(this.level).map((m,i)=>({...m,...layout?.[i]}));
    this.pegs=makePegs(this.level);this.aim=this.profile.aims[id]??480;
    this.actions={moved:this.modules.some((m,i)=>distance(m,this.level.modules[i])>18),aimed:Math.abs(this.aim-480)>18};
    this.resetAttempt();return true;
  }
  resetAttempt(){this.phase='planning';this.time=0;this.balls=[];this.roots=new Map();this.emitted=0;this.spawn=0;this.previewSpawn=0;this.burstsUsed=0;this.burstReady=0;this.chains=0;this.lostBalls=0;this.lossCauses={};this.result=null;this.lessonBoosted=false;this.rng=random(this.level.seed);this.scatter=scatter(this.profile);}
  event(type,data){this.onEvent(type,data);}
  aimTo(x){if(!['planning','running'].includes(this.phase)||!Number.isFinite(x))return false;const next=clamp(x,45,915);if(Math.abs(next-this.aim)>18)this.actions.aimed=true;this.aim=next;this.profile.aims[this.level.id]=next;this.onSave(this.profile);return true;}
  moveModule(id,x,y){
    const m=this.modules[id];if(!m||!['planning','running'].includes(this.phase)||!Number.isFinite(x)||!Number.isFinite(y))return false;
    const next={x:clamp(x,85,875),y:clamp(y,145,445)};
    if(distance(m,next)>12)this.actions.moved=true;m.x=next.x;m.y=next.y;
    this.profile.layouts[this.level.id]=this.modules.map(({x,y})=>({x,y}));this.onSave(this.profile);return true;
  }
  restore(){if(this.phase==='running')return false;delete this.profile.layouts[this.level.id];delete this.profile.aims[this.level.id];return this.load(this.level.id);}
  start(){
    if(this.phase!=='planning')return false;
    this.time=0;this.balls=[];this.roots=new Map();this.emitted=0;this.spawn=0;this.burstsUsed=0;this.burstReady=0;this.chains=0;this.lostBalls=0;this.lossCauses={};this.phase='running';this.result=null;
    this.scatter=scatter(this.profile);this.rng=random(this.level.seed);this.profile.attemptSerial++;
    this.attemptId=this.profile.attemptSerial;this.onSave(this.profile);this.event('start',{});return true;
  }
  emit(vx=null){if(this.emitted>=this.level.budget||this.balls.length>=220)return false;const root=this.emitted++;this.roots.set(root,{pending:0,delivered:false,targets:new Set(),score:0,boosted:false,portal:false,chain:false});addBall(this,{root,...(vx===null?{}:{vx})});return true;}
  burst(){
    if(this.phase!=='running'||this.time<this.burstReady||this.burstsUsed>=this.level.bursts||this.emitted>=this.level.budget||this.balls.length>200)return false;
    const size=Math.min(burstSize(this.profile),this.level.budget-this.emitted);
    for(let i=0;i<size;i++)this.emit((i-(size-1)/2)*16);
    this.burstsUsed++;this.burstReady=this.time+8;this.event('burst',{});return true;
  }
  buy(key){if(this.phase==='running')return false;const ok=purchase(this.profile,key);if(ok){this.scatter=scatter(this.profile);this.onSave(this.profile);this.event('upgrade',{});}return ok;}
  retry(){if(this.phase==='running')this.finish('Attempt stopped. Rebuild the route and try again.');this.load(this.level.id);this.event('retry',{});}
  step(dt=DT){
    if(!['planning','running'].includes(this.phase))return;
    this.time+=dt;
    if(this.phase==='planning'){
      this.previewSpawn+=dt;if(this.previewSpawn>=.8){this.previewSpawn=0;addBall(this,{});}physicsStep(this,dt);return;
    }
    this.spawn+=dt;if(this.spawn>=interval(this.profile)){this.spawn-=interval(this.profile);this.emit();}
    physicsStep(this,dt);
    if(this.emitted===this.level.budget&&this.balls.length===0)this.finish();
    else if(this.time>150){for(const root of this.roots.values())root.pending=0;this.balls=[];this.finish('Attempt exceeded its safety limit. Try a clearer route.');}
  }
  finish(forcedReason=null){
    if(this.phase!=='running')return false;
    const m=metrics(this),reasons=forcedReason?[forcedReason]:failures(this,m),won=reasons.length===0;
    this.phase=won?'won':'lost';
    const result={...m,status:this.phase,reason:reasons.join(' '),reasons,duration:this.time,bursts:this.burstsUsed,lossCauses:{...this.lossCauses},modules:this.modules.map(m=>({...m})),aim:this.aim,attemptId:this.attemptId};
    result.stars=stars(this.level,result);
    const old=this.profile.bests[this.level.id],firstWin=won&&!this.profile.complete[this.level.id];
    result.reward=reward(this.level,result,firstWin)+(won?Math.max(0,result.stars-(old?.stars||0))*20:0);
    this.profile.coins=clamp(this.profile.coins+result.reward,0,99999);
    if(won){this.profile.complete[this.level.id]=true;if(!old||result.stars>old.stars||result.efficiency>old.efficiency)this.profile.bests[this.level.id]={stars:Math.max(old?.stars||0,result.stars),efficiency:Math.max(old?.efficiency||0,result.efficiency),score:Math.max(old?.score||0,result.score),duration:Math.min(old?.duration||Infinity,result.duration)};if(this.level.id===0)this.profile.tutorial.stage=3;}
    this.result=result;
    this.profile.journal.push({level:this.level.id,status:result.status,duration:result.duration,efficiency:result.efficiency,reward:result.reward,reason:result.reason});this.profile.journal=this.profile.journal.slice(-40);
    this.onSave(this.profile);this.event(won?'win':'fail',result);return result;
  }
}
