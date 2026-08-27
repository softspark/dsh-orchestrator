// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const files = ['cordis.patch.yml', 'agent-presets/softspark-orchestrator/agent.cordis.yml', 'package.json'];
const contents = await Promise.all(files.map(async (path) => [path, await readFile(new URL(`../${path}`, import.meta.url), 'utf8')]));

test('publishable configuration contains no credential input', () => {
  for (const [path, content] of contents) {
    assert.doesNotMatch(content, /ANTHROPIC_API_KEY|GEMINI_API_KEY|GOOGLE_API_KEY|GOOGLE_APPLICATION_CREDENTIALS|access[_-]?token|client[_-]?secret/iu, path);
  }
});

test('provider permissions stay fail-closed', () => {
  const patch = contents.find(([path]) => path === 'cordis.patch.yml')[1];
  assert.match(patch, /permissionMode: dontAsk/u);
  assert.match(patch, /permission: reject/u);
  assert.match(patch, /--available-tools=/u);
  assert.doesNotMatch(patch, /bypassPermissions|permission: allow|--allow-all|--yolo/iu);
});

test('Copilot integration uses no direct Google authentication route', () => {
  const patch = contents.find(([path]) => path === 'cordis.patch.yml')[1];
  assert.doesNotMatch(patch, /gemini-cli|antigravity|google oauth|GOOGLE_/iu);
  assert.match(patch, /command: copilot/u);
});
