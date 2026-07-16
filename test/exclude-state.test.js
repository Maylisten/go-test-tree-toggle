'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  addPattern,
  createSnapshot,
  isValidSnapshot,
  restorePattern
} = require('../src/exclude-state');

const PATTERN = '**/*_test.go';

test('adds only the Go test pattern and preserves other rules', () => {
  const current = { '**/.git': true, '**/*.generated.go': false };

  assert.deepEqual(addPattern(current, PATTERN), {
    '**/.git': true,
    '**/*.generated.go': false,
    [PATTERN]: true
  });
  assert.equal(Object.hasOwn(current, PATTERN), false);
});

test('removes the setting container when the extension created it', () => {
  const snapshot = createSnapshot(undefined, PATTERN);
  const enabled = addPattern(undefined, PATTERN);

  assert.equal(restorePattern(enabled, PATTERN, snapshot), undefined);
});

test('keeps unrelated rules added while the toggle is active', () => {
  const snapshot = createSnapshot({ '**/.DS_Store': true }, PATTERN);
  const current = {
    '**/.DS_Store': true,
    '**/tmp': true,
    [PATTERN]: true
  };

  assert.deepEqual(restorePattern(current, PATTERN, snapshot), {
    '**/.DS_Store': true,
    '**/tmp': true
  });
});

test('restores an existing pattern value exactly', () => {
  const originalRule = { when: '$(basename).go' };
  const snapshot = createSnapshot({ [PATTERN]: originalRule }, PATTERN);
  const enabled = addPattern({ [PATTERN]: originalRule }, PATTERN);

  assert.deepEqual(restorePattern(enabled, PATTERN, snapshot), {
    [PATTERN]: originalRule
  });
});

test('validates persisted state before using it', () => {
  const snapshot = createSnapshot({}, PATTERN);

  assert.equal(isValidSnapshot(snapshot), true);
  assert.equal(isValidSnapshot({ active: true }), false);
  assert.equal(isValidSnapshot(null), false);
});
