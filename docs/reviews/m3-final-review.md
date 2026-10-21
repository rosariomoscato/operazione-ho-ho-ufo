# M3 — review combinata codice ed evidenze

2026-10-21. Ownership: **solo questo report**. Nessuna modifica a core/build/snapshot, nessun browser, test GPU, agente, commit o pubblicazione. Letti Game, BossBattle, BossChapter, BossVisual, storage3, scenari, input/CSS/testi; confronto con ACT_03_PLAN, spec square, SCRIPT e design A già acquisiti.

## Verdetti

| Prospettiva | Esito e ambito |
|---|---|
| Critico | **SHIP condizionato per la build provata 6Gx4PZDE**: mancano fresh-eyes concluso, prova8 pausa/Esc e raccordo hash sorgente descritto sotto. Nessun BLOCKER/MAJOR di prodotto dimostrato nelle prove lette. |
| Azione/comicità | **LANDS su meccaniche e immagini dimostrate**: cono, apertura, impacchettamento e sciarpa leggibili. Comprensione spontanea e bilanciamento umano restano al fresh-eyes, non al bot. |
| Narrativa | **ON TRACK**: tre colpi liberano il nucleo, E lo mette al sicuro, E all'albero avvia il finale; sciarpa→portale chiuso→partenza slitta, nessuna vittoria anticipata. |

Non attribuire il sign-off automaticamente al working tree corrente: **tre hash differiscono dalle prove controllate**. È un gate di provenienza, non la diagnosi di una regressione o un MAJOR immaginato.

## 1. Versione provata e source guard

`captures/summary.json` e il report playthrough contengono HTML con **`index-6Gx4PZDE.js`**. I risultati semanticamente falliti della precedente BFh1iWzC/pre-integration restano storici e **non** vengono contati come PASS o come difetti ancora presenti in6Gx4.

Nel report controllato `sourceHashes` e `sourceHashesAfter` coincidono per tutti i sei file: la prova non ha modificato quei sorgenti. Il reviewer ha però confrontato con SHA256 dei **file ora presenti**:

| Sorgente | Confronto attuale con report controllato |
|---|---|
| `src/gameplay/boss.ts` | Identico |
| `src/storage.ts` | Identico |
| `src/levels/square.ts` | Identico |
| `src/game.ts` | **Diverso** |
| `src/gameplay/bossChapter.ts` | **Diverso** |
| `src/gameplay/bossVisual.ts` | **Diverso** |

Esempi osservabili: il codice attuale di `BossChapter.renderHUD` include Ciclo e una UI ending semplificata senza vita/navigazione operativa; le PNG6Gx4 mostrano ancora vita e Percorso→Albero durante il finale. Quindi non basta dire «hash before/after invariati» per certificare il working tree **dopo** la prova. Non è accertato qui chi abbia scritto il delta o perché; nessun file è stato ripristinato dal reviewer.

**Raccordo minimo:** l'integratore identifica e congela l'esatto artefatto/source manifest da consegnare. Per6Gx4 conservare il suo mapping; per un nuovo artefatto documentare il delta dei tre file, rilanciare le prove influenzate (almeno catture/semantic coverage/contatti/pausa e finale, oltre alla meccanica se toccata). Non serve rifare indiscriminatamente M1/M2 o inventare un guasto; serve non associare a sorgenti nuovi un report vecchio.

## 2. Prove controllate reali — 7/7 PASS

Letto integralmente `docs/evidence/step-08-m3/controlled/report.json`. **PASS, errors vuoto**, vero Game.update e oggetti reali, distinta da playthrough/input umano. Non aggiunta una prova8 inesistente.

