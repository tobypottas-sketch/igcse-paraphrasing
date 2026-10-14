import fs from 'node:fs';

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const before = ` box.innerHTML=st.records.slice().reverse().slice(0,30).map(r=>{const locked=r.setId && !isSetComplete(parseInt(r.setId.replace('set',''))-1); return \`<div class="review-item \${r.strong?'good':'bad'}"><strong>\${r.area}</strong><div class="answer-box"><strong>Task:</strong> \${r.prompt}</div><div class="answer-box"><strong>Your answer:</strong> \${r.user||'No answer'}</div><div class="answer-box"><strong>Model / accepted idea:</strong> \${locked?'Hidden until the whole set is complete':r.accepted}</div><div class="answer-box"><strong>Why:</strong> \${r.note}</div></div>\`;}).join('');`;

const after = ` box.innerHTML=st.records.slice().reverse().slice(0,30).map(r=>{const locked=r.setId && !isSetComplete(parseInt(r.setId.replace('set',''))-1); const reviewUnlocked=!locked; return \`<div class="review-item \${reviewUnlocked?(r.strong?'good':'bad'):''}"><strong>\${r.area}</strong><div class="answer-box"><strong>Task:</strong> \${r.prompt}</div><div class="answer-box"><strong>Your answer:</strong> \${r.user||'No answer'}</div><div class="answer-box"><strong>Model / accepted idea:</strong> \${reviewUnlocked?r.accepted:'Hidden until the whole set is complete'}</div><div class="answer-box"><strong>Why:</strong> \${reviewUnlocked?r.note:'Hidden until the whole set is complete'}</div></div>\`;}).join('');`;

if (!html.includes(before)) throw new Error('Expected vulnerable Review renderer not found.');
html = html.replace(before, after);
fs.writeFileSync(file, html);
