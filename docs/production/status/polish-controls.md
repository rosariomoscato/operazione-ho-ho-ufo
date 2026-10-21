# Passo9 — UI/comandi: ownership libera

2026-10-21. Implementazione consegnata al main; **non SHIP**. Nessuna nuova storia, difficoltà, durata artificiale, asset/audio, commit, subagente, worktree, spesa o snapshot. File altrui/copie M1/M2/RC non modificati. HANDOFF/BACKLOG/review/freeze restano al main.

## File e API

Modificati soltanto `src/game.ts`, `src/input.ts`, `src/storage.ts`, `src/style.css`, `src/gameplay/bossChapter.ts`, `src/gameplay/systems/ranged.ts`; nuovo helper puro `src/ui/controls.ts`. `texts.ts` non richiede modifica: ID/battute/storia conservati, istruzioni mostrate con i comandi effettivi dal formatter.

### Preferenze, nessuna migrazione checkpoint

Stessa chiave **`ho-ho-ufo.settings.v1`**. Forma completa:

```ts
{
  master: .7, music: .3, effects: .65,
  reducedMotion: false, aimAssist: true,
  sensitivity: 1, // .25..2, moltiplicatore mouse
  invertY: false,
  fov: 53, // 45..75, gameplay; riprese finali/face/diorama conservano FOV proprio
  keyBindings: {
    forward: 'KeyW', backward: 'KeyS', left: 'KeyA', right: 'KeyD',
    dodge: 'Space', interact: 'KeyE', help: 'KeyH'
  }
}
```

Export nuovi da storage: `ControlAction`, `KeyBindings`, `defaultKeyBindings` (frozen), `freshSettings():Settings` (copia profonda dei binding), `normalizeSettings(unknown):Settings`, `validBinding(unknown): boolean` con type predicate. `defaultSettings` frozen, `readSettings()`/`writeSettings()` round-trip completo normalizzato. Nessun import runtime locale nel leaf storage: il loader dataURL dei test continua a funzionare.

Numeri non finiti/tipi errati→default; numeri finiti fuori limite→clamp. Settings legacy5campi→default nuovi. Binding accettati: KeyA–Z, Digit0–9, quattro Arrow, Space, ShiftLeft/Right. Sette codici validi unici obbligatori: mappa corrotta/parziale/duplicata→intera mappa default, nessuna correzione silenziosa per swap. JSON null/corrotto/storage negato sicuri. Nessuna modifica a checkpoint3, chiavi save, flag, migrazione, cancellazione progressi.

### Input/UI

- `Input.setBindings(KeyBindings)` copia la mappa fisica→canonici esistenti KeyW/S/A/D/Space/KeyE/KeyH, svuota held/pressed/mouse. Keyup usa la mappa raw registrata sul keydown, non la preferenza successiva. Repeat senza keydown registrato dopo rebind/blur ignorato: non resuscita W bloccato.
- `Input.capture` intercetta in capture phase **prima** dei button/Space HTML; reserved/combo e conflitti spiegati senza cambiare vecchio binding. Esc annulla cattura senza resume; fuori cattura safety pausa invariata. Alt/Ctrl/Meta non diventano gameplay; Enter resta skip fisso, Escape/Tab/Enter/Fkeys non assegnabili.
- Clic sinistro/destro trascinato invariati; nessun gamepad/touch. Il fix frame0 resta intatto: niente `endFrame()` con dt≤0, nessun clock finto.
- Menu: sensibilità, invertY, FOV, sette pulsanti di rimappatura, attesa «Premi un tasto», status conflitto/annullo e **Ripristina impostazioni predefinite** (tutte le preferenze, mai save). Reset/applicazione volumi reali passano dal mixer esistente.
- `Game.controls(text)` / helper puro `controlText(text,bindings)`: sostituzione di token di comando isolati negli authored prompt, non parsing di messaggi range né cambio di ID. HUD/tutorial/dialoghi mostrati/help/menu/marker/aria canvas usano binding effettivi. TreeWalker conserva la sorgente di ogni text node: non rimappa una stringa già trasformata. **H: aiuto aggiunto persistentemente al cortile**, oltre a M2/M3: con help KeyJ mostra J anche a720p.

### Chiarezza, camera e memoria

