import {Engine} from '../src/engine.js';
import {fresh,sanitize} from '../src/save.js';
import {LEVELS} from '../src/levels.js';
import {runAttempt} from './campaign.js';
import {writeFile} from 'node:fs/promises';
const earned=fresh(),player=new Engine(earned);
for(const l of LEVELS){player.load(l.id);if(runAttempt(player).status!=='won')throw Error('Campaign did not unlock');}
const rows=[];
// Explore a 9-route neighborhood, not a single pixel-perfect demonstration.
for(const l of LEVELS){const trials=[];for(const dx of [-15,0,15])for(const dy of [-12,0,12]){const e=new Engine(sanitize(earned));e.load(l.id);const plan={aim:l.solution.aim+dx,modules:l.solution.modules.map(([x,y])=>[x+dx,y+dy])};const r=runAttempt(e,{override:plan});trials.push({dx,dy,status:r.status,efficiency:r.efficiency,reason:r.reason});}rows.push({level:l.id+1,trials,won:trials.filter(t=>t.status==='won').length});}
for(const key of ['precision','flow','burst'])while(player.buy(key)){}
const maxUpgradeRows=LEVELS.map(l=>{const e=new Engine(sanitize(earned));e.load(l.id);const r=runAttempt(e);return{level:l.id+1,status:r.status,efficiency:r.efficiency,reason:r.reason};});
console.table(rows.map(r=>({level:r.level,nearbyWins:r.won,of:9})));console.table(maxUpgradeRows);
await writeFile('docs/robustness.json',JSON.stringify({neighborhood:rows,maxUpgradeRows,earnedUpgrades:earned.upgrades},null,2));
if(rows.some(r=>r.won<5)||maxUpgradeRows.some(r=>r.status!=='won'))process.exitCode=1;
