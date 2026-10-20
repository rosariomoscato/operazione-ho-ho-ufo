# Audio runtime M1

Implementato esclusivamente in `src/audio.ts`; unico export: `createGameAudio(): GameAudio`, contratto da `src/contracts.ts`.

## Uso

```ts
const audio = createGameAudio();
void audio.init(); // Avviare al caricamento, senza attendere per avviare il gioco.
audio.music('music.village'); // Selezione memorizzata anche prima di init/unlock.
// Nel gestore clic/tasto di avvio:
void audio.unlock();
audio.setVolumes({ master: 0.8, music: 0.3, effects: 0.65 });
audio.effect('sfx.throw');
audio.music('music.combat');
audio.pause();
// Nel gestore esplicito di ripresa:
audio.resume();
// Titolo/uscita: reset tracce, effetti e autorizzazione logica.
audio.stop();
```

- Solo HTMLAudio e WAV statici esistenti; indice `/audio/index.json`, asset risolti relativamente all'indice. Nessun AudioContext, sintetizzatore, chiave, costo o generazione.
- `init()` idempotente: fetch con timeout 8 s, validazione indice, precaricamento metadata senza attendere i file. `stats().loaded` indica indice utilizzabile e preload avviato, **non** che tutti i file siano interamente scaricati. Errori indice/file/play rimangono non bloccanti in `stats().error` (ultimo errore, persistente).
- Un solo tema attivo, cambio immediato con reset del precedente; neve in loop sotto il tema sul bus effetti × .20. Selezioni prima dell'inizializzazione conservate; nessuna selezione obsoleta applicata dopo await.
- `unlock()` tenta playback sincronamente nel gesto quando l'indice è pronto. Se clic arriva prima del fetch, tenta al completamento: un browser che nega l'autoplay richiede un nuovo `unlock()` da gesto; nessuna promise rejection non gestita. Consigliato inizializzare già sulla schermata titolo.
- Pool riutilizzabile massimo 8 effetti, tutti gli ID `sfx.*` dell'indice supportati. `sfx.alien` prioritario, singola istanza e intervallo minimo 700 ms; non rubato da effetti meno importanti. Seconda priorità hurt/anchor/checkpoint, poi suoni ordinari. Gain .90 telegraph/.70 altri, oltre ai bus.
- Il parametro posizione è accettato ma volutamente ignorato: nessuna posizione listener nel contratto; attenuare dalla distanza dall'origine sarebbe scorretto e potrebbe nascondere i telegraph.
- Volumi master/music/effects limitati 0..1, NaN → 0, applicati anche ai suoni attivi. Default .80/.30/.65.
- `pause()` congela tutti i player senza seek; `resume()` riparte dalla stessa posizione e va chiamato da input. Effetti richiesti durante pausa/loading/lock non sono accodati. `stop()` ferma/resetta tutti i player e cancella selezione; per ripartire scegliere un tema e chiamare `unlock()`.
- Nessun listener visibility e nessun auto-resume: il core decide quando sospendere e richiede input per riprendere. ID sconosciuti dopo indice pronto segnalati in stats senza throw. `activeEffects` conta player effetti attivi non in pausa.

## Verifiche

- **PASS TypeScript strict isolato**: `node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --target ES2022 --module ESNext --moduleResolution Bundler --lib ES2022,DOM --skipLibCheck src/audio.ts`.
- **PASS test di stato con HTMLAudio simulato**, eseguiti in memoria con Node `--experimental-strip-types`: unlock prima del fetch, cambio village→combat durante fetch, esclusività musica + neve, limite 8 voci, protezione telegraph, pausa/ripresa senza seek, clamp volumi, ID ignoto, stop senza ripartenza, fetch offline, play rifiutati senza rejection non gestite, nuovo unlock dopo rifiuto e cambio musica durante pausa.
- Typecheck globale tentato: bloccato al momento della prova da `src/main.ts` che importa `./game` ancora assente; nessuna modifica fuori dai due file assegnati.
- Playback reale verificato dall'integratore con `node tools/check-runtime-audio.mjs`: inizializzazione, avvio village+vento da gesto, otto richieste effetti, pausa completa, cambio musica silenzioso durante pausa, ripresa esplicita combat+vento e stop/reset; nessun errore. Report `docs/evidence/step-06/runtime-audio.json`. Visibility e mix nel gameplay restano al collaudo complessivo. Non dichiarata una nuova approvazione d'ascolto da questi test.

## Headroom effetti simultanei

- Ogni voce usa `master * effects * gain / max(1, N)`, con N = voci logicamente attive, comprese quelle in pausa o con play pendente. Ricalcolo di **tutte** le voci a nuova attivazione, release/ended, errore, steal e cambio impostazioni. `release` sospende prima di alzare i volumi delle rimanenti; la nuova voce parte solo dopo il riequilibrio. Nessun cambiamento a priorità o revisioni anti-race.
- Dimostrazione al massimo dei tre bus: picco alien ≤ .355 × .90 = .3195; altri effetti ≤ .5012 × .70 = .35084. Per N voci, somma dei picchi ≤ N × .35084/N = **.35084**, quindi < .451. Musica ≤ .355, neve ≤ .08 × .20 = .016: totale conservativo **.72184 < .95**. Limiti dei picchi verificati rispetto ad `analysis.peakDb` dell'indice corrente, non una misura del mix percepito.
- **PASS stub HTMLAudio, master/music/effects = 1**: 8 eventi simultanei (1 alien + 7 throw), picchi effettivi dell'indice × volumi impostati; upper bound misurato **.7175598144531249**. Verificati riequilibrio a 7 voci dopo ended e rifiuto play corrente, priorità alien durante steal ripetuti, pausa/ripresa, rifiuto pendente dopo pausa senza release erronea, e stop. Tutti i bound controllati ≤ .95; strict TypeScript rieseguito con esito positivo.
- Limiti: divisione immediata per N può produrre variazioni percepibili di volume quando cambia il numero di suoni; nessun compressore, smoothing sintetizzato o AudioContext. Garanzia numerica riferita agli asset attuali e ai volumi del mixer, non a elaborazioni esterne del dispositivo o a futuri WAV con picchi superiori. Nessuna generazione, API o nuova prova d'ascolto.
