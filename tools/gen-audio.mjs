import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const SAMPLE_RATE = 44100;
const VERSION = 'free-arcade-v1';
const TAU = 2 * Math.PI;
export const contentHash = asset => createHash('sha256').update(JSON.stringify({ version: VERSION, sampleRate: SAMPLE_RATE, asset })).digest('hex');
const frequency = midi => 440 * 2 ** ((midi - 69) / 12);

export function renderAsset(asset) {
  if (!Number.isFinite(asset.duration) || asset.duration <= 0 || asset.duration > 60) throw new Error('Invalid duration');
  const samples = new Float64Array(Math.round(asset.duration * SAMPLE_RATE));
  let seed = asset.seed >>> 0;
  const noise = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2147483648 - 1; };
  function event(start, duration, fn, gain = 1) {
    const offset = Math.round(start * SAMPLE_RATE), length = Math.round(duration * SAMPLE_RATE);
    for (let i = 0; i < length && offset + i < samples.length; i++) {
      if (offset + i < 0) continue;
      const t = i / SAMPLE_RATE, x = i / Math.max(1, length - 1);
      const envelope = Math.min(1, t / .004) * Math.min(1, (1 - x) * duration / .018);
      samples[offset + i] += fn(t, x) * envelope * gain;
    }
  }
  function bell(start, midi, duration = .4, gain = .2) {
    const f = frequency(midi);
    event(start, duration, t => (Math.sin(TAU * f * t) + .28 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t * 14) + .12 * Math.sin(TAU * f * 5.4 * t) * Math.exp(-t * 25)) * Math.exp(-t * 8), gain);
  }
  function bass(start, midi, duration = .35, gain = .13) {
    const f = frequency(midi);
    event(start, duration, t => (Math.sin(TAU * f * t) + .25 * Math.sin(TAU * f * 2 * t)) * Math.exp(-t * 4), gain);
  }
  function kick(start) { event(start, .17, t => Math.sin(TAU * (45 * t + 55 * .035 * (1 - Math.exp(-t / .035)))) * Math.exp(-t * 28), .18); }
  function snare(start, gain = .06) { event(start, .1, t => noise() * Math.exp(-t * 40), gain); }
  const recipe = asset.recipe;
  if (recipe === 'village' || recipe === 'combat') {
    if (asset.bpm !== 120 || asset.duration !== 16) throw new Error('Music recipe requires 8 bars at 120 BPM');
    // Original melody, not a quotation of an existing Christmas song.
    const melody = [[76,79,83,79,81,79,76,74],[72,76,79,76,74,76,79,83],[74,77,81,77,79,77,74,72],[71,74,79,83,81,79,74,71],[76,79,84,83,81,79,76,79],[72,76,79,84,83,79,76,72],[74,77,81,84,83,81,77,74],[71,74,79,81,79,76,74,79]];
    const roots = [48, 45, 50, 43, 48, 45, 50, 43];
    for (let bar = 0; bar < 8; bar++) {
      for (let eighth = 0; eighth < 8; eighth++) {
        const at = bar * 2 + eighth * .25;
        bell(at, melody[bar][eighth], Math.min(.36, 16 - at), recipe === 'combat' ? .16 : .19);
        if (eighth % 2 === 0) bass(at, roots[bar] + (eighth === 4 ? 7 : 0));
        if (recipe === 'combat') {
          if (eighth % 4 === 0) kick(at);
          if (eighth % 4 === 2) snare(at);
          snare(at + .125, .016);
        } else if (eighth === 2 || eighth === 6) snare(at, .016);
      }
      for (let beat = 0; beat < 4; beat++) {
        const at = bar * 2 + beat * .5 + .125;
        bell(at, roots[bar] + 24 + [0, 4, 7, 12][beat], .22, .055);
      }
    }
  } else if (recipe === 'snow') {
    let low = 0;
    event(0, asset.duration, (t, x) => {
      low += .025 * (noise() - low);
      return (low * .65 + Math.sin(TAU * 82 * t) * .025 + Math.sin(TAU * 123 * t) * .012) * Math.sin(Math.PI * x) ** 2;
    });
  } else if (recipe === 'throw') {
    event(0, .25, t => Math.sin(TAU * (450 * t + 1800 * t * t)) * Math.exp(-t * 12), .3); bell(.13, 91, .32, .15);
  } else if (recipe === 'wrap') {
    event(0, .15, t => Math.sin(TAU * (100 * t + 15 * (1 - Math.exp(-t * 22)))) * Math.exp(-t * 30), .4);
    [84, 79, 76, 72].forEach((n, i) => bell(.1 + i * .11, n, .34, .18));
  } else if (recipe === 'dodge') {
    let low = 0; event(0, .32, (t, x) => { low += .18 * (noise() - low); return low * Math.sin(Math.PI * x) ** 2; }, .6);
  } else if (recipe === 'alien') {
    event(0, .59, t => Math.sin(TAU * (160 * t + 35 * t * t) + 4 * Math.sin(TAU * 19 * t)) * Math.exp(-t * 5), .28);
  } else if (recipe === 'anchor') {
    event(0, .6, t => Math.sin(TAU * (360 * t - 220 * t * t)) * Math.exp(-t * 6), .22);
    [72, 76, 79, 84].forEach((n, i) => bell(.48 + i * .12, n, .5, .2));
  } else if (recipe === 'checkpoint' || recipe === 'heal') {
    (recipe === 'heal' ? [79, 83, 86, 91] : [72, 76, 84]).forEach((n, i) => bell(i * .14, n, .45, .22));
  } else if (recipe === 'hurt') {
    event(0, .3, t => (Math.sin(TAU * (140 * t - 100 * t * t)) + .15 * noise()) * Math.exp(-t * 18), .3);
  } else throw new Error(`Unknown recipe: ${recipe}`);

  let peak = 0; for (const v of samples) { if (!Number.isFinite(v)) throw new Error('Nonfinite sample'); peak = Math.max(peak, Math.abs(v)); }
  if (peak === 0) throw new Error('Silent asset');
  const gain = 10 ** (asset.peakDb / 20) / peak;
  for (let i = 0; i < samples.length; i++) samples[i] *= gain;
  return samples;
}

