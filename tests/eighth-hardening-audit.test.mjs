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

const ctx = {};
vm.createContext(ctx);
vm.runInContext([
  extractFunction('normalizeText'),
  extractFunction('similarityLoose')
].join('\n'), ctx);

test('synonym writing rejects a fragment of a multi-word accepted synonym', () => {
  assert.equal(ctx.similarityLoose('make', ['make better']), false);
  assert.equal(ctx.similarityLoose('easy', ['easy to understand']), false);
});

test('synonym writing still accepts exact accepted alternatives', () => {
  assert.equal(ctx.similarityLoose('make better', ['make better']), true);
  assert.equal(ctx.similarityLoose('develop', ['develop', 'make better']), true);
});
