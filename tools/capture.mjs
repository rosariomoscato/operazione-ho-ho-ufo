import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import { serve } from './serve.mjs';
import { visualAudit } from './visual-audit.mjs';

export function parseArgs(args) {
  const options = { page: args[0], times: [0], views: null, out: 'captures/default', selftest: false, size: [1280, 720] };
  if (!options.page || options.page.startsWith('--')) throw new Error('Usage: node tools/capture.mjs <page.html> [--times 0,2.4,5] [--views diorama,fp] [--out path] [--size 1280x720] [--selftest] [--gpu swiftshader]');
  for (let i = 1; i < args.length; i++) {
    const key = args[i];
    if (key === '--selftest') { options.selftest = true; continue; }
    if (key === '--visual-checks') { options.visualChecks = true; continue; }
    if (key === '--build') { options.build = true; continue; }
    if (!['--times', '--views', '--out', '--size', '--gpu', '--url', '--scenario'].includes(key)) throw new Error(`Unknown option: ${key}`);
    const value = args[++i];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${key}`);
    if (key === '--times') options.times = value.split(',').map(Number);
    if (key === '--views') options.views = value.split(',');
    if (key === '--out') options.out = value;
    if (key === '--size') options.size = value.split('x').map(Number);
    if (key === '--gpu') options.gpu = value;
    if (key === '--url') options.url = value;
    if (key === '--scenario') options.scenario = value;
  }
  if (options.times.some(t => !Number.isFinite(t) || t < 0)) throw new Error('Times must be finite and nonnegative');
  if (options.size.length !== 2 || options.size.some(n => !Number.isInteger(n) || n < 64 || n > 7680)) throw new Error('Invalid size');
  if (options.gpu && options.gpu !== 'swiftshader') throw new Error('Only --gpu swiftshader is supported');
  if (options.url) {
    const target = new URL(options.url);
    if (target.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)) throw new Error('--url must target a local HTTP server');
  }
  if (options.build && options.url) throw new Error('--build and --url cannot be combined');
  return options;
}

export async function findBrowser() {
  const candidates = [
    process.env.BROWSER_PATH,
    join(process.env.ProgramFiles ?? 'C:/Program Files', 'Google/Chrome/Application/chrome.exe'),
    join(process.env['ProgramFiles(x86)'] ?? 'C:/Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe'),
    join(process.env.ProgramFiles ?? 'C:/Program Files', 'Microsoft/Edge/Application/msedge.exe'),
    join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
  ].filter(Boolean);
  for (const path of candidates) { try { await access(path); return path; } catch {} }
  throw new Error('Chrome/Edge not found. Set BROWSER_PATH to an installed Chromium browser.');
}

export async function capture(options) {
  const out = resolve(options.out);
  await mkdir(out, { recursive: true });
  const report = { page: options.page, scenario: options.scenario ?? null, size: options.size, gpu: options.gpu ?? 'default', frames: [], errors: [], warnings: [], pass: false };
  let browser, server;
  try {
    if (options.build) execSync(process.platform === 'win32' ? 'npm.cmd run build' : 'npm run build', { stdio: 'inherit' });
    const local = options.url ? { url: new URL(options.url).origin } : await serve(options.build ? resolve('dist') : process.cwd());
    server = local.server;
    const args = options.gpu === 'swiftshader' ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [];
    browser = await chromium.launch({ executablePath: await findBrowser(), headless: true, args });
    const page = await browser.newPage({ viewport: { width: options.size[0], height: options.size[1] }, deviceScaleFactor: 1 });
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') report.errors.push(message.text());
      if (message.type() === 'warning') report.warnings.push(message.text());
    });
    page.on('requestfailed', request => report.errors.push(`${request.url()}: ${request.failure()?.errorText}`));
    const url = options.url ? new URL(options.url) : new URL(options.page.replaceAll('\\', '/'), `${local.url}/`);
    if (url.origin !== local.url) throw new Error('Only local project pages are allowed');
    const response = await page.goto(url.href);
    if (!response?.ok()) throw new Error(`Page failed: ${response?.status()}`);
    await page.waitForFunction(() => window.LC?.ready === true, null, { timeout: 30000 });
    if (options.scenario) await page.evaluate(scenario => { if (typeof LC.goto !== 'function') throw new Error('Scenario capture requires LC.goto'); LC.goto(scenario); }, options.scenario);
    await page.evaluate(() => window.LC.pause());
    const views = options.views ?? await page.evaluate(() => window.LC.views);
    const tiles = [];
    for (const view of views) for (const time of options.times) {
      const frame = await page.evaluate(({ view, time, selftest }) => {
        const lc = window.LC; lc.setView(view); lc.seek(time); lc.renderNow();
        return { stats: lc.getStats(), selfTest: selftest ? lc.selfTest() : null, state: typeof lc.state === 'function' ? lc.state() : null };
      }, { view, time, selftest: options.selftest });
      const file = `${String(report.frames.length).padStart(2, '0')}-${view.replace(/[^a-z0-9_-]/gi, '_')}-${time}.png`;
      await page.screenshot({ path: join(out, file) });
      const validStats = Number.isFinite(frame.stats.drawCalls) && Number.isFinite(frame.stats.triangles);
      const budgetPass = validStats && frame.stats.drawCalls <= 150 && frame.stats.triangles <= 150000;
      report.frames.push({ view, time, file, ...frame, budgetPass });
      // Render the labels in Chromium, avoiding machine-specific SVG/font support.
      tiles.push({ file, label: `${view} / t=${time}s / ${frame.stats.drawCalls} calls / ${frame.stats.triangles} tris` });
    }
    // Determinism: identical inputs must yield byte-identical PNGs.
    await page.evaluate(({ view, time }) => { LC.setView(view); LC.seek(time); LC.renderNow(); }, report.frames[0]);
    const first = await page.screenshot();
    await page.evaluate(() => { LC.seek(1.123); LC.renderNow(); });
    await page.evaluate(({ view, time }) => { LC.setView(view); LC.seek(time); LC.renderNow(); }, report.frames[0]);
    report.deterministic = first.equals(await page.screenshot());
    report.fpsProbe = await page.evaluate(async () => {
      const samples = []; let previous;
      await new Promise(done => {
        const tick = now => {
          if (previous !== undefined) samples.push(now - previous);
          previous = now; LC.seek(samples.length / 60); LC.renderNow();
          if (samples.length < 45) requestAnimationFrame(tick); else done();
        }; requestAnimationFrame(tick);
      });
      const meanMs = samples.reduce((a, b) => a + b, 0) / samples.length;
      return { samples: samples.length, meanMs, fps: 1000 / meanMs, note: 'Headless smoke test only; not proof of laptop performance.' };
    });
    if (options.visualChecks) report.visualAudit = await visualAudit(page, views, out);
    const sheet = await browser.newPage({ viewport: { width: 960, height: Math.ceil(tiles.length / 2) * 298 }, deviceScaleFactor: 1 });
    await sheet.setContent('<html><body style="margin:0;background:#101c2a;color:#f6f3e7;font:16px system-ui;display:grid;grid-template-columns:480px 480px"></body></html>');
    const composites = [];
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const image = await sharp(join(out, tile.file)).resize(480, 270).toBuffer();
      composites.push({ input: image, left: (i % 2) * 480, top: Math.floor(i / 2) * 298 });
    }
    const base = await sharp({ create: { width: 960, height: Math.ceil(tiles.length / 2) * 298, channels: 3, background: '#101c2a' } }).composite(composites).png().toBuffer();
    await sheet.evaluate(({ base64, tiles }) => {
      document.body.style.display = 'block';
      const image = document.createElement('img'); image.src = `data:image/png;base64,${base64}`; image.style.display = 'block'; document.body.append(image);
      tiles.forEach((tile, i) => { const label = document.createElement('div'); label.textContent = tile.label; Object.assign(label.style, { position: 'absolute', left: `${(i % 2) * 480 + 12}px`, top: `${Math.floor(i / 2) * 298 + 274}px`, fontSize: '13px' }); document.body.append(label); });
    }, { base64: base.toString('base64'), tiles });
    await sheet.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
    await sheet.screenshot({ path: join(out, '_contact-sheet.png') });
    report.pass = report.frames.length > 0 && report.errors.length === 0 && report.deterministic && report.frames.every(f => f.budgetPass && (!options.selftest || f.selfTest?.pass === true)) && (!options.visualChecks || report.visualAudit?.pass === true);
  } catch (error) { report.errors.push(error.stack ?? String(error)); }
  finally {
    await browser?.close();
    if (server) await new Promise(done => server.close(done));
    await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
  }
  console.log(`${report.pass ? 'PASS' : 'FAIL'}: ${report.frames.length} frames, ${report.errors.length} errors. Report: ${join(out, 'report.json')}`);
  for (const frame of report.frames) {
    for (const check of frame.selfTest?.checks ?? []) {
      if (!check.pass) console.error(`${frame.view} @ ${frame.time}s: ${check.name} = ${check.value}, limit ${check.limit}`);
    }
    if (!frame.budgetPass) console.error(`${frame.view}: invalid stats or rendering budget exceeded`);
  }
  for (const error of report.errors) console.error(error);
  if (report.visualAudit && !report.visualAudit.pass) {
    for (const check of report.visualAudit.typography.checks.filter(check => !check.pass)) console.error(`Text audit: ${JSON.stringify(check)}`);
    if (!report.visualAudit.palette.pass) console.error(`Palette audit: ${JSON.stringify(report.visualAudit.palette.invalidColors)}`);
    for (const probe of report.visualAudit.flashes.filter(probe => !probe.pass)) console.error(`Brightness audit: ${JSON.stringify(probe)}`);
  }
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { const report = await capture(parseArgs(process.argv.slice(2))); process.exitCode = report.pass ? 0 : 1; }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
