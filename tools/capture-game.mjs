import { execSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { capture } from './capture.mjs';
import { serve } from './serve.mjs';

// Build once, then exercise the production bundle, not the dev-only source.
execSync(process.platform === 'win32' ? 'npm.cmd run build' : 'npm run build', { stdio: 'inherit' });
const { server, url } = await serve('dist');
const summary = { pass: true, runs: [] };
try {
  for (const scenario of ['intro', 'training', 'battle-a', 'first-wrap', 'battle-b', 'battle-c', 'anchor', 'complete']) {
    const report = await capture({ page: 'index.html', url, scenario, times: scenario === 'first-wrap' ? [0, .25, .9, 1.4] : [0, 1], views: ['player', 'diorama'], out: `captures/game/${scenario}`, selftest: true, size: [1280, 720] });
    summary.runs.push({ scenario, pass: report.pass, errors: report.errors, maxCalls: Math.max(...report.frames.map(frame => frame.stats.drawCalls)), maxTriangles: Math.max(...report.frames.map(frame => frame.stats.triangles)) });
    summary.pass &&= report.pass;
  }
  for (const gpu of ['default', 'swiftshader']) {
    const report = await capture({ page: 'index.html', url, scenario: 'battle-c', times: [0, .5, 1], views: ['player'], out: `captures/game/audit-${gpu}`, selftest: true, visualChecks: true, size: [1920, 1080], ...(gpu === 'swiftshader' ? { gpu } : {}) });
    summary.runs.push({ scenario: `battle-c-1080p-${gpu}`, pass: report.pass, errors: report.errors, visualAudit: report.visualAudit, fpsProbe: report.fpsProbe });
    summary.pass &&= report.pass;
  }
} finally {
  await new Promise(done => server.close(done));
  await mkdir('captures/game', { recursive: true });
  await writeFile('captures/game/summary.json', JSON.stringify(summary, null, 2));
}
console.log(`Game capture suite: ${summary.pass ? 'PASS' : 'FAIL'}`);
process.exitCode = summary.pass ? 0 : 1;
