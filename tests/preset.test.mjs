// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const preset = await readFile(new URL('../agent-presets/softspark-orchestrator/agent.cordis.yml', import.meta.url), 'utf8');

function row(id, nextId) {
  const start = preset.indexOf(`- id: ${id}`);
  assert.notEqual(start, -1, `missing row ${id}`);
  const next = preset.indexOf(`- id: ${nextId}`, start + 1);
  return preset.slice(start, next === -1 ? preset.length : next);
}

test('preset enables Claude and Copilot Gemini providers', () => {
  assert.match(row('tool-subagent-codex', 'tool-subagent-claude-code'), /disabled: true/u);
  assert.doesNotMatch(row('tool-subagent-claude-code', 'tool-subagent-copilot-gemini'), /disabled: true/u);
  const gemini = row('tool-subagent-copilot-gemini', 'workflow-worker-thread');
  assert.doesNotMatch(gemini, /disabled: true/u);
  assert.match(gemini, /provider: copilot-gemini/u);
  assert.match(gemini, /toolName: subagent_gemini_copilot/u);
});

test('external tools are one-shot and provider-managed', () => {
  for (const block of [
    row('tool-subagent-claude-code', 'tool-subagent-copilot-gemini'),
    row('tool-subagent-copilot-gemini', 'workflow-worker-thread'),
  ]) {
    assert.match(block, /backgroundMode: one-shot/u);
    assert.match(block, /maxDepth: provider-managed/u);
  }
});

test('all preset row ids are unique', () => {
  const ids = [...preset.matchAll(/^\s*- id:\s*(\S+)\s*$/gmu)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});
