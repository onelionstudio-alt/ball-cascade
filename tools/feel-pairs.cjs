// Identical save snapshots copied from the actual earned browser campaign.
// These comparison contexts are not counted as campaign completion evidence.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://127.0.0.1:8020/';let browser;
(async()=>{
 const earned=JSON.parse(await fs.readFile('docs/feel/after/results.json','utf8')).report.profile;
 const saved=JSON.stringify(earned),hash=crypto.createHash('sha256').update(saved).digest('hex');
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const records=[];
 for(const mode of ['before','after'])for(const [name,width,height]of [['desktop',1440,900],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height}});await context.addInitScript(data=>localStorage.setItem('ball-cascade-v3',data),saved);const page=await context.newPage();await page.goto(base+(mode==='before'?'.qa/before-site/':''));await page.locator('[data-level="0"]').waitFor();
  await page.screenshot({path:path.resolve(`docs/feel/${mode}/paired-${name}.png`),fullPage:true,animations:'disabled'});
  const coins=(await page.locator('#coins').innerText()).replace(/\D/g,'');assert.equal(Number(coins),earned.coins);assert.equal(await page.locator('#coordx').inputValue(),String(Math.round(earned.aims[0])));
  records.push({mode,name,width,height,coins:Number(coins),aim:earned.aims[0],state:await page.locator('#state').innerText()});await context.close();
 }
 const matrix=[],context=await browser.newContext();await context.addInitScript(data=>localStorage.setItem('ball-cascade-v3',data),saved);const page=await context.newPage();await page.goto(base);await page.locator('[data-level]').first().waitFor();
 for(const [name,width,height]of [['iphone',390,844],['android',360,800],['compact-iphone',375,667],['tablet',768,1024],['landscape',844,390]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(100);
  for(let id=0;id<12;id++){
   await page.locator(`[data-level="${id}"]`).click();
   const layout=await page.evaluate(()=>{const box=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom,scrollW:e.scrollWidth,clientW:e.clientWidth,scrollH:e.scrollHeight,clientH:e.clientHeight};};return{scroll:document.documentElement.scrollWidth,width:innerWidth,mission:box('.mission'),canvas:box('canvas'),launch:box('#launch'),pause:box('#pause')};});
   assert(layout.scroll<=width,`${name}/${id+1}: body overflow`);assert(layout.mission.scrollW<=layout.mission.clientW+1,`${name}/${id+1}: mission text overflow`);assert(layout.mission.scrollH<=layout.mission.clientH+1,`${name}/${id+1}: hidden mission conditions`);assert(layout.launch.h>=44&&layout.pause.h>=44&&layout.pause.w>=44,`${name}/${id+1}: touch target`);assert(layout.canvas.h>0);matrix.push({viewport:name,level:id+1,...layout});
   if(id===0)await page.screenshot({path:path.resolve(`docs/feel/after/07-${name}.png`),fullPage:true,animations:'disabled'});
   if(name==='iphone'&&id===11)await page.screenshot({path:path.resolve('docs/feel/after/11-mobile-master.png'),fullPage:true,animations:'disabled'});
  }
 }
 await fs.writeFile('docs/feel/comparison-state.json',JSON.stringify({source:'Unmodified profile earned by the after Chromium UI campaign',profileSha256:hash,records},null,2));await fs.writeFile('docs/feel/after/layout-matrix.json',JSON.stringify(matrix,null,2));await browser.close();console.log('Four matched-profile screenshots and',matrix.length,'responsive mission checks passed');
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
