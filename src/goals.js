export function metrics(engine){
  let delivered=0,failed=0,targeted=0,portal=0,boosted=0,finished=0,score=0;const counts=[0,0,0,0,0];
  for(const root of engine.roots.values()){
    if(root.pending===0)finished++;
    if(root.delivered)delivered++;
    if(root.pending===0&&!root.delivered)failed++;
    const hits=[...root.targets];if(hits.length)targeted++;
    for(const slot of hits)counts[slot]++;
    if(hits.length&&root.portal)portal++;
    if(hits.length&&root.boosted)boosted++;
    score+=root.score;
  }
  const emitted=engine.emitted;
  return {delivered,failed,targeted,portal,boosted,finished,counts,score,emitted,efficiency:emitted?targeted/emitted:0,lossRate:emitted?failed/emitted:0,chains:engine.chains};
}
export function failures(engine,m=metrics(engine)){
  const l=engine.level,a=[];
  if(!engine.actions.moved)a.push('Move at least one module to build your own route.');
  if(l.id===0&&!engine.actions.aimed)a.push('Aim the emitter after moving the multiplier.');
  if(l.need&&m.targeted<l.need)a.push(`Target deliveries: ${m.targeted}/${l.need}.`);
  if(l.needEach)for(const slot of l.targets)if(m.counts[slot]<l.needEach)a.push(`Pocket ${slot+1}: ${m.counts[slot]}/${l.needEach}.`);
  if(l.boosted&&m.boosted<l.boosted)a.push(`Boosted target balls: ${m.boosted}/${l.boosted}.`);
  if(l.portalNeed&&m.portal<l.portalNeed)a.push(`Portal deliveries: ${m.portal}/${l.portalNeed}.`);
  if(l.chains&&m.chains<l.chains)a.push(`Three-hit reactions: ${m.chains}/${l.chains}.`);
  if(l.minEfficiency&&m.efficiency+1e-9<l.minEfficiency)a.push(`Target efficiency ${Math.round(m.efficiency*100)}%: need ${l.minEfficiency*100}%.`);
  if(l.maxLoss!==undefined&&m.lossRate>l.maxLoss+1e-9)a.push(`Lost ${Math.round(m.lossRate*100)}%: maximum ${l.maxLoss*100}%.`);
  return a;
}
export function goalText(level){
  if(level.id===0)return 'Deliver 12 balls to the center, with at least 8 boosted.';
  if(level.chains)return `Complete ${level.chains} three-hit reactions and deliver ${level.need} balls to lit pockets.`;
  if(level.portalNeed)return `Send ${level.portalNeed} balls through the portal into the far-right pocket.`;
  let text=level.needEach?`Deliver ${level.needEach} balls to EACH lit pocket.`:`Deliver ${level.need} balls to the lit pocket${level.targets.length>1?'s':''}.`;
  if(level.minEfficiency)text+=` At least ${Math.round(level.minEfficiency*100)}% target efficiency.`;
  if(level.maxLoss!==undefined)text+=` Lose no more than ${Math.round(level.maxLoss*100)}%.`;
  return text;
}
export function progressText(engine,m=metrics(engine)){
  const l=engine.level;
  if(l.chains)return `${m.chains}/${l.chains} chains · ${m.targeted}/${l.need} target balls`;
  if(l.portalNeed)return `${m.portal}/${l.portalNeed} portal deliveries`;
  if(l.needEach)return l.targets.map(s=>`Pocket ${s+1}: ${m.counts[s]}/${l.needEach}`).join(' · ');
  return `${m.targeted}/${l.need} target balls`+(l.boosted?` · ${m.boosted}/${l.boosted} boosted`:'');
}
