import type { AudioSettings, GameAudio } from './contracts';

type MusicId = 'music.village' | 'music.combat';
interface Track { id: string; url: string; audio: HTMLAudioElement }
interface Voice {
  audio: HTMLAudioElement;
  id: string;
  active: boolean;
  priority: number;
  order: number;
  gain: number;
  revision: number;
}

const clamp = (value: number): number => Number.isNaN(value) ? 0 : Math.max(0, Math.min(1, value));

/** Static-file mixer. Call unlock/resume directly from a user input handler. */
export function createGameAudio(): GameAudio {
  const tracks = new Map<string, Track>();
  const voices: Voice[] = [];
  let volumes: AudioSettings = { master: 0.8, music: 0.3, effects: 0.65 };
  let initialization: Promise<void> | undefined;
  let loaded = false;
  let error: string | null = null;
  let unlocked = false;
  let paused = false;
  let selected: MusicId | null = null;
  let order = 0;
  let loopRevision = 0;
  let lastAlien = -Infinity;

  function report(message: string): void { error = message; }
  function rewind(audio: HTMLAudioElement): void {
    audio.pause();
    try { audio.currentTime = 0; } catch { /* Metadata can still be unavailable. */ }
  }
  function ready(): boolean { return loaded && unlocked && !paused; }
  function updateVolumes(): void {
    for (const track of tracks.values()) {
      track.audio.volume = clamp(volumes.master * (track.id.startsWith('music.')
        ? volumes.music : track.id === 'ambience.snow' ? volumes.effects * 0.2 : volumes.effects));
    }
    // Count logical voices (including pending plays and paused voices), not
    // audio.paused: async play/resume must never bypass the headroom budget.
    // Current peak bounds: alien <= .355 * .9, other SFX <= .5012 * .7.
    // Dividing by N bounds their sum by .35084; adding music .355 and
    // snow .08 * .2 keeps the total <= .72184 (< .95), even at full buses.
    const divisor = Math.max(1, voices.filter(voice => voice.active).length);
    for (const voice of voices) {
      voice.audio.volume = clamp(volumes.master * volumes.effects * voice.gain / divisor);
    }
  }

  // Handle both synchronous failures and rejected play promises. Stale failures
  // from a replaced track/voice must not cancel the newer selection.
  function play(audio: HTMLAudioElement, current: () => boolean, failed?: () => void): Promise<void> {
    const reject = (): void => {
      if (!current()) return;
      report('Riproduzione audio non disponibile; riprovare con un gesto utente.');
      failed?.();
    };
    try { return Promise.resolve(audio.play()).catch(reject); }
    catch { reject(); return Promise.resolve(); }
  }

  function syncLoops(): Promise<void> {
    if (!ready() || !selected) return Promise.resolve();
    const revision = loopRevision;
    const pending: Promise<void>[] = [];
    for (const id of [selected, 'ambience.snow']) {
      const track = tracks.get(id);
      if (!track) { report(`Asset audio assente: ${id}`); continue; }
      if (track.audio.paused) pending.push(play(track.audio,
        () => revision === loopRevision && ready()));
    }
    return Promise.all(pending).then(() => undefined);
  }

  function init(): Promise<void> {
    if (initialization) return initialization;
    initialization = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const indexURL = new URL('/audio/index.json', window.location.href);
        const response = await fetch(indexURL, { signal: controller.signal });
        if (!response.ok) throw new Error(`Indice audio HTTP ${response.status}`);
        const index: unknown = await response.json();
        if (!index || typeof index !== 'object' || !('assets' in index) || !Array.isArray(index.assets)) {
          throw new Error('Indice audio non valido');
        }
        for (const asset of index.assets as unknown[]) {
          if (!asset || typeof asset !== 'object' || !('id' in asset) || !('file' in asset)
            || typeof asset.id !== 'string' || typeof asset.file !== 'string') {
            report('Voce indice audio non valida');
            continue;
          }
          const url = new URL(asset.file, indexURL);
          if (url.origin !== indexURL.origin || !url.pathname.startsWith('/audio/') || tracks.has(asset.id)) {
            report(`Percorso o ID audio non valido: ${asset.id}`);
            continue;
          }
          const audio = new Audio();
          audio.preload = 'metadata';
          audio.loop = asset.id.startsWith('music.') || asset.id === 'ambience.snow';
          audio.addEventListener('error', () => report(`Caricamento audio fallito: ${asset.id}`));
          audio.src = url.href;
          tracks.set(asset.id, { id: asset.id, url: url.href, audio });
          audio.load();
        }
        loaded = tracks.size > 0;
        if (!loaded) report('Indice audio vuoto');
        updateVolumes();
        void syncLoops();
      } catch (cause: unknown) {
        report(cause instanceof Error ? cause.message : 'Inizializzazione audio fallita');
      } finally { clearTimeout(timeout); }
    })();
    return initialization;
  }

  function release(voice: Voice): void {
    voice.revision++;
    voice.active = false;
    rewind(voice.audio);
    updateVolumes();
  }
  function newVoice(): Voice {
    const voice: Voice = {
      audio: new Audio(), id: '', active: false, priority: 0, order: 0, gain: 1, revision: 0,
    };
    voice.audio.preload = 'metadata';
    voice.audio.addEventListener('ended', () => {
      if (voice.audio.ended) release(voice);
    });
    voice.audio.addEventListener('error', () => {
      if (!voice.active || !voice.audio.error) return;
      report(`Caricamento audio fallito: ${voice.id}`);
      release(voice);
    });
    voices.push(voice);
    return voice;
  }

  return {
    init,
    unlock() {
      unlocked = true;
      // Never await init before the synchronous gesture-time play attempts.
      const pending = syncLoops();
      return Promise.all([init(), pending]).then(() => undefined);
    },
    music(id) {
      if (id !== 'music.village' && id !== 'music.combat') {
        report(`ID musica sconosciuto: ${String(id)}`);
        return;
      }
      if (selected !== id) {
        loopRevision++;
        if (selected) {
          const previous = tracks.get(selected);
          if (previous) rewind(previous.audio);
        }
        selected = id;
      }
      void syncLoops();
    },
    effect(id, _position) {
      const track = tracks.get(id);
      if (!id.startsWith('sfx.') || (loaded && !track)) {
        report(`ID effetto sconosciuto: ${id}`);
        return;
      }
      // Do not queue stale combat sounds during loading, locked audio or pause.
      if (!ready() || !track) return;
      const now = performance.now();
      if (id === 'sfx.alien' && (now - lastAlien < 700
        || voices.some(voice => voice.active && voice.id === id))) return;
      const priority = id === 'sfx.alien' ? 3 : ['sfx.hurt', 'sfx.anchor', 'sfx.checkpoint'].includes(id) ? 2 : 1;
      let voice = voices.find(candidate => !candidate.active);
      if (!voice && voices.length < 8) voice = newVoice();
      if (!voice) {
        voice = voices.filter(candidate => candidate.priority <= priority)
          .sort((a, b) => a.priority - b.priority || a.order - b.order)[0];
      }
      if (!voice) return; // Never steal an active telegraph for a lower-priority sound.
      release(voice);
      voice.id = id;
      voice.priority = priority;
      voice.order = ++order;
      voice.gain = id === 'sfx.alien' ? 0.9 : 0.7;
      voice.active = true;
      voice.audio.src = track.url;
      updateVolumes();
      if (id === 'sfx.alien') lastAlien = now;
      const currentVoice = voice;
      const revision = voice.revision;
      void play(voice.audio, () => currentVoice.revision === revision && currentVoice.active,
        () => release(currentVoice));
    },
    setVolumes(settings) {
      volumes = { master: clamp(settings.master), music: clamp(settings.music), effects: clamp(settings.effects) };
      updateVolumes();
    },
    pause() {
      paused = true;
      loopRevision++;
      for (const track of tracks.values()) track.audio.pause();
      for (const voice of voices) {
        voice.revision++;
        voice.audio.pause();
      }
    },
    resume() {
      paused = false;
      if (!ready()) return;
      void syncLoops();
      for (const voice of voices) {
        if (!voice.active || !voice.audio.paused) continue;
        const revision = ++voice.revision;
        void play(voice.audio, () => voice.active && voice.revision === revision,
          () => release(voice));
      }
    },
    stop() {
      selected = null;
      paused = false;
      unlocked = false;
      loopRevision++;
      lastAlien = -Infinity;
      for (const track of tracks.values()) rewind(track.audio);
      for (const voice of voices) release(voice);
    },
    stats() {
      return { loaded, activeEffects: voices.filter(voice => voice.active && !voice.audio.paused).length, error };
    },
  };
}
