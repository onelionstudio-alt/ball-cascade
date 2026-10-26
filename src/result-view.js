// Read-only explanation of the existing goals. Never determines the outcome.
export function resultView(level,r,actions){
 const items=[],add=(id,label,value,done)=>items.push({id,label,value,done});
 if(level.need)add('delivered','Target deliveries',`${r.targeted} / ${level.need}`,r.targeted>=level.need);
 if(level.needEach)for(const slot of level.targets)add('pocket'+slot,`Pocket ${slot+1}`,`${r.counts[slot]} / ${level.needEach}`,r.counts[slot]>=level.needEach);
 if(level.boosted)add('boosted','Boosted deliveries',`${r.boosted} / ${level.boosted}`,r.boosted>=level.boosted);
 if(level.portalNeed)add('portal','Portal deliveries',`${r.portal} / ${level.portalNeed}`,r.portal>=level.portalNeed);
 if(level.chains)add('chains','Three-hit reactions',`${r.chains} / ${level.chains}`,r.chains>=level.chains);
 if(level.minEfficiency)add('accuracy','Target hit rate',`${Math.round(r.efficiency*100)}% / ${level.minEfficiency*100}%`,r.efficiency+1e-9>=level.minEfficiency);
 if(level.maxLoss!==undefined)add('loss','Lost originals',`${Math.round(r.lossRate*100)}% / max ${level.maxLoss*100}%`,r.lossRate<=level.maxLoss+1e-9);
 add('moved','Position a piece',actions.moved?'Done':'Not yet',actions.moved);
 if(level.id===0)add('aimed','Aim the nozzle',actions.aimed?'Done':'Not yet',actions.aimed);
 const failed=items.filter(i=>!i.done);let main=failed.find(i=>['boosted','portal','chains'].includes(i.id))||failed[0];
 if(!main&&r.status==='lost'){main={id:'attempt',label:'Finish the cascade',value:r.reason||'Attempt incomplete',done:false};items.push(main);}
 const tips={boosted:'Place the ×2 booster in the ball stream before launching.',portal:'Aim into the glowing entrance. Follow the exit to its target pocket.',chains:'Feed the first gold activator so the reaction reaches the next one.',accuracy:'Aim for the glowing target pockets. Safe gray pockets do not count toward this goal.',loss:'Route around the red teeth. Time your burst for an open window.',moved:'Move a piece into the stream to build your own route.',aimed:'Drag the nozzle left or right before launching.',attempt:'Try a clearer route so every ball can finish.'};
 return {items,summary:main?`${main.label}: ${main.value}`:'Every condition is complete',tip:main?(tips[main.id]||'Redirect the stream toward the glowing pockets. Split it early when both sides need balls.'):'',incomplete:items.filter(i=>!i.done).length};
}