1. **Approach/checkpoint e attacco:** encounter salva prima del primo wind-up; attivo a1.41s, wind-up1.4s, lock1.1s; un solo danno dell'attackID, finestra5.5s.
2. **Schivata vera:** `dodge` a1.36, contatto evitato a1.42,6HP e segmenti precedenti conservati. Non dedotto dal solo testo «protetto».
3. **Anti-spam:** prefire lanciato fuori apertura respinto anche se arriva durante l'apertura; due lanci validi nella stessa finestra producono un solo segmento, secondo impatto respinto a scudo attivo.
4. **Late/miss:** regalo partito tardi e arrivato dopo chiusura respinto; finestra mancata ripete il ciclo senza azzerare i segmenti già ottenuti.
5. **Ordine del nucleo/save:** non si salta la presa; pickup/restituzione e Continua terminale mantengono segmenti3, bossDefeated, coreCarried/coreReturned, completed e portale chiuso. Non confondere la raccolta con l'E finale.
6. **Appoggi/finale misurati:** a0/1.5/3.5/5/8 e seek indietro a1.5, fondo del pacco sul ponte0m; appoggi sciarpa sul vero coperchio/fronte0 o circa2e-15m, entro1mm. Nave/portale visibili prima5 e invisibili da5; seek indietro ripristina la posa. Non viene certificata una presa mano inesistente.
7. **Aiuti:**15.01/30/45s senza progresso, poi ingresso encounter azzera. È prova della scala nel Game reale, **non ancora della pausa Esc live**.

La prova8 live con pausa/Esc è annunciata in preparazione ma al momento della lettura il report controllato contiene **sette** casi; nessun report aggiuntivo è stato acquisito per dichiararla PASS.

## 3. Playthrough Nuova partita→ENDING — PASS reale, con due retry corretti

Letto `docs/evidence/step-08-m3/playthrough/report.json`, compresi boundaries, bossObservations, log finali e selfTest; osservata direttamente `ending.png`.

**PASS,22lanci,169.169s wallclock**, percorso da Nuova partita, senza seed/goto/danni o clock iniettati secondo protocollo del report. Non è durata umana né promessa10–15minuti. Finale: `boss.completed=true`, segmenti3, bossDefeated/coreCarried/coreReturned veri, `portalClosed=true`, endingElapsed≈8.17. `worldFallback=false` e cast reale nei dati osservati.

**Correzione fattuale:** il file non registra «due morti nel boss». Registra:

- **Una morte in M2**, chapter `toystreet`, tempo43.0053: Officina già spenta/libera, cura consumata, Giostra attivata. Retry conserva Officina e poi raggiunge M2 completo; non si perde il lato concluso.
- **Una morte in M3**, chapter `square`, tempo26.1274, checkpoint boss con **due segmenti già completati**. Le osservazioni mostrano perdita progressiva di salute nei coni e una prima apertura mancata, poi segmenti1 e2. Non è un reset spontaneo al cortile o perdita del nucleo.
- Dopo retry M3, log riparte a ciclo3 con segmenti2: attacchi distinti1/2/3 tolgono un HP ciascuno (6→5→4→3), intervalli compatibili con wind-up1.4/attivo.35/gap.5, poi apertura a6.269 e terzo segmento a8.337. La progressione precedente è preservata, senza doppio danno per ID.

Il bot riesce anche assorbendo parte dei colpi e usando checkpoint indulgenti; questo dimostra completabilità e persistenza, **non prova che abbia schivato bene o che l'umano troverà il boss facile/difficile**. Nessuna richiesta di filler, HP extra o rallentamento artificiale dal wallclock.

## 4. Catture6Gx4: guardate, non soltanto conteggiate

Letti summary e tutti i tredici report individuali: **31frame**, tutti report PASS/deterministic=true, errors vuoto; summary con renderPass e coverageErrors vuoto per i casi semantici boss/ciclo/stato. Il render del preset corretto non viene scambiato per una simulazione degli attacchi.

Osservati direttamente:

