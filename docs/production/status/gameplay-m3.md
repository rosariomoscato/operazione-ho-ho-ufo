# Gameplay M3 — pronto all'integrazione finale, ownership libera

2026-10-21. Implementati piazza→boss→nucleo→albero→finale. Nessun nuovo atto/filler, spesa, voce, commit, subagente o worktree. M1/M2 congelati non modificati; hash verificati dalla suite comune. Nessun SHIP del builder: integrazione/fresh-eyes e freeze RC spettano al main.

## File / separazione

- `src/gameplay/boss.ts`: `BossBattle`, `bossConfig`, `sectorDistance`, `bossSectorContains`; FSM e latch finestra indipendenti dal renderer.
- `src/gameplay/bossVisual.ts`: unico cast Squamakk, segnale con bordo comprensivo del corpo, nucleo unico, pacco e sciarpa reale. Riusa toyMaterial/cast; nessun mondo o cast duplicato. Dispose libera soltanto geometrie/materiali posseduti, non quelli condivisi del cast.
- `src/gameplay/bossChapter.ts`: bridge di capitolo, interazioni, staging/timeline/UI/aiuti. Mondo tramite setStoryState, una chiamata per cambio stato; nessun reset per frame.
- `src/game.ts`: soli raccordi nel flusso precedente, factory/cleanup atto, tag regali, debug, misure e pausa/input. Registri esistenti rilevano automaticamente square/squamakk e il modulo scenari nuovo.
- `src/storage.ts`: schema3/migrazione; `texts.ts`: dialoghi finali e variante M2 aggiornata; `style.css`: boss-status. `src/scenarios/{types,square}.ts`: preset M3 dati.

## Flusso corrente e comandi

- Nuova partita resta M1. M2 a3/3: **E al cancello nord entra in piazza**, non più «non giocabile». Nessun testo storico degli snapshot cambiato.
- Titolo: **Prova la piazza e Squamakk**. Come ProvaM2, non cancella/sovrascrive il salvataggio; la prova M2 conserva questa modalità anche entrando in M3.
- WASD relativo camera, destro trascinato mira al+, clic lancia, Spazio schiva, E raccoglie/restituisce, H aiuto, Esc pausa. Dopo restituzione c'è presentazione dichiarata, Invio/pulsante Salta finale ed Esc pausa; il footer non promette più movimento/combattimento durante quel momento.
- Approach sul cerchio encounter; checkpoint scritto prima del primo telegraph. Un solo boss, tre segmenti, pattern1/2/3. Raggio22m/half-angle.20rad + corpo.48, lock dopo.3s, wind-up1.4s e ≥.8s bloccati anche dopo un tick lungo; attivo.35s, massimo1danno per ID anche se il contatto è protetto. Gap.5s, finestra5.5s. Miss ripete pattern corrente senza azzerare segmenti.
- Nuovo wind-up soltanto con origine visibile e LOC reali; quello già committed continua se si gira camera. Nessun minion o pericolo M2 sopravvive al cambio atto. Boss fermo; semplice separazione del corpo, nessun danno da contatto passivo.
- Regalo valido SOLO se lanciato e arrivato nella stessa finestra non consumata, da portata12m e con esplosione≤2m dal **bossPoint(0,-8)**/LOC. Non usa il punto pickup. Latch consumato prima di incrementare; prefire, late/stale flight e doppio lancio non rubano segmenti. Tag ed eventi espongono launch/impact.
- Terzo hit salva subito core e spegne pericoli. E sul pickup(0,-6.2) è valido subito, senza aspettare1.4s di gag. Flag carried sicuro, nucleo visivo magico accanto al player, nessuna presa della mano dichiarata. E all'esterno del tronco, **treeInteraction(8,-4.4)**, restituisce solo se carried. E prematuro/duplicato/lontano spiega motivo e stato; un vecchio feedback range sparisce entrando in portata.
- Una sola timeline dalla restituzione: deposito0–1, pacco/sciarpa1–2.5, ritiro nave/portale2.5–5, slitta5–8. `vo.briciola.saved`/titolo vittoria solo dopo chiusura reale del nodo portale, non dopo il solo boss. Skip avanza allo stesso terminale senza cambiare endingStarted. Retry/Continue di ending già concluso, nessun replay obbligato.
- Pausa/tab nascosta congelano clock, finestra, aiuti e audio. Nessuna cura aggiunta; retry6HP + segmenti persistenti. H e scala15/30/45 senza progresso rilevante, scheda boss fino al primo hit; nessuna attesa per abilitarli.

## Raccordo visivo effettivo

Squamakk usa il cast vero e mantiene scala base1.35. Carica attaccata alla bocca locale esportata, senza doppia scala; superficie posteriore della sfera tocca il mouth point reale. Nucleo esposto sul pettorale/strumento; logica/cerchio di tiro sempre bossPoint, distinto dal pickup.

