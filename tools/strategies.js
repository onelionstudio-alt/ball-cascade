import {Engine} from '../src/engine.js';
import {fresh,sanitize} from '../src/save.js';
import {LEVELS} from '../src/levels.js';
import {runAttempt} from './campaign.js';
import {writeFile} from 'node:fs/promises';

// Unlock only by actually playing the rules, then compare replay attempts from
// that earned profile. No completion flags, goals, money or ball states are set.
const earned=fresh(),player=new Engine(earned);
for(const l of LEVELS){player.load(l.id);const r=runAttempt(player);if(r.status!=='won')throw Error(`Cannot unlock ${l.id+1}: ${r.reason}`);}
const rows=[];
for(const l of LEVELS){
  const row={level:l.id+1,name:l.name,strategies:{}};
  for(const strategy of ['weak','medium','strong']){
    const e=new Engine(sanitize(earned));e.load(l.id);const r=runAttempt(e,{strategy});
    row.strategies[strategy]={status:r.status,duration:r.duration,efficiency:r.efficiency,counts:r.counts,chains:r.chains,portal:r.portal,lossRate:r.lossRate,score:r.score,reason:r.reason,plan:r.plan};
  }
  if(l.alternate){const e=new Engine(sanitize(earned));e.load(l.id);const r=runAttempt(e,{override:l.alternate});row.alternate={status:r.status,efficiency:r.efficiency,reason:r.reason,plan:r.plan};}
  rows.push(row);
}
console.table(rows.map(r=>({level:r.level,name:r.name,weak:r.strategies.weak.status,medium:r.strategies.medium.status,strong:r.strategies.strong.status,weakEfficiency:Math.round(r.strategies.weak.efficiency*100),strongEfficiency:Math.round(r.strategies.strong.efficiency*100),alternate:r.alternate?.status||''})));
await writeFile('docs/strategy-comparison.json',JSON.stringify(rows,null,2));
if(rows.some(r=>r.strategies.strong.status!=='won'||r.strategies.weak.status==='won'||r.alternate&&r.alternate.status!=='won'))process.exitCode=1;
