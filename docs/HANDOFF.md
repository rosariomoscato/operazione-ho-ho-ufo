# Operazione Ho Ho UFO — Handoff

Concept approvato. Leggere `AGENTS.md` e questo file a ogni nuova sessione; continuare con la skill `build-a-game`.

## 1. Pipeline

| # | Passo | Stato | Note |
|---|---|---|---|
| 1 | Storia, personaggi e luoghi | Completato | Concept approvato; SCRIPT e BACKLOG scritti |
| 2 | Debug visivo | Completato | Catture verificate, errore da 5 cm rilevato, test software passato |
| 3 | Stile e design system | Completato | A — Vinile morbido scelto, design system scritto e audit 1080p superato |
| 4 | Voci, suoni e musica | Completato | Proposta audio gratuita approvata dall'utente |
| 5 | Demo personaggio parlante | Saltato | Percorso gratuito scelto: dialoghi solo a testo, niente voci o labiale |
| 6 | Vertical slice | Completato | Build/test/catture/review/fresh-eyes e rerun finali PASS |
| 7 | Playtest | Completato | Utente: «va bene»; snapshot M1 congelato e verificato su5176 |
| 8 | Gioco completo | In corso | Avventura completa/RC locale pronta; attesa playtest utente prima del passo9 |
| 9 | Rifinitura | Non iniziato | |
| 10 | Deploy | Non iniziato | Nessuna pubblicazione autorizzata |

## 2. Decisioni

| Data | Decisione | Fonte |
|---|---|---|
| 2026-10-20 | Babbo Natale salva il mondo da alieni con la testa di rettile | Utente |
| 2026-10-20 | Terza persona, azione comica, 10–15 minuti, PC browser con tastiera e mouse | Utente |
| 2026-10-20 | Titolo, trama, meccaniche e luoghi in GAME_DESIGN sono proposte, non approvati | Prima bozza |
| 2026-10-20 | Concept Operazione Ho Ho UFO approvato: trama, regali che impacchettano, tre ancoraggi, boss Squamakk e finale | Utente: «mi piace» |
| 2026-10-20 | Usare Git locale e salvare una versione dopo ogni passo; nessuna pubblicazione | Utente |
| 2026-10-20 | Identità Git locale: Rosario Moscato, ros.moscato@gmail.com | Utente |
| 2026-10-20 | Direzione grafica da esplorare: Giocattoli 3D | Utente |
| 2026-10-20 | Stile finale A — Vinile morbido | Utente: «A» |
| 2026-10-20 | Audio gratuito offline; dialoghi solo a testo, niente casting/labiale | Utente |
| 2026-10-20 | Atmosfera musicale Natale arcade | Utente |
| 2026-10-20 | Audio proposto approvato | Utente: «va bene» |
| 2026-10-20 | Primo segmento: il cortile; revisioni snelle; TypeScript + Vite + Three.js | Utente |
| 2026-10-20 | Primo cortile approvato dopo consegna del link giocabile | Utente: «va bene» |
| 2026-10-21 | Avviare M2 e fermarsi per prova prima del boss; restano review snella e audio gratuito | Utente: «prosegui», «continua»; continuità delle scelte precedenti |
| 2026-10-21 | Cartella unica con proprietà separate, nessun nuovo worktree dopo questionario interrotto | Default conservativo dell'integratore, come M1 |
| 2026-10-21 | Via dei giocattoli approvata; procedere con piazza, Squamakk e finale già previsti | Utente: «va bene, continua» |
| 2026-10-21 | M3 usa tre cicli1/2/3coni sequenziali, segmenti persistenti e interazioni nucleo/albero; coordinate tecniche scelte dentro concept | Autonomo, DESIGN PASS reviewer `docs/set-pieces/square.md` |

**Passo corrente:** 8, **avventura completa pronta per il playtest utente**. Release candidate immutabile **http://127.0.0.1:5179/** (`npm.cmd run snapshot:release`), cartella `snapshots/release-candidate/`, build **D86qgQyq**. **Nuova partita** per percorso completo; **Prova la piazza e Squamakk** per il nuovo atto senza sostituire progressi. M1 e M2 approvati restano su5176/5177. Nessuna pubblicazione o spesa autorizzata. Non passare al9 finché l'utente non prova/approva l'avventura completa.

### Consegna avventura completa — gate finali

