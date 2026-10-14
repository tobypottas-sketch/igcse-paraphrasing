import fs from 'node:fs';

const file='index.html';
let html=fs.readFileSync(file,'utf8');

if(
  html.includes("function examResponseKey(...parts)") &&
  html.includes("function uniqueExerciseCount(records,setId,exercise)") &&
  html.includes("const starterLocked=getMode()==='exam'")
){
  console.log('Exam hardening already applied.');
  process.exit(0);
}

function replaceOnce(before,after,label){
  if(!html.includes(before)) throw new Error(`Expected ${label} source not found.`);
  html=html.replace(before,after);
}

replaceOnce(
  `function getMode(){ return getState().mode || 'practice'; }`,
  `function getMode(){ return getState().mode || 'practice'; }\nfunction examResponseKey(...parts){ return parts.map(v=>String(v)).join(':'); }\nfunction isExamResponseLocked(key){ const st=getState(); return !!(st.examLocks && st.examLocks[key]); }\nfunction lockExamResponse(key){ const st=getState(); st.examLocks=st.examLocks || {}; st.examLocks[key]=true; saveState(st); }`,
  'Exam response helpers anchor'
);

replaceOnce(
  `function switchTab(tab){document.querySelectorAll('.tab-btn').forEach(btn=>btn.classList.toggle('active', btn.dataset.tab===tab));document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));document.getElementById('panel-'+tab).classList.add('active');if(tab==='review')renderReview();}`,
  `function getActiveSetIndex(){\n const active=document.querySelector('.tab-btn.active');\n const tab=active && active.dataset ? active.dataset.tab : '';\n return ['set1','set2','set3','set4','set5'].indexOf(tab);\n}\nfunction canOpenResults(){\n if(getMode()!=='exam') return true;\n const idx=getActiveSetIndex();\n return idx>=0 && isSetComplete(idx);\n}\nfunction switchTab(tab){\n if(tab==='results' && !canOpenResults()){\n   const n=document.getElementById('modeNotice');\n   if(n) n.textContent='Complete the current Exam set before viewing Results.';\n   return;\n }\n document.querySelectorAll('.tab-btn').forEach(btn=>btn.classList.toggle('active', btn.dataset.tab===tab));\n document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));\n document.getElementById('panel-'+tab).classList.add('active');\n if(tab==='review')renderReview();\n}`,
  'switchTab results gate'
);

const completeRegex=/function isSetComplete\(i\)\{\n const st=getState\(\), setId='set'\+\(i\+1\);\n return st\.records\.filter\(r=>r\.setId===setId && r\.area\.includes\('EX1'\)\)\.length>=3 &&\n        st\.records\.filter\(r=>r\.setId===setId && r\.area\.includes\('EX2'\)\)\.length>=4 &&\n        st\.records\.filter\(r=>r\.setId===setId && r\.area\.includes\('EX3'\)\)\.length>=1 &&\n        st\.records\.filter\(r=>r\.setId===setId && r\.area\.includes\('EX4'\)\)\.length>=1;\n\}/;
if(!completeRegex.test(html)) throw new Error('Expected vulnerable isSetComplete source not found.');
html=html.replace(completeRegex,`function uniqueExerciseCount(records,setId,exercise){\n const keys=new Set();\n records.filter(r=>r.setId===setId && r.area.includes(exercise)).forEach(r=>keys.add(r.area+'|'+r.prompt));\n return keys.size;\n}\nfunction isSetComplete(i){\n const st=getState(), setId='set'+(i+1);\n return uniqueExerciseCount(st.records,setId,'EX1')>=3 &&\n        uniqueExerciseCount(st.records,setId,'EX2')>=4 &&\n        uniqueExerciseCount(st.records,setId,'EX3')>=1 &&\n        uniqueExerciseCount(st.records,setId,'EX4')>=1;\n}`);

