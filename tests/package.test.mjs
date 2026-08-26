// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
const lifecycle = new Set(['preinstall', 'install', 'postinstall', 'prepare', 'prepack', 'postpack', 'publish', 'postpublish', 'prepublish', 'prepublishOnly']);

test('runtime and peer dependencies are exact', () => {
  assert.equal(manifest.dependencies['@deepseek-ai/dsh-subagent-claude-code'], '0.1.1-rc.2');
  assert.equal(manifest.peerDependencies['@deepseek-ai/dsh'], '0.1.1-rc.2');
});

test('package and lock versions agree', () => {
  assert.equal(lock.version, manifest.version);
  assert.equal(lock.packages[''].version, manifest.version);
});

test('package defines no lifecycle scripts', () => {
  assert.deepEqual(Object.keys(manifest.scripts).filter((name) => lifecycle.has(name)), []);
});

test('published surface is configuration and documentation only', () => {
  assert.deepEqual(manifest.files, ['agent-presets', 'cordis.patch.yml', 'README.md', 'CHANGELOG.md', 'LICENSE', 'NOTICE']);
  assert.equal(manifest.main, undefined);
  assert.equal(manifest.bin, undefined);
});
