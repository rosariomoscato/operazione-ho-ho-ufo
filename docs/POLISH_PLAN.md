# Passo 9 — Rifinitura snella

2026-10-21. Avventura completa D86qgQyq approvata («mi sembra ok»); utente ora chiede «procedi». Nessun fastidio prioritario espresso: ordine scelto autonomamente dai MINOR verificati, senza ripetere domande già risposte. Nessuna spesa o pubblicazione.

## Perimetro

1. **Camera:** riprodurre compressione presso negozio/riparo M2 e albero M3; mantenere avatar/bersaglio visibili senza attraversare solidi o cambiare i percorsi. Risolvere causa, non spostare collider per nascondere il difetto. Camera gameplay deterministica e senza blur. Se serve trasparenza di un occluder, solo suoi materiali clonati, non palette/materiali condivisi di tutta la scena. Conservare distinzione fra solido fisico e visibilità.
2. **Chiarezza:** aggancio assistito dichiarato come tale, libero tiro al+ con assistenza spenta; feedback E aggiornato quando cambia distanza/condizione; preferenza ragionevole per dispositivo locale pronto nei pareggi; etichette senza coprire volti. Raccordare cue/bolt M2 alla bocca visiva preservando sweep dalla root (nessun tiro attraverso ripari).
3. **Accessibilità desktop:** opzioni già presenti realmente testate (volumi, reducedMotion, aimAssist); aggiungere sensibilità mouse, inversione verticale, FOV moderato45–75 (default53), rimappatura dei7comandi tastiera movimento/schivata/interazione/aiuto, con conflitti spiegati e ripristino predefiniti. Esc resta uscita/pausa sicura; click e destro conservati. **Nessun gamepad/touch:** input approvato tastiera+mouse, non nuovo supporto non richiesto. Le istruzioni devono mostrare i tasti effettivi.
4. **Performance/mood/mix:** stessa sera Vinile A e stessa difficoltà/storia/tempi; niente nuovi livelli, filler, voci o asset esterni. Verificare budget nei tre atti e angoli peggiori/software, pool e vita delle risorse dopo retry/replay. Non dedurre60fps hardware dal software renderer. Musica/effetti statici, pausa e volume verificabili; nessun ducking vocale perché non ci sono voci.
5. **Durata:** riportare tempi del bot separati da umani. L'utente ha approvato l'esperienza; non gonfiarla per raggiungere una stima10–15min mai misurata. Un numero umano non va inventato moltiplicando il bot.

## Fonti immutabili

Non modificare `snapshots/m1-slice/`, `snapshots/m2-street/`, `snapshots/release-candidate/` (5176/5177/5179). Lavorare solo nel sorgente, poi nuova copia `snapshots/polished-1/` e porta5181 dopo gate; nuova approvazione utente prima di chiudere9. La RC approvata resta sempre giocabile.

## Contratto camera

Il core chiama `resolveGameplayCamera(world,player,yaw,pitch)` da `src/engine/camera.ts`, ricevendo `{position:Vector3,look:Vector3,distance:number,compressed:boolean,occluded:string[]}`. La funzione è deterministica, non cambia player/input/physics. Esportare anche `resetCameraOcclusion(world)` (diorama/face/override/uscita atto) e `disposeCameraOcclusion(world)` (solo proprie risorse). Il modulo può preparare/cacheare dati per mondo una volta, non scandire migliaia di triangoli ad ogni frame. Non ricreare materiali per frame.

Usare preferibilmente spalla/boom/pivot e volumi3D coerenti con la geometria; se trasparenze locali necessarie, prepararle nel mondo senza superare budget150/150k. Mai applicare il basso coefficiente di compressione solo in2D ignorando altezza e fronde/tetti. Testare griglia di pose attorno ai solidi: nessuna camera dentro solido, niente testa che riempie lo schermo senza motivo; fallback espliciti se spazio fisicamente insufficiente. Non cambiare silenziosamente il verso WASD relativo alla visuale con orbite arbitrarie.

## Ownership finché i builder sono attivi

- **Camera/visuale persistente:** nuovo `src/engine/camera.ts` ed eventuali helper `camera*.ts`; metadata/struttura camera nei tre `src/levels/{courtyard,toystreet,square}.ts`, eventualmente contratti visuali attraverso proprietà opzionali da concordare col main. `src/characters/cast/shooter.ts` solo metadata della bocca reale se utile. Status `docs/production/status/polish-camera.md`. Nessun Game/input/storage/UI o snapshot.
- **Gameplay/UI persistente:** `src/game.ts`, `input.ts`, `storage.ts`, `style.css`, `texts.ts`, `src/gameplay/bossChapter.ts`, `src/gameplay/systems/ranged.ts`, eventuale nuovo modulo UI/preferenze puro; status `polish-controls.md`. Chiama il contratto camera sopra, non ne riscrive l'implementazione. Storage checkpoint3 invariato; preferenze estese con fallback compatibili, nessuna cancellazione progressi.
- **Main:** contratti comuni prima della costruzione, test/strumenti/documenti/evidenze/freeze e integrazione. Non modifica file assegnati in parallelo.
- **Reviewer combinato persistente:** review piano e prove finali; **un nuovo playtester a occhi nuovi** per l'intero gioco da Nuova partita, senza menu capitoli (il precedente conosce già tutta la storia). Pochi collaboratori, non micro-agenti.

## Gate

- Build/typecheck/unit/regressioni salvataggi3 e hash delle tre copie. Nessun cambio involontario di danni, pattern, finestre o storia.
- Test di ogni opzione: limiti/persistenza, reset default, rimappatura effettiva e istruzioni, conflitti/annullamento, sensibilità/inversione/FOV, first-frame input e pause/resume. Test vecchi adeguati ai nuovi campi, mai allentati per far passare regressioni.
- Camera: prima/dopo gameplay vicino a negozio M2/albero M3, griglia numerica di clearances, occluder locale e no modifica materiali condivisi, reset tra viste/atti, contatti/budget/determinismo; misurare eventuali risorse non rilasciate prima di cambiarne il ciclo di vita.
- Audit1080 e diagnosi deuteranopia, segnali di forma/testo, screening lampi nei modi disponibili, reducedMotion e assist on/off con catture vere. Software mirato tutti e tre gli atti, angoli peggiori e picchi campionati entro budget.
- Fullbot input reali Nuova partita→fine, con nuovi default compatibili; opzioni nonpredefinite provate separatamente. Nuovo fresh-eyes completo dalla sola UI, pause per latenza dichiarate senza chiamarle durata umana.
- Review finale criticogenere/narrativa in ordine; risolvere BLOCKER/MAJOR. Congelare polished-1 solo dopo gate, mostrare link e chiedere approvazione. Nessuna pubblicazione o costo inferiti dal polish.

## Esito consegna

TmJx2Hx1: gate tecnici, fullbot e freshfull PASS; review SHIP/LANDS/ON TRACK. Nuova `snapshots/polished-1/` congelata27file, hash e smoke5181PASS. Fonte finale `docs/evidence/step-09/source-manifest.json`, riepilogo `release-gates.json`; dettagli in HANDOFF/review finale. MINOR residuo: Santa parzialmente sottochioma nel quadro finale ampio, non confondere con camera gameplay risolta. Approvazione utente ricevuta: «si, mi sembra pronta»; passo9 completato. Nessun deploy o spesa autorizzati.
