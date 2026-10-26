// Atelier 452 visual components. Presentation only; rules stay in goals.js.
const paths={
 play:'<path d="m9 5 11 7-11 7Z" fill="currentColor"/>',pause:'<path d="M8 5v14M16 5v14" stroke-width="4"/>',
 sound:'<path d="m11 4-6 5H2v6h3l6 5ZM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3v2m-1 3h.01"/>',
 redo:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',next:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
 coin:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><path d="M12 8v8m-2-6h4m-4 4h4"/>',
 target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
 balls:'<circle cx="8" cy="8" r="4"/><circle cx="17" cy="14" r="5"/><circle cx="6" cy="19" r="2"/>',
 accuracy:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/>',
 flow:'<path d="M4 5h12l-3-3m3 3-3 3M2 12h20m-4-3 4 3-4 3M4 19h12l-3-3m3 3-3 3"/>',
 precision:'<path d="M4 4h16l-6 8v8l-4-2v-6Z"/><path d="M7 7h10"/>',
 burst:'<path d="m13 2-9 12h7l-1 8 10-13h-8Z"/>',split:'<path d="M12 22V13M5 3v4l7 6 7-6V3M2 6l3-3 3 3m8 0 3-3 3 3"/>',
 hazard:'<path d="m12 3 10 18H2Z"/><path d="M12 9v5m0 3h.01"/>',
 wrench:'<path d="M14 6a5 5 0 0 0-6 6l-6 6 4 4 6-6a5 5 0 0 0 6-6l-3 3-4-4Z"/>',
 check:'<path d="m5 12 4 5L20 6"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
 star:'<path d="m12 2 3 6.3 7 .9-5.1 5 1.3 7-6.2-3.3L5.8 21l1.3-6.8L2 9.2l7-.9Z" fill="currentColor"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>'
};
export const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]||paths.target}</svg>`;

export function missionView(level,m){
 const conditions=[];let current=m.targeted,total=level.need,label=`Reach ${level.need} target balls`,progress=`${m.targeted} / ${level.need} delivered`;
 if(level.needEach){current=Math.min(...level.targets.map(s=>m.counts[s]));total=level.needEach;label=`Fill both pockets · ${level.needEach} each`;progress=level.targets.map(s=>`P${s+1} ${m.counts[s]}/${total}`).join('  ·  ');}
 if(level.id===0)label='Send 12 balls to the center';
 if(level.portalNeed){current=m.portal;total=level.portalNeed;label=`Make ${total} portal deliveries`;progress=`${current} / ${total} through portal`;}
 if(level.chains){current=m.chains;total=level.chains;label=`Trigger ${total} chain reactions`;progress=`${current} / ${total} reactions`;conditions.push({icon:'target',text:`${m.targeted}/${level.need} delivered`,done:m.targeted>=level.need});}
 if(level.boosted)conditions.push({icon:'burst',text:`${m.boosted}/${level.boosted} boosted`,done:m.boosted>=level.boosted});
 if(level.minEfficiency)conditions.push({icon:'accuracy',text:`Accuracy ≥ ${Math.round(level.minEfficiency*100)}%`,done:m.emitted>0&&m.efficiency>=level.minEfficiency});
 if(level.maxLoss!==undefined)conditions.push({icon:'hazard',text:`Original loss ${Math.round(m.lossRate*100)}% ≤ ${Math.round(level.maxLoss*100)}%`,done:m.emitted>0&&m.lossRate<=level.maxLoss});
 return {label,progress,ratio:Math.min(1,total?current/total:0),conditions};
}

// A visual count-up only. The engine has already awarded the real coins.
export function animateReward(element,amount,reducedMotion=false){
 if(element._rewardFrame)cancelAnimationFrame(element._rewardFrame);
 if(reducedMotion||!amount){element.textContent=amount.toLocaleString();return;}
 const start=performance.now(),step=now=>{const p=Math.min(1,(now-start)/650);element.textContent=Math.round(amount*(1-(1-p)**3)).toLocaleString();if(p<1)element._rewardFrame=requestAnimationFrame(step);};
 element.textContent='0';element._rewardFrame=requestAnimationFrame(step);
}
