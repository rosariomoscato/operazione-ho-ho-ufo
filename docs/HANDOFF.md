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
| 7 | Playtest | In corso | Preview stabile pronta; attesa feedback utente, nessuno snapshot congelato ancora |
| 8 | Gioco completo | Non iniziato | |
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

**Passo corrente:** 7, il direttore prova il cortile. M1 ha superato i gate; review combinata **SHIP / LANDS / ON TRACK**, fresh-eyes completato e importanti risolti. Link consigliato **http://127.0.0.1:5175/** (preview statica senza HMR). Attendere feedback utente prima di costruire il resto. Non dichiarare approvazione utente o snapshot congelato finché non li abbiamo.

## 3. Domande aperte

- Feedback utente su movimento, mira, fluidità, chiarezza, grafica e audio del primo cortile.

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

Non è ancora un gioco giocabile. A è il riferimento scelto; B/C restano come confronto storico. Il laboratorio tecnico conserva `?lift=0.05` per riprodurre l'errore senza alterare la scena corretta.

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

1. Salvare commit M1, mostrare preview produzione5175 e comandi; preview è avviata e HTTP index/3bundle/audio-index verificati.
2. Raccogliere feedback testuale dell'utente in BACKLOG, chiarire note ambigue e correggere cause. Verificare i cambiamenti prima del replay.
3. Quando l'utente dice che il segmento va bene: build e copia immutabile in `snapshots/m1-slice/`, demo su porta separata e HANDOFF aggiornato; solo allora completare passo7 e andare al passo8. Riferimento07-playtest letto.
4. Nessuna pubblicazione o spesa autorizzata. Non garantire5minuti o60fps: durata fresh non misurata, prestazioni reali da giudicare sul PC utente.

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

Ambiente verificato: Node v22.23.1 e git 2.54.0.windows.1 disponibili; progetto inizialmente vuoto salvo la skill installata.
