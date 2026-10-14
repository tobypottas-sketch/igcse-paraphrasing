import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('locked exam-style review hides answer key, explanation and correctness styling', () => {
  assert.match(html, /const reviewUnlocked=!locked/);
  assert.match(html, /reviewUnlocked\?\(r\.strong\?'good':'bad'\):''/);
  assert.match(html, /<strong>Why:<\/strong>[^`]*reviewUnlocked\?r\.note:'Hidden until the whole set is complete'/);
  assert.match(html, /<strong>Model \/ accepted idea:<\/strong>[^`]*reviewUnlocked\?r\.accepted:'Hidden until the whole set is complete'/);
});
