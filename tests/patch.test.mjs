// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8');

test('host patch registers only the two subscription providers', () => {
  assert.match(patch, /providerName: claude-code/u);
  assert.match(patch, /permissionMode: dontAsk/u);
  assert.match(patch, /providerName: gemini/u);
  assert.match(patch, /command: gemini/u);
  assert.match(patch, /args: \[--acp\]/u);
  assert.match(patch, /permission: reject/u);
  assert.equal((patch.match(/env: \{\}/gu) ?? []).length, 2);
});

test('public patch has no private absolute path', () => {
  assert.doesNotMatch(patch, /\/Users\/|[A-Za-z]:\\Users\\/u);
});
