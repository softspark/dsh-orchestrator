// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { composeEntries, loadOverlayPatches } from '@deepseek-ai/dsh-app-boot';

const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8');
const crlfPatch = patch.replaceAll(/\r?\n/gu, '\r\n');
const dshManifest = JSON.parse(await readFile(
  new URL('../node_modules/@deepseek-ai/dsh/package.json', import.meta.url),
  'utf8',
));
const parsedPatch = loadOverlayPatches(
  'dsh-orchestrator-test',
  fileURLToPath(new URL('../cordis.patch.yml', import.meta.url)),
);

test('host patch registers Claude and official Copilot ACP providers', () => {
  assert.match(patch, /providerName: claude-code/u);
  assert.match(patch, /permissionMode: dontAsk/u);
  assert.equal((patch.match(/inheritSessionPermissions: true/gu) ?? []).length, 1);
  assert.match(patch, /providerName: copilot-gemini/u);
  assert.match(patch, /name: '@deepseek-ai\/dsh-subagent-acp'/u);
  assert.match(patch, /command: copilot/u);
  for (const argument of [
    '--acp',
    '--stdio',
    '--no-auto-update',
    '--no-custom-instructions',
    '--no-remote',
    '--no-remote-export',
    '--disable-builtin-mcps',
    '--no-ask-user',
    '--available-tools=',
    '--max-ai-credits=30',
    '--model=gemini-3.6-flash',
  ]) {
    const pattern = new RegExp(`- ${argument.replaceAll('.', '\\.')}(?:\\r?\\n|$)`, 'u');
    assert.match(patch, pattern);
    assert.match(crlfPatch, pattern);
  }
  assert.match(patch, /permission: reject/u);
  assert.equal((patch.match(/env: \{\}/gu) ?? []).length, 2);
  assert.doesNotMatch(patch, /gemini-cli|antigravity/iu);
});

test('public patch has no private absolute path', () => {
  assert.doesNotMatch(patch, /\/Users\/|[A-Za-z]:\\Users\\/u);
});

test('the Claude provider carries no session permission inheritance', () => {
  // `@deepseek-ai/dsh-subagent-claude-code@0.1.1-rc.2` declares only
  // providerName, env, permissionMode and disposeGraceMs, and resolves those
  // four alone; `permissionMode` is fixed for the provider instance. An
  // undeclared key is kept by schemastery rather than rejected, so the key
  // would survive composition, change nothing, and warn about nothing.
  const composed = composeEntries([parsedPatch], () => {});
  const claude = composed.find((entry) => entry.id === 'subagent-claude-code');

  assert.deepEqual(claude.config, {
    providerName: 'claude-code',
    permissionMode: 'dontAsk',
    env: {},
  });
});

test('patch composes the complete Codex dynamic-tool config only after dsh-codex', () => {
  assert.equal(dshManifest.version, '0.1.1-rc.2');

  const warnings = [];
  const composed = composeEntries([
    [{ insert: [{ id: 'llm-codex', name: '@softspark/dsh-codex' }] }],
    parsedPatch,
  ], (message) => warnings.push(message));
  const codex = composed.find((entry) => entry.id === 'llm-codex');

  assert.deepEqual(warnings, []);
  assert.deepEqual(codex, {
    id: 'llm-codex',
    name: '@softspark/dsh-codex',
    config: {
      provider: 'codex',
      command: 'codex',
      sandbox: 'workspace-write',
      approvalPolicy: 'untrusted',
      inheritSessionPermissions: true,
      allowApiKeyAuth: false,
      experimentalDynamicTools: true,
      dynamicToolTimeoutMs: 600000,
      requestTimeoutMs: 30000,
      turnTimeoutMs: 600000,
    },
  });

  const standaloneWarnings = [];
  const standalone = composeEntries([parsedPatch], (message) => {
    standaloneWarnings.push(message);
  });

  assert.equal(standalone.some((entry) => entry.id === 'llm-codex'), false);
  assert.deepEqual(standaloneWarnings, ['patch: entry "llm-codex" not found']);
});
