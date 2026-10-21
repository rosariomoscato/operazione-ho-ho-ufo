# M3 — Piazza, Squamakk e restituzione

2026-10-21. L'utente approva M2 e chiede «va bene, continua». Conservare impostazioni già scelte: review snella, audio gratuito, testo italiano, cartella unica con proprietà separate. Nessuna spesa/pubblicazione.

## Prima di costruire

- M1 `snapshots/m1-slice/` immutabile. Anche M2 approvato congelato in `snapshots/m2-street/`,27file byte-identici alla build DpZTJjdp; manifest `docs/evidence/step-08/m2-snapshot-baseline.json`, server5177 `npm.cmd run snapshot:m2`. Non rigenerare nessuna delle due copie.
- Storia finale già approvata in GAME_DESIGN/SCRIPT: nave in piazza, boss con tre cicli leggibili, nucleo liberato, E per prenderlo e riportarlo all'albero, portale chiuso e sciarpa per Squamakk. Non inventare altro atto, volo pilotabile o nemici di riempimento.
- `docs/set-pieces/square.md` è il gate di design del reviewer prima di implementare combattimento e finale. Dettagli tecnici/coordinate scelti autonomamente dentro il concept; non sono nuove promesse di durata.

## Spazio e contratti condivisi

Fonte coordinate `src/acts/square.ts`, unità metri, pavimento0, stessi bounds x[-15,15]/z[-15,13]. `squareLayout`: ingresso(0,10), encounter(0,2)r4.5, Squamakk(0,-8), nucleo(0,-6.2), albero(8,-6), slitta(-9,-7). Cammino ingresso→nucleo e nucleo→albero aperto, nessun corridoio stretto tipo camera M2.

Solidi reali: `square-tree` x[7.2,8.8], z[-6.8,-5.2]; `square-sled` x[-11,-7],z[-8.5,-5.5]. L'interazione albero usa un punto accessibile **(8,-4.4)**, non il centro del tronco. Nave scenica oltre boss a(0,-12), alta quanto basta a non bloccare tiro/visibilità; fusoliera non attraversabile solo se effettivamente nel percorso (preferire fuori bounds nord). Niente muri sul centro o sul cammino a destra. Collider e spigoli devono corrispondere alle silhouette visibili.

`CourtyardWorld.setStoryState(state,time)` opzionale con state battle/core/carrying/ending, transizioni settime solo al cambio stato; update(time,beat,reducedMotion) puro/seek-safe. Il mondo gestisce albero, slitta, portale e nave **non** boss/nucleo interattivo portato dal gameplay. Stato ending: nucleo restituito illumina albero, portale/nave/pacchi si ritirano con easing senza flash, slitta si prepara alle consegne. Mai mostrare vittoria in core/carrying.

Raccordo finale condiviso: nave centro `squareLayout.ship (0,4.4,-12)`, pacco-Squamakk gestito dal core su `parcelOnShip (0,4.8,-11.2)`; non duplicare Squamakk nel mondo. Timeline da Ealbero:0–1s accento albero;1–2.5s sciarpa/pacco visibili con camera gameplay dedicata dopo restituzione;2.5–5s ritiro nave+portale+pacchi scala1→0;5–8s breve partenza slitta e titolo vittoria dopo chiusura. Tutto seek-safe, riduzione movimento conserva eventi senza grande volo camera. World espone nomi nodi per misure `Nave di Squamakk`, `Portale alieno`, `Slitta delle consegne`, `Albero della Stella Polare`.

Cast nuovo `src/characters/cast/squamakk.ts`, default `{id:'squamakk',create}`, VisualActor come gli altri: rettiliano riconoscibile, più grande, mantello/corona da generale buffo, non umano o arma realistica. Pacco/sciarpa finale come oggetti visivi core; niente mani che afferrano oggetti non misurati. Piedi reali e accessori con contatti verificabili.

## Meccanica e progressione

