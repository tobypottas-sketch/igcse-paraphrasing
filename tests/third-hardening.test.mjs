import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('index.html', 'utf8');

test('Review escapes persisted record text before inserting it into innerHTML', () => {
  assert.match(source, /function\s+escapeHtml\s*\(/, 'escapeHtml helper is required');
  assert.match(source, /escapeHtml\(r\.user\s*\|\|\s*['"]No answer['"]\)/, 'student answer must be escaped');
  assert.match(source, /escapeHtml\(r\.prompt\)/, 'stored task text must be escaped');
  assert.match(source, /escapeHtml\(r\.area\)/, 'stored area label must be escaped');
  assert.doesNotMatch(source, /<strong>Your answer:<\/strong>\s*\$\{r\.user/, 'raw stored answer must never be interpolated into review HTML');
});