- `captures/boss-cycle-3/00-player-0.png`: due colpi già riusciti, una tacca rimasta, **Carica1/3**, settore con bordo visibile fino alla camera e boss riconoscibile davanti alla nave. Non si vede un attacco simultaneo triplo; «1/3» qui è sequenza, distinto dalle tacche.
- `captures/boss-vulnerable/00-player-0.png`: nucleo luminoso sul petto, indicazione5.5s, marker MIRATO nella scena e istruzione di lanciare. Il bersaglio non è sullo sfondo o dentro la nave; Santa non lo copre nel campione.
- `captures/square-ending/_contact-sheet.png` e **`01-player-1.5.png` nativa**: sciarpa **rossa con frange oro** drappeggiata sul pacco, faccia/corona del generale riconoscibili, ponte sotto il pacco, battuta di generosità. A3.5 nave/pacco si ritirano insieme; da5 portale/nave scompaiono; a8 slitta assente e titolo di vittoria. La sciarpa è stata mostrata prima del ritiro, non sostituita soltanto da una riga di testo.
- `playthrough/ending.png`: vittoria e conclusione effettive dopo input reali; Santa è parzialmente dietro albero/pannelli, limite di composizione sotto, non personaggio perso o interazione bloccata.

Massimi della suite: **63call /53.588triangoli**, entro budget. Contatti e audit1080 palette/font/contrasto/screening, software e determinismo PASS nei report. Questo certifica i campioni della build, non tutti i picchi possibili o60fps sul laptop; il software CPU non è una misura delle prestazioni utente. Fotogrammi deterministici + report temporali corroborano leggibilità e correttezza, non sono un nuovo playtest live del reviewer.

## 5. Codice attuale: riscontri e punti da non sovradichiarare

### Boss e cambio stato

`boss.ts:4,26–40` rispetta config1.4/.3/.35/.5/5.5, pattern1/2/3, lock immutabile e un contatto consumato per attackID. Il test distanza al settore **finito** include bodyRadius.48 (`10–16`), non una retta infinita. `BossVisual:11–14,78` espande il bordo visivo oltre il corpo, con controllo campionato; non certifica fotosensibilità da solo.

`boss.ts:42–53` lega lancio/arrivo a windowID, timestamp e inRange, consuma atomicamente prima del callback che salva il segmento. Il ciclo ripetuto incrementa windowID; il danno a Babbo non cambia segmenti. Retry può riusare ID partendo da una nuova sessione perché `Game.clearActors()` elimina anche tutti i regali/bolts vecchi (`game.ts:101`): non si trascinano prefire fra reset.

`BossChapter:31–33` salva pre-boss prima dell'attacco; `23` richiede origine visibile e assenza di altri attacchi impegnati. I due rami M1/M2 non rimangono attivi nella piazza. Il bersaglio del regalo è bossPoint, mentre pickup usa corePoint: non sono confusi (`38–46,52–58`).

### Interazioni e salvataggi3

`BossChapter:49–58` nega E prima della sconfitta, albero senza nucleo, ripresa doppia e fuori portata/linea; restituisce solo usando treeInteraction accessibile, non centro del tronco. Cancella il feedback range quando il player entra in portata (`35`), migliorando il precedente MINOR M2. `segmentComplete` salva ogni segmento e il terzo passa a core immediatamente (`24–27`); fine attacchi non attende animazione del pacco.

`storage.ts:17–34` migra v1/v2, valida3segmenti↔bossDefeated, carry richiede defeat, return richiede carry e boundary coerente; square richiede due ancoraggi locali già spenti. Impossibili non riparati con nuova partita implicita. Lettura legacy non riscrive; nuova chiave3 e clear solo esplicito. I38unit globali PASS e hashM1/M2 intatti sono **riportati dall'integratore**, non rieseguiti dal reviewer. Nessun vecchio snapshot/testo storico modificato da questa review.

### Finale e pausa