export function encodeWav(samples) {
  const wav = Buffer.alloc(44 + samples.length * 2);
  wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(SAMPLE_RATE, 24); wav.writeUInt32LE(SAMPLE_RATE * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, i) => { if (!Number.isFinite(sample) || Math.abs(sample) >= 1) throw new Error('Clipped or invalid sample'); wav.writeInt16LE(Math.round(sample * 32767), 44 + i * 2); });
  return wav;
}

export function inspectWav(wav) {
  if (wav.toString('ascii', 0, 4) !== 'RIFF' || wav.readUInt32LE(24) !== SAMPLE_RATE || wav.readUInt16LE(22) !== 1 || wav.length !== wav.readUInt32LE(40) + 44) throw new Error('Invalid generated WAV');
  let peak = 0, squares = 0, clipped = 0, sum = 0, maxStep = 0, previous = 0;
  for (let i = 44; i < wav.length; i += 2) {
    const value = wav.readInt16LE(i) / 32768;
    peak = Math.max(peak, Math.abs(value)); squares += value * value; sum += value;
    if (Math.abs(value) >= .999) clipped++;
    if (i > 44) maxStep = Math.max(maxStep, Math.abs(value - previous)); previous = value;
  }
  const count = (wav.length - 44) / 2;
  return { sampleRate: SAMPLE_RATE, channels: 1, duration: count / SAMPLE_RATE, peakDb: 20 * Math.log10(peak), rmsDb: 20 * Math.log10(Math.sqrt(squares / count)), dcOffset: sum / count, clippedSamples: clipped, seamDelta: Math.abs(wav.readInt16LE(44) - wav.readInt16LE(wav.length - 2)) / 32768, maxStep };
}

export async function generate(manifestPath, dryRun = false) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.route !== 'free-offline' || manifest.projectCreditCeiling !== 0) throw new Error('This tool only supports the zero-cost offline route. No APIs are called.');
  const ids = new Set();
  for (const asset of manifest.assets) {
    if (!/^[a-z0-9.-]+$/.test(asset.id) || ids.has(asset.id)) throw new Error('Invalid/duplicate asset id'); ids.add(asset.id);
    if (!['music', 'ambience', 'sfx'].includes(asset.type)) throw new Error('No voice generation supported');
  }
  const index = { version: VERSION, route: manifest.route, creditsSpent: 0, assets: [] };
  if (!dryRun) { await mkdir('public/audio', { recursive: true }); await mkdir('tools/audio/ledger', { recursive: true }); }
  for (const asset of manifest.assets) {
    const hash = contentHash(asset), file = `public/audio/${hash}.wav`;
    let existing; try { existing = await readFile(file); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (dryRun) { console.log(`${existing ? 'CACHED' : 'RENDER'} ${asset.id}: ${asset.duration}s, 0 credits`); continue; }
    const wav = existing ?? encodeWav(renderAsset(asset));
    const analysis = inspectWav(wav);
    if (analysis.clippedSamples || Math.abs(analysis.dcOffset) > .01 || analysis.seamDelta > .001) throw new Error(`Audio quality gate failed: ${asset.id}`);
    if (!existing) await writeFile(file, wav);
    index.assets.push({ ...asset, hash, file: `./${hash}.wav`, waveform: `./${hash}.svg`, cached: !!existing, analysis });
    // Tiny deterministic waveform, authored in code, for the listening page.
    const count = (wav.length - 44) / 2, bars = [];
    for (let b = 0; b < 240; b++) {
      let max = 0;
      for (let i = Math.floor(b * count / 240); i < Math.floor((b + 1) * count / 240); i++) max = Math.max(max, Math.abs(wav.readInt16LE(44 + i * 2) / 32768));
      const y = Math.max(1, max * 46);
      bars.push(`<path d="M${b * 2} ${48 - y}v${2 * y}"/>`);
    }
    await writeFile(`public/audio/${hash}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 96"><rect width="480" height="96" fill="#121d32"/><g stroke="#ffcf78" stroke-width="1">${bars.join('')}</g></svg>`);
    console.log(`${existing ? 'CACHED' : 'RENDERED'} ${asset.id}: ${analysis.peakDb.toFixed(1)} dBFS, no clipping`);
  }
  if (dryRun) { console.log('Total estimated credits: 0. No network requests.'); return; }
  await writeFile('public/audio/index.json', JSON.stringify(index, null, 2));
  await writeFile('tools/audio/ledger/opening-free.json', JSON.stringify({ route: manifest.route, generator: VERSION, projectCreditCeiling: 0, creditsSpent: 0, networkRequests: 0, assets: index.assets.map(({ id, hash }) => ({ id, hash })) }, null, 2));
  return index;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  try {
    if (!args[0] || args.slice(1).some(arg => arg !== '--dry-run')) throw new Error('Usage: node tools/gen-audio.mjs tools/audio/manifest/opening.json [--dry-run]');
    await generate(args[0], args.includes('--dry-run'));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
