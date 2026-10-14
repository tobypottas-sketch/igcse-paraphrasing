import fs from 'node:fs';

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

function replaceOnce(before, after, label){
  if(!html.includes(before)) throw new Error(`Expected ${label} source not found.`);
  html = html.replace(before, after);
}

replaceOnce(
  `function getMode(){ return getState().mode || 'practice'; }`,
  `function getMode(){ return getState().mode || 'practice'; }\nfunction showExamRecordedFeedback(id){\n const el=document.getElementById(id);\n if(el) el.innerHTML='<div class="notice notice-blue">Answer recorded. Review this after the set.</div>';\n}`,
  'getMode hook'
);

replaceOnce(
  ` const strong=optIdx===task.answer;\n Array.from(parent.children).forEach((b)=>{b.classList.remove('selected','correct','wrong');});\n if(strong){`,
  ` const strong=optIdx===task.answer;\n Array.from(parent.children).forEach((b)=>{b.classList.remove('selected','correct','wrong');});\n if(mode==='exam'){\n   btn.classList.add('selected');\n   showExamRecordedFeedback(\`${'${prefix}'}Feedback_${'${idx}'}\`);\n   recordResult(prefix==='pm'?'Starter Match: Phrase':'Starter Match: Sentence', task.stem, task.options[optIdx], task.options[task.answer], strong, 'Recorded in exam mode.', null, prefix==='pm'?'phrase_match':'sentence_match');\n   return;\n }\n if(strong){`,
  'starter choice exam gate'
);

replaceOnce(
  ` if(mode==='exam'){\n   strong = result.level==='correct';\n   feedback = strong ? \`Correct. ${'${task.why}'}\` : 'Recorded. Review this after the set.';\n   cls = strong ? 'notice-green' : 'notice-coral';\n   note = strong ? task.why : 'Incorrect in exam mode.';\n   if(strong) explain = buildWhyItWorks(task.prompt, task.accepted[0], task.why);\n } else if(result.level==='correct'){`,
  ` if(mode==='exam'){\n   strong = result.level==='correct';\n   feedback = 'Answer recorded. Review this after the set.';\n   cls = 'notice-blue';\n   note = 'Recorded in exam mode.';\n } else if(result.level==='correct'){`,
  'starter written exam feedback'
);

replaceOnce(
  ` const strong=optIdx===answerIndex;\n const skill = exType==='ex1' ? 'ex1' : 'ex2';\n if(strong){`,
  ` const strong=optIdx===answerIndex;\n const skill = exType==='ex1' ? 'ex1' : 'ex2';\n if(mode==='exam'){\n   btn.classList.add('selected');\n   showExamRecordedFeedback(\`${'${setId}'}_${'${exType}'}_${'${idx}'}\`);\n   recordResult(\`Activity ${'${i+1}'} ${'${exType.toUpperCase()}'}\`, task.q, exType==='ex1'?task.shuffled.options[optIdx]:['A','B','C','D'][optIdx], exType==='ex1'?task.shuffled.options[answerIndex]:task.answer, strong, 'Recorded in exam mode.', setId, skill);\n   return;\n }\n if(strong){`,
  'exam-style choice exam gate'
);

fs.writeFileSync(file, html);
