import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPositioning } from '../lib/positioning-rules.mjs';

const ok = (s) => assert.equal(checkPositioning(s).length, 0, s);
const bad = (s, id) => {
  const v = checkPositioning(s);
  assert.equal(v.length, 1, s);
  assert.equal(v[0].id, id);
};

test('product-mode-leak: guided setup session phrase flagged in service content', () => {
  bad('We start with a guided setup session before your first cycle.', 'product-mode-leak');
});

test('product-mode-leak: facility license phrase flagged', () => {
  bad('Cost is a flat facility license by roster size.', 'product-mode-leak');
});

test('product-mode-leak: runs in the browser, no installation phrase flagged', () => {
  bad('It runs in the browser, no installation, no IT department required.', 'product-mode-leak');
});

test('product-mode-leak: 21 automated rule checks phrase flagged', () => {
  bad('21 automated rule checks validate every draft.', 'product-mode-leak');
});

test('product-mode-leak: service-mode wording passes clean', () => {
  ok('We configure your rules before your first cycle, checked by our scheduling team.');
});

test('triad-drift: AI builds your schedule without the canonical team-checks wording is flagged', () => {
  bad('The AI builds your schedule automatically overnight.', 'triad-drift');
  bad('AI builds the schedule while you sleep.', 'triad-drift');
});

test('triad-drift: canonical triad wording passes clean', () => {
  ok('AI builds your schedule, our scheduling team checks it, you approve.');
  ok('The AI builds your schedule and our scheduling team reviews it before you approve.');
});

test('novel-service-promise: novel we-do-X-for-you construction flagged', () => {
  bad('We handle the callout tracking for you.', 'novel-service-promise');
  bad('We configure the reporting for you.', 'novel-service-promise');
});

test('novel-service-promise: registry-token phrasing passes clean', () => {
  ok('We configure your rules before your first cycle.');
});

test('retired-demo-wording: live demo flagged', () => {
  bad('Try the live demo to see how it works.', 'retired-demo-wording');
});

test('retired-demo-wording: interactive demo passes clean', () => {
  ok('Try the interactive demo to see how it works.');
});

test('positioning-ok comment suppresses any rule on that line', () => {
  ok('It runs in the browser, no installation, no IT department required. <!-- positioning-ok -->');
  ok('Try the live demo to see how it works. <!-- positioning-ok -->');
});

test('line and text metadata are returned for a violation', () => {
  const v = checkPositioning('line one\nTry the live demo today.\nline three');
  assert.equal(v.length, 1);
  assert.equal(v[0].line, 2);
  assert.equal(v[0].id, 'retired-demo-wording');
  assert.ok(v[0].text.includes('live demo'));
  assert.ok(v[0].message.length > 0);
});