- **SHIP / LANDS / ON TRACK**, condizioni chiuse in `docs/reviews/m3-final-review.md`§8. Nessun BLOCKER/MAJOR aperto; review/fresh-eyes precedono la consegna.
- Typecheck/build **D86qgQyq PASS**;38test sorgente PASS più1test hashRC PASS (ora39 nel comando globale). M1/M2/RC immutabili, manifest27+27+27file. Nuovo source manifest di34file, hash coerenti col test controllato e HTMLbundle uguale fra catture/fullbot/dist.
- **9/9 controlli Game reale PASS**: telegraph/checkpoint/danno singolo, schivata, regali prefire/doppi/late, nucleo→albero e checkpoint/Continua, appoggi pacco/sciarpa/ritiro, aiuti, pausaEsc/resume e primo clic/E dopo frame0. Corretto bug input perduto, nessun delta fittizio.
- **Fullbot reale Nuova partita→fine PASS**,20lanci,1morteM3 a2segmenti conservati,125.645swall con retry (non durata umana). Nessun seed/goto/danno/clock iniettato; checkpoint finali coreReturned/boss.completed/portalClosed veri.
- **31frame finali PASS** (semantica+render+determinismo+audit1080+software), max63call/53.588triangoli in M3;3luci,0post. Guardate PNG boss/scarf1.5/finale8 e foto finale del bot. Non garanzia60fps o picco di ogni sovrapposizione.
- Fresh-eyes M3 **completato0morti/retry,5HP**, finale guardato senza skip e Nuovaavventura verificata→M1. SoloUI su6Gx4, pause reali fra azioni per latenza, audio muto; varianti finali UI/input collaudate con nuove prove D86qgQyq. Non primo playthrough umano continuo né durata umana. `docs/reviews/m3-fresh-eyes.md`.
- Regressione controllataM2 7/7PASS e mixerHTMLAudio vero PASS; file statici gratuiti originali, nessuna nuova approvazione d'ascolto dal test in muto.
- FreezeRC27file byte-identici e smoke5179 PASS: Nuova partita/M1, provaM3, sciarpa close-up e terminale con nodi nave/portale/slitta invisibili, selfTest e0errori. Prove sotto `docs/evidence/step-08-m3/final/`, `release-smoke/` e `release-gates.json`.
- MINOR di camera vicino albero/props, aggancio permissivo e avvisi distanza temporanei restano in BACKLOG per feedback/rifinitura. Non rigenerare o sovrascrivere la RC; eventuali fix/polish nel sorgente e in nuova copia di milestone.

### Cronologia costruzione M3 (ownership ora libera; stati intermedi storici)

