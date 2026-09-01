// SPDX-License-Identifier: Apache-2.0
// Copyright 2024-2026 Lukasz Krzemien (biuro@softspark.eu)
// Source: https://github.com/softspark/dsh-orchestrator

import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const licenseSha256 = 'c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4';
const requiredFiles = [
  'LICENSE',
  'NOTICE',
  'README.md',
  'CHANGELOG.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  'AGENTS.md',
  'CLAUDE.md',
  'llms.txt',
  'package.json',
  'package-lock.json',
  'cordis.patch.yml',
  'agent-presets/softspark-orchestrator/agent.cordis.yml',
  'agent-presets/softspark-orchestrator/preset.yml',
  'kb/decisions/adr-003-enable-codex-dynamic-tools.md',
  '.npmrc',
  '.npmignore',
  '.github/CODEOWNERS',
  '.github/CONTRIBUTING.md',
  '.github/FUNDING.yml',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/dependabot.yml',
  '.github/workflows/ci.yml',
  '.github/workflows/publish.yml',
  'kb/troubleshooting/common-issues.md',
  'scripts/audit.mjs',
  'scripts/validate-kb.mjs',
  'scripts/verify-version-sync.mjs',
  'tests/patch.test.mjs',
  'tests/preset.test.mjs',
  'tests/package.test.mjs',
  'tests/security.test.mjs',
];

const missing = [];
for (const relativePath of requiredFiles) {
  try {
    await access(resolve(root, relativePath), constants.R_OK);
  } catch {
    missing.push(relativePath);
  }
}

if (missing.length > 0) {
  console.error(`Missing required files: ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  const license = await readFile(resolve(root, 'LICENSE'));
  const actualSha256 = createHash('sha256').update(license).digest('hex');
  if (actualSha256 !== licenseSha256) {
    console.error(`LICENSE sha256 mismatch: ${actualSha256}`);
    process.exitCode = 1;
  } else {
    console.log(`Required files present; LICENSE sha256=${actualSha256}`);
  }
}
