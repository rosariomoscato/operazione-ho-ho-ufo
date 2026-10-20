# Operazione Ho Ho UFO — Handoff

Concept approvato. Leggere `AGENTS.md` e questo file a ogni nuova sessione; continuare con la skill `build-a-game`.

## 1. Pipeline

| # | Passo | Stato | Note |
|---|---|---|---|
| 1 | Storia, personaggi e luoghi | Completato | Concept approvato; SCRIPT e BACKLOG scritti |
| 2 | Debug visivo | Completato | Catture verificate, errore da 5 cm rilevato, test software passato |
| 3 | Stile e design system | Completato | A — Vinile morbido scelto, design system scritto e audit 1080p superato |
| 4 | Voci, suoni e musica | In corso | Percorso gratuito Natale arcade; 11 asset e pagina ascolto pronti, attesa approvazione utente |
| 5 | Demo personaggio parlante | Saltato | Percorso gratuito scelto: dialoghi solo a testo, niente voci o labiale |
| 6 | Vertical slice | Non iniziato | |
| 7 | Playtest | Non iniziato | |
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

**Passo corrente:** 4, proposta audio gratuita pronta per l'ascolto. Attendere feedback sui file prima di completare il passo. Passo 5 saltato per percorso gratuito; alla conferma audio procedere al passo 6. SCRIPT è una prima stesura derivata dal concept, non un'approvazione delle singole battute.

## 3. Domande aperte

- L'utente approva le due musiche e gli effetti della pagina ascolto, o desidera modifiche?

## 4. Demo

| Demo | Come aprirla | File |
|---|---|---|
| Laboratorio visivo tecnico | `npm.cmd run dev`, poi http://127.0.0.1:5173/tools/testscene.html | `tools/testscene.html`, `tools/testscene.mjs` |
| Contact sheet passo 2 | Aprire PNG | `docs/evidence/step-02/contact-sheet.png` |
| Report positivo, negativo e software | Aprire JSON | `docs/evidence/step-02/` |
| Confronto giocattoli 3D | http://127.0.0.1:5173/design/styles/index.html | `design/styles/index.html` e immagini permanenti in `design/styles/frames/` |
| A — Vinile morbido | http://127.0.0.1:5173/design/styles/vinyl.html | `design/styles/vinyl.html` |
| B — Bottega di legno | http://127.0.0.1:5173/design/styles/wood.html | `design/styles/wood.html` |
| C — Action figure spaziali | http://127.0.0.1:5173/design/styles/action.html | `design/styles/action.html` |
| Ascolto audio gratuito | http://127.0.0.1:5173/tools/audio/audition.html | `tools/audio/audition.html`, `tools/audio/audition.mjs`, `public/audio/` |

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

1. Mostrare pagina ascolto e chiedere approvazione/modifiche. Non avanzare finché non risponde.
2. Dopo l'approvazione segnare passo 4 completo, mantenere passo 5 saltato e leggere `references/06-vertical-slice.md` e `references/team.md`.
3. Preparare piano tecnico e team del primo segmento giocabile, comunicando all'utente il carico previsto prima di eseguire una sessione multi-agente pesante.

Ambiente verificato: Node v22.23.1 e git 2.54.0.windows.1 disponibili; progetto inizialmente vuoto salvo la skill installata.
