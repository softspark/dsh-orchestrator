// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const expected = 'c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4';
const actual = createHash('sha256').update(readFileSync(new URL('../LICENSE', import.meta.url))).digest('hex');
if (actual !== expected) throw new Error(`LICENSE hash mismatch: ${actual}`);
console.log(`Apache-2.0 license valid (${actual})`);
