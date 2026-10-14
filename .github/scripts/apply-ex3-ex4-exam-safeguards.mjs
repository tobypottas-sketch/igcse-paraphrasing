import fs from 'node:fs';

const file='index.html';
let html=fs.readFileSync(file,'utf8');

function replaceOnce(before,after,label){
  if(!html.includes(before)) throw new Error(`Expected ${label} source not found.`);
  html=html.replace(before,after);
}

replaceOnce(
  ` const s10=countMatchesFlexible(h10,set.ex3_h10), s11=countMatchesFlexible(h11,set.ex3_h11); const strong=(s10+s11)>=(set.ex3_h10.length+set.ex3_h11.length-1);\n document.getElementById(\`${'${setId}'}_ex3_feedback\`).innerHTML=`,
  ` const s10=countMatchesFlexible(h10,set.ex3_h10), s11=countMatchesFlexible(h11,set.ex3_h11); const strong=(s10+s11)>=(set.ex3_h10.length+set.ex3_h11.length-1);\n if(getMode()==='exam'){\n   showExamRecordedFeedback(\`${'${setId}'}_ex3_feedback\`);\n   recordResult(\`Activity ${'${i+1}'} EX3\`, 'Heading-based notes', h10.concat(h11).filter(Boolean).join(' | '), 'Accepted by heading in any order', strong, 'Recorded in exam mode.', setId, 'ex3');\n   return;\n }\n document.getElementById(\`${'${setId}'}_ex3_feedback\`).innerHTML=`,
  'Exercise 3 feedback'
);

replaceOnce(
  ` const set=activities[i], setId='set'+(i+1), text=document.getElementById(\`${'${setId}'}_summary\`).value.trim(); const wc=wordCount(text), points=countSummaryPoints(text,set.ex4_points), overlap=overlapCount(text,normalizeText(set.ex4_text).split(' '));\n const strong=points>=5 && wc>=65 && wc<=95 && overlap<10; let msg=`,
  ` const set=activities[i], setId='set'+(i+1), text=document.getElementById(\`${'${setId}'}_summary\`).value.trim(); const wc=wordCount(text), points=countSummaryPoints(text,set.ex4_points), overlap=overlapCount(text,normalizeText(set.ex4_text).split(' '));\n const strong=points>=5 && wc>=65 && wc<=95 && overlap<10;\n if(getMode()==='exam'){\n   showExamRecordedFeedback(\`${'${setId}'}_ex4_feedback\`);\n   recordResult(\`Activity ${'${i+1}'} EX4\`, set.ex4_title, text, 'A concise own-words summary with several relevant points', strong, 'Recorded in exam mode.', setId, 'ex4');\n   return;\n }\n let msg=`,
  'Exercise 4 feedback'
);

fs.writeFileSync(file,html);