- Gameplay `ses_ea5402239ffeHy4Z4AqMv6HIKM`: game/storage/testi/input/CSS, moduli boss/scenari/registri e status gameplay-m3. Non sovrascrivere finché non libera ownership. Schema3 previsto; integratore aggiorna unit test esistenti quando API consegnata.
- Visuale `ses_ea540d802ffeAYczibcpB2Yy95` **concluso/ownership libera**: `docs/production/status/visual-m3.md`, mondo23call28.200tri/boss17call11.738tri,3luci. Immagini guardate e conservate in `docs/evidence/step-08-m3/visual/`. Raccordi concreti muzzleLocal/supporto pacco e sede albero nello status/review.
- Reviewer `ses_ea543ccebffeuVAiKb5J2usMih`: spec M3 conclusa DESIGN PASS; riutilizzare per review finale. Playtester persistente `ses_ea2c6727affencuvI80D9dBNtm` non avviato suM3: soloUI quando gate pronti, pausa fra decisioni.
- Main: test/catture/releasebot/documenti/freeze. Nessun M3 già dichiarato funzionante; stage8 completo solo dopo gate, bot Nuova partita→finale e prova utente dell'avventura. Non saltare al polish/deploy.
- M2 congelato salvato in commit `13490ee`, bytes esclusi da conversione EOL tramite `.gitattributes`; smoke2frame/selfTest PASS, prove `docs/evidence/step-08/frozen-m2/`. Hash M1+M2 tutti27+27 PASS; dati/percorsi M3 **2test PASS**, non test del boss.
- Strumenti main preparati: `tools/square.test.mjs` (dati/accessibilità), `tools/capture-square.mjs`/`npm.cmd run capture:square` (da eseguire solo dopo implementazione scenari), `tools/input-driver.mjs` e `tools/playthrough-acts.mjs` (controlli reali/M1→M2→ingressoM3, non ancora eseguiti sul nuovo atto). Driver fresh-eyes accetta `PLAYTEST_AREA=m3` e `PLAYTEST_STEP_MODE=1`; non ancora avviato. Completarne il bot con stato/API boss consegnati dal builder, non inventare PASS o durata.
- Aggiunto `tools/full-playthrough.mjs` / `npm.cmd run test:playthrough`: nessun seed/goto/seek/danno iniettato, nuovo context→Nuova partita→M1/M2→boss/core/albero/finale, retry reali contati se muore. Sintassi dei3moduli input/playthrough PASS e2test dati M3 PASS. **Non ancora eseguito**: attende build M3 e adattamento al campo phase effettivo del boss; non chiamarlo completamento reale prima del report. API prevista `LC.state().boss.phase`, da confrontare con consegna del builder.
- Review visuale parziale **PASS provvisorio**, nessunBLOCKER/MAJOR (`docs/reviews/m3-visual-review.md`). Main `test:square`5test PASS dati+mondo reale+timeline/restoreridotto+48pose/veri vertici cast e budget. Test comuni23PASS incluso schema3 e hash M1/M2; non sono gate del combattimento M3.
- Nuovo `tools/square-storage.test.mjs`: migrazioniv2/saveboundaries/corruzione/clear4/5PASS; testversionstringaFAIL e statoendingimpossibile (M3-S1) inviato al builder per filtro stretto. Ownershipstorageancoralui, mainnonlo corregge in parallelo.
- Preparati `tools/freeze-release.mjs`/`serve-release.mjs`: richiedono report reali PASS, review/playtest accettati e HTMLbuildidentico fra capture/fullbot/dist, rifiutano sovrascritture. **Non eseguiti**, nessun releasecandidate ancora creato o promessa di funzionamentoM3. Porta futura5179 solo dopo gate.
- Primo build integrato M3 **PASS** (`index-BFh1iWzC.js`), copia di lavoro separata in `C:/Users/rosar/AppData/Local/Temp/opencode/m3-candidate-BFh1iWzC/` per non subire modifiche sorgente durante le prove. Capture M3 e full-playthrough su questa candidata avviati in background: esito ancora da ricevere, non contarliPASS. Storage M3-S1 corretto dal builder e rerun5/5PASS; unit globali ora includono tutti i test M3.
- **Esiti BFh1iWzC:** suite rendering numerico31frame PASS ma **integrazione visiva FAIL** osservata neiPNG: vulnerable ancora scudo, ending conbossvivo/navenonritirata e pacco/sciarpa mancanti. Non consegnare questa build. Copie raw e PNG in `docs/evidence/step-08-m3/pre-integration/`; summary corrente marcato semanticamenteFAIL, non allentati test. `capture-square.mjs` ora richiede vero bossstate/ciclo/fase e checkpoint nucleo restituito, oltre al render.
- Full bot BFh1iWzC **FAIL al gate API** dopoNuovapartita/M1/M2/ingressoM3 con17lanci0morti,91swall: manca LC.state().boss. Nessun seed/goto/danno introdotto; copia reportpermanente. Riscontri inviati al builder ancora owner. Non riusare questo come completamento finale né come prova di boss ingiocabile.
- `npm.cmd test` più recente **38/38PASS**: incluse8prove runtimeM3 (FSM vera1/2/3coni,lock ancheframe lungo,prefire/stalewindow/doppiohit,cono finito+margine corpo,miss e visibilità),5save3,2dati e gateprecedenti. Unit non sostituiscono le pose/Game reali ancora da verificare.
- Preparato `tools/check-square.mjs`:7fixture controllate sul vero Game (approach/checkpoint/cone-damage, dodge reale, regali prefire/doppi/late, presa/restituzione/retry/Continue, sciarpa/supporto/ritiro, aiuti). **Non ancora eseguito**: attende consegna stabile del core. Import SAVE_KEY nella fixture evita hardcodev2/v3; analogo raccordo applicato a check-street-combat. Sourcehash before/after impediscono di accettare un run durante modifiche concorrenti.
- Build successiva **6Gx4PZDE PASS**, candidata isolata in `C:/Users/rosar/AppData/Local/Temp/opencode/m3-candidate-6Gx4PZDE/`; capture con controlli semantici e fullbot riavviati, esiti ancora attesi. `check-square.mjs` eseguito: **7/7 PASS**, sourcehash invariati prima/dopo,0errori; copia `docs/evidence/step-08-m3/controlled/report.json`. Include veri Game.throwGift/dodge/interact/retry/Continue, ordine nucleo, appoggio sciarpa/pacco/ritiro e aiuti15/30/45. Aggiunta poi8a verifica pausaEsc reale e ripresa (da eseguire al rerun finale). Non promuovere al gate finale i vecchi PNG BFh1iWzC.
- **Esiti6Gx4 conclusi:** fullbotNuovapartita→finale **PASS22lanci,2morti169.169swall**, una morteM2 e unaM3 a2segmenti che restano salvati; non durataumana. Capture31frame **PASS anche semantico**, boss/cicli/vulnerabilità/ending reali ePNG guardate, sciarpa+ritiro visibili; max63call/53.588triangoli. Prove permanenti `docs/evidence/step-08-m3/playthrough/` e `captures/`.
- Review combinata `docs/reviews/m3-final-review.md`: **SHIP condizionato/LANDS/ON TRACK**, nonMAJOR da quelleprove; pendingfresh,Esc e allineamentosorgenti (3hash divergenti per altre modifiche core rispetto a6Gx4). FreshM3 ora **completato0morti/retry,5HP**, ha guardato finale senza skip e provatoNuovaavventura→M1; report `docs/reviews/m3-fresh-eyes.md`,37azioni434swallnonhuman, screenshotpermanenti `fresh-eyes/`. NienteMAJORconfermato,Esull'albero esitante risolto riposizionandosi.
- Nuovi test main: pausaEsc vera/finestravulnerabilità/resume **PASS** (8°caso); 9°caso deterministico **FAIL** primo input dopo resume: Game.frame dt0 svuota coda prima di update, perde click/E. RiscontroM3-I3 inviato al builder ancora owner, mainnonlofixa in parallelo; evidenza `pre-integration/first-frame-input-failed.json`. Aggiornare/rieseguire dopo fix, non congelare RC con questo gate aperto.
- Regressione controllataM2 sul nuovo source **7/7PASS** (`m2-regression/report.json`), mixerHTMLAudio reale **PASS** (`audio/runtime-audio.json`): pausa/tuttii loop, pool8, cambio musica silente finché resume,stop0. Non è nuova approvazione d'ascolto umano.

