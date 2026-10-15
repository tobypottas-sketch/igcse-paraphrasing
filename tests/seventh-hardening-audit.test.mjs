import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function extractFunction(name){
  const start = html.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} should exist`);
  let i = html.indexOf('{', start);
  let depth = 0;
  for(; i < html.length; i++){
    if(html[i] === '{') depth++;
    else if(html[i] === '}'){
      depth--;
      if(depth === 0) return html.slice(start, i + 1);
    }
  }
  throw new Error(`Could not extract ${name}`);
}

const ctx = {};
vm.createContext(ctx);
vm.runInContext([
  extractFunction('normalizeText'),
  extractFunction('tokenSet'),
  extractFunction('overlapRatio'),
  extractFunction('similarityLoose'),
  extractFunction('evaluateTrainingAnswer'),
  extractFunction('hasFlexibleNegation'),
  extractFunction('flexiblePhraseMatch'),
  extractFunction('countMatchesFlexible'),
  extractFunction('countSummaryPoints')
].join('\n'), ctx);

test('Exercise 3 notes reject incomplete fragments of a full accepted idea', () => {
  assert.equal(ctx.flexiblePhraseMatch('clothes', 'clothes become waste'), false);
  assert.equal(ctx.flexiblePhraseMatch('staff', 'staff test equipment'), false);
  assert.equal(ctx.flexiblePhraseMatch('inflatable screen', 'inflatable screen used'), false);
});

test('Exercise 4 point detection does not award a point for a negated idea', () => {
  const groups = [['outdoor activity','done outdoors']];
  assert.equal(ctx.countSummaryPoints('It is not an outdoor activity.', groups), 0);
  assert.equal(ctx.countSummaryPoints('This is never done outdoors.', groups), 0);
});

test('written paraphrase training does not reward copying the source sentence', () => {
  const source = 'Visitors are advised to arrive early because seats are limited.';
  const accepted = [
    'guests are told to come sooner because there are not many seats',
    'people should get there early because only a few seats are available',
    'visitors are recommended to arrive early since seating is limited'
  ];
  const result = ctx.evaluateTrainingAnswer(source, accepted, 'wp', source);
  assert.notEqual(result.level, 'correct');
});

test('written paraphrase training does not reward a short subset of a model answer', () => {
  const source = 'Visitors are advised to arrive early because seats are limited.';
  const accepted = [
    'guests are told to come sooner because there are not many seats',
    'people should get there early because only a few seats are available',
    'visitors are recommended to arrive early since seating is limited'
  ];
  const result = ctx.evaluateTrainingAnswer('visitors are recommended to arrive early', accepted, 'wp', source);
  assert.notEqual(result.level, 'correct');
});
