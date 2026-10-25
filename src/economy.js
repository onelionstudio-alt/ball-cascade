export const TRACKS=[
  {id:'flow',name:'Flow tuning',description:'Slightly faster automatic flow',base:75,step:55},
  {id:'precision',name:'Steady nozzle',description:'Less sideways scatter at the emitter',base:60,step:50},
  {id:'burst',name:'Burst reserve',description:'An extra ball in each special launch',base:90,step:65}
];
export const CAP=6;
export function price(profile,key){const t=TRACKS.find(t=>t.id===key);return t?t.base+t.step*(profile.upgrades[key]||0):Infinity;}
export function purchase(profile,key){if(!TRACKS.some(t=>t.id===key)||profile.upgrades[key]>=CAP)return false;const cost=price(profile,key);if(profile.coins<cost)return false;profile.coins-=cost;profile.upgrades[key]++;return true;}
export const interval=profile=>.7-.025*profile.upgrades.flow;
export const burstSize=profile=>8+profile.upgrades.burst;
export const scatter=profile=>Math.max(6,32-4*profile.upgrades.precision);
export function reward(level,result,firstWin){
  if(result.status!=='won')return 0;
  return firstWin?100+level.id*35:0;
}
export function stars(level,result){if(result.status!=='won')return 0;return result.efficiency>=.85&&result.lossRate<=.08?3:result.efficiency>=.7&&result.lossRate<=.2?2:1;}