replaceOnce(
  `function checkStarterChoice(prefix,idx,optIdx,btn){\n const list=prefix==='pm'?currentStarterSet.phraseMatch:currentStarterSet.sentenceMatch; const task=list[idx]; const parent=btn.parentElement; const mode=getMode();\n const strong=optIdx===task.answer;`,
  `function checkStarterChoice(prefix,idx,optIdx,btn){\n const list=prefix==='pm'?currentStarterSet.phraseMatch:currentStarterSet.sentenceMatch; const task=list[idx]; const parent=btn.parentElement; const mode=getMode();\n const examKey=examResponseKey('starter-choice',prefix,idx);\n if(mode==='exam' && isExamResponseLocked(examKey)){ showExamRecordedFeedback(\`${'${prefix}'}Feedback_${'${idx}'}\`); return; }\n const strong=optIdx===task.answer;`,
  'starter choice lock guard'
);
replaceOnce(
  `   recordResult(prefix==='pm'?'Starter Match: Phrase':'Starter Match: Sentence', task.stem, task.options[optIdx], task.options[task.answer], strong, 'Recorded in exam mode.', null, prefix==='pm'?'phrase_match':'sentence_match');\n   return;`,
  `   recordResult(prefix==='pm'?'Starter Match: Phrase':'Starter Match: Sentence', task.stem, task.options[optIdx], task.options[task.answer], strong, 'Recorded in exam mode.', null, prefix==='pm'?'phrase_match':'sentence_match');\n   lockExamResponse(examKey);\n   Array.from(parent.children).forEach(b=>b.disabled=true);\n   return;`,
  'starter choice lock commit'
);

replaceOnce(
  ` const mode=getMode();\n const attempt=incrementAttemptCount(prefix, idx);`,
  ` const mode=getMode();\n const examKey=examResponseKey('starter-write',prefix,idx);\n if(mode==='exam' && isExamResponseLocked(examKey)){ showExamRecordedFeedback(\`${'${prefix}'}Feedback_${'${idx}'}\`); return; }\n const attempt=incrementAttemptCount(prefix, idx);`,
  'starter write lock guard'
);
replaceOnce(
  ` recordResult(prefix==='ws'?'Starter Write: Synonym':'Starter Write: Paraphrase', task.prompt, user, task.accepted[0], strong, note, null, skill);\n}`,
  ` recordResult(prefix==='ws'?'Starter Write: Synonym':'Starter Write: Paraphrase', task.prompt, user, task.accepted[0], strong, note, null, skill);\n if(mode==='exam'){ lockExamResponse(examKey); const input=document.getElementById(\`${'${prefix}'}_${'${idx}'}\`); if(input) input.disabled=true; }\n}`,
  'starter write lock commit'
);

replaceOnce(
  ` const parent=btn.parentElement;\n const mode=getMode();\n Array.from(parent.children).forEach((b)=>{b.classList.remove('selected','correct','wrong');});`,
  ` const parent=btn.parentElement;\n const mode=getMode();\n const examKey=examResponseKey(setId,exType,idx);\n if(mode==='exam' && isExamResponseLocked(examKey)){ showExamRecordedFeedback(\`${'${setId}'}_${'${exType}'}_${'${idx}'}\`); return; }\n Array.from(parent.children).forEach((b)=>{b.classList.remove('selected','correct','wrong');});`,
  'exam-style choice lock guard'
);
replaceOnce(
  `   recordResult(\`Activity ${'${i+1}'} ${'${exType.toUpperCase()}'}\`, task.q, exType==='ex1'?task.shuffled.options[optIdx]:['A','B','C','D'][optIdx], exType==='ex1'?task.shuffled.options[answerIndex]:task.answer, strong, 'Recorded in exam mode.', setId, skill);\n   return;`,
  `   recordResult(\`Activity ${'${i+1}'} ${'${exType.toUpperCase()}'}\`, task.q, exType==='ex1'?task.shuffled.options[optIdx]:['A','B','C','D'][optIdx], exType==='ex1'?task.shuffled.options[answerIndex]:task.answer, strong, 'Recorded in exam mode.', setId, skill);\n   lockExamResponse(examKey);\n   Array.from(parent.children).forEach(b=>b.disabled=true);\n   return;`,
  'exam-style choice lock commit'
);

