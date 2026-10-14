import fs from 'node:fs';

const file='index.html';
let html=fs.readFileSync(file,'utf8');

function replaceOnce(before, after, label){
  if(!html.includes(before)) throw new Error(`Expected ${label} source not found.`);
  html=html.replace(before, after);
}

if(!html.includes('starterSet:null')){
  replaceOnce(
`    records:[],
    mode:'practice',`,
`    records:[],
    mode:'practice',
    examLocks:{},
    starterSet:null,`,
'default state');
}

if(!html.includes('function hasAttemptProgress(st)')){
  replaceOnce(
`function setAppMode(mode){
  const st=getState();
  st.mode=mode;
  saveState(st);
  updateModeUI();
  renderReview();
}`,
`function hasAttemptProgress(st){
  return !!((st.records && st.records.length) || Object.keys(st.examLocks || {}).length);
}
function resetAttemptForModeSwitch(st){
  st.records=[];
  st.examLocks={};
  st.starterSet=null;
  return st;
}
function setAppMode(mode){
  const st=getState();
  if(mode===st.mode) return;
  if(mode!==st.mode && hasAttemptProgress(st)){
    const ok=window.confirm('Switching mode starts a fresh attempt and clears the current Results and Review for this app. Continue?');
    if(!ok) return;
    resetAttemptForModeSwitch(st);
  }
  st.mode=mode;
  saveState(st);
  renderAll();
}`,
'mode switch');
}

if(!html.includes('st.starterSet=currentStarterSet')){
  replaceOnce(
`function generateStarterSet(){
  currentStarterSet={
    phraseMatch:sampleItems(phraseBank,5).map(task=>Object.assign({}, task, shuffleQuestionOptions(task))),
    sentenceMatch:sampleItems(sentenceBank,5).map(task=>Object.assign({}, task, shuffleQuestionOptions(task))),
    writeSynonym:sampleItems(synonymWriteBank,4),
    writeParaphrase:sampleItems(paraphraseWriteBank,4)
  };
  renderStarter();
}`,
`function generateStarterSet(){
  const st=getState();
  currentStarterSet={
    phraseMatch:sampleItems(phraseBank,5).map(task=>Object.assign({}, task, shuffleQuestionOptions(task))),
    sentenceMatch:sampleItems(sentenceBank,5).map(task=>Object.assign({}, task, shuffleQuestionOptions(task))),
    writeSynonym:sampleItems(synonymWriteBank,4),
    writeParaphrase:sampleItems(paraphraseWriteBank,4)
  };
  st.starterSet=currentStarterSet;
  st.examLocks=Object.fromEntries(Object.entries(st.examLocks || {}).filter(([key])=>!key.startsWith('starter-')));
  st.records=(st.records || []).filter(r=>r.setId);
  saveState(st);
  renderStarter();
}`,
'starter persistence');
}

if(!html.includes('function restoreExamLockUI()')){
  const anchor=`function renderReview(){`;
  const helper=`function restoreExamLockUI(){
 const st=getState();
 if(st.mode!=='exam') return;
 const locks=st.examLocks || {};
 Object.keys(locks).forEach(key=>{
   const parts=key.split(':');
   if(parts[0]==='starter-choice'){
     const prefix=parts[1], idx=parts[2];
     document.querySelectorAll('[data-action="starter-choice"][data-prefix="'+prefix+'"][data-index="'+idx+'"]').forEach(btn=>btn.disabled=true);
     showExamRecordedFeedback(prefix+'Feedback_'+idx);
   }else if(parts[0]==='starter-write'){
     const prefix=parts[1], idx=parts[2];
     const input=document.getElementById(prefix+'_'+idx); if(input) input.disabled=true;
     const btn=document.querySelector('[data-action="starter-write"][data-prefix="'+prefix+'"][data-index="'+idx+'"]'); if(btn) btn.disabled=true;
     showExamRecordedFeedback(prefix+'Feedback_'+idx);
   }else if(/^set\\d+$/.test(parts[0])){
     const setId=parts[0], ex=parts[1], setIndex=parseInt(setId.replace('set',''),10)-1;
     if(ex==='ex1' || ex==='ex2'){
       const idx=parts[2];
       document.querySelectorAll('[data-action="set-choice"][data-set="'+setIndex+'"][data-exercise="'+ex+'"][data-index="'+idx+'"]').forEach(btn=>btn.disabled=true);
       showExamRecordedFeedback(setId+'_'+ex+'_'+idx);
     }else if(ex==='ex3'){
       document.querySelectorAll('#'+setId+'Container .note-row input').forEach(el=>el.disabled=true);
       const btn=document.querySelector('[data-action="check-ex3"][data-set="'+setIndex+'"]'); if(btn) btn.disabled=true;
       showExamRecordedFeedback(setId+'_ex3_feedback');
     }else if(ex==='ex4'){
       const summary=document.getElementById(setId+'_summary'); if(summary) summary.disabled=true;
       const btn=document.querySelector('[data-action="check-ex4"][data-set="'+setIndex+'"]'); if(btn) btn.disabled=true;
       showExamRecordedFeedback(setId+'_ex4_feedback');
     }
   }
 });
}
`;
  replaceOnce(anchor, helper+anchor, 'restore helper anchor');
}

replaceOnce(
`function renderAll(){generateStarterSet(); for(let i=0;i<activities.length;i++) renderSet(i); renderResults(); updateModeUI(); renderReview();}`,
`function renderAll(){
 const st=getState();
 if(st.starterSet && st.starterSet.phraseMatch){ currentStarterSet=st.starterSet; renderStarter(); }
 else generateStarterSet();
 for(let i=0;i<activities.length;i++) renderSet(i);
 renderResults();
 updateModeUI();
 renderReview();
 restoreExamLockUI();
}`,
'renderAll persistence');

fs.writeFileSync(file,html);