### Consegna M2 — riepilogo verificato

- **SHIP / LANDS / ON TRACK**: review `docs/reviews/m2-final-review.md`, condizioni finali chiuse con audit UI e test aggiornati; nessun BLOCKER/MAJOR aperto.
- Build finale e **22test PASS**, compresi hash M1/migrazione/save/unit ranged/mondo. Due ordini reali finali PASS:12/10lanci,clear-prima-E/ancoraggi/retry/Continua; tutorial ranged appreso al restore. Prove `docs/evidence/step-08/integration-final/`.
- M1 regressione+ingresso a piedi/E in M2 PASS (`m1-regression/`). Combattimento controllato vero Game.update **7/7 PASS** (`combat/`): lock/slot, riparo/sweep, danno, schivata, cura+persistenza, nave, interazioni indipendenti. Non è un playthrough.
- Suite completa **32frame PASS** sulla candidata meccanicamente equivalente MP92z05e (`captures/`); audit1080/software/determinismo,6misuremani/contatti/budget. Massimo campionato107call/86.070triangoli; non garanzia60fps né picco di ogni sovrapposizione possibile.
- Ultime3patch solo obiettivo/singolare/memoria tutorial: audit DpZTJjdp PASS (`final-ui/`, `final-clear/`, `final-singular/`), nuovo verbo e «1difensore» osservati, palette/contrasto/font/determinismo conformi. Nessun nuovo schema save o cambio meccanico.
- Fresh-eyes iniziale fallito per latenza; **retest UI-only completato3/3**, Giostra→Officina,0morti/retry,3HP finali. PauseEsc reali fra azioni per escludere attese del tester, non bilanciamento umano continuo o durata; audio muto, nessuna nuova approvazione d'ascolto. Report `docs/reviews/m2-fresh-eyes-retest.md`, PNGpermanenti `fresh-eyes/`.
- MINOR in BACKLOG: camera stretta vicino riparo destro, feedbackE vecchio, aggancio permissivo/clic driver da isolare, muzzle arretrato. Vecchio ritornoCOURTYARD non riprodotto nei successivi quattro completamenti bot; causa non dimostrata, traccia mantenuta.
- Nessun M2 congelato finché l'utente non lo approva; nessun M3/boss o pubblicazione. Le prove permanenti sopra sono sotto `docs/evidence/step-08/`.

### Cronologia integrazione M2 (gli stati intermedi sotto sono storici)

