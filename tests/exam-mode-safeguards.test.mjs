import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('Exam Mode records answers without revealing correctness or explanations', () => {
  assert.match(html, /function showExamRecordedFeedback\(id\)/);
  assert.match(html, /Answer recorded\. Review this after the set\./);
  assert.match(html, /if\(mode==='exam'\)\{\s*btn\.classList\.add\('selected'\);\s*showExamRecordedFeedback\(`/);
  assert.match(html, /if\(mode==='exam'\)\{\s*strong = result\.level==='correct';\s*feedback = 'Answer recorded\. Review this after the set\.';\s*cls = 'notice-blue';\s*note = 'Recorded in exam mode\.';/);
  assert.doesNotMatch(html, /if\(mode==='exam'\)\{\s*strong = result\.level==='correct';\s*feedback = strong \? `Correct\./);
});
