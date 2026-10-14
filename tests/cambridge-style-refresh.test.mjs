import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('Paraphrasing uses the shared Cambridge suite header and palette', () => {
  assert.match(html, /class="cambridge-brand"/);
  assert.match(html, /Cambridge IGCSE · English as a Second Language/);
  assert.match(html, /--teal:#149b96/);
  assert.match(html, /--rose:#c88383/);
  assert.match(html, /class="hero-shell"/);
});

test('existing app structure and learning controls are preserved', () => {
  assert.match(html, /data-tab="overview"/);
  assert.match(html, /data-tab="starter"/);
  assert.match(html, /data-tab="set5"/);
  assert.match(html, /Practice mode/);
  assert.match(html, /Exam mode/);
});
