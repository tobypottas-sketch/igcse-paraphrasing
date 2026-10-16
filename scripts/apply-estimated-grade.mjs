import fs from 'node:fs';
const path='index.html';
let html=fs.readFileSync(path,'utf8');
if(html.includes('id="scoreGrade"')) process.exit(0);
function once(a,b,label){if(!html.includes(a)) throw new Error(`Missing patch anchor: ${label}`); html=html.replace(a,b);}
const card='<div class="stat-card"><div class="stat-value" id="scoreAccuracy">0%</div><div class="stat-label">Success rate</div></div>';
once(card,card+'<div class="stat-card"><div class="stat-value" id="scoreGrade">—</div><div class="stat-label">Indicative 0511 R&W grade</div><div class="stat-label" style="margin-top:6px">June 2026 · Component 12 · completed exam-style work only · not an official Cambridge result</div></div>','grade card');
const anchor='function renderResults(){';
const helper=`function estimate0511Component12Grade(percent){\n const thresholds=[55,50,45,40,35,30,25];\n const grades=['A','B','C','D','E','F','G'];\n const raw=(Number(percent)||0)*60/100;\n for(let i=0;i<thresholds.length;i++){ if(raw>=thresholds[i]) return grades[i]; }\n return 'U';\n}\n`;
once(anchor,helper+anchor,'helper');
const first=" const st=getState(), attempts=st.records.length, strong=st.records.filter(r=>r.strong).length, partial=attempts-strong, acc=attempts?Math.round((strong/attempts)*100):0;";
once(first,first+"\n const examRecords=st.records.filter(r=>r.setId);\n const examStrong=examRecords.filter(r=>r.strong).length;\n const examAcc=examRecords.length?Math.round((examStrong/examRecords.length)*100):0;\n const hasCompletedSet=activities.some((_,idx)=>isSetComplete(idx));",'exam records');
const scores=" document.getElementById('scoreAttempts').textContent=attempts; document.getElementById('scoreStrong').textContent=strong; document.getElementById('scorePartial').textContent=partial; document.getElementById('scoreAccuracy').textContent=acc+'%'; document.getElementById('progressFill').style.width=Math.min(100,attempts*2)+'%';";
once(scores,scores+"\n document.getElementById('scoreGrade').textContent=hasCompletedSet&&examRecords.length?estimate0511Component12Grade(examAcc):'—';",'grade render');
fs.writeFileSync(path,html);