- Visuale completato: `src/levels/toystreet.ts`, shooter e contatti mani separati. Scena isolata104call/85.830triangoli con Santa e6difensori; non sostituisce il budget integrato. Immagini conservate in `docs/evidence/step-08/visual/`, status `docs/production/status/visual-m2.md`.
- Gameplay in lavorazione al collaboratore persistente `ses_ea5402239ffeHy4Z4AqMv6HIKM`: possiede game/storage/input/UI/testi/registri/sistemi/scenari. Non sovrascriverli finché non libera ownership. Reviewer visuale parziale attivo `ses_ea543ccebffeuVAiKb5J2usMih`, report previsto `docs/reviews/m2-visual-review.md`; visual builder libero.
- Test integratore eseguiti:11test comuni PASS;6test M2 PASS (dati, navigazione, segmenti proiettile, immutabilità27file M1, migrazione v1 non distruttiva, roundtripcheckpoint entrambi ordini). Non sono prove di completamento giocabile.
- Strumenti pronti: `npm.cmd run capture:street`, `tools/playtest-driver.mjs` e client UI-only per fresh-eyes (solo input/screenshot/testo visibile, niente LC/eval). Driver non ancora avviato. Ogni screenshot/playtest va verificato prima del link utente.
- Restano: build finale, catture e selfTest integrato (anche mani shooter), regressioneM1, integrazioneM2 entrambiordini, tiro/riparo/schivata, retry/Continua/cura, scalaaiuti15/30/45/pausa/progresso, review completa e fresh-eyes. Nessuna approvazione M2 o claim60fps.
- Verifiche successive: review visuale parziale conclusa senza BLOCKER/MAJOR (`docs/reviews/m2-visual-review.md`). Build CCPcB_n9 PASS;32fotogrammi cattura, selfTest/budget/audit1080/software PASS, ma determinismo `street-start` FAIL → suite complessiva FAIL. Osservati contact sheet Officina, completamento/nave e audit. Nessun sign-off di atto.
- Aggiunti `tools/street-runtime.test.mjs` (4test PASS: telegraph/lock, visibilità/cover, sweep colpo-riparo, danno singolo/pool/expiry), `tools/check-street.mjs` (integrazione con input reali da checkpoint M2), `tools/check-street-guidance.mjs` (debug preset per misurare scalaaiuti con input). Bot integrazione ancora FAIL: primo run Officina+retry/Continua superati, successivo ritorno inatteso al cortile; secondo run morto in combattimento. Aiuti H/pausa15/30/45 osservati PASS, reset al progresso da rieseguire con camminata basata su stato. Riscontri inviati al builder; dettagli in BACKLOG M2-T1..4. Non nascondere questi FAIL dietro i soli unit test.
- Rerun guida completato: **PASS**, H immediato, pausa congela clock, aiuti a15.01/30.01/45.01s e ingresso reale in arena azzera scala.0errori. Report `docs/evidence/step-08/guidance/report.json`; questo chiude M2-T4, non i gate combattimento/determinismo ancora aperti.
- Ulteriore rerun mirato `street-start` con2frame player PASS/deterministico (`captures/street-determinism/report.json`): primo FAIL non riprodotto, causa ancora non dimostrata. `capture.mjs` ora conserva prima/dopoPNG e stato nei futuri FAIL. Runtime test aggiunto per mondo: beacon/ID indipendenti, discesa seek-safe8→5.5→3, setter ripetuto e restore già a3,3luci PASS (5test runtime totali).
- Playtester iniziale fresh-eyes attivo `ses_ea2c6727affencuvI80D9dBNtm`: solo screenshot/testo/input tramite driver su5190, buildstatica5175, nessun accesso a codice/docs/LC; report previsto `docs/reviews/m2-fresh-eyes-initial.md`. Non cambiare dist durante il tentativo. Audio muto: nessuna approvazione d'ascolto. Questo primo tentativo serve anche a distinguere limiti del bot da problemi del gioco; non è ancora sign-off finale.
- Gameplay builder concluso, **ownership core libera**; status `docs/production/status/gameplay-m2.md`. Determinismo riprodotto come4pixel nell'ombraCSS del pannello e corretto rimuovendo shadow (non allentato confronto); contatti mani integrati. Traccia `LC.state().transitions` conserva azioni menu/reset per diagnosi del ritorno al cortile ancora non accertato.
- Typecheck finale dell'integratore PASS; build candidata separata PASS in `C:/Users/rosar/AppData/Local/Temp/opencode/m2-candidate-20261021/` (`index-MP92z05e.js`), senza cambiare dist servita al playtester. Review codice/narrativa integrata affidata al reviewer persistente, report previsto `docs/reviews/m2-integration-review.md`.
- Bot integrazione aggiornato per ispezionare HP/playing anche **dopo** la rotazione e prima del clic: possibile morte durante la decisione, seguita da clic involontari sul menu. Ipotesi, non causa provata. Tool accetta `GAME_ROOT` per usare candidata separata. Ultimo `npm.cmd test` timeout120s dopo6test emessi (nessunFAIL emesso), non contare come suite finale PASS; carico ambiente segnalato anche dal builder. Test M2 separati più recenti:6dati/save+5runtime PASS.
- **Nuovi PASS integratore:** build standard completa MP92z05e PASS,11test comuni PASS (rerun7s), `street-start` corretto4frame player/diorama selfTest+determinismo PASS. Bot candidata **entrambiordini PASS**,13lanciOfficina→Giostra /12lanciGiostra→Officina,36.633/40.034swallcomprensiviretry/reload (non durata umana). Clear-prima-E,ancore,checkpoint/retry/Continua perogni lato verificati,3/3,selfTest,0errori. Prove permanenti `docs/evidence/step-08/integration/` e `final-start/`. Ritorno al cortile non riprodotto nella nuova prova; causa vecchia non dimostrata.
- Fresh-eyes iniziale **non completato**:2morti osservate e grandi intervalli fra input,nessunMAJOR sostanziato; report `docs/reviews/m2-fresh-eyes-initial.md`. Driver ora offre pausaEsc reale fra le decisioni (nessuna manipolazione stato), screenshot prima della pausa e resume prima dell'input; directory distinta `captures/playtest-m2-stepped/`. Retest stesso playtester attivo, report previsto `docs/reviews/m2-fresh-eyes-retest.md`. Non cambiare dist MP92z05e mentre gioca. Review completa ancora attesa, niente consegna anticipata.
- Review statica completa conclusa: `docs/reviews/m2-integration-review.md`, CODE PASS provvisorio/ON TRACK,nessunnuovoBLOCKER/MAJOR provato; MINOR C1muzzle arretrato,C2verboobiettivo,C3memoriatutorial. Ilreportprecede iPASSbotentrambiordini e rerunstartfinale: per sign-off fornireleprovepiùrecenti. Builder gameplay riutilizzato solo per tool controllato `tools/check-street-combat.mjs`+status/report dedicati, nessun core/dist durante fresh-eyes; atteso output per cover/dodge/cura/nave/slot. Non duplicare la sua area.

## 3. Domande aperte

- Nessuna domanda bloccante per M2. Si mantengono impostazioni precedenti; il questionario interrotto non conta come scelta di worktree o aumento dei costi. Far provare M2 prima del boss.

## 4. Demo

