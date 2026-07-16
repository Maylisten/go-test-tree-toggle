'use strict';

const vscode = require('vscode');
const {
  addPattern,
  createSnapshot,
  isValidSnapshot,
  restorePattern
} = require('./exclude-state');

const EXCLUDE_PATTERN = '**/*_test.go';
const STATE_KEY = 'goTestTreeToggle.snapshot.v1';
const CONTEXT_KEY = 'goTestTreeToggle.active';

function getWorkspaceExcludeValue() {
  const inspected = vscode.workspace
    .getConfiguration('files')
    .inspect('exclude');

  return inspected ? inspected.workspaceValue : undefined;
}

function hasOpenWorkspace() {
  return Boolean(
    vscode.workspace.workspaceFile
      || (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
  );
}

async function setActiveContext(active) {
  await vscode.commands.executeCommand('setContext', CONTEXT_KEY, active);
}

async function enable(context) {
  if (!hasOpenWorkspace()) {
    void vscode.window.showWarningMessage(
      'Open a folder or workspace before hiding *_test.go files.'
    );
    return;
  }

  const existingSnapshot = context.workspaceState.get(STATE_KEY);
  if (isValidSnapshot(existingSnapshot)) {
    await setActiveContext(true);
    return;
  }

  const workspaceValue = getWorkspaceExcludeValue();
  const snapshot = createSnapshot(workspaceValue, EXCLUDE_PATTERN);
  const nextValue = addPattern(workspaceValue, EXCLUDE_PATTERN);

  // Store the restoration data first. If the settings update fails, remove it
  // immediately so the extension never claims ownership of a change it did not make.
  await context.workspaceState.update(STATE_KEY, snapshot);

  try {
    await vscode.workspace
      .getConfiguration('files')
      .update('exclude', nextValue, vscode.ConfigurationTarget.Workspace);
  } catch (error) {
    await context.workspaceState.update(STATE_KEY, undefined);
    throw error;
  }

  await setActiveContext(true);
}

async function disable(context) {
  const snapshot = context.workspaceState.get(STATE_KEY);

  if (!isValidSnapshot(snapshot)) {
    await setActiveContext(false);
    return;
  }

  const workspaceValue = getWorkspaceExcludeValue();
  const restoredValue = restorePattern(
    workspaceValue,
    EXCLUDE_PATTERN,
    snapshot
  );

  await vscode.workspace
    .getConfiguration('files')
    .update('exclude', restoredValue, vscode.ConfigurationTarget.Workspace);

  await context.workspaceState.update(STATE_KEY, undefined);
  await setActiveContext(false);
}

function reportError(action, error) {
  const detail = error instanceof Error ? error.message : String(error);
  void vscode.window.showErrorMessage(
    `Could not ${action} *_test.go files: ${detail}`
  );
}

async function activate(context) {
  const snapshot = context.workspaceState.get(STATE_KEY);
  await setActiveContext(isValidSnapshot(snapshot));

  context.subscriptions.push(
    vscode.commands.registerCommand('goTestTreeToggle.hide', async () => {
      try {
        await enable(context);
      } catch (error) {
        reportError('hide', error);
      }
    }),
    vscode.commands.registerCommand('goTestTreeToggle.show', async () => {
      try {
        await disable(context);
      } catch (error) {
        reportError('show', error);
      }
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
