import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('mode switching with existing work starts a fresh local attempt instead of exposing unfinished Exam work', () => {
  assert.match(html, /function resetAttemptForModeSwitch\(/);
  assert.match(html, /if\(mode!==st\.mode && hasAttemptProgress\(st\)\)/);
  assert.match(html, /st\.records=\[\]/);
  assert.match(html, /st\.examLocks=\{\}/);
});

test('starter random set is persisted so reload does not attach old Exam locks to new questions', () => {
  assert.match(html, /starterSet:/);
  assert.match(html, /st\.starterSet=currentStarterSet/);
  assert.match(html, /if\(st\.starterSet/);
});

test('stored Exam locks are re-applied to the rebuilt UI after reload', () => {
  assert.match(html, /function restoreExamLockUI\(/);
  assert.match(html, /restoreExamLockUI\(\);/);
  assert.match(html, /Answer recorded\. Review this after the set\./);
});

test('Starter Exam completes after all 18 responses and then unlocks Results and Review', () => {
  assert.match(html, /function isStarterExamComplete\(\)/);
  assert.match(html, /count\('starter-choice:pm:'\)>=5/);
  assert.match(html, /count\('starter-choice:sm:'\)>=5/);
  assert.match(html, /count\('starter-write:ws:'\)>=4/);
  assert.match(html, /count\('starter-write:wp:'\)>=4/);
  assert.match(html, /if\(tab==='starter'\) return isStarterExamComplete\(\)/);
  assert.match(html, /const starterLocked=getMode\(\)==='exam' && !isStarterExamComplete\(\)/);
});
