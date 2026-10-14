import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function between(startMarker, endMarker){
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `could not extract ${startMarker}`);
  return html.slice(start, end);
}

function loadFunction(name, source){
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${source}\nthis.__fn = ${name};`, context);
  return context.__fn;
}

test('Exercise 3 matcher rejects tiny substring fragments but accepts meaningful phrase containment', () => {
  const normalize = between('function normalizeText', 'function similarityLoose');
  const matcher = between('function countMatchesFlexible', 'function checkExercise3');
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${normalize}\n${matcher}\nthis.__fn = countMatchesFlexible;`, context);
  const fn = context.__fn;
  assert.equal(fn(['a'], [['wear strong shoes', 'strong footwear']]), 0);
  assert.equal(fn(['please wear strong shoes'], [['wear strong shoes', 'strong footwear']]), 1);
  assert.equal(fn(['do not wear strong shoes'], [['wear strong shoes', 'strong footwear']]), 0);
});

test('Exercise 4 overlap counts distinct copied words, not repeated source occurrences', () => {
  const normalize = between('function normalizeText', 'function similarityLoose');
  const overlap = between('function overlapCount', 'function checkExercise4');
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${normalize}\n${overlap}\nthis.__fn = overlapCount;`, context);
  const fn = context.__fn;
  assert.equal(fn('people outside', ['people','people','people','outside','outside']), 2);
});
