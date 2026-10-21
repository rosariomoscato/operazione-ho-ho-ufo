import sharp from 'sharp';
import { join } from 'node:path';

export async function visualAudit(page, views, out) {
  const metadata = await page.evaluate(() => window.LC.visualMetadata?.());
  if (!metadata) throw new Error('--visual-checks requires LC.visualMetadata()');
  const normalize = color => color.toLowerCase();
  const allowed = new Set(metadata.palette.map(normalize));
  const invalidColors = metadata.materialColors.filter(color => !allowed.has(normalize(color)));
  await page.evaluate(view => { LC.setView(view); LC.seek(0); LC.renderNow(); }, views[0]);
  const typography = await page.evaluate(() => {
    const ctx = document.createElement('canvas').getContext('2d');
    const parse = color => color.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0];
    const over = (a, b) => { const alpha = a[3] ?? 1; return [0, 1, 2].map(i => a[i] * alpha + b[i] * (1 - alpha)); };
    const luminance = rgb => rgb.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const checks = [];
    for (const node of document.querySelectorAll('body *')) {
      if (node.closest('[aria-hidden="true"]')) continue;
      if (!Array.from(node.childNodes).some(child => child.nodeType === Node.TEXT_NODE && child.textContent.trim())) continue;
      const style = getComputedStyle(node), rect = node.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2 || style.display === 'none' || style.visibility === 'hidden') continue;
      let background = [0, 0, 0];
      const ancestry = []; for (let parent = node; parent; parent = parent.parentElement) ancestry.unshift(parent);
      for (const parent of ancestry) background = over(parse(getComputedStyle(parent).backgroundColor), background);
      const foreground = over(parse(style.color), background);
      const l1 = luminance(foreground), l2 = luminance(background);
      const contrast = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
      ctx.font = style.font;
      const capHeight = ctx.measureText('H').actualBoundingBoxAscent;
      const minCapHeight = innerHeight >= 1080 ? 24 : 0;
      checks.push({ text: node.textContent.trim().slice(0, 70), contrast, capHeight, minCapHeight, pass: contrast >= 4.5 && capHeight >= minCapHeight });
    }
    return { pass: checks.length > 0 && checks.every(check => check.pass), checks, note: 'Accessible DOM text only; aria-hidden graphic glyphs are excluded and require visual/outline checks. 24px cap-height gate applies at 1080p. Canvas text needs a separate measured contract.' };
  });
  const flashes = [];
  for (const view of views) {
    const probe = await page.evaluate(({ view, selector }) => {
      const lc = window.LC; lc.pause(); lc.setView(view);
      const canvas = document.createElement('canvas'); canvas.width = 96; canvas.height = 54;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const source = document.querySelector(selector);
      const fps = 12, duration = lc.duration, samples = Math.ceil(duration * fps);
      let previous; const events = []; let maxAffectedFraction = 0;
      for (let i = 0; i <= samples; i++) {
        const before = lc.getStats().renderFrame;
        lc.seek(i / fps);
        if (!Number.isFinite(before) || lc.getStats().renderFrame === before) lc.renderNow();
        ctx.drawImage(source, 0, 0, 96, 54);
        const pixels = ctx.getImageData(0, 0, 96, 54).data;
        const values = new Float32Array(96 * 54);
        for (let p = 0; p < values.length; p++) values[p] = (pixels[p * 4] * .2126 + pixels[p * 4 + 1] * .7152 + pixels[p * 4 + 2] * .0722) / 255;
        if (previous) {
          let affected = 0; for (let p = 0; p < values.length; p++) if (Math.abs(values[p] - previous[p]) > .2) affected++;
          const fraction = affected / values.length;
          maxAffectedFraction = Math.max(maxAffectedFraction, fraction);
          if (fraction > .2) events.push(i / fps);
        }
        previous = values;
      }
      const maxEventsPerSecond = events.reduce((max, t) => Math.max(max, events.filter(other => other > t - 1 && other <= t).length), 0);
      return { view, fps, samples: samples + 1, events, maxAffectedFraction, maxEventsPerSecond, pass: maxEventsPerSecond <= 3 };
    }, { view, selector: metadata.canvasSelector });
    flashes.push(probe);
  }
  // Diagnostic simulation, not an automated guarantee of color-blind usability.
  await page.evaluate(view => { LC.setView(view); LC.seek(0); LC.renderNow(); }, views.includes('player') ? 'player' : views[0]);
  const screenshot = await page.screenshot();
  await sharp(screenshot).recomb([[.367, .861, -.228], [.28, .673, .047], [-.012, .043, .969]]).png().toFile(join(out, 'deuteranopia-preview.png'));
  const palette = { pass: invalidColors.length === 0, allowed: [...allowed], invalidColors };
  return { pass: palette.pass && typography.pass && flashes.every(check => check.pass), palette, typography, flashes, notes: ['12 Hz full-loop screening is not a clinical photosensitivity certification; inspect new fast VFX separately.', 'Color-blind PNG is a diagnostic preview; gameplay must also use shape, text and position.'] };
}