| Demo | Come aprirla | File |
|---|---|---|
| Laboratorio visivo tecnico | `npm.cmd run dev:labs`, poi http://127.0.0.1:5173/tools/testscene.html | `tools/testscene.html`, `tools/testscene.mjs` |
| Contact sheet passo 2 | Aprire PNG | `docs/evidence/step-02/contact-sheet.png` |
| Report positivo, negativo e software | Aprire JSON | `docs/evidence/step-02/` |
| Confronto giocattoli 3D | http://127.0.0.1:5173/design/styles/index.html | `design/styles/index.html` e immagini permanenti in `design/styles/frames/` |
| A — Vinile morbido | http://127.0.0.1:5173/design/styles/vinyl.html | `design/styles/vinyl.html` |
| B — Bottega di legno | http://127.0.0.1:5173/design/styles/wood.html | `design/styles/wood.html` |
| C — Action figure spaziali | http://127.0.0.1:5173/design/styles/action.html | `design/styles/action.html` |
| Ascolto audio gratuito | http://127.0.0.1:5173/tools/audio/audition.html | `tools/audio/audition.html`, `tools/audio/audition.mjs`, `public/audio/` |
| Primo cortile giocabile (verifica M1) | `npm.cmd run dev`, http://127.0.0.1:5174/ | `index.html`, `src/`; build produzione `dist/` |
| Preview stabile per l'utente | `npm.cmd run build`, poi `npm.cmd run preview`, http://127.0.0.1:5175/ | Build statica senza HMR |
| Via dei giocattoli M2 | http://127.0.0.1:5175/ → **Prova la via dei giocattoli** | Prova non distruttiva; fine3/3, boss escluso |
| M2 approvato, congelato | `npm.cmd run snapshot:m2`, http://127.0.0.1:5177/ | `snapshots/m2-street/`, immutabile con manifest hash |
| Avventura completa — release candidate | `npm.cmd run snapshot:release`, http://127.0.0.1:5179/ | `snapshots/release-candidate/`, D86qgQyq, immutabile; main preview5175 può cambiare |
| Cortile M1 approvato, congelato | `npm.cmd run snapshot:m1`, http://127.0.0.1:5176/ | `snapshots/m1-slice/`, server read-only `tools/serve-snapshot.mjs` |

Il cortile è giocabile; l'avventura completa non è ancora implementata. A è il riferimento grafico scelto; B/C restano come confronto storico. Il laboratorio tecnico conserva `?lift=0.05` per riprodurre l'errore senza alterare la scena corretta.

### Verifiche passo 2

- Edge installato rilevato automaticamente; nessun browser scaricato.
- `npm.cmd test`: 3 test passati (CLI e server).
- `npm.cmd run capture`: 6 fotogrammi, 2 viste, 3 tempi, 0 errori e warning; determinismo PNG verificato.
- Ogni vista: 8 draw call, 568 triangoli; contatti entro 1 mm. Probe headless circa 60 fps, non garanzia di prestazioni su altri dispositivi.
- `node tools/capture.mjs "tools/testscene.html?lift=0.05" --times 0 --views diorama --out captures/planted-error --selftest`: FAIL atteso, exit 1; box-floor circa 0.05 m contro limite 0.001 m.
- `node tools/capture.mjs tools/testscene.html --times 0,2.4 --views diorama,fp --out captures/swiftshader --selftest --gpu swiftshader`: PASS, 4 fotogrammi.
- Contact sheet osservata direttamente. Dipendenze npm controllate: nessuna vulnerabilità segnalata all'installazione.
- Windows blocca `npm.ps1`: usare `npm.cmd` senza modificare policy di sistema.

Comando generale: `node tools/capture.mjs <page.html> --times 0,2.4,5 --views diorama,fp --out captures/<nome> --selftest`. Opzioni: `--size 1920x1080`, `--gpu swiftshader`. Screenshot e report di lavoro in `captures/` (ignorata da Git); prove permanenti in `docs/evidence/`.

### Verifiche confronto passo 3

