import { execSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { capture } from './capture.mjs';
import { serve } from './serve.mjs';

if (!process.env.GAME_ROOT) execSync(process.platform === 'win32' ? 'npm.cmd run build' : 'npm run build', { stdio: 'inherit' });
const root = process.env.GAME_ROOT ?? 'dist';
const { server, url } = await serve(root);
const summary = { pass: true, act: 'square', html: await readFile(join(root, 'index.html'), 'utf8'), runs: [] };
function coverage(scenario, frames) {
  const errors = [];
  for (const frame of frames) {
    const state = frame.state, boss = state?.boss;
    if (state?.chapter !== 'square' || !boss) { errors.push('Missing final-act/boss state: numeric render checks cannot prove scenario coverage'); continue; }
    if (scenario.startsWith('boss-cycle-') && boss.cycle !== Number(scenario.at(-1))) errors.push(`Wrong boss cycle for ${scenario}`);
    if (scenario === 'boss-vulnerable' && boss.phase !== 'vulnerable') errors.push('Vulnerability preset is not actually vulnerable');
    if (scenario === 'boss-locked' && (boss.phase !== 'windup' || boss.lockedAt === null)) errors.push('Locked preset has no locked wind-up');
    if (['boss-wrapped','square-core','square-carrying','square-ending'].includes(scenario) && boss.segments !== 3) errors.push(`Boss is not defeated in ${scenario}`);
    if (scenario === 'square-ending' && state.checkpoint?.coreReturned !== true) errors.push('Ending checkpoint has not returned the core');
  }
  return [...new Set(errors)];
}
try {
  const cases = ['square-entry', 'boss-cycle-1', 'boss-cycle-2', 'boss-cycle-3', 'boss-locked', 'boss-vulnerable', 'boss-wrapped', 'square-core', 'square-carrying', 'square-ending'];
  for (const scenario of cases) {
    const report = await capture({ page: 'index.html', url, scenario, times: scenario === 'square-ending' ? [0, 1.5, 3.5, 5, 8] : [0], views: ['player', 'diorama'], size: [1280, 720], out: `captures/square/${scenario}`, selftest: true });
    const coverageErrors = coverage(scenario, report.frames);
    summary.runs.push({ scenario, pass: report.pass && coverageErrors.length === 0, renderPass: report.pass, errors: report.errors, coverageErrors, maxCalls: Math.max(...report.frames.map(frame => frame.stats.drawCalls)), maxTriangles: Math.max(...report.frames.map(frame => frame.stats.triangles)) });
    summary.pass &&= report.pass && coverageErrors.length === 0;
  }
  for (const scenario of ['boss-vulnerable', 'square-ending']) {
    const report = await capture({ page: 'index.html', url, scenario, times: [scenario === 'square-ending' ? 1.5 : 0], views: ['player'], size: [1920, 1080], out: `captures/square/audit-${scenario}`, selftest: true, visualChecks: true });
    summary.runs.push({ scenario: `audit-${scenario}`, pass: report.pass, errors: report.errors, audit: report.visualAudit });
    summary.pass &&= report.pass;
  }
  const software = await capture({ page: 'index.html', url, scenario: 'boss-cycle-3', times: [0], views: ['player'], size: [1280, 720], out: 'captures/square/software', selftest: true, gpu: 'swiftshader' });
  summary.runs.push({ scenario: 'software', pass: software.pass, errors: software.errors });
  summary.pass &&= software.pass;
} catch (error) {
  summary.pass = false; summary.error = error.stack ?? String(error); throw error;
} finally {
  await new Promise(done => server.close(done)); await mkdir('captures/square', { recursive: true });
  await writeFile('captures/square/summary.json', JSON.stringify(summary, null, 2));
}
console.log(`M3 captures: ${summary.pass ? 'PASS' : 'FAIL'}`); process.exitCode = summary.pass ? 0 : 1;