Gag: corpo/muso/corona/piedi riconoscibili nel pacco, breve oscillazione locale, Santa traslucido solo in caso di occlusione come M1. Dopo1.4s rig trasferito al nodo **Nave di Squamakk**, posizione locale dal suo `parcelSupport`(0,.4,.8): fondo pacco a world4.8, segue ritiro/scala/reducedMotion automaticamente. Nessun clone abbandonato nella piazza.

Sciarpa rossa con frange oro, drappeggiata sul top/fronte del pacco, non una finta presa al collo. Due appoggi reali, separati dai nastri del pacco. Hook **`scarfGroup.userData.measureScarfContacts()`**, anche `BossVisual.measureScarfContacts()`. SelfTest misura punti trasformati sulle superfici realmente costruite; sollevare top di1cm causa FAIL. Supporto pacco/deck e carica/mouth sono verifiche separate, non «mani». Misure saltate quando nave/prop sono invisibili o collassati a scala0.

Finale1–2.5: camera player dedicata [4,6,-3], nodo pacco/scarf visibile. ReducedMotion usa una vista ampia stabile per tutta la presentazione; nessun grande volo. Core restituito viene collocato visivamente presso la sede dell'albero, non un secondo oggetto creato dal mondo. Unico mood snowy-evening, tre luci, zero post/blur/flash globale.

## API esatta per strumenti / fullbot

`LC.state()` conserva i campi M1/M2 e aggiunge:

```text
chapter/act: 'square'
beat: 'square' | 'boss' | 'core' | 'return-core' | 'ending'
boss: {
  phase: 'approach'|'waiting'|'windup'|'active'|'gap'|'vulnerable'|'defeated',
  segments: 0..3, cycle: 1..3, cone, pattern, attempt,
  windowId, windowConsumed, windowStarted, windowUntil,
  since, until, remaining, angle, attackId, lockedAt,
  attackContactConsumed, defeatedAt, committed, config,
  bossSegments, bossDefeated, coreCarried, coreReturned,
  endingStarted, endingElapsed, portalClosed, completed, visual
}
bossSegments/bossDefeated/coreCarried/coreReturned: stessi flag anche top-level
gifts: [{x,y,z,age,bossTag:{windowId,launchedAt,inRange}}]
```

**Per il bot: `state.boss.phase === 'vulnerable'`, `state.boss.segments`, `state.boss.windowUntil`; finale concluso `state.boss.completed === true`.** `completed` richiede restituzione, chiusura reale e almeno8s di timeline. `coreCarried:true` resta storico anche dopo coreReturned:true; il visuale non rimane in mano/accanto al player una volta restituito.

Sul Game vero: `game.square` è BossChapter; `game.boss` getter di BossBattle (null prima di M3). Model `state(time)` puro. Nessuna API pubblica per regalare progressi.

Eventi: boss-windup/lock/active/active-end/body-contact/window-open/window-miss/gift-launch/gift-rejected/gift-miss/segment-hit, boss-defeated, core-carried/core-returned, ending-scarf-presentation/portal-closed/skip, dialogue con ID; normali checkpoint/progress/hurt/avoid. Ogni hit include windowId/launchAt/impactAt; timestamp simulati.

`getStats().storyNodes` legge visibilità/position/scale reali di Nave di Squamakk, Portale alieno, Slitta delle consegne, Albero della Stella Polare; `shipHeight` reale. `selfTest` aggiunge piedi boss dove applicabile, supporti sciarpa/deck/muzzle, invarianti segmenti/flag, assenza pericoli M2, campionamento del bordo grafico espanso contro hurt-body, timing SOLO dove osservato nel log. Contatori evidence separati; log vuoto non prova timing.

## Debug pose puro

Nuovi goto: square-entry, square-approach, boss-cycle-1/2/3, boss-locked, **boss-active** aggiuntivo, boss-vulnerable, boss-miss, boss-wrapped, square-core, square-carrying, square-ending. Dati da modulo e squareLayout; non da un elenco monolitico nuovo.

Goto prepara checkpoint/phase di review senza save. Seek cambia posa/tempo, **non fa girare AI, non riapre windowConsumed né assegna segmenti**. Le fasi dei preset sono statiche preconfigurate, non un replay del combattimento; LC.play abilita simulazione vera senza persistenza in review. Esempio: boss-vulnerable resta il preset di una apertura; per vedere danni/clock veri usare play/update. Ending review ha timestamp0 e seek0..8; restore/retry vero ha timestamp-8. Anche retry da una fixture review è terminale: corretto il caso inizialmente trovato che ripresentava il finale.

