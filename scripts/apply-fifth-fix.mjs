import fs from 'node:fs';

const path = new URL('../index.html', import.meta.url);
let html = fs.readFileSync(path, 'utf8');
const before = html;

const oldFn = `function similarityLoose(answer, acceptedList){const a=normalizeText(answer); return acceptedList.some(acc=>{const x=normalizeText(acc); return a===x || a.includes(x) || x.includes(a);});}`;
const newFn = `function similarityLoose(answer, acceptedList){
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

if (html.includes(oldFn)) html = html.replace(oldFn, newFn);
else if (!html.includes("shorter.length < 3")) throw new Error('Paraphrasing similarity target not found');

if (html === before) console.log('Paraphrasing fifth-audit fix already applied.');
else {
  fs.writeFileSync(path, html);
  console.log('Applied Paraphrasing fifth-audit fix.');
}