`BossChapter:58,62–68` avvia ending solo al return, mostra sciarpa da1s e annuncia Terra salva solo da5s con nodo portale realmente chiuso; completed richiede anche elapsed≥8 (`95`). Skip è azione esplicita e applica stato terminale; Continua usa endingStarted=-8 e mantiene coreReturned. `BossVisual:40–57` parenta il pacco alla nave, non lo lascia sospeso dopo il ritiro, e non ricrea un secondo nucleo nel mondo.

Loop `Game.frame:405–410` non avanza mentre pausa/dead/tab nascosta; Esc è gestito prima del filtro dei pulsanti in input. **Correttezza statica, non PASS della prova8 richiesta**. Al termine, callback di skip/movimenti non riaprono il combattimento. Il codice attuale migliora i testi ending rispetto alle immagini; non affermato che tali migliorie siano già nel bundle6Gx4.

## 6. Rilievi MINOR e raccordi mirati

1. **Composizione finale / albero:** in `playthrough/ending.png` Santa e nucleo sono in parte dietro fronde e pannelli; chiusura e sciarpa sono comunque già mostrate e non si blocca l'azione. Rifinitura: nel quadro largo ending di `BossChapter.applyCamera:75–77` scegliere look/pivot che mostri meglio Santa e sede. Non cambiare collider o costringere a muoversi dopo E. Ricatturare normale/ridotto movimento se modificato.
2. **Doppioni HUD in6Gx4:** nella contact sheet ending restano vita/schivata, Percorso albero0m e comandi di combattimento durante la presentazione, benché già conclusa l'interazione. MINOR, non falsa vittoria. `BossChapter.renderHUD:91–92` attuale sembra già semplificarli: **chiudere con prova della revisione consegnata**, non col solo codice non allineato agli hash.
3. **Registro SCRIPT M3:** `texts.ts:14` ora guida al cancello, mentre SCRIPT mantiene ancora la variante M2 «ci fermeremo prima del prossimo scontro». Varianti operative/finale devono essere registrate dal main senza cambiare gli snapshot. ID `vo.squamakk.defeat`, `vo.santa.scarf`, `vo.briciola.saved` già esistono nell'originale; non richiedono voci o una nuova trama.
4. **Frasi window/range:** rifiuti di scudo/prefire/late sono presenti e corretti ma potenzialmente verbosi; valutarli nel fresh-eyes prima di ridurre informazioni. Nessun MAJOR di comprensione assegnato senza testimonianza.

Nessun BLOCKER/MAJOR di prodotto confermato. Nessuna presa mano fittizia: appoggi pacco/sciarpa misurati separatamente. Il source guard pendente è una condizione tecnica di sign-off, non un difetto visuale inventato.

## 7. Condizioni residue precise

- **Fresh-eyes M3:** `docs/reviews/m3-fresh-eyes.md` **non presente al momento della lettura**. Attendere il vero esito UI-only su6Gx4 immutabile5180, senza sostituire la build durante la sessione. Deve capire cono/finestra/pickup/albero e vedere sciarpa→chiusura→slitta; dichiarare eventuali pause e audio muto. Nessun esito inventato o tempo umano dedotto dal bot.
- **Prova8 pausa/Esc reale:** conservare report che dimostri clock/finestra/coni/ending congelati e ripresa esplicita senza doppio danno; codice/7casi già presenti non la sostituiscono.
- **Source/build provenance:** riallineare i tre hash divergenti all'artefatto realmente consegnato o validare il nuovo delta come descritto in§1. Dopo modifiche rilevanti rivedere le prove influenzate; non chiamare6Gx4 un artefatto diverso.
- **Testi M3:** registrare le varianti correnti nello SCRIPT principale, lasciando immutabili le copie congelate. È raccordo documentale MINOR, non motivo di rifare il concept.

Con queste condizioni chiuse e senza nuovi rilievi importanti: **SHIP / LANDS / ON TRACK** per il check-in utente dell'avventura completa e successivo passo9. Nessuna richiesta di allungare il minutaggio, nuova spesa, deploy o pubblicazione.

