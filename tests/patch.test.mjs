// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8');

test('host patch registers only the Claude subscription provider', () => {
  assert.match(patch, /providerName: claude-code/u);
  assert.match(patch, /permissionMode: dontAsk/u);
  assert.doesNotMatch(patch, /gemini|acp/iu);
  assert.equal((patch.match(/env: \{\}/gu) ?? []).length, 1);
});

test('public patch has no private absolute path', () => {
  assert.doesNotMatch(patch, /\/Users\/|[A-Za-z]:\\Users\\/u);
});
