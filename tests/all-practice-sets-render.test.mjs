import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('all five practice-set containers and data remain present', () => {
  for (let i = 1; i <= 5; i += 1) {
    assert.match(html, new RegExp(`id=["']set${i}Container["']`), `missing set${i} container`);
  }
  assert.match(html, /for\(let i=0;i<activities\.length;i\+\+\) renderSet\(i\)/);
  assert.match(html, /const activities=\[/);
});

test('live word-count helper exists so Set 1 cannot abort rendering Sets 2-5', () => {
  assert.match(html, /function\s+updateWordCount\s*\(\s*i\s*\)/, 'renderSet calls updateWordCount(i), but the helper is missing');
  assert.match(html, /document\.getElementById\(`\$\{setId\}_wc`\)/, 'word-count helper must update the visible counter');
});
