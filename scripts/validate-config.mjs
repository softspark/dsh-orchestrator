// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs';

const patch = readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8');
const preset = readFileSync(new URL('../agent-presets/softspark-orchestrator/agent.cordis.yml', import.meta.url), 'utf8');

if (/(ANTHROPIC_API_KEY|GEMINI_API_KEY|GOOGLE_API_KEY|GOOGLE_APPLICATION_CREDENTIALS|apiKey|oauth)/i.test(patch)) {
  throw new Error('provider patch must not reference keys, credentials, or OAuth');
}
for (const expected of [
  'providerName: claude-code',
  'permissionMode: dontAsk',
]) {
  if (!patch.includes(expected)) throw new Error(`provider patch missing: ${expected}`);
}
if ((patch.match(/env: \{\}/g) ?? []).length !== 1) throw new Error('Claude provider must use an empty explicit env overlay');
if (/gemini|acp/i.test(patch)) throw new Error('unsupported Google provider must not be registered');

function row(id, nextId) {
  const start = preset.indexOf(`- id: ${id}`);
  if (start < 0) throw new Error(`preset row missing: ${id}`);
  const end = nextId === undefined ? preset.length : preset.indexOf(`- id: ${nextId}`, start + 1);
  return preset.slice(start, end < 0 ? preset.length : end);
}

const codex = row('tool-subagent-codex', 'tool-subagent-claude-code');
const claude = row('tool-subagent-claude-code', 'workflow-worker-thread');
if (!codex.includes('disabled: true')) throw new Error('Codex subagent must remain disabled');
if (claude.includes('disabled: true') || !claude.includes('provider: claude-code') || !claude.includes('toolName: subagent_claude_code')) throw new Error('Claude tool row invalid');
if (!claude.includes('maxDepth: provider-managed')) throw new Error('external providers require provider-managed depth');
if (/tool-subagent-gemini|subagent_gemini/.test(preset)) throw new Error('unsupported Gemini tool must not be present');

const ids = [...preset.matchAll(/^\s*- id:\s*(\S+)\s*$/gm)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) throw new Error(`duplicate preset ids: ${[...new Set(duplicates)].join(', ')}`);
console.log('DSH provider and preset configuration valid');
