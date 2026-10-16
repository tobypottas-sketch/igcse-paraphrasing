import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Paraphrasing Results shows an indicative June 2026 0511 R&W grade from completed exam-style work', () => {
  assert.match(html, /Indicative 0511 R&W grade/);
  assert.match(html, /estimate0511Component12Grade/);
  assert.match(html, /55\s*,\s*50\s*,\s*45\s*,\s*40\s*,\s*35\s*,\s*30\s*,\s*25/);
  assert.match(html, /filter\(r=>r\.setId\)/);
  assert.match(html, /June 2026/);
  assert.match(html, /not an official Cambridge result/i);
});

// Regression guard for completed exam-style work only.
