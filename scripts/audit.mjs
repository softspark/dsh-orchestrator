// SPDX-License-Identifier: Apache-2.0
// Copyright 2024-2026 Lukasz Krzemien (biuro@softspark.eu)
// Source: https://github.com/softspark/dsh-orchestrator

import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignoredDirectories = new Set([
  '.agents', '.claude', '.codex', '.git', '.idea', 'coverage', 'lib', 'node_modules',
]);
const scannedExtensions = new Set(['.js', '.json', '.mjs', '.ts', '.yml', '.yaml']);
const placeholderPrefixes = [
  'REPLACE_', 'CHANGEME_', 'CHANGE_ME', 'YOUR_', 'EXAMPLE_', 'PLACEHOLDER_',
  '${', '{{', '<', 'xxx', 'XXX', '[REDACTED]',
];
const syntheticCredential = /(?:^|[\s_-])(?:raw|test|fake|example|placeholder|synthetic|second|access)[_-](?:token|secret)(?:$|[\s_-])/iu;
const rules = [
  {
    id: 'DSH-ORCH-001',
    level: 'error',
    pattern: /(?<![.\w$])(?:eval|exec(?:Sync)?)\s*\(|\bnew\s+Function\s*\(/gu,
    message: 'Dynamic code or shell command execution is forbidden.',
  },
  {
    id: 'DSH-ORCH-002',
    level: 'error',
    pattern: /\bshell\s*:\s*true\b/gu,
    message: 'Subprocesses must never launch through a shell.',
  },
  {
    id: 'DSH-ORCH-003',
    level: 'error',
    pattern: /\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\b\s*[:=]\s*['"][^'"]{8,}['"]/giu,
    message: 'Potential hardcoded credential.',
    placeholdersAllowed: true,
  },
  {
    id: 'DSH-ORCH-004',
    level: 'error',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/gu,
    message: 'Private key material must not be committed.',
  },
];

const walk = async (directory) => {
  const paths = [];
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...await walk(absolutePath));
    } else if (scannedExtensions.has(extname(entry.name)) && entry.name !== 'audit.mjs') {
      paths.push(absolutePath);
    }
  }
  return paths;
};

const isPlaceholder = (match) => {
  const value = match.match(/['"]([^'"]+)['"]$/u)?.[1] ?? '';
  return placeholderPrefixes.some((prefix) => value.startsWith(prefix))
    || syntheticCredential.test(value);
};

const locationAt = (content, offset) => {
  const lines = content.slice(0, offset).split('\n');
  return { line: lines.length, column: (lines.at(-1)?.length ?? 0) + 1 };
};

const scannedPaths = await walk(root);
const findings = [];
for (const absolutePath of scannedPaths) {
  const content = await readFile(absolutePath, 'utf8');
  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    for (const match of content.matchAll(rule.pattern)) {
      if (rule.placeholdersAllowed === true && isPlaceholder(match[0])) continue;
      findings.push({
        ruleId: rule.id,
        level: rule.level,
        message: rule.message,
        path: relative(root, absolutePath).replaceAll('\\', '/'),
        ...locationAt(content, match.index),
      });
    }
  }
}

const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const lifecycleNames = new Set([
  'preinstall', 'install', 'postinstall', 'prepublish', 'prepare', 'prepack',
  'postpack', 'publish', 'postpublish', 'prepublishOnly',
]);
for (const scriptName of Object.keys(packageJson.scripts ?? {})) {
  if (lifecycleNames.has(scriptName)) {
    findings.push({
      ruleId: 'DSH-ORCH-005',
      level: 'error',
      message: `Lifecycle script "${scriptName}" is forbidden.`,
      path: 'package.json',
      line: 1,
      column: 1,
    });
  }
}

const sarifRules = rules.map((rule) => ({
  id: rule.id,
  shortDescription: { text: rule.message },
  defaultConfiguration: { level: rule.level },
}));
sarifRules.push({
  id: 'DSH-ORCH-005',
  shortDescription: { text: 'Lifecycle scripts are forbidden.' },
  defaultConfiguration: { level: 'error' },
});
const sarif = {
  version: '2.1.0',
  '$schema': 'https://json.schemastore.org/sarif-2.1.0.json',
  runs: [{
    tool: {
      driver: {
        name: 'dsh-orchestrator-audit',
        informationUri: 'https://github.com/softspark/dsh-orchestrator',
        rules: sarifRules,
      },
    },
    results: findings.map((finding) => ({
      ruleId: finding.ruleId,
      level: finding.level,
      message: { text: finding.message },
      locations: [{
        physicalLocation: {
          artifactLocation: { uri: finding.path },
          region: { startLine: finding.line, startColumn: finding.column },
        },
      }],
    })),
  }],
};

const runtimePaths = scannedPaths.filter((path) =>
  relative(root, path).replaceAll('\\', '/').startsWith('src/'),
);
const allContent = (await Promise.all(
  runtimePaths.map((path) => readFile(path, 'utf8')),
)).join('\n');
const permissions = {
  childProcess: /node:child_process/u.test(allContent)
    ? 'direct subprocess API imported; shell execution is rejected by the audit'
    : 'not detected',
  environment: /process\.env/u.test(allContent) ? 'environment access detected' : 'not detected',
  filesystem: /node:fs/u.test(allContent) ? 'filesystem API imported' : 'not detected',
  network: /node:(?:http|https|net|tls|dgram)/u.test(allContent)
    ? 'network API imported'
    : 'not detected',
  nativeAddons: /process\.dlopen|\.node['"]/u.test(allContent)
    ? 'native addon loading detected'
    : 'not detected',
  lifecycleScripts: Object.keys(packageJson.scripts ?? {}).filter((name) => lifecycleNames.has(name)),
};

const mode = process.argv[2] ?? '--ci';
if (mode === '--sarif') {
  console.log(JSON.stringify(sarif, null, 2));
} else if (mode === '--permissions') {
  console.log(JSON.stringify(permissions, null, 2));
} else if (mode === '--ci') {
  for (const finding of findings) {
    console.error(`${finding.level.toUpperCase()} ${finding.ruleId} ${finding.path}:${finding.line} ${finding.message}`);
  }
  console.log(`Security audit: ${findings.length} finding(s)`);
} else {
  console.error(`Unknown mode: ${mode}`);
  process.exitCode = 2;
}

if (findings.some((finding) => finding.level === 'error')) {
  process.exitCode = 1;
}
