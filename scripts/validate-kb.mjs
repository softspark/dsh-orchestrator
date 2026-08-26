// SPDX-License-Identifier: Apache-2.0
// Copyright 2024-2026 Lukasz Krzemien (biuro@softspark.eu)
// Source: https://github.com/softspark/dsh-orchestrator

import { readFile, readdir } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kbRoot = resolve(root, 'kb');
const requiredFields = [
  'title',
  'category',
  'service',
  'tags',
  'created',
  'last_updated',
  'description',
];
const categoryByDirectory = new Map([
  ['best-practices', 'best-practices'],
  ['business', 'business'],
  ['decisions', 'decisions'],
  ['howto', 'howto'],
  ['planning', 'planning'],
  ['procedures', 'procedures'],
  ['reference', 'reference'],
  ['runbooks', 'runbooks'],
  ['templates', 'templates'],
  ['troubleshooting', 'troubleshooting'],
]);

const documentPaths = await collectMarkdown(kbRoot);
const errors = [];

for (const absolutePath of documentPaths) {
  const path = relative(root, absolutePath).replaceAll('\\', '/');
  const content = await readFile(absolutePath, 'utf8');
  const parsed = parseFrontmatter(content, path, errors);
  if (parsed === undefined) continue;
  validateDocument(path, parsed, errors);
}

errors.sort((left, right) => (
  left.path.localeCompare(right.path) || left.message.localeCompare(right.message)
));

if (errors.length > 0) {
  console.error(`KB validation failed: ${errors.length} error(s)`);
  for (const error of errors) {
    console.error(`- ${error.path}: ${error.message}`);
  }
  process.exitCode = 1;
} else {
  console.log(`KB validation passed: ${documentPaths.length} document(s)`);
}

async function collectMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  const paths = [];
  for (const entry of entries) {
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...await collectMarkdown(absolutePath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      paths.push(absolutePath);
    }
  }
  return paths;
}

function parseFrontmatter(content, path, errors) {
  const normalized = content.replaceAll('\r\n', '\n');
  if (!normalized.startsWith('---\n')) {
    addError(errors, path, 'missing opening frontmatter delimiter');
    return undefined;
  }
  const closingIndex = normalized.indexOf('\n---\n', 4);
  if (closingIndex < 0) {
    addError(errors, path, 'missing closing frontmatter delimiter');
    return undefined;
  }
  const raw = normalized.slice(4, closingIndex);
  const fields = new Map();
  for (const [index, line] of raw.split('\n').entries()) {
    if (line.trim().length === 0 || line.trimStart().startsWith('#')) continue;
    if (line !== line.trimStart()) {
      addError(errors, path, `unsupported multiline frontmatter at line ${index + 2}`);
      continue;
    }
    const match = /^([A-Za-z_][A-Za-z0-9_-]*):(?:\s*(.*))?$/u.exec(line);
    if (match === null) {
      addError(errors, path, `invalid frontmatter syntax at line ${index + 2}`);
      continue;
    }
    const key = match[1];
    if (fields.has(key)) {
      addError(errors, path, `duplicate frontmatter field "${key}"`);
      continue;
    }
    try {
      fields.set(key, parseValue(match[2] ?? ''));
    } catch (error) {
      addError(
        errors,
        path,
        `invalid value for "${key}": ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }
  return fields;
}

function parseValue(raw) {
  const value = raw.trim();
  if (value.startsWith('[')) return parseInlineArray(value);
  if (value.startsWith('"')) {
    if (!value.endsWith('"')) throw new Error('unterminated double-quoted string');
    const parsed = JSON.parse(value);
    if (typeof parsed !== 'string') throw new Error('expected a string');
    return parsed;
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'")) throw new Error('unterminated single-quoted string');
    return value.slice(1, -1).replaceAll("''", "'");
  }
  return value;
}

function parseInlineArray(raw) {
  if (!raw.endsWith(']')) throw new Error('unterminated inline array');
  const body = raw.slice(1, -1).trim();
  if (body.length === 0) return [];
  return body.split(',').map((part) => {
    const value = parseValue(part);
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('array entries must be non-empty strings');
    }
    return value.trim();
  });
}

function validateDocument(path, fields, errors) {
  for (const field of requiredFields) {
    if (!fields.has(field)) addError(errors, path, `missing required field "${field}"`);
  }
  const strings = ['title', 'category', 'service', 'created', 'last_updated', 'description'];
  for (const field of strings) {
    const value = fields.get(field);
    if (value !== undefined && (typeof value !== 'string' || value.trim().length === 0)) {
      addError(errors, path, `field "${field}" must be a non-empty string`);
    }
  }
  const tags = fields.get('tags');
  if (tags !== undefined && (
    !Array.isArray(tags)
    || tags.length === 0
    || tags.some((tag) => typeof tag !== 'string' || tag.length === 0)
  )) {
    addError(errors, path, 'field "tags" must be a non-empty string array');
  }

  const directory = path.split('/')[1];
  const expectedCategory = categoryByDirectory.get(directory);
  if (expectedCategory === undefined) {
    addError(errors, path, `directory "${String(directory)}" is not in the KB taxonomy`);
  } else if (fields.get('category') !== expectedCategory) {
    addError(errors, path, `category must be "${expectedCategory}" for kb/${directory}/`);
  }

  if (fields.has('section') && fields.get('section') !== fields.get('category')) {
    addError(errors, path, 'section conflicts with category');
  }
  for (const dateField of ['created', 'last_updated']) {
    const value = fields.get(dateField);
    if (typeof value === 'string' && !isIsoDate(value)) {
      addError(errors, path, `field "${dateField}" must be a valid YYYY-MM-DD date`);
    }
  }
}

function isIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (match === null) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
  );
}

function addError(errors, path, message) {
  errors.push({ path, message });
}
