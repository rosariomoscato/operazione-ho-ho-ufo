import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from './capture.mjs';
import { serve } from './serve.mjs';

test('capture CLI parses options', () => {
  const options = parseArgs(['tools/testscene.html', '--times', '0,2.4,5', '--views', 'diorama,fp', '--selftest', '--visual-checks', '--gpu', 'swiftshader']);
  assert.deepEqual(options.times, [0, 2.4, 5]);
  assert.deepEqual(options.views, ['diorama', 'fp']);
  assert.equal(options.selftest, true);
  assert.equal(options.visualChecks, true);
});
test('invalid CLI options fail', () => {
  for (const args of [[], ['x', '--times', 'oops'], ['x', '--size', '0x720'], ['x', '--unknown'], ['x', '--gpu', 'magic']]) assert.throws(() => parseArgs(args));
});
test('local server serves files and rejects traversal', async () => {
  const { server, url } = await serve();
  try {
    assert.equal((await fetch(`${url}/tools/testscene.html`)).status, 200);
    assert.equal((await fetch(`${url}/missing`)).status, 404);
    assert.equal((await fetch(`${url}/..%2fpackage.json`)).status, 403);
  } finally { await new Promise(done => server.close(done)); }
});