- Tre HTML autonomi: geometria, materiali, texture procedurali e animazione inclusi; unica dipendenza esterna Three.js 0.186.1 da CDN con import map.
- Generatore sorgente `tools/build-style-mockups.mjs`; modifica qui e rigenera con `node tools/build-style-mockups.mjs` se serve. Le tre demo vanno conservate anche dopo la scelta.
- Stesso momento di 6 s: Babbo Natale porge un regalo; rettiliano, casetta, tre alberi e UFO nella stessa disposizione. Viste `diorama`, `player`, `turntable`, `face`; tempi 0, 1.5, 3, 4.5 s.
- Tutti i 48 fotogrammi passano: mani–regalo e piedi–suolo entro 1 mm, determinismo PNG verificato, 0 errori browser. Contact sheet di tutte le varianti osservate direttamente.
- Massimi rilevati: A 94 draw call/23.016 triangoli; B 94/4.544; C 96/11.156. Tre luci reali, nessuna con ombre, zero passaggi post.
- Autocritica e correzioni: isolato il personaggio nelle viste turntable/face per evitare occlusioni; ampliata la turntable per mantenere il cappello in quadro; corretta la camera player in vera terza persona e spostata lateralmente per rendere visibile il rettiliano.
- `node tools/check-styles.mjs`: pulsanti confronto, immagini locali, quattro viste, scrubber, pausa/riproduzione e contatti verificati; niente overflow della pagina confronto a 390 px. Report e screenshot in `docs/evidence/step-03/`.
- Esempio cattura: `node tools/capture.mjs design/styles/vinyl.html --times 0,1.5,3,4.5 --views diorama,player,turntable,face --out captures/styles/vinyl --selftest`.
- Dopo scelta A: aggiunto `tools/visual-audit.mjs`, attivato con `--visual-checks` in capture. Verifica palette dichiarata contro colori effettivi dei materiali, contrasto DOM e maiuscole, screening luminosità del loop a 12 Hz per vista, PNG diagnostico deuteranopia dalla vista giocatore. Limiti documentati nel design system: non certifica fotosensibilità, texture/canvas text futuri vanno controllati separatamente.
- Audit A a 1920×1080: 16 fotogrammi positivi, contrasto minimo 10.29:1, maiuscole minime 26 px, zero eventi di variazione luminosa estesa, 0 errori browser. Contact sheet e report permanenti in `docs/evidence/step-03/approved/`.
- Rifiniture successive alla scelta: pannello testo opaco, testo più grande a 1080p, intestazione nascosta nei close-up, cono del cappello centrato e ridotto per evitare una linea rossa attraverso il bordo crema; camera volto allargata per contenere il pompon. Nessuna modifica alla direzione artistica scelta.
- Tutti i controlli nuovi descrivono solo la sera innevata attualmente implementata. Non dichiarare coperti VFX, mood o gameplay futuri.

## 5. Audio e costi

Percorso gratuito esplicitamente scelto: **0 crediti, 0 API, nessun account richiesto**. 11 file statici generati offline (2 musiche, vento e 8 effetti). Nessun doppiaggio. Manifest `tools/audio/manifest/opening.json`, indice `public/audio/index.json`, registro `tools/audio/ledger/opening-free.json`, dettagli in `docs/AUDIO.md`.

- `audio:plan` verificato prima della generazione; seconda esecuzione dry-run rileva tutti gli asset in cache.
- `npm.cmd test`: 6 test passati, incluse tutte le ricette audio deterministiche, peak, durata, clipping, salti alle estremità e cache key.
- `node tools/check-audio.mjs`: tutti gli 11 WAV caricati e avviati in Edge; prova di 12 s completa, reset/stop verificati, nessun errore e nessun overflow a 390 px. Report e screenshot in `docs/evidence/step-04/`.
- Corretto il server locale con lunghezza file e byte-range: prima i file lunghi davano durata infinita nel browser. Test HTTP aggiunti.
- Screenshot e waveform osservati. Verifiche tecniche non equivalgono ad approvazione d'ascolto: chiedere feedback all'utente.
- Server locale riavviato su porta 5173 per caricare i nuovi header audio; nessuna modifica alle policy di sistema.
- Qualsiasi futuro percorso a pagamento richiede decisione separata, preventivo e sì esplicito; non è implementato nel renderer gratuito.

## 6. Prossimi passi

1. Consegnare linkRC5179: Nuova partita oppure Prova la piazza e Squamakk. Lasciare giocare l'utente; raccogliere sensazioni su boss, chiarezza, fluidità, grafica e audio senza un altro ciclo di sviluppo anticipato.
2. Registrare feedback in BACKLOG, chiarire ambiguità e verificare le correzioni. M1/M2/RC restano intatti; cambiare solo sorgente e nuove milestone, mai sovrascrivere copie congelate.
3. All'approvazione dell'avventura completa chiudere passo8 e iniziare9 leggendo il suo riferimento; affrontare i MINOR e gli aspetti di polish con review e nuovo check-in. Non ripetere concept/stile/audio/costi già scelti.
4. Nessuna pubblicazione o spesa autorizzata. Non garantire durata umana o60fps: prestazioni reali da giudicare sul PC utente. Deploy solo dopo consenso esplicito.

## 7. Evidenze M1

