import test from 'node:test';import assert from 'node:assert/strict';
import {LEVELS} from '../src/levels.js';import {failures} from '../src/goals.js';import {resultView} from '../src/result-view.js';
function perfect(l){return{status:'won',emitted:l.budget,targeted:l.budget,counts:Array(5).fill(l.budget),boosted:l.budget,portal:l.budget,chains:l.chains||0,efficiency:1,lossRate:0};}
for(const l of LEVELS)test(`${l.name}: every required result condition agrees with original rules`,()=>{
 const actions={moved:true,aimed:true},good=perfect(l);assert(resultView(l,good,actions).items.every(i=>i.done));
 const cases=[{r:good,a:{...actions,moved:false}}];if(l.id===0)cases.push({r:good,a:{...actions,aimed:false}});
 for(const [key,n]of [['targeted',l.need],['boosted',l.boosted],['portal',l.portalNeed],['chains',l.chains]])if(n)cases.push({r:{...good,[key]:n-1},a:actions});
 if(l.needEach)for(const slot of l.targets){const counts=[...good.counts];counts[slot]=l.needEach-1;cases.push({r:{...good,counts},a:actions});}
 if(l.minEfficiency)cases.push({r:{...good,efficiency:l.minEfficiency-.01},a:actions});if(l.maxLoss!==undefined)cases.push({r:{...good,lossRate:l.maxLoss+.01},a:actions});
 for(const {r,a}of cases){const reasons=failures({level:l,actions:a},r),view=resultView(l,{...r,status:reasons.length?'lost':'won'},a);assert(reasons.length>0);assert.equal(view.incomplete,reasons.length);assert(view.summary&&view.tip);}
});
test('36 deliveries and 100% accuracy never conceal a missing multiplier',()=>{const l=LEVELS[0],r={...perfect(l),status:'lost',boosted:0},view=resultView(l,r,{moved:true,aimed:true});assert.equal(view.items.find(i=>i.id==='delivered').done,true);assert.equal(view.items.find(i=>i.id==='boosted').done,false);assert.match(view.summary,/Boosted/);assert.match(view.tip,/×2/);});
test('forced incomplete attempt is explained even if numeric thresholds were met',()=>{const l=LEVELS[2],view=resultView(l,{...perfect(l),status:'lost',reason:'Safety limit reached'},{moved:true,aimed:true});assert.equal(view.incomplete,1);assert.match(view.summary,/Safety/);});
