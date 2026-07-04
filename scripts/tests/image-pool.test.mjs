import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { familyOf, overusedFamily, IMAGE_FAMILIES } from '../lib/image-pool.mjs';

const POOL = [
  { id: 'aaa', description: 'x', topics: [], family: 'supplies-flat-lay' },
  { id: 'bbb', description: 'x', topics: [], family: 'supplies-flat-lay' },
  { id: 'ccc', description: 'x', topics: [], family: 'supplies-flat-lay' },
  { id: 'ddd', description: 'x', topics: [], family: 'supplies-flat-lay' },
  { id: 'eee', description: 'x', topics: [], family: 'nurse-portrait' },
];

test('familyOf returns the family for a pool id', () => {
  assert.equal(familyOf(POOL, 'aaa'), 'supplies-flat-lay');
  assert.equal(familyOf(POOL, 'eee'), 'nurse-portrait');
});

test('familyOf returns null for unknown id or entry without family', () => {
  assert.equal(familyOf(POOL, 'zzz'), null);
  assert.equal(familyOf([{ id: 'nofam' }], 'nofam'), null);
});

test('overusedFamily fires when 3+ LIVE siblings share the chosen family', () => {
  const siblings = [
    { slug: 'p1', imageId: 'bbb', live: true },
    { slug: 'p2', imageId: 'ccc', live: true },
    { slug: 'p3', imageId: 'ddd', live: true },
    { slug: 'p4', imageId: 'eee', live: true },
  ];
  const hit = overusedFamily(POOL, 'aaa', siblings, 3);
  assert.ok(hit);
  assert.equal(hit.family, 'supplies-flat-lay');
  assert.equal(hit.count, 3);
  assert.deepEqual(hit.slugs.sort(), ['p1', 'p2', 'p3']);
});

test('overusedFamily ignores draft siblings and stays quiet below threshold', () => {
  const siblings = [
    { slug: 'p1', imageId: 'bbb', live: true },
    { slug: 'p2', imageId: 'ccc', live: false },
    { slug: 'p3', imageId: 'ddd', live: false },
  ];
  assert.equal(overusedFamily(POOL, 'aaa', siblings, 3), null);
});

test('overusedFamily returns null when the chosen id has no family', () => {
  const siblings = [
    { slug: 'p1', imageId: 'bbb', live: true },
    { slug: 'p2', imageId: 'ccc', live: true },
    { slug: 'p3', imageId: 'ddd', live: true },
  ];
  assert.equal(overusedFamily(POOL, 'unknown-id', siblings, 3), null);
});

test('every entry in the real image pool has a valid family', () => {
  const pool = JSON.parse(fs.readFileSync(path.resolve('scripts/image-pool.json'), 'utf8'));
  assert.ok(Array.isArray(pool) && pool.length > 0);
  for (const entry of pool) {
    assert.ok(
      IMAGE_FAMILIES.includes(entry.family),
      `pool entry ${entry.id} has invalid/missing family: ${entry.family}`
    );
  }
});
