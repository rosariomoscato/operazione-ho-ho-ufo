import { execSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { capture } from './capture.mjs';
import { serve } from './serve.mjs';

if (!process.env.GAME_ROOT) execSync(process.platform === 'win32' ? 'npm.cmd run build' : 'npm run build', { stdio: 'inherit' });
const { server, url } = await serve(process.env.GAME_ROOT ?? 'dist');
const summary = { pass: true, act: 'toystreet', runs: [] };
try {
  for (const scenario of ['street-start', 'street-left', 'street-right', 'street-left-clear', 'street-right-clear', 'street-one-anchor', 'street-complete']) {
    const report = await capture({ page: 'index.html', url, scenario, times: scenario === 'street-complete' ? [0, 1.5, 3] : [0, 1], views: ['player', 'diorama'], size: [1280, 720], out: `captures/street/${scenario}`, selftest: true });
    summary.runs.push({ scenario, pass: report.pass, errors: report.errors, maxCalls: Math.max(...report.frames.map(frame => frame.stats.drawCalls)), maxTriangles: Math.max(...report.frames.map(frame => frame.stats.triangles)) });
    summary.pass &&= report.pass;
  }
  const audit = await capture({ page: 'index.html', url, scenario: 'street-left', times: [0], views: ['player'], size: [1920, 1080], out: 'captures/street/audit-default', selftest: true, visualChecks: true });
  summary.runs.push({ scenario: 'street-audit-1080', pass: audit.pass, visualAudit: audit.visualAudit, errors: audit.errors });
  summary.pass &&= audit.pass;
  const software = await capture({ page: 'index.html', url, scenario: 'street-start', times: [0], views: ['diorama'], size: [1280, 720], out: 'captures/street/software', selftest: true, gpu: 'swiftshader' });
  summary.runs.push({ scenario: 'street-software', pass: software.pass, errors: software.errors, fpsProbe: software.fpsProbe });
  summary.pass &&= software.pass;
} finally {
  await new Promise(done => server.close(done));
  await mkdir('captures/street', { recursive: true });
  await writeFile('captures/street/summary.json', JSON.stringify(summary, null, 2));
}
console.log(`M2 capture suite: ${summary.pass ? 'PASS' : 'FAIL'}`);
process.exitCode = summary.pass ? 0 : 1;
