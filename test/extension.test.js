'use strict';

const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

test('Explorer title actions target the built-in file Explorer view', () => {
  const manifest = require('../package.json');
  const menus = manifest.contributes.menus;
  const actions = menus['view/title'];

  assert.equal(menus['explorer/title'], undefined);
  assert.equal(actions.length, 2);
  assert.ok(actions.every(
    ({ when }) => when.includes('view == workbench.explorer.fileView')
  ));
});

test('Explorer commands update and restore only the target exclude rule', async () => {
  const registeredCommands = new Map();
  const state = new Map();
  const contextValues = new Map();
  const subscriptions = [];
  let workspaceExclude = { '**/.git': true };

  const vscodeMock = {
    ConfigurationTarget: { Workspace: 2 },
    commands: {
      executeCommand: async (command, key, value) => {
        if (command === 'setContext') {
          contextValues.set(key, value);
        }
      },
      registerCommand: (command, handler) => {
        registeredCommands.set(command, handler);
        return { dispose() {} };
      }
    },
    window: {
      showErrorMessage() {},
      showWarningMessage() {}
    },
    workspace: {
      workspaceFile: undefined,
      workspaceFolders: [{ uri: { fsPath: '/workspace' } }],
      getConfiguration: () => ({
        inspect: () => ({ workspaceValue: workspaceExclude }),
        update: async (_name, value) => {
          workspaceExclude = value;
        }
      })
    }
  };

  const originalLoad = Module._load;
  Module._load = function mockLoad(request, parent, isMain) {
    if (request === 'vscode') {
      return vscodeMock;
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    const extensionPath = require.resolve('../src/extension');
    delete require.cache[extensionPath];
    const extension = require(extensionPath);
    const context = {
      subscriptions,
      workspaceState: {
        get: (key) => state.get(key),
        update: async (key, value) => {
          if (value === undefined) {
            state.delete(key);
          } else {
            state.set(key, value);
          }
        }
      }
    };

    await extension.activate(context);
    await registeredCommands.get('goTestTreeToggle.hide')();

    assert.deepEqual(workspaceExclude, {
      '**/.git': true,
      '**/*_test.go': true
    });
    assert.equal(contextValues.get('goTestTreeToggle.active'), true);

    // Simulate an unrelated settings edit made while the filter is active.
    workspaceExclude['**/generated'] = true;
    await registeredCommands.get('goTestTreeToggle.show')();

    assert.deepEqual(workspaceExclude, {
      '**/.git': true,
      '**/generated': true
    });
    assert.equal(contextValues.get('goTestTreeToggle.active'), false);
    assert.equal(subscriptions.length, 2);
  } finally {
    Module._load = originalLoad;
  }
});
