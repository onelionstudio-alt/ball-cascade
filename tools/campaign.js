import {Engine} from '../src/engine.js';
import {fresh} from '../src/save.js';
import {LEVELS} from '../src/levels.js';
import {DT} from '../src/math.js';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
export function configure(engine,strategy='strong',override=null){
  const l=engine.level,plan=override||(strategy==='strong'?l.solution:strategy==='medium'?{aim:l.solution.aim,modules:l.modules.map(m=>[m.x+25,m.y])}:{aim:480,modules:l.modules.map(m=>[m.x+20,m.y])});
  engine.aimTo(plan.aim);plan.modules.forEach(([x,y],id)=>engine.moveModule(id,x,y));return plan;
}
export function runAttempt(engine,{strategy='strong',override=null,bursts=true}={}){
  const plan=configure(engine,strategy,override);engine.start();
  for(let tick=0;tick<120*155&&engine.phase==='running';tick++){
    if(bursts&&engine.time>=engine.burstReady)engine.burst();engine.step(DT);
  }
  if(!engine.result)throw Error('Attempt did not terminate');return {...engine.result,plan};
}
export function campaign(strategy='strong',{upgrade=true}={}){
  const profile=fresh(),engine=new Engine(profile),rows=[];
  for(const level of LEVELS){
    if(!engine.load(level.id))break;
    if(upgrade)for(const key of ['precision','flow','burst'])while(profile.upgrades[key]<3&&engine.buy(key)){}
    const result=runAttempt(engine,{strategy});rows.push({level:level.id+1,name:level.name,status:result.status,duration:result.duration,attempts:1,efficiency:result.efficiency,lossRate:result.lossRate,counts:result.counts,chains:result.chains,portal:result.portal,reward:result.reward,coins:profile.coins,upgrades:{...profile.upgrades},reason:result.reason,plan:result.plan});
    if(result.status!=='won')break;
  }
  return {strategy,completed:profile.complete.filter(Boolean).length,totalSeconds:rows.reduce((a,r)=>a+r.duration,0),rows};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
  const report=campaign('strong');console.table(report.rows.map(r=>({level:r.level,name:r.name,status:r.status,seconds:r.duration.toFixed(1),efficiency:(r.efficiency*100).toFixed(0)+'%',reason:r.reason})));await mkdir('docs',{recursive:true});await writeFile('docs/campaign-strong.json',JSON.stringify(report,null,2));if(report.completed!==12)process.exitCode=1;
}
