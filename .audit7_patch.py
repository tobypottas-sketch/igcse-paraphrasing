from pathlib import Path

p = Path('index.html')
s = p.read_text()

def replace_function(source, name, replacement):
    start = source.index(f'function {name}(')
    brace = source.index('{', start)
    depth = 0
    end = None
    for i in range(brace, len(source)):
        if source[i] == '{':
            depth += 1
        elif source[i] == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    if end is None:
        raise SystemExit(f'could not find end of {name}')
    return source[:start] + replacement + source[end:]

s = replace_function(s, 'flexiblePhraseMatch', '''function flexiblePhraseMatch(left,right){
 const l=normalizeText(left), r=normalizeText(right);
 if(!l||!r) return false;
 if(l===r) return true;
 if(hasFlexibleNegation(l)!==hasFlexibleNegation(r)) return false;
 return (` ${l} `).includes(` ${r} `);
}''')

s = replace_function(s, 'evaluateTrainingAnswer', '''function evaluateTrainingAnswer(user, acceptedList, prefix='ws', sourcePrompt=''){
 const clean=normalizeText(user);
 if(!clean) return {level:'empty'};
 if(prefix==='ws'){
  if(similarityLoose(user,acceptedList)) return {level:'correct'};
  const maxOverlap=Math.max.apply(null,acceptedList.map(a=>overlapRatio(clean,a)).concat([0]));
  const containsUsefulCore=acceptedList.some(a=>{
   const core=normalizeText(a).split(' ').filter(w=>w.length>4);
   return core.some(w=>clean.includes(w));
  });
  if(maxOverlap>=0.45||containsUsefulCore) return {level:'close'};
  return {level:'try_again'};
 }
 const words=clean.split(' ').filter(Boolean);
 if(words.length<4) return {level:'try_again'};
 const acceptedNorm=acceptedList.map(a=>normalizeText(a)).filter(Boolean);
 const userTokens=tokenSet(clean);
 const sourceText=normalizeText(sourcePrompt).replace(/^paraphrase\s+/,'').trim();
 if(sourceText){
  const sourceTokens=tokenSet(sourceText);
  let shared=0;
  sourceTokens.forEach(tok=>{ if(userTokens.has(tok)) shared++; });
  const sourceRetention=sourceTokens.size ? shared/sourceTokens.size : 0;
  const substantialLength=userTokens.size>=Math.max(4,Math.ceil(sourceTokens.size*0.7));
  if(clean===sourceText||(sourceRetention>=0.8&&substantialLength)) return {level:'try_again'};
 }
 const stats=acceptedNorm.map(target=>{
  const targetTokens=tokenSet(target);
  const overlap=overlapRatio(clean,target);
  const lengthRatio=Math.min(userTokens.size,targetTokens.size)/Math.max(1,Math.max(userTokens.size,targetTokens.size));
  return {overlap,lengthRatio};
 });
 const best=stats.reduce((top,item)=>!top||item.overlap>top.overlap?item:top,null)||{overlap:0,lengthRatio:0};
 const sharedMeaningful=acceptedNorm.some(a=>{
  const targetWords=a.split(' ').filter(w=>w.length>3);
  const shared=targetWords.filter(w=>words.includes(w));
  return shared.length>=Math.min(3,Math.max(2,targetWords.length-1));
 });
 if((best.overlap>=0.72&&words.length>=5&&best.lengthRatio>=0.7)||
    (best.overlap>=0.6&&sharedMeaningful&&words.length>=6&&best.lengthRatio>=0.75)) return {level:'correct'};
 if((best.overlap>=0.4&&words.length>=4)||(sharedMeaningful&&words.length>=5)) return {level:'close'};
 return {level:'try_again'};
}''')

old = "const result=evaluateTrainingAnswer(user,task.accepted,prefix);"
if old not in s:
    raise SystemExit('starter write evaluator call not found')
s = s.replace(old, "const result=evaluateTrainingAnswer(user,task.accepted,prefix,task.prompt);", 1)

s = replace_function(s, 'countSummaryPoints', '''function countSummaryPoints(text, groups){
 const t=normalizeText(text);
 const containsNonNegatedPhrase=phrase=>{
  const p=normalizeText(phrase);
  if(!t||!p) return false;
  const padded=` ${t} `, needle=` ${p} `;
  let from=0;
  while(true){
   const idx=padded.indexOf(needle,from);
   if(idx<0) return false;
   const before=padded.slice(0,idx).trim().split(/\\s+/).filter(Boolean).slice(-4).join(' ');
   if(!hasFlexibleNegation(before)) return true;
   from=idx+needle.length;
  }
 };
 let count=0;
 groups.forEach(group=>{ if(group.some(a=>containsNonNegatedPhrase(a))) count++; });
 return count;
}''')

p.write_text(s)