replaceOnce(
  `function checkExercise3(i){\n const set=activities[i], setId='set'+(i+1);`,
  `function checkExercise3(i){\n const set=activities[i], setId='set'+(i+1);\n const examKey=examResponseKey(setId,'ex3');\n if(getMode()==='exam' && isExamResponseLocked(examKey)){ showExamRecordedFeedback(\`${'${setId}'}_ex3_feedback\`); return; }`,
  'Exercise 3 lock guard'
);
replaceOnce(
  `   recordResult(\`Activity ${'${i+1}'} EX3\`, 'Heading-based notes', h10.concat(h11).filter(Boolean).join(' | '), 'Accepted by heading in any order', strong, 'Recorded in exam mode.', setId, 'ex3');\n   return;`,
  `   recordResult(\`Activity ${'${i+1}'} EX3\`, 'Heading-based notes', h10.concat(h11).filter(Boolean).join(' | '), 'Accepted by heading in any order', strong, 'Recorded in exam mode.', setId, 'ex3');\n   lockExamResponse(examKey);\n   document.querySelectorAll(\`#${'${setId}'}Container .note-row input\`).forEach(el=>el.disabled=true);\n   const checkBtn=document.querySelector(\`[data-action="check-ex3"][data-set="${'${i}'}"]\`); if(checkBtn) checkBtn.disabled=true;\n   return;`,
  'Exercise 3 lock commit'
);

replaceOnce(
  `function checkExercise4(i){\n const set=activities[i], setId='set'+(i+1), text=document.getElementById(\`${'${setId}'}_summary\`).value.trim();`,
  `function checkExercise4(i){\n const set=activities[i], setId='set'+(i+1);\n const examKey=examResponseKey(setId,'ex4');\n if(getMode()==='exam' && isExamResponseLocked(examKey)){ showExamRecordedFeedback(\`${'${setId}'}_ex4_feedback\`); return; }\n const text=document.getElementById(\`${'${setId}'}_summary\`).value.trim();`,
  'Exercise 4 lock guard'
);
replaceOnce(
  `   recordResult(\`Activity ${'${i+1}'} EX4\`, set.ex4_title, text, 'A concise own-words summary with several relevant points', strong, 'Recorded in exam mode.', setId, 'ex4');\n   return;`,
  `   recordResult(\`Activity ${'${i+1}'} EX4\`, set.ex4_title, text, 'A concise own-words summary with several relevant points', strong, 'Recorded in exam mode.', setId, 'ex4');\n   lockExamResponse(examKey);\n   const summary=document.getElementById(\`${'${setId}'}_summary\`); if(summary) summary.disabled=true;\n   const checkBtn=document.querySelector(\`[data-action="check-ex4"][data-set="${'${i}'}"]\`); if(checkBtn) checkBtn.disabled=true;\n   return;`,
  'Exercise 4 lock commit'
);

replaceOnce(
  ` else notice.textContent='Starter results always show model answers. Exam-style set answers unlock only after the whole set is complete.';`,
  ` else notice.textContent=getMode()==='exam'?'Starter model answers stay hidden in Exam mode.':'Starter results show model answers in Practice mode. Exam-style set answers unlock only after the whole set is complete.';`,
  'Review starter notice'
);
replaceOnce(
  ` box.innerHTML=st.records.slice().reverse().slice(0,30).map(r=>{const locked=r.setId && !isSetComplete(parseInt(r.setId.replace('set',''))-1); const reviewUnlocked=!locked; return`,
  ` const starterLocked=getMode()==='exam';\n box.innerHTML=st.records.slice().reverse().slice(0,30).map(r=>{const locked=r.setId && !isSetComplete(parseInt(r.setId.replace('set',''))-1); const reviewUnlocked=r.setId?!locked:!starterLocked; return`,
  'Starter Review lock'
);

fs.writeFileSync(file,html);
