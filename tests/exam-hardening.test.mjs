import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('set completion counts unique question records rather than repeated checks', () => {
  assert.match(html, /function uniqueExerciseCount\(records,setId,exercise\)/);
  assert.match(html, /uniqueExerciseCount\(st\.records,setId,'EX1'\)>=3/);
  assert.match(html, /uniqueExerciseCount\(st\.records,setId,'EX2'\)>=4/);
});

test('Exam Mode locks each response after the first submission', () => {
  assert.match(html, /function examResponseKey\(/);
  assert.match(html, /function isExamResponseLocked\(/);
  assert.match(html, /function lockExamResponse\(/);
  assert.match(html, /if\(mode==='exam' && isExamResponseLocked\(/);
});

test('Results are blocked while the active Exam set is unfinished', () => {
  assert.match(html, /function canOpenResults\(\)/);
  assert.match(html, /if\(tab==='results' && !canOpenResults\(\)\)\{/);
  assert.match(html, /Complete the current Exam set before viewing Results\./);
});

test('Starter Review never reveals model answers or correctness in Exam Mode', () => {
  assert.match(html, /const starterLocked=getMode\(\)==='exam'/);
  assert.match(html, /const reviewUnlocked=r\.setId\?!locked:!starterLocked/);
});
