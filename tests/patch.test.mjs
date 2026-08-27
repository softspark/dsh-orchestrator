// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8');
const crlfPatch = patch.replaceAll(/\r?\n/gu, '\r\n');

test('host patch registers Claude and official Copilot ACP providers', () => {
  assert.match(patch, /providerName: claude-code/u);
  assert.match(patch, /permissionMode: dontAsk/u);
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
