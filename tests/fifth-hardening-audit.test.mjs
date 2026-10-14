import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function extractFunction(name){
  const start = html.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} should exist`);
  let i = html.indexOf('{', start);
  let depth = 0;
  for(; i < html.length; i++){
    if(html[i] === '{') depth++;
    else if(html[i] === '}'){
      depth--;
      if(depth === 0) return html.slice(start, i + 1);
    }
  }
  throw new Error(`Could not extract ${name}`);
}

const code = [
  extractFunction('normalizeText'),
  extractFunction('similarityLoose'),
  extractFunction('tokenSet'),
  extractFunction('overlapRatio'),
  extractFunction('evaluateTrainingAnswer')
].join('\n');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(code, ctx);

test('Synonym writing rejects trivial substring fragments', () => {
  assert.notEqual(ctx.evaluateTrainingAnswer('a', ['purchase'], 'ws').level, 'correct');
  assert.notEqual(ctx.evaluateTrainingAnswer('ur', ['purchase'], 'ws').level, 'correct');
});

test('Synonym writing still accepts genuine exact and expanded answers', () => {
  assert.equal(ctx.evaluateTrainingAnswer('purchase', ['purchase'], 'ws').level, 'correct');
  assert.equal(ctx.evaluateTrainingAnswer('to purchase', ['purchase'], 'ws').level, 'correct');
});
