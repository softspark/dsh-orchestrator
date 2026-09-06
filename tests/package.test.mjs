// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import test from 'node:test';

const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
const lifecycle = new Set(['preinstall', 'install', 'postinstall', 'prepare', 'prepack', 'postpack', 'publish', 'postpublish', 'prepublish', 'prepublishOnly']);

test('runtime dependencies are exact and peers name qualified versions only', () => {
  assert.equal(manifest.dependencies['@deepseek-ai/dsh-subagent-acp'], '0.1.2-rc.1');
  assert.equal(manifest.dependencies['@deepseek-ai/dsh-subagent-claude-code'], '0.1.2-rc.1');
  assert.equal(manifest.devDependencies['@deepseek-ai/dsh-app-boot'], '0.1.2-rc.1');
  assert.equal(manifest.devDependencies['@deepseek-ai/dsh'], '0.1.2-rc.1');
  assert.equal(manifest.peerDependencies['@deepseek-ai/dsh'], '0.1.2-rc.1');
});

test('composition test dependency is direct and lock-synchronized', () => {
  assert.equal(lock.packages[''].devDependencies['@deepseek-ai/dsh-app-boot'], '0.1.2-rc.1');
  assert.equal(lock.packages['node_modules/@deepseek-ai/dsh-app-boot'].version, '0.1.2-rc.1');
  assert.equal(lock.packages['node_modules/@deepseek-ai/dsh-app-boot'].peer, undefined);
});

test('package and lock versions agree', () => {
  assert.equal(lock.version, manifest.version);
  assert.equal(lock.packages[''].version, manifest.version);
});

test('the real Claude provider resolves the qualified SDK override', async () => {
  assert.equal(manifest.overrides['@deepseek-ai/dsh-subagent-claude-code@0.1.2-rc.1']['@anthropic-ai/claude-agent-sdk'], '0.3.263');
  const providerRequire = createRequire(new URL('../node_modules/@deepseek-ai/dsh-subagent-claude-code/package.json', import.meta.url));
  const sdkEntry = providerRequire.resolve('@anthropic-ai/claude-agent-sdk');
  const sdk = JSON.parse(await readFile(join(dirname(sdkEntry), 'package.json'), 'utf8'));
  assert.equal(sdk.version, '0.3.263');
  assert.equal(lock.packages['node_modules/@anthropic-ai/claude-agent-sdk'].version, sdk.version);
});

test('package defines no lifecycle scripts', () => {
  assert.deepEqual(Object.keys(manifest.scripts).filter((name) => lifecycle.has(name)), []);
});

test('published surface is configuration and documentation only', () => {
  assert.deepEqual(manifest.files, ['agent-presets', 'cordis.patch.yml', 'README.md', 'CHANGELOG.md', 'LICENSE', 'NOTICE']);
  assert.equal(manifest.main, undefined);
  assert.equal(manifest.bin, undefined);
});