- Transizione dal cancello M2 dopo3/3 con E, feedback prima/fuori portata. Nuova partita continua a partire dal cortile, flusso precedente intatto; prova esplicita M3 dal titolo non sovrascrive il save reale.
- Checkpoint all'ingresso e prima del boss;6HP al retry. Squamakk si attiva avvicinandosi al cerchio encounter, nessuna attesa artificiale. Non ripetere boss già sconfitto dopo Continua.
- Boss: tre segmenti/cicli, raggio a cono annunciato, direzione bloccata prima dell'impatto, danno1/protezione esistente, una sola minaccia alla volta. Sequenza cambia fra cicli, mai sovrapposizioni cieche. Dopo sequenza finestra nucleo vulnerabile abbastanza lunga per avvicinarsi e lanciare da12m; un colpo efficace per ciclo, nessun doppio conteggio da splash/doppio lancio. Mancare ripete il ciclo, non soft-lock. Nessun countdown reale punitivo.
- Regali fuori vulnerabilità: motivo visibile («Scudo attivo · schiva il raggio»), non input ignorato. Obiettivo operativo persistente, marker destinazione distinto da MIRATO, how-to fino a primo successo, H e aiuti15/30/45 con pausa/progresso misurati.
- Boss sconfitto→E nucleo≤2.2m e linea libera→nucleo portato non perdibile→E albero sul punto accessibile≤2.2m→finale unico. I flag di sconfitta/presa/restituzione salvano immediatamente, ordine invalido negato con ragione, mai pickup duplicato o boss resuscitato dopo retry/Continua.
- Schema save3 con migrazioni v1/v2 senza riscrivere i vecchi dati all'apertura; legacy conservata finché Nuova partita esplicita. Tutte le prove vecchie e hash degli snapshot restano valide; chiave v3 nuova, clear esplicito tutte le versioni.

## Ownership

- Integratore: questo piano, contratti/atto e gate design, freeze/manifest/demo, strumenti test/release/catture/docs comuni. Non scrive file dei builder mentre assegnati.
- Builder gameplay persistente: game/storage/testi/input/CSS, nuovi src/gameplay/boss*.ts, src/scenarios/square.ts e registri se necessario; status gameplay-m3. Nessun world/cast nuovo, snapshot, tool o package. Leggere spec e rispettare tutti i checkpoint; evitare refactor non necessario di M1/M2.
- Builder visuale persistente: solo src/levels/square.ts, src/characters/cast/squamakk.ts, eventuali src/visual/square*.ts, status visual-m3. Non toccare contratti, atti, materiali/attori condivisi, game/storage o snapshot.
- Reviewer persistente: spec design prima, review combinata codice/evidenze poi. Playtester indipendente persistente soloUI con pausa reale tra decisioni, nessun accesso alle fonti M3. Pochi collaboratori, nessun nuovo team di micro-agenti.

## Budget, audio e gate finali

Stile Vinile A, materiali/luce già scelti. Mondo≤35k/25call, Squamakk≤18k/20call, scena completa/VFX≤150k/150call. Tre luci/zero post preferiti. Nessun blur o flash. Restare nella sera innevata, accenti vittoria tramite materiali piccoli conformi, non inventare un nuovo mood senza audit.

Solo audio statico gratuito già approvato: village/combat, alien/throw/wrap/anchor/hurt/heal/checkpoint. Niente voci o acquisti/API. Nessun nuovo file richiesto per completare l'atto; mix reale da verificare senza chiamare il test in muto una prova d'ascolto.

Gate: design approvato reviewer, typecheck/build/unit/hash M1+M2, salvo v1/v2/v3, M1/M2 regressione, boss segnali/lock/danno/vulnerabilità/pause, checkpoint di ogni confine, nucleo/albero/interazioni e finale, cure non farmabili; catture gameplay+close-up, palette/font/contrasto/screening/budget e software mirato, review senza BLOCKER/MAJOR, fresh-eyes. **Bot reale da Nuova partita fino al finale**, non seed/glitch per il release pass; distinguere prove controllate dai playthrough.

Quando tutti passano congelare un release candidate su cartella/porta nuova, far provare l'avventura completa e aspettare il feedback prima del passo9. Nessuna promessa di10–15minuti o60fps senza misure umane/hardware.
