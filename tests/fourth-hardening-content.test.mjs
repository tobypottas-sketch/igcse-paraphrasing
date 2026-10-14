import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const match = html.match(/const paraphraseWriteBank=(\[.*?\]);\s*const activities=/s);
assert.ok(match, 'paraphraseWriteBank should be readable');
const bank = JSON.parse(match[1]);

const words = s => String(s).toLowerCase().replace(/^paraphrase:\s*/, '').match(/[a-z]+(?:'[a-z]+)?/g) || [];

test('accepted paraphrases never repeat the source sentence unchanged', () => {
  const copied=[];
  for (const item of bank) {
    const source = words(item.prompt).join(' ');
    for (const accepted of item.accepted) {
      if(words(accepted).join(' ') === source) copied.push(`${item.prompt} -> ${accepted}`);
    }
  }
  assert.deepEqual(copied, [], `Copied source answers:\n${copied.join('\n')}`);
});

test('accepted paraphrases make a meaningful lexical change to the source', () => {
  const weak=[];
  for (const item of bank) {
    const source = new Set(words(item.prompt));
    for (const accepted of item.accepted) {
      const answer = new Set(words(accepted));
      let retained = 0;
      source.forEach(w => { if (answer.has(w)) retained++; });
      const ratio = source.size ? retained / source.size : 0;
      if(ratio >= 0.8) weak.push(`${ratio.toFixed(2)} | ${item.prompt} -> ${accepted}`);
    }
  }
  assert.deepEqual(weak, [], `Weak paraphrases:\n${weak.join('\n')}`);
});