- `docs/TECH_PLAN.md`, `docs/LEVEL_LAYOUT.md`, `docs/set-pieces/courtyard.md`: scritti prima del codice.
- `docs/production/status/{visual,audio,gameplay}.md`: consegne con ownership, limiti e prove. Tutti i collaboratori hanno terminato.
- `npm.cmd run build`: TypeScript/Vite PASS; vendor Three539kB minificato/134kB gzip genera un warning di dimensione, non un errore. Runtime senza CDN, file audio locali.
- `npm.cmd test`: **11 PASS** (sintesi/cache audio, CLI/server, collisioni swept/raggi, percorsi dai tre spawn, save/schema/errore storage).
- `node tools/capture-game.mjs`: **42 fotogrammi**, 8 scenari + audit default e SwiftShader1080; selfTest/budget/determinismo/console PASS. Copie permanenti in `docs/evidence/step-06/captures/`, summary e report per scenario.
- Massimi della suite finale: **76 call / 93.314 triangoli**, 3 luci, zero ombre dinamiche/post. Solo mood snowy-evening attualmente implementato. Contatti piedi entro2mm; nessun falso sign-off mani: nel gameplay non c'è una presa statica del regalo, che viene lanciato.
- Audit UI1080: contrasto minimo **10.01:1**, maiuscole minime **25px**, palette conforme, zero variazioni luminose estese rilevate nel probe. Reticolo è un simbolo aria-hidden, verificato visivamente e con contorno ink/crema12.32:1, non testo contro un fondo canvas presunto.
- Probe headless: circa42fps default e0.90fps SwiftShader. **Non sono garanzia né misura diretta dei60fps gameplay**: il probe chiama seek+renderNow (nel gioco seek ridisegna già), SwiftShader è CPU-bound e molto lento. Pass software significa rendering/test/budget corretti, non che la versione CPU sia fluida. Verificare fluidità sul PC dell'utente; nessun claim60fps già raggiunti.
- `node tools/check-game.mjs`: PASS con input reali, senza goto/seek; tutorial e sei difensori, retry+reload/Continua su A/B/C effettivamente raggiunti, E ecomplete1/3, reload finale, storage negato non fatale. Report `docs/evidence/step-06/integration.json`; il bot legge LC.state per orientarsi, **non è fresh-eyes**. Combat walltime17.18s nel run informato, non durata da primo giocatore.
- `node tools/check-melee.mjs`: PASS AI live due colpi distinti, windup~1s, lock~.8s, recovery≥1.2s; cura reale+2 una volta e consumo preservato dopo retry. Report `melee.json` include log. Lo scenario debug non altera save reale.
- `node tools/check-runtime-audio.mjs`: PASS HTMLAudio reale, loop/pool/pausa/ripresa/stop; registro0crediti.
- `node tools/check-wrap.mjs`: PASS 4 catture1920 a.25/.9s, modalità normale/ridotto movimento, bersaglio non spostato; `docs/evidence/step-06/wrap/`. PNG live della chiusura osservata e confrontata dal reviewer.
- Reviewer `docs/reviews/courtyard.md`: SHIP/LANDS/ON TRACK dopo correzioni R1–R3; MINOR sulla cattura tardiva della sola freccia live, preset spedizione corretto.
- Bot iniziale falliva perché restava lontano dall'ultimo difensore senza avanzare; corretto il **bot** per avvicinarsi, non alterata difficoltà/nemici. I precedenti timeout in parallelo non sono stati conteggiati come PASS.
- Titolo/pausa/review non ridisegnano continuamente; Esc funziona anche su pulsanti; separazione player/nemici impedisce sovrapposizioni sfruttabili. Nessun acquisto o deploy.
- Fresh-eyes `docs/reviews/fresh-eyes.md`: COMPLETED dalla nuova partita fino a1/3, nessuna sconfitta,2HP finali; nessun codice/docs/LC consultato. Durata e audio non verificati. Retest stessa sessione dopo correzioni: importanti risolti, completamento; non dichiarato nuovo blind playtest. Immagini raw sono artefatti della sessione Playwright non archiviate localmente; report e prove integrate locali restano permanenti.
- Correzioni post-playtest: istruzioni reticolo/non-puntatore, markerMIRATO+cerchio, avviso lati/dietro, labelcura, prefissoPercorso, singolare1difensore. Anche con assist disattivato il marker indica allineamento ma non sposta la traiettoria. Restano MINOR di sovrapposizione fra marker e fascia inferiore UI.
- L'interruzione HMR durante retest è documentata; consegnare preview statica5175 per evitare ricariche da modifiche sorgente. Nessun ritorno spontaneo al titolo riprodotto nei test produzione.
- Rerun finale dopo tutti i cambiamenti UI: **PASS** suite42catture/default/software1080, E2E A/B/C+1/3 e melee/cura/retry. Copie dei report finali aggiornate in `docs/evidence/step-06/captures/`; integration finale8lanci,57.136s wallclock di combattimento inclusi retry/reload, non durata fresh.

## 8. Chiusura playtest e snapshot M1

- Approvazione utente registrata il2026-10-20, senza richieste di modifica aggiuntive.
- `npm.cmd run build`: PASS, stesso bundle approvato (`index-CnKfY3Uc.js`). Copiati27file da dist allo snapshot; SHA256 confrontati uno per uno, identici.
- Snapshot creato solo dopo verifica che la destinazione non esistesse; nessuna sovrascrittura. I suoi asset sono autonomi, inclusi JS/CSS/audio locali.
- `npm.cmd run snapshot:m1` serve solo lo snapshot su5176, senza build. Non usa la cartella dist e non si aggiorna con Vite/HMR.
- Smoke test: `node tools/capture.mjs index.html --url http://127.0.0.1:5176/ --scenario training --times 0 --views player --out captures/snapshot-m1 --selftest` → PASS,1fotogramma,0errori. Prove permanenti `docs/evidence/step-07/`.

Ambiente verificato: Node v22.23.1 e git 2.54.0.windows.1 disponibili; progetto inizialmente vuoto salvo la skill installata.