## Keep — massimo cinque

1. Tre pattern progressivi ma una sola minaccia, lock chiaro e finestre indulgenti.
2. WindowID e checkpoint per segmento: spam respinto, miss e morte non cancellano progressi riusciti.
3. Percorso completo verificato da Nuova partita, con retry reali e nucleo non perdibile.
4. Sciarpa visibile prima del portale chiuso: la generosità resta il payoff, non soltanto un titolo di vittoria.
5. Contatti separati e semantic capture rigorose, senza confondere render/software/bot con durata o prestazioni umane.

## 8. Chiusura condizioni — integratore

2026-10-21, successiva alla review. Si applica il verdetto condizionato del §7, **SHIP / LANDS / ON TRACK per il playtest utente dell'avventura completa**, con i seguenti riscontri reali:

- Fresh-eyes concluso su6Gx4: `docs/reviews/m3-fresh-eyes.md`,37azioni,0morti/retry,5HP; ha capito boss→presa→albero e guardato sciarpa→ritiro→partenza senza skip, poi Nuovaavventura→M1. Pause reali fra decisioni e audio muto dichiarati. Non è durata umana o bilanciamento continuo misurato.
- Il caso E esitante ha motivato una verifica aggiuntiva, senza attribuirgli retroattivamente una causa certa. **Riprodotto e corretto** il bug generale che cancellava il primo input nel RAFdt0 dopo la ripresa: ora la coda viene conservata fino al primo update, senza delta fittizio né modifiche ai tempi del boss.
- **Build finale D86qgQyq**, non rinominata6Gx4. Nuovo manifest SHA256 di tutti i34sorgenti in `docs/evidence/step-08-m3/final/source-manifest.json`; i sei hash della prova controllata coincidono con il manifest e con il working tree. HTML della build identico nei report fullbot/capture/dist. Il problema di provenienza del §1 è quindi chiuso con nuove prove, non ignorato.
- `final/controlled.json`: **9/9PASS**, inclusa pausaEsc reale/clock/finestra/resume e conservazione del primo clic **e E** nel frame iniziale. `final/unit-final.tap`: **38/38PASS**, inclusi hash immutabili M1/M2 e schema3.
- `final/report.json`: nuovo fullbot **Nuova partita→fine PASS**,20lanci,1morteM3 con2segmenti conservati,125.645swallnonumani,0errori. Boss3segmenti/coreReturned/portalClosed/completed confermati, finale guardato fino a stato terminale.
- `final/captures/`: nuovo rerun **31frame PASS** con copertura semantica, contatti, determinismo, audit1080/software e0errori. Massimo63call/53.588triangoli. L'integratore ha guardato direttamente charge ciclo3, sciarpa1.5s, terminale8s e finale del bot: HUDending semplificato, sciarpa leggibile, nave/portale/slitta ritirati; i vecchi PNG non sono stati riusati come prova del testo nuovo.
- Varianti M3 correnti registrate in SCRIPT; snapshot e testi storici M1/M2 immutabili. Ownership del builder conclusa in `docs/production/status/gameplay-m3.md`.

Restano MINOR di camera presso albero/props, aggancio permissivo e alcuni avvisi distanza temporanei; non sono diventati BLOCKER/MAJOR nelle prove. Nessun claim60fps,10–15minuti effettivi o ascolto umano dal test headless. Solo release candidate locale e check-in utente, non pubblicazione o passo9 già approvato.

**Post-freeze:**27file copiati byte-identici in `snapshots/release-candidate/`; smoke locale5179 PASS (Nuova partita, provaM3, sciarpa e stato terminale), hash RC1/1PASS. Il comando globale ora include39test:38del sorgente più il controllo della copiaRC, con le tre copie storiche protette. Nessuna approvazione utente dell'avventura completa inferita dal freeze.
