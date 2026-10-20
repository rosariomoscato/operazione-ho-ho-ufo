const byId = new Map();
let previewing = false, played = new Set();
const caption = document.querySelector('#caption'), previewButton = document.querySelector('#preview');
function stopAll(resetCaption = true) {
  previewing = false;
  for (const audio of byId.values()) { audio.pause(); audio.currentTime = 0; audio.loop = audio.dataset.loop === 'true'; audio.volume = .55; }
  previewButton.textContent = 'Ascolta la scena';
  if (resetCaption) caption.textContent = 'Riproduzione fermata.';
}
function makeCard(asset) {
  const article = document.createElement('article'); article.dataset.id = asset.id;
  const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = asset.type === 'music' ? 'Musica originale' : asset.type === 'ambience' ? 'Atmosfera' : 'Effetto';
  const title = document.createElement('h3'); title.textContent = asset.name;
  const description = document.createElement('p'); description.textContent = asset.description;
  const wave = document.createElement('img'); wave.className = 'wave'; wave.src = new URL(asset.waveform, new URL('../../public/audio/index.json', location.href)); wave.alt = 'Forma d’onda: ' + asset.name;
  const audio = document.createElement('audio'); audio.controls = true; audio.preload = 'metadata'; audio.loop = asset.loop;
  audio.dataset.loop = String(asset.loop);
  audio.src = new URL(asset.file, new URL('../../public/audio/index.json', location.href)); audio.setAttribute('aria-label', asset.name); audio.volume = .55;
  audio.addEventListener('error', () => { document.querySelector('#error').textContent = 'Impossibile caricare: ' + asset.name + '. Ricarica la pagina.'; });
  audio.addEventListener('play', () => {
    if (!previewing) {
      for (const other of byId.values()) if (other !== audio) other.pause();
      caption.textContent = 'Ascolto singolo: ' + asset.name;
    }
  });
  const meta = document.createElement('p'); meta.className = 'meta';
  meta.textContent = asset.duration + ' s · ' + (asset.bpm ? asset.bpm + ' BPM · ' : '') + asset.analysis.peakDb.toFixed(1) + ' dBFS · ' + (asset.loop ? 'Ripetizione attiva' : 'Singolo effetto');
  if (asset.loop) {
    const toggle = document.createElement('button'); toggle.textContent = 'Disattiva ripetizione';
    toggle.addEventListener('click', () => { audio.loop = !audio.loop; audio.dataset.loop = String(audio.loop); toggle.textContent = audio.loop ? 'Disattiva ripetizione' : 'Attiva ripetizione'; });
    article.append(tag, title, description, wave, audio, meta, toggle);
  } else article.append(tag, title, description, wave, audio, meta);
  byId.set(asset.id, audio);
  document.querySelector(asset.type === 'sfx' ? '#effects' : '#music').append(article);
}
try {
  const response = await fetch('../../public/audio/index.json');
  if (!response.ok) throw new Error('Indice audio non disponibile');
  const index = await response.json(); index.assets.forEach(makeCard);
  document.querySelector('#status').textContent = index.assets.length + ' file pronti · gratis · nessuna voce generata';
  previewButton.disabled = false;
  const music = byId.get('music.village');
  const events = [
    { time: 0, text: 'Briciola: «Hanno rubato il nucleo!»' },
    { time: 2, sound: 'sfx.alien', text: 'Un rettiliano sbarra la strada.' },
    { time: 4, sound: 'sfx.throw', text: 'Babbo Natale lancia un regalo.' },
    { time: 4.65, sound: 'sfx.wrap', text: 'Il rettiliano viene impacchettato!' },
    { time: 6.5, text: 'Babbo Natale: «Impacchettato. Senza scontrino.»' },
    { time: 9, sound: 'sfx.checkpoint', text: 'Briciola: «Tre ancoraggi, capo. Spegnili e la nave viene giù!»' },
  ];
  function advance() {
    if (!previewing) return;
    for (const [i, event] of events.entries()) {
      if (music.currentTime >= event.time && !played.has(i)) {
        played.add(i); caption.textContent = event.text;
        if (event.sound) { const audio = byId.get(event.sound); audio.volume = .65; audio.currentTime = 0; audio.play().catch(error => { document.querySelector('#error').textContent = error.message; }); }
      }
    }
    if (music.currentTime >= 12) { stopAll(false); caption.textContent = 'Fine della prova. Quali suoni vuoi tenere o cambiare?'; }
  }
  music.addEventListener('timeupdate', advance);
  previewButton.onclick = async () => {
    stopAll(false); played = new Set(); previewing = true;
    document.querySelector('#error').textContent = '';
    music.volume = .3; music.loop = false;
    const wind = byId.get('ambience.snow'); wind.volume = .2; wind.loop = true;
    try { await music.play(); await wind.play(); advance(); previewButton.textContent = 'Ricomincia la scena'; }
    catch { stopAll(); document.querySelector('#error').textContent = 'Riproduzione bloccata. Premi di nuovo Ascolta o usa i controlli dei singoli file.'; }
  };
} catch (error) { document.querySelector('#error').textContent = error.message; document.querySelector('#status').textContent = 'Caricamento non riuscito'; }
document.querySelector('#stop').onclick = () => stopAll();
document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); });