Viste player/diorama/face restano; **face in M3 inquadra boss/pacco/scarf**, non il retro di Santa. Duration6 nei capitoli precedenti,8 in square. HUD nascosto solo nei close-up di review come prima.

## Storage3 — cambio API

Export: `SAVE_KEY='ho-ho-ufo.checkpoint.v3'`, `LEGACY_V2_KEY='ho-ho-ufo.checkpoint.v2'`, `LEGACY_KEY='ho-ho-ufo.checkpoint.v1'`. Boundary aggiunte square/boss/core/return-core/ending. `Checkpoint.version:3` per tutti gli atti; conserva chapter/boundary/healed/firstWrapped/disabledAnchors/clearedArenas/activatedArenas/defeatedEnemies e richiede bossSegments:number0..3 + bossDefeated/coreCarried/coreReturned:boolean. Export `BossCheckpoint`, `emptyBossCheckpoint()` oltre agli helper esistenti.

Normalize v1/v2 preserva progresso/flag esistenti e aggiunge bossflags0/false; read non riscrive all'apertura, Continue salva copia nuova. V3 impossibile rifiutato: sconfitta↔3segmenti, carried⇒defeated, returned⇒carried; boundary coerenti. Versioni **solo number1/2/3**, niente coercizione '3'/'2'/99/3.5; chapter e boundary devono essere stringhe, non array convertibili. Corrupt v3 non ripiega silenziosamente su un vecchio cortile. Nuova partita esplicita elimina v1/v2/v3, non impostazioni. Preview/debug non scrivono.

## Prove effettive

- `npx.cmd tsc --noEmit`: PASS finale, dopo il fix input.
- Build builder PASS (app B7llcmq1, Three544.5kB, solo warning chunk>500k); successivi fix minimi input/validazione richiedono il rebuild finale del main prima del freeze. Nessun package/config modificato.
- `npm.cmd test`: **38/38PASS**, compresi hash immutabili M1/M2, regressioni fisica/save,8runtime M3 e5save3. Dopo l'ultimo restringimento tipi storage,5save3 rieseguiti PASS.
- **`node tools/check-square.mjs`:9/9PASS**, zero errori. Include Esc che congela finestra/clock e riproduzione del primo frame dt0. Fix minimo in Game.frame: se dt≤0 return prima di input.endFrame; coda throw/pressed/dx/dy preservata fino al primo update vero. Nessun delta finto o modifica ai tempi boss. Tool dell'integratore non modificato.
- Catture builder13preset: selfTest tutti PASS, boss-vulnerable realmente vulnerable e boss object presente; max campionato58call/51.816triangoli nelle viste player,3luci/zero post. Sciarpa1.5s:2contatti PASS, pacco/deck/mouth separati. Guardate immagini di vuln/wrap/scarf gameplay+close/chiusura.
- Prove controllate con **Game.update vero**, non playthrough: approach salva prima del cono; dal bordo14.4m si cammina entro12m e il primo regalo arriva nell'apertura; prefire/doppio/late/stale rifiutati; ciclo3 reale→terzo volo→E nucleo allo stesso timestamp senza attesa gag→E esterno albero→scarf/chiusura/skip→retry terminale. Errore top sciarpa+1cm rilevato. Seek dopo un hit non modifica segmento/phase/window/latch.
- Breve prova **input reali, tempo reale**, ProvaM3: WASD fino a portata, prima finestra lasciata scadere intenzionalmente, secondo tentativo preso con un clic normale;1segmento,1miss,4HP,10.7372s simulati, zero errori. Non chiamata prova dell'intero boss o dell'avventura.
- Ricevuto dal main: fullbot6Gx4 da Nuova partita a fine PASS,22lanci/2morti con segmenti2 conservati;31capture semanticamente PASS e review condizionata al fresh/pausa/hash. Non rieseguito il tool full-playthrough owned dal main; non attribuito un nuovo fresh-eyes.

File propri in `captures/gameplay-m3/`: scenarios.json, boss-vulnerable-player.png, boss-wrapped-player.png, square-carrying-player.png, square-ending-player.png, ending-scarf-close.png, ending-closed.png, controlled-final.json, real-input-first-hit.json. `controlled.json` è il tentativo storico con FAIL review-retry finale, corretto e superseduto da controlled-final.json. Catture precedono soltanto le ultime rifiniture dei testi/footer, non sono golden RC.

## Limiti / consegna

Non dichiarati SHIP,60fps su laptop, durata10–15min o mix d'ascolto da un test headless. Mondo/cast veri disponibili e fallback segnala FAIL nei selfTest, non è una scena approvata sostitutiva. Restano al main rebuild/allineamento report sulla revisione finale, fresh-eyes/review finale e freezeRC prima del feedback utente/passo9. **Ownership core gameplay e dei nuovi moduli/scenari libera.**
