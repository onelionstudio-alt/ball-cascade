import {mkdir,copyFile,cp,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
// Export only runtime assets. Tests, reports and repository metadata stay out.
const target=resolve('artifacts/site');await mkdir(target,{recursive:true});
for(const file of ['index.html','game.js','styles.css'])await copyFile(file,resolve(target,file));
await cp('src',resolve(target,'src'),{recursive:true});
await writeFile(resolve(target,'build.json'),JSON.stringify({name:'Ball Cascade: Cascade Challenge',version:'0.3.1',entry:'index.html',sdk:'none; future adapter only'},null,2));
console.log(target);
