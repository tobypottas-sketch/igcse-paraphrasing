import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html','utf8');

test('Paraphrasing local state is scoped by Hub user namespace',()=>{
  assert.match(html,/hubStorageNamespace/);
  assert.match(html,/function\s+storageKey\s*\(/);
  assert.doesNotMatch(html,/getItem\(STORE_KEY\)/);
  assert.doesNotMatch(html,/setItem\(STORE_KEY/);
});

test('embedded Paraphrasing waits for authenticated Hub context before loading state',()=>{
  assert.match(html,/self-study-hub-context/);
  assert.match(html,/window\.parent\s*===\s*window/);
  assert.match(html,/event\.origin\s*!==\s*window\.location\.origin/);
  assert.match(html,/function\s+initialiseParaphrasingApp\s*\(/);
});