- Aggancio ON: **AGGANCIATO · assistenza**. OFF: **MIRATO · tiro al+**, nessuna modifica alla traiettoria. Soglie, portate e danni esistenti non cambiati.
- Etichette ordinate contro altre etichette **e volumi facciali NPC proiettati**; spostamento verticale locale, nessun nuovo criterio che nasconde NPC lontani. Font36px a1920×1080 come root esistente, non rimpicciolito per compattare. Pannelli opachi conservati; bottom più compatto per padding/gap, speaker/testo a1rem.
- `Game.notifyRange(target:Point,name,radius=2.2,ready=true)` usa dati strutturati; `feedback` getter ricalcola distanza e LOC reali. In portata non promette uso per dispositivo protetto. Gate M1/M2, ancoraggi e nucleo/albero M3 raccordati. Il no-core all'albero non conserva più una distanza statica.
- `nearestAnchor()` preferisce il lato pronto nei pareggi entro1m, non teletrasporta: distanza≤2.2/LOC/guardiani ancora obbligatori.
- Importati **solo** i tre export camera del builder: player→resolve; override/face/diorama/finale→reset; clearActors/uscita atto→dispose. Nessun solver duplicato. `LC.state().cameraDiagnostics` e `LC.getStats().cameraDiagnostics` sono null nelle riprese non-gameplay, altrimenti `{position:number[3],look:number[3],distance,compressed,occluded}`. `state().settings` è copia profonda per diagnostica.
- Perdite misurate nei cambi atto prima di intervenire: geometrie109→367 in4cicli. Rilasciate **soltanto geometrie merged esclusive dei tre world.root** dopo clearActors/dispose occluder; non materiali, texture, primitive/cast. Gli attori stanno fuori world.root e la rig pacco viene rimossa prima. Nuova misura: warm-up58/59/60, poi plateau **65/60/60 geometrie M2/M3/M1** ripetuto3volte; texture4 costanti, selfTest tutti positivi. Nessuna riscrittura dei sistemi/cache globali.

### Bocca tiratore M2

Export `rangedMuzzle(enemy):Vector3`: root position/angle aggiornata prima della lettura, preferisce `actor.root.userData.getMuzzleWorld(target)`, poi `muzzleLocal`, infine fallback storico. Actor assente nei fake unit gestito. Cue sfera centro .14m davanti alla bocca reale, bolt dalla bocca reale, altezza metadata. Sweep root→muzzle contro cover **e player**, selezione primo impatto prima di attivare un volo oltre il bersaglio. Verso resta sin/cos dell'angolo locked, speed6/lock/windup/1global/pool invariati.

## Prove e limiti

- `npm.cmd test`: **42/42PASS**, inclusi nuovi3settings del main, regressioni M1/M2/M3 e hash81file. Nessun test/tools/package modificato da questo builder. Eseguito prima dell'ultimissimo guard repeat/spacing etichette; main conserva rerun finale.
- `npm.cmd run build`: **PASS finale eJyO25XT**, typecheck incluso; warning storico Three544.5kB>500k, non un errore. Il bundle comprende l'albero condiviso in evoluzione: main riallinea manifest/prove/freeze definitivo.
- Nove casi `tools/check-square.mjs`: **9/9PASS** sulla nuova UI/camera, compresi Esc-clock e click/E frame0. Tool originale letto senza modificarlo; eseguita copia **in memoria** con soli import assoluti e out reindirizzato in `captures/polish-controls/square-controlled/report.json`. Ultimo guard repeat è separatamente provato.
- `captures/polish-controls/verified.json`: **8/8PASS**, zero pageerror: prefs/clamp/no save mutation, tutte7mappe canoniche+keyup, conflitti/reserved/Esc, click/E frame0, sensibilità/invert/FOV, assistOFF non snap, range live/camera reset, helpJ e interagisciF nei due capitoli.
- `real-keys-resources.json`: click e **tasti Playwright reali** su UI: conflitto Space, Tab rifiutato, Esc annulla rimanendo pausa, Z assegnato, resetW. Plateau risorse sopra;12selfTest PASS. Output non è fullplaythrough.
- `muzzle.json`: **3/3PASS** con cast shooter vero: mouth(0,1.2,1.045), bolt identico, cue(0,1.2,1.185); cover interposta root→mouth ferma il colpo prima del muro; player fra root/mouth prende un solo impatto senza spawn oltre. Nessun claim di timing da questi preset già in windup: timing coperto dai test runtime normali.
- `held-repeat-labels.json`: held W→rebind→repeat→keyup lascia0held; font etichette36px e selfTest PASS. JSON/PNG salvati e log PASS, ma processo browser.close ha superato timeout120s: **non chiamato run pulito**. Non compromette i precedenti run senza errori.
- Ricevuto dal main: UI reale volumi/invert/reduced/aim/FOV/persistenza/conflict/Esc/7remap/reload/forwardZ/sens1.5 PASS; mancava helpJ nel solo cortile, aggiunto e ricatturato1280×720/1920×1080. Main deve rieseguire il proprio tool sull'ultimo sorgente.
- Guardate immagini bossON/OFF, M2 etichette, trasporto con F/Shift/J, menu e cortile720/1080. Ultima disposizione anti-volti nel PNG `street-labels.png`; altre immagini di confronto restano storiche, non golden RC. `controlled.json`/`controlled-final.json` sono tentativi preliminari superseduti: scenario inesistente street-entry e confronto stringa accentata nel pipe PowerShell; verificato poi via tasti veri e confronti ASCII. Non nascosti come PASS.

Restano al main audit DOM cap-height/contrasto e diagnosi colore/software/peggiori angoli, prove audio reali/mix (non ascoltato qui), test camerae2e e manifest fonte/build unico, fullbot default e **nuovo** fresh-eyes completo, review finale, nuova polished-1/5181. Nessun60fps laptop o durata umana inferiti da headless/bot. Nessuna nuova milestone congelata da questo builder. **OWNERSHIP LIBERA** sui file assegnati.
