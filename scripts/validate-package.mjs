// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
for (const [field, expected] of Object.entries({
  name: '@softspark/dsh-orchestrator',
  version: '1.0.0',
  license: 'Apache-2.0',
  type: 'module',
})) {
  if (manifest[field] !== expected) throw new Error(`package ${field} must be ${expected}`);
}
if (manifest.private === true) throw new Error('publishable package cannot be private');
if (manifest.engines?.node !== '>=22.19.0') throw new Error('Node engine must match the supported DSH baseline');
if (manifest.dsh?.bundle?.patch !== './cordis.patch.yml') throw new Error('DSH bundle patch declaration missing');
if (manifest.peerDependencies?.['@deepseek-ai/dsh'] !== '0.1.1-rc.2') throw new Error('DSH peer must be exact');
for (const dependency of ['@deepseek-ai/dsh-subagent-acp', '@deepseek-ai/dsh-subagent-claude-code']) {
  if (manifest.dependencies?.[dependency] !== '0.1.1-rc.2') throw new Error(`${dependency} must be exact`);
}
for (const lifecycle of ['preinstall', 'install', 'postinstall', 'prepare', 'prepublish', 'prepublishOnly', 'postpublish']) {
  if (manifest.scripts?.[lifecycle] !== undefined) throw new Error(`lifecycle script forbidden: ${lifecycle}`);
}
for (const file of ['agent-presets', 'cordis.patch.yml', 'LICENSE', 'NOTICE', 'README.md', 'CHANGELOG.md']) {
  if (!manifest.files?.includes(file)) throw new Error(`package files entry missing: ${file}`);
}
console.log('package manifest valid');
