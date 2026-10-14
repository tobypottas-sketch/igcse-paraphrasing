import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('blank Starter written Exam responses cannot be recorded', () => {
  assert.match(html, /function\s+checkStarterWrite\s*\([\s\S]*?if\s*\(mode==='exam'\s*&&\s*!user\)\s*\{[\s\S]*?return;[\s\S]*?\}/);
});

test('Exercise 3 Exam requires every note field to contain a response', () => {
  assert.match(html, /function\s+checkExercise3\s*\([\s\S]*?h10\.concat\(h11\)\.some\(v=>!String\(v\)\.trim\(\)\)[\s\S]*?return;/);
});

test('Exercise 4 Exam cannot record a blank summary', () => {
  assert.match(html, /function\s+checkExercise4\s*\([\s\S]*?if\s*\(getMode\(\)==='exam'\s*&&\s*!text\)\s*\{[\s\S]*?return;/);
});

test('Starter regenerate and reset controls are disabled throughout Exam Mode', () => {
  assert.match(html, /\[data-action="regenerate-starter"\],\[data-action="reset-starter"\]/);
  assert.match(html, /btn\.disabled\s*=\s*mode==='exam'/);
});
