// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs';

const patch = readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8');
const preset = readFileSync(new URL('../agent-presets/softspark-orchestrator/agent.cordis.yml', import.meta.url), 'utf8');

if (/(ANTHROPIC_API_KEY|GEMINI_API_KEY|GOOGLE_API_KEY|GOOGLE_APPLICATION_CREDENTIALS|(?:^|\s)apiKey\s*:|oauth)/im.test(patch)) {
  throw new Error('provider patch must not reference keys, credentials, or OAuth');
}
for (const expected of [
  '- id: llm-codex',
  "name: '@softspark/dsh-codex'",
  'provider: codex',
  'command: codex',
  'sandbox: workspace-write',
  'approvalPolicy: untrusted',
  'allowApiKeyAuth: false',
  'experimentalDynamicTools: true',
  'dynamicToolTimeoutMs: 600000',
  'requestTimeoutMs: 30000',
  'turnTimeoutMs: 600000',
  'providerName: claude-code',
  'permissionMode: dontAsk',
  "name: '@deepseek-ai/dsh-subagent-acp'",
  'providerName: copilot-gemini',
  'command: copilot',
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
  'permission: reject',
]) {
  if (!patch.includes(expected)) throw new Error(`provider patch missing: ${expected}`);
}
if ((patch.match(/^- id: llm-codex$/gmu) ?? []).length !== 1) {
  throw new Error('provider patch must target llm-codex exactly once');
}
if (/allowApiKeyAuth:\s*true|experimentalDynamicTools:\s*false/iu.test(patch)) {
  throw new Error('Codex dynamic bridge must reject API-key auth and remain enabled');
}
if ((patch.match(/env: \{\}/g) ?? []).length !== 2) throw new Error('external providers must use empty explicit env overlays');
if (/gemini-cli|antigravity|google oauth|GOOGLE_/i.test(patch)) throw new Error('direct Google authentication routes must not be registered');
if (/--allow-all|--yolo|permission: allow/i.test(patch)) throw new Error('Copilot provider must remain fail-closed');

function row(id, nextId) {
  const start = preset.indexOf(`- id: ${id}`);
  if (start < 0) throw new Error(`preset row missing: ${id}`);
  const end = nextId === undefined ? preset.length : preset.indexOf(`- id: ${nextId}`, start + 1);
  return preset.slice(start, end < 0 ? preset.length : end);
}

const codex = row('tool-subagent-codex', 'tool-subagent-claude-code');
const claude = row('tool-subagent-claude-code', 'tool-subagent-copilot-gemini');
const gemini = row('tool-subagent-copilot-gemini', 'workflow-worker-thread');
if (!codex.includes('disabled: true')) throw new Error('Codex subagent must remain disabled');
if (claude.includes('disabled: true') || !claude.includes('provider: claude-code') || !claude.includes('toolName: subagent_claude_code')) throw new Error('Claude tool row invalid');
if (!claude.includes('maxDepth: provider-managed')) throw new Error('external providers require provider-managed depth');
if (gemini.includes('disabled: true') || !gemini.includes('provider: copilot-gemini') || !gemini.includes('toolName: subagent_gemini_copilot')) throw new Error('Copilot Gemini tool row invalid');
if (!gemini.includes('maxDepth: provider-managed')) throw new Error('external providers require provider-managed depth');

const ids = [...preset.matchAll(/^\s*- id:\s*(\S+)\s*$/gm)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) throw new Error(`duplicate preset ids: ${[...new Set(duplicates)].join(', ')}`);
console.log('DSH provider and preset configuration valid');
