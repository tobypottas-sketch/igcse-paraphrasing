import fs from 'node:fs';
const file='index.html';
let html=fs.readFileSync(file,'utf8');
const once=(before,after,label)=>{ if(html.includes(after)) return; if(!html.includes(before)) throw new Error('Missing '+label); html=html.replace(before,after); };

once("const STORE_KEY='igcse0511_full_dashboard_v1';","const STORE_KEY_BASE='igcse0511_full_dashboard_v1';\nlet hubStorageNamespace='anonymous';\nlet paraphrasingAppInitialised=false;\nlet paraphrasingDomReady=false;\nfunction storageKey(){ return hubStorageNamespace==='anonymous' ? STORE_KEY_BASE : STORE_KEY_BASE+':'+hubStorageNamespace; }\nfunction applyHubStorageNamespace(namespace){\n const clean=String(namespace||'').trim().replace(/[^a-zA-Z0-9_-]/g,'').slice(0,96);\n if(!clean || clean===hubStorageNamespace) return;\n hubStorageNamespace=clean;\n MEMORY_STATE_CACHE=null;\n}\nwindow.addEventListener('message',function(event){\n if(window.parent===window || event.source!==window.parent || event.origin!==window.location.origin) return;\n const data=event.data;\n if(!data || data.type!=='self-study-hub-context') return;\n applyHubStorageNamespace(data.storageNamespace);\n initialiseParaphrasingApp();\n});",'storage constant');

html=html.replaceAll('window.localStorage.getItem(STORE_KEY)','window.localStorage.getItem(storageKey())')
 .replaceAll('window.localStorage.setItem(STORE_KEY, value)','window.localStorage.setItem(storageKey(), value)');

once("window.addEventListener('DOMContentLoaded', renderAll);","function initialiseParaphrasingApp(){\n if(paraphrasingAppInitialised || !paraphrasingDomReady) return;\n paraphrasingAppInitialised=true;\n renderAll();\n}\nwindow.addEventListener('DOMContentLoaded',function(){\n paraphrasingDomReady=true;\n if(window.parent===window) initialiseParaphrasingApp();\n});",'deferred init');

fs.writeFileSync(file,html);
