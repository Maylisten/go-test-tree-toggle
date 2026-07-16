'use strict';

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cloneRecord(value) {
  return isRecord(value) ? { ...value } : {};
}

function createSnapshot(workspaceValue, pattern) {
  const current = cloneRecord(workspaceValue);
  const hadPattern = Object.prototype.hasOwnProperty.call(current, pattern);

  return {
    version: 1,
    active: true,
    containerExisted: isRecord(workspaceValue),
    hadPattern,
    ...(hadPattern ? { previousValue: current[pattern] } : {})
  };
}

function addPattern(workspaceValue, pattern) {
  return {
    ...cloneRecord(workspaceValue),
    [pattern]: true
  };
}

function restorePattern(workspaceValue, pattern, snapshot) {
  const restored = cloneRecord(workspaceValue);

  if (snapshot.hadPattern) {
    restored[pattern] = snapshot.previousValue;
  } else {
    delete restored[pattern];
  }

  if (!snapshot.containerExisted && Object.keys(restored).length === 0) {
    return undefined;
  }

  return restored;
}

function isValidSnapshot(value) {
  return isRecord(value)
    && value.version === 1
    && value.active === true
    && typeof value.containerExisted === 'boolean'
    && typeof value.hadPattern === 'boolean';
}

module.exports = {
  addPattern,
  createSnapshot,
  isValidSnapshot,
  restorePattern
};
