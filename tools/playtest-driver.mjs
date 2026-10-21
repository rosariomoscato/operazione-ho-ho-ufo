import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { findBrowser } from './capture.mjs';

// UI-only bridge for a fresh-eyes agent: no eval, game state or debug commands.
const url = process.argv[2] ?? 'http://127.0.0.1:5175/';
const target = new URL(url);
if (target.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(target.hostname)) throw Error('Local game URL required');
const stepped = process.env.PLAYTEST_STEP_MODE === '1';
const area = ['m2','m3','polish'].includes(process.env.PLAYTEST_AREA) ? process.env.PLAYTEST_AREA : 'm2';
const directory = resolve(`captures/playtest-${area}${stepped ? '-stepped' : ''}`);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ executablePath: await findBrowser(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(url);
const history = []; let sequence = 0, start = Date.now(), busy = false, driverPaused = false;
const bounded = (value, min, max) => { const n = Number(value); if (!Number.isFinite(n) || n < min || n > max) throw Error('Argument outside allowed range'); return n; };
async function screenshot() {
  const path = join(directory, `${String(++sequence).padStart(3, '0')}.png`);
  await page.screenshot({ path });
  return { image: path, text: await page.locator('body').innerText(), elapsedWallSeconds: (Date.now() - start) / 1000, pauseBetweenActions: stepped, audio: 'Muted in this test setup; do not claim listening approval.' };
}
async function action(command) {
  const { type } = command;
  if (driverPaused) { await page.keyboard.press('Escape'); driverPaused = false; }
  if (type === 'mark') start = Date.now();
  else if (type === 'button') await page.getByRole('button', { name: String(command.name), exact: true }).click({ timeout: 5000 });
  else if (type === 'key') {
    const key = String(command.key);
    if (!/^(Key[WASDEH]|[wasdeh]|Space|Escape|Enter|Tab|Arrow(Up|Down|Left|Right))$/.test(key)) throw Error('Unsupported key');
    if (command.duration) { await page.keyboard.down(key); await page.waitForTimeout(bounded(command.duration, 1, 5000)); await page.keyboard.up(key); }
    else await page.keyboard.press(key);
  } else if (type === 'click') await page.mouse.click(bounded(command.x, 0, 1279), bounded(command.y, 0, 719), { button: command.button === 'right' ? 'right' : 'left' });
  else if (type === 'drag') {
    const x = bounded(command.x ?? 640, 0, 1279), y = bounded(command.y ?? 360, 0, 719);
    await page.mouse.move(x, y); await page.mouse.down({ button: 'right' });
    await page.mouse.move(bounded(x + Number(command.dx), 0, 1279), bounded(y + Number(command.dy ?? 0), 0, 719), { steps: 6 });
    await page.mouse.up({ button: 'right' });
  } else if (type === 'wait') await page.waitForTimeout(bounded(command.duration, 1, 5000));
  else if (type !== 'snapshot' && type !== 'mark' && type !== 'close') throw Error('Unsupported UI action');
  history.push({ sequence: sequence + 1, command, elapsedWallSeconds: (Date.now() - start) / 1000 });
  await page.waitForTimeout(100); // Let normal UI animation/input rendering settle.
  const result = await screenshot();
  // Real Esc menu only: no game clock/state/debug mutation. Remove remote
  // think-time from combat while retaining every requested live input interval.
  if (stepped && type !== 'close' && await page.locator('.menu-layer').isHidden()) {
    await page.keyboard.press('Escape'); driverPaused = true;
  }
  if (type === 'close') setTimeout(() => { void close(); }, 100);
  return result;
}
const server = createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/action') { res.writeHead(404).end(); return; }
  if (busy) { res.writeHead(409).end('A UI action is already running'); return; }
  busy = true;
  try {
    let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 10000) throw Error('Request too large'); }
    const result = await action(JSON.parse(body));
    await writeFile(join(directory, 'ui-actions.json'), JSON.stringify(history, null, 2));
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(result));
  } catch (error) { res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: error.message })); }
  finally { busy = false; }
});
await new Promise((done, fail) => { server.once('error', fail); server.listen(5190, '127.0.0.1', done); });
console.log(`UI-only playtest driver on http://127.0.0.1:5190/ for ${url}. Screenshots: ${directory}`);
async function close() { await browser.close(); server.close(); }
process.on('SIGINT', () => { void close(); });
process.on('SIGTERM', () => { void close(); });
