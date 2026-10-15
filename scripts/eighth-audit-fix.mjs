import fs from 'node:fs';

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');
const before = `function similarityLoose(answer, acceptedList){
  const a=normalizeText(answer);
  if(!a) return false;
  return acceptedList.some(acc=>{
    const x=normalizeText(acc);
    if(!x) return false;
    if(a===x) return true;
    const shorter = a.length <= x.length ? a : x;
    const longer = a.length <= x.length ? x : a;
    if(!shorter.includes(' ') && shorter.length < 3) return false;
    return (\` \${longer} \`).includes(\` \${shorter} \`);
  });
}`;
const after = `function similarityLoose(answer, acceptedList){
  const a=normalizeText(answer);
  if(!a) return false;
  return acceptedList.some(acc=>{
    const x=normalizeText(acc);
    if(!x) return false;
    return a===x || (\` \${a} \`).includes(\` \${x} \`);
  });
}`;
if (!html.includes(before)) {
  if (html.includes(after)) process.exit(0);
  throw new Error('Expected similarityLoose block not found');
}
html = html.replace(before, after);
fs.writeFileSync(path, html);
