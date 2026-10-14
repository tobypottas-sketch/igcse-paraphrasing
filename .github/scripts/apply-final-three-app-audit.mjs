import fs from 'node:fs';

const file='index.html';
let html=fs.readFileSync(file,'utf8');

function replaceOnce(before,after,label){
  if(html.includes(after)) return;
  if(!html.includes(before)) throw new Error(`Missing ${label} anchor`);
  html=html.replace(before,after);
}

replaceOnce(
` const examKey=examResponseKey('starter-write',prefix,idx);
 if(mode==='exam' && isExamResponseLocked(examKey)){ showExamRecordedFeedback(\`${'${prefix}'}Feedback_${'${idx}'}\`); return; }
 const attempt=incrementAttemptCount(prefix, idx);`,
` const examKey=examResponseKey('starter-write',prefix,idx);
 if(mode==='exam' && isExamResponseLocked(examKey)){ showExamRecordedFeedback(\`${'${prefix}'}Feedback_${'${idx}'}\`); return; }
 if(mode==='exam' && !user){
   const el=document.getElementById(\`${'${prefix}'}Feedback_${'${idx}'}\`);
   if(el) el.innerHTML='<div class="notice notice-gold">Enter an answer before recording this Exam response.</div>';
   return;
 }
 const attempt=incrementAttemptCount(prefix, idx);`,
'Starter blank response guard');

replaceOnce(
` if(getMode()==='exam' && isExamResponseLocked(examKey)){ showExamRecordedFeedback(\`${'${setId}'}_ex3_feedback\`); return; } const h10=set.ex3_h10.map((_,idx)=>document.getElementById(\`${'${setId}'}_h10_${'${idx}'}\`).value); const h11=set.ex3_h11.map((_,idx)=>document.getElementById(\`${'${setId}'}_h11_${'${idx}'}\`).value);
 const s10=countMatchesFlexible(h10,set.ex3_h10), s11=countMatchesFlexible(h11,set.ex3_h11);`,
` if(getMode()==='exam' && isExamResponseLocked(examKey)){ showExamRecordedFeedback(\`${'${setId}'}_ex3_feedback\`); return; } const h10=set.ex3_h10.map((_,idx)=>document.getElementById(\`${'${setId}'}_h10_${'${idx}'}\`).value); const h11=set.ex3_h11.map((_,idx)=>document.getElementById(\`${'${setId}'}_h11_${'${idx}'}\`).value);
 if(getMode()==='exam' && h10.concat(h11).some(v=>!String(v).trim())){
   const el=document.getElementById(\`${'${setId}'}_ex3_feedback\`);
   if(el) el.innerHTML='<div class="notice notice-gold">Complete all note fields before recording this Exam response.</div>';
   return;
 }
 const s10=countMatchesFlexible(h10,set.ex3_h10), s11=countMatchesFlexible(h11,set.ex3_h11);`,
'Exercise 3 blank response guard');

replaceOnce(
` const text=document.getElementById(\`${'${setId}'}_summary\`).value.trim(); const wc=wordCount(text), points=countSummaryPoints(text,set.ex4_points), overlap=overlapCount(text,normalizeText(set.ex4_text).split(' '));`,
` const text=document.getElementById(\`${'${setId}'}_summary\`).value.trim();
 if(getMode()==='exam' && !text){
   const el=document.getElementById(\`${'${setId}'}_ex4_feedback\`);
   if(el) el.innerHTML='<div class="notice notice-gold">Write a summary before recording this Exam response.</div>';
   return;
 }
 const wc=wordCount(text), points=countSummaryPoints(text,set.ex4_points), overlap=overlapCount(text,normalizeText(set.ex4_text).split(' '));`,
'Exercise 4 blank response guard');

replaceOnce(
`  if(p && e){
    p.className='btn ' + (mode==='practice' ? 'btn-primary' : 'btn-secondary');
    e.className='btn ' + (mode==='exam' ? 'btn-primary' : 'btn-secondary');
  }
  if(n){`,
`  if(p && e){
    p.className='btn ' + (mode==='practice' ? 'btn-primary' : 'btn-secondary');
    e.className='btn ' + (mode==='exam' ? 'btn-primary' : 'btn-secondary');
  }
  document.querySelectorAll('[data-action="regenerate-starter"],[data-action="reset-starter"]').forEach(btn=>{
    btn.disabled = mode==='exam';
  });
  if(n){`,
'Starter Exam reroll lock');

fs.writeFileSync(file,html);
