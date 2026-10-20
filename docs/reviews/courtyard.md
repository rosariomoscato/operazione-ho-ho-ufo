# Cortile M1 — REVIEW lean combinata

Data: 2026-10-20. **Review chiusa dopo correzioni.** Proprietà rispettata: scritto solo questo documento; nessuna modifica a codice, HANDOFF o specifica.

## Verdetti

| Prospettiva | Verdetto | Motivazione |
|---|---|---|
| Critico | **SHIP** | R1 chiuso, R2/R3 corretti; report integrati, checkpoint e audit definitivi PASS. Sign-off della review, non pubblicazione o gate fresh-eyes. |
| Azione/comicità | **LANDS** | Muso, zampe e pacco ora leggibili dalla camera normale; battuta e conferma di spedizione esplicite, controlli liberi. |
| Narrativa | **ON TRACK** | Neutralizzazione non letale leggibile; il cortile termina a 1/3, nave e portale restano, nessun finale globale anticipato. |

**Nessun BLOCKER o MAJOR aperto. SHIP / LANDS / ON TRACK confermati dopo fresh-eyes e retest chiarezza.** R1, R2 e R3 chiusi. Il primo playtest indipendente è **COMPLETED**; il retest dello stesso giocatore chiude le due confusioni importanti, ma non costituisce una nuova prova blind. Durata primo giocatore non misurata, ascolto del mix non verificato. La rigenerazione dei test sulla UI congelata resta distinta dai PASS della precedente revisione: vedere l'ultimo raccordo in fondo.

Le sezioni seguenti conservano i passaggi storici e i loro limiti al momento della scrittura. **Fa fede «Ultimo raccordo — fresh-eyes e chiarezza» in fondo**, insieme alla tabella sopra; i precedenti «fresh-eyes ancora da fare» sono superati.

## Evidenze effettivamente esaminate

- Lette le consegne `docs/production/status/{gameplay,visual,audio}.md`, la specifica `docs/set-pieces/courtyard.md`, TECH_PLAN e i contratti; confrontati `src/game.ts`, `src/input.ts`, `src/storage.ts`, `src/style.css`, `src/visual/actors.ts`, `src/levels/courtyard.ts`, `src/main.ts` e gli strumenti di cattura/E2E pertinenti. Contesto narrativo e grafico dalle fonti già lette in DESIGN.
- **Osservate direttamente tutte le otto contact sheet** in `captures/game/{intro,training,battle-a,first-wrap,battle-b,battle-c,anchor,complete}/_contact-sheet.png` e le due immagini `docs/evidence/step-06/visual/isolated-{gameplay,close}.png`.
- Per evitare diagnosi da miniature, osservati anche `first-wrap/01-player-0.25.png`, `first-wrap/02-player-0.9.png`, `battle-c/00-player-0.png` e `audit-default/00-player-0.png` a risoluzione nativa.
- Letti programmaticamente tutti gli otto `report.json`: **36 fotogrammi**, tutti con selfTest PASS, report PASS, deterministic=true, errori e warning vuoti. Massimi effettivi delle suite: **75 draw call / 93.234 triangoli**, non solo i 67 call della vista player. Tre luci, zero ombre dinamiche/post nei campioni.
- `docs/evidence/step-06/runtime-audio.json`: PASS playback reale, pool limitato, pausa/cambio/ripresa/stop, nessun errore. Non è una prova d'ascolto del mix durante battaglia.
- Letti i report audit default/SwiftShader a 1080p presenti al momento della review: ancora riferiti ai due rilievi noti (#ffffff del contact shadow e reticolo valutato come testo). Le correzioni dichiarate dall'integratore richiedono nuovo report: non attribuito loro un nuovo PASS.
- `docs/evidence/step-06/integration.json` non presente al momento della verifica. Il run reale completo e le prove checkpoint/attacchi sono **riportati dal collaboratore** in status/gameplay, non riprodotti indipendentemente in questa review. Non inventate prove fresh-eyes o un fallimento conclusivo del mainbot.

## Rilievo confermato da correggere

### R1 — MAJOR — La prima gag non insegna chiaramente «rettiliano impacchettato e rispedito»

**Evidenza:** nelle immagini native `captures/game/first-wrap/01-player-0.25.png` e `02-player-0.9.png` il pacco viola/oro spunta a destra di Babbo, ma testa/zampe del rettiliano sono occultate dal protagonista. Il risultato legge come un semplice pacco in scena, non un alieno che si agita dentro. A 1,4 s nella contact sheet è scomparso, senza un'indicazione di destinazione. Il preset non mostra neppure la battuta, quindi non dimostra la leggibilità della gag completa con il normale HUD live.

**Causa verificabile:** `src/game.ts:211–212` piazza il pacco nella posizione del nemico e riduce insieme attore e pacco; non gestisce l'occlusione da Santa. `wrap` e il passaggio a `gone` (righe 138, 167) non mostrano un simbolo di spedizione/destinazione. La camera a spalla fissa (`updateCamera`, 223–227) non garantisce la visibilità del bersaglio nel caso centrale già documentato dal preset. La testa può essere ben costruita e restare comunque nascosta: il close-up isolato non risolve questa prova gameplay.

**Effetto:** si perde il primo payoff comico e la spiegazione visiva della regola non letale, elemento distintivo del concept. Non è una richiesta di cinematiche o di asset nuovi costosi.

**Minima correzione costruibile:** durante il primo wrap, gestire l'occlusione in spazio schermo rendendo Santa localmente/temporaneamente semitrasparente quando copre testa e pacco (oppure correggendo dolcemente la spalla con collisione e riduzione movimento rispettate). Non spostare o teletrasportare il nemico per la camera. Conservare il muso e una coppia di zampe fuori dal pacco per la lettura 0,25–0,9 s. Prima della scomparsa aggiungere un piccolo simbolo locale pacco→nave/freccia verso l'alto, usando palette/materiali già esistenti: niente flash, nuovo suono, attesa o blocco controlli. È sufficiente una spedizione simbolica, non una traiettoria fisica fino all'UFO.

**Chiusura richiesta:** ripetere la sequenza del preset nelle normali viste player a 1280 e 1920, poi una neutralizzazione reale senza `goto`, con battuta e HUD. Mostrare sagoma rettiliana + pacco e conferma spedizione, senza nascondere eventuali telegraph di altri nemici. Con riduzione movimento mantenere la medesima informazione senza camera mobile o rimbalzi. Un close-up aggiuntivo da solo non chiude R1.

## Rilievi MINOR / miglioramenti circoscritti

### R2 — MINOR — Tutorial della schivata statico, non prova di telegraph

`src/game.ts:208` mostra il settore del drone finché manca `dodgeUsed` e lo fa puntare continuamente al player. Non esiste il ciclo sicuro 1 s → lock → colpo innocuo della specifica. La schivata è comunque esplicitamente indicata e il tutorial accetta l'ordine inverso: non è un soft-lock confermato.

**Fix minimo:** animare il solo segnale di esercizio con il medesimo lock leggibile del nemico, senza danno e senza richiedere un timing riuscito. La schivata già eseguita continua a contare. Non aggiungere attese obbligatorie.

### R3 — MINOR — Battute implementate senza registro completo degli ID

`game.ts` contiene stringhe dirette e alcune parafrasi invece di un collegamento agli ID di SCRIPT (es. `enterTraining`, 94). Nessuna contraddizione di trama confermata, ma la tracciabilità del testo e delle nuove etichette tecniche richiesta dalla specifica non è dimostrata.

**Fix minimo:** censire le stringhe nuove con ID stabili e mappare le battute esistenti, senza cambiare la trama o richiedere doppiaggio. Non bloccare il gameplay per attendere lettura integrale.

## Aspetti verificati e limiti delle prove

### Arrivi e tre microincontri

Il codice ha gruppi 1+2+3, ingresso da nord/ovest/est e messaggio di arrivo; B usa separazione/flanking, C mantiene un difensore nell'area dispositivo (`updateEnemies`, 186–191). I preset B/C rendono distinguibili coppia e triangolo; non risultano tre ondate numericamente identiche. **Non serve aggiungere nemici.** I preset non mostrano il tragitto reale dagli spawn, quindi la visibilità degli arrivi e l'effetto del raggruppamento vanno valutati nel run live, non dedotti dalle sole miniature. Nessun difetto MAJOR negli arrivi è dimostrato dalle prove presenti.

### Checkpoint e difficoltà

Boundary A/B/C/anchor/complete, flag cura, ripristino 6 HP e posizioni sicure sono coerenti nel codice. I gruppi già completati non sono ricreati da `reset`; `state()` espone nemici e checkpoint. Il collaboratore riporta Continua dopo reload per tutti i confini, errore storage non fatale e prova reale di attacchi 1,0003 s / recovery 1,2004 s, senza doppio danno. Sono riscontri utili, non sostituiscono un report permanente riproducibile. I PASS statici sulle finestre di attacco nelle catture con log vuoto non provano che un attacco sia avvenuto.

### HUD 1080p

**Nessuna sovrapposizione confermata fra obiettivo e salute.** La prima impressione dalla contact sheet era un artefatto della composizione; le PNG native 1280/1920 mostrano pannelli separati. L'audit già presente misura i testi effettivi con contrasto minimo circa **10,01:1** e cap-height **25–26 px** per etichette/testo: sopra soglia. Il solo reticolo aria-hidden non va trattato come testo informativo; resta da valutarne visivamente la leggibilità sulla neve e sui tetti, non da dichiarare che non conti per l'usabilità. La cattura 1080p mostra comandi, obiettivo, salute e cura/schivata senza occludere i tre nemici.

### Debug e contatti

API LC prevista presente; `goto` e `seek` in review non scrivono save, `duration=6` è esplicitamente un loop di revisione, non durata partita. `seek` non simula combattimento; le pose immutate di battle a t0/t1 non sono una prova dell'AI. `first-wrap` ha un ramo dedicato coerente ai tempi catturati, ma va affiancato alla prova live richiesta in R1.

`selfTest` dichiara correttamente di **non misurare mani–regalo**; il contratto VisualActor espone solo `floorError`. Non presentare il gate «tutti i contatti» come concluso. Nel gameplay il regalo nasce da `(player.x,1.3,player.z)`, non da una presa dichiarata: serve chiarire/verificare il contatto solo nelle pose che effettivamente intendono mostrare un oggetto impugnato. Il pass sui piedi non certifica assenza di clipping del rig o del pacco: immagini e test mirati restano necessari.

### Ritmo e durata

Lo status gameplay dichiara un run informato di circa **16 secondi di simulazione**: è un utile limite inferiore, non una misura del primo giocatore. Non sostiene «cinque minuti», ma non basta neppure a concludere che un giocatore nuovo finirà in 16 secondi. Misurare il fresh-eyes e dichiarare la durata corta se emerge; non gonfiare vita, camminate o numero di ondate.

## Prove ancora da chiudere — non difetti confermati

1. Rerun audit default e SwiftShader dopo tinta shadow ink e filtro glyph aria-hidden; conservare i nuovi report e sostituire il riferimento ai risultati storici, non la storia delle demo.
2. Mainbot E2E completato senza concorrenza pesante di capture; timeout precedente non è un fallimento gameplay conclusivo. Conservare report input reali, pause, E e reload a 1/3.
3. Evidenze permanenti retry/Continua ai tre confini, almeno un attacco completo con danno/evitamento e una cura; non solo reload dei save preparati. Il primo wrap di A fa entrare B nello stesso aggiornamento e salva `firstWrapped`: non viene diagnosticato un bug di ripetizione della battuta sulla sola lettura di `wrap()`.
4. Playtester a occhi nuovi, senza codice/docs/LC: arrivi comprensibili, drone/schivata/E trovati, risultato 1/3 interpretato correttamente e durata registrata. **Gate non ancora completato.**

## Keep — massimo cinque

1. Stile A morbido, silhouette riconoscibili e cortile centrale libero; geometria in codice senza modelli esterni.
2. Sei HP, due colpi per soldato, munizioni infinite, un attacco impegnato alla volta e recovery indulgente.
3. Obiettivo, distanza, salute e fine segmento espliciti; finale rigorosamente 1/3.
4. Checkpoint per gruppi e fallimenti storage non bloccanti; nessuna ripetizione obbligata del tutorial.
5. Audio statico gratuito con pool limitato, pausa reale e headroom documentato; nessuna voce o spesa inventata.

**Raccomandazione del primo passaggio (superata dalla chiusura sotto):** correggere R1 localmente, senza ricostruire il livello; ricatturare la gag e completare i report.

## Chiusura dopo correzioni — stato corrente

### R1 — CHIUSO: leggibilità gameplay e spedizione

Osservate direttamente la **nuova** `captures/game/first-wrap/_contact-sheet.png`, le PNG native `01-player-0.25.png` e `02-player-0.9.png`, e `docs/evidence/step-06/{live-wrap,live-shipping,bot-complete}.png`.

Nel preset nativo il rettiliano ora mostra chiaramente muso e piedi fuori dal pacco; Santa diventa semitrasparente solo quando si sovrappone, senza spostamento del bersaglio né cambio camera. A 0,25 s si legge «Pacco rettiliano», a 0,9 s «↑ Spedito alla nave»; la battuta «Impacchettato. Senza scontrino.» è presente con HUD normale. A 1,4 s Santa torna opaco. Il regalo non viene più confuso con un oggetto ambientale.

La PNG **live-wrap** conferma la soluzione anche in combattimento reale, con i due nuovi soldati di B già visibili sulla sinistra: testa, pacco e piedi leggibili al centro, battuta presente, arrivo del gruppo distinto dalla gag. Nessun telegraph offensivo è coperto nei campioni esaminati. Questa prova live risolve il dubbio principale che il preset isolato non poteva chiudere.

Letto il raccordo in `src/game.ts`: materiali clonati **solo su Santa**, opacity .18/depthWrite false durante overlap schermo, ripristino dei valori originali dopo; `revealWrappedAlien()` non dipende da reducedMotion e non muove la camera. Le etichette cambiano sulla stessa timeline del wrap. La compatibilità con reducedMotion è confermata dalla logica, **non attribuita a una cattura dedicata non esaminata**. Per il sign-off non è necessario un viaggio fisico del pacco fino alla nave: la spedizione simbolica approvata nella correzione minima è ora inequivocabile.

### R2 — CHIUSO: esercizio sicuro della schivata

`pose()` usa un ciclo di **2,8 s**, segue il giocatore nei primi **0,2 s**, mantiene il settore fino a **1,2 s**, poi lo nasconde. Quindi circa 1 s di indicazione bloccata e 1,6 s di pausa visiva, senza danno o attesa obbligatoria. La condizione tutorial resta droneHit + dodgeUsed, indipendente dall'ordine. Il settore statico permanente del primo passaggio non è più il comportamento live.

### R3 — CHIUSO: ID dei testi

Letti `src/texts.ts`, `sayLine()` e il log `dialogue` nel report integrato: la prima battuta usa `vo.santa.wrapped`, la conclusione `vo.briciola.route`. Le nuove righe coerenti (`vo.briciola.theft.short`, `.training`, `.heal`, `.clear`) e le etichette `ui.wrap.parcel` / `ui.wrap.shipped` sono censite in SCRIPT. Non viene richiesto di ripristinare parola per parola la prima bozza: le parafrasi coerenti non costituiscono un difetto narrativo. Le stringhe HUD non devono diventare file vocali.

### Report definitivi esaminati

- **`captures/game/summary.json`: PASS**, otto scenari più audit default/SwiftShader a 1920×1080. Palette senza colori invalidi, contrasto testo minimo circa 10,01:1, cap-height 25–26 px; screening lampi PASS. Budget campionato massimo **75 call / 93.234 triangoli**. Il reticolo aria-hidden è correttamente distinto dal testo informativo. Il probe headless default circa 42 fps **non dimostra 60 fps su laptop medio**, né viene presentato come tale: il budget numerico passa, il target hardware resta da misurare.
- **`docs/evidence/step-06/integration.json`: PASS**, errors vuoto. Input reali, tutorial, pausa, sei difensori, confini A/B/C effettivamente raggiunti, retry e reload/Continua con ID rispettivamente [1], [2,3], [4,5,6]; completamento e reload a 1/3; errore storage non fatale. Non è fresh-eyes: il bot è informato e legge lo stato. `bot-complete.png` conferma HUD a 1/3, battuta degli elfi al momento corretto e replay esplicito.
- **`docs/evidence/step-06/melee.json`: PASS**, due attacchi reali distinti, salute 6→5→4, wind-up circa 1,0003/1,0004 s, finestre dopo lock 0,8 s (la differenza floating-point 0,7999999999999998 non è un difetto di timing), recovery campionata 1,2004 s. Cura reale +2 e consumo conservato al retry, ritorno a 6 HP; debug non scrive il checkpoint reale. Questo chiude la precedente mancanza di prove permanenti, non soltanto il PASS vacuo dei preset fermi.
- **`runtime-audio.json`: PASS**, riletto: playback reale, pool, pausa, cambio musica, ripresa e stop senza errori. Nessuna nuova approvazione percettiva del mix è implicita.
- Build PASS con warning chunk Three circa 539 kB e **11 unit test PASS** comunicati dall'integratore; non rieseguiti da questo reviewer. Nessun nuovo acquisto, agente o modifica fuori ownership.

### Residuo MINOR — cattura live-shipping tardiva

La PNG `live-shipping.png` effettivamente osservata mostra già Santa opaco e pacco/etichetta scomparsi: **non dimostra visivamente la finestra live «↑ Spedito alla nave»**. Essere oltre 0,9 s non garantisce essere prima di 1,4 s; la cattura può arrivare dopo la finestra. La scritta è invece direttamente verificata nella PNG nativa del preset a 0,9 s, e la prima parte del wrap è verificata live: il difetto MAJOR di leggibilità è chiuso, non riaperto per questa lacuna di documentazione.

**Correzione minima non bloccante:** nello strumento di prova catturare un fotogramma live mentre l'etichetta «Spedito» è realmente visibile, verificando anche che il nemico sia ancora wrapped; non allungare il gameplay per accomodare lo screenshot. Non dichiarare la PNG attuale prova della scritta.

### Limiti che restano, senza nuovi MAJOR

- Fresh-eyes ancora da fare: comprensione spontanea degli arrivi, schivata, E, risultato 1/3 e durata. Il combatWallSeconds del bot è circa **17,18 s**, non durata di un primo giocatore. Non sostenere «cinque minuti» senza misura, non aggiungere padding.
- Restano i limiti già dichiarati dei test contatti: piedi/collisioni/budget verificati, mani–oggetto non certificate dal contratto attuale. Nessuna nuova posa di presa viene certificata indirettamente da questi PASS.
- Le cinque cose da conservare della prima review restano valide. Il warning bundle e la cattura shipping tardiva non richiedono di riscrivere la slice.

**Conclusione:** review combinata **SHIP / LANDS / ON TRACK**, R1–R3 chiusi. Prossimo gate: playtest a occhi nuovi, non ancora superato. Nessuna autorizzazione a pubblicare o spendere.

## Ultimo raccordo — fresh-eyes e chiarezza (stato finale)

**SHIP / LANDS / ON TRACK restano validi. Nessun nuovo MAJOR concreto nelle prove esaminate.** Review qualitativa e criterio di completamento del playtest a occhi nuovi chiusi, con i limiti sotto. Non si riapre la specifica né si richiede un altro agente.

### Evidenze lette e osservate

Letto integralmente `docs/reviews/fresh-eyes.md`, compresa appendice del retest. Osservate direttamente `captures/fresh-eyes-02-tutorial.png`, `fresh-eyes-06-combat.png`, `fresh-eyes-09-gate.png`, tutte e quattro le `captures/retest-clarity-*.png` e `captures/game/clarity-training/00-player-0.png` nativa 1920×1080. Confrontata la logica UI corrente in `src/game.ts`: bersaglio MIRATO con ring, avviso per minacce laterali/dietro, cura, prefisso Percorso e singolare. Nessun codice modificato dal reviewer.

- **Primo fresh-eyes COMPLETED:** Nuova partita → tutorial → sei difensori → E → 1/3 → fine segmento; solo UI e input reali, senza docs/codice/LC o manipolazione dello stato. Nessuna sconfitta o restart, finale **2 HP su 6**. La PNG finale conferma che la via successiva non è stata interpretata come soft-lock. Le pause frequenti escludono una stima attendibile del ritmo; nessuna durata cronologica misurata.
- **Due confusioni importanti emerse davvero**, non negate dal precedente sign-off tecnico: clic sul bersaglio invece del reticolo e difficoltà a ritrovare il nemico laterale mentre il regalo va davanti. La build precedente non meritava una dichiarazione di chiarezza spontanea su questi due punti.
- **Retest COMPLETED dello stesso giocatore:** istruzione «tira al +, non al mouse», trascinamento destro, marker MIRATO e ring chiariscono l'aggancio; tutorial completato senza tentativi a vuoto. L'avviso «Dietro, ← a sinistra · Destro: gira e mira» viene verificato intenzionalmente; il giocatore si riallinea e risolve il combattimento. Le due confusioni sono dichiarate **RISOLTE** dal playtester e le immagini ne sostengono il motivo. Non lo si presenta come un nuovo giocatore che impara senza conoscenze pregresse.
- «Percorso» distingue navigazione e mira; «✚ Cura +2» identifica l'oggetto da ferito; «1 difensore» corregge il plurale. La raccolta della cura non è dimostrata isolatamente dal retest: resta supportata dal test meccanico `melee.json`, non dal ritorno a salute piena dopo Continua.

### Interruzione del retest: limite esterno, non diagnosi di save corrotto

Il retest torna al titolo prima dell'ancoraggio; **Continua recupera correttamente l'obiettivo**, poi E e fine segmento funzionano. Il playtester, usando solo UI, non poteva accertare la causa. L'integratore documenta modifiche sorgente via HMR durante la sessione: reload da HMR è una causa esterna plausibile, non un guasto dimostrato del salvataggio o dell'AI. Il retest non viene descritto come completamento ininterrotto.

Sorgente ora congelato; per l'utente usare il **production preview sulla porta 5175**, senza nuovi aggiornamenti HMR. Il test dist isolato non mostra autoreload secondo l'integratore. Se il ritorno al titolo si ripetesse sulla produzione immutabile andrebbe indagato come nuovo difetto; le prove attuali non lo dimostrano.

### Gate e stato delle prove, senza sovradichiarazioni

| Criterio | Stato finale |
|---|---|
| Review critico / azione-comicità / narrativa | **SHIP / LANDS / ON TRACK**, nessun BLOCKER/MAJOR aperto |
| Completamento indipendente a occhi nuovi | **COMPLETED** nel primo run; due problemi di chiarezza corretti e retestati dal medesimo giocatore |
| Chiarezza della UI aggiornata | Confermata dal retest mirato; non prova blind ex novo |
| Audit training aggiornato 1920×1080 | `captures/game/clarity-training/report.json` **PASS**, errors vuoto, visualAudit PASS; PNG osservata |
| Suite produzione, E2E e mischia | Report presenti letti con PASS; l'integratore segnala rigenerazione in corso dopo gli ultimi ritocchi UI. **Non attribuire automaticamente quei PASS alla revisione finale congelata** finché la rigenerazione non termina |
| Durata primo giocatore circa cinque minuti | **Non misurata**, nessuna promessa di durata |
| Audio | Test runtime tecnico PASS; **mix non ascoltato** nel fresh-eyes/retest |
| Prestazioni | Budget campionati sotto soglia; **non certificati 60 fps su laptop/CPU** |

Si chiudono quindi **qualità della review e requisito di completamento fresh-eyes**, non si certifica indiscriminatamente ogni target produttivo. La sola chiusura tecnica pendente dichiarata qui è raccogliere i rerun già in corso sul sorgente congelato; non occorre rifare il design o bloccare per i MINOR.

### Residui MINOR per backlog, non bloccanti

1. **Marker sovrapposti:** `retest-clarity-03-markers.png` mostra le tacche di un altro rettiliano sulla sinistra di MIRATO. Correzione minima futura: separazione verticale/anti-overlap tra etichette di attori vicini, non cambiare l'aggancio. Il corpo selezionato, il ring e il tiro rimangono comprensibili.
2. **HUD inferiore alto a 1280×720:** comandi su due righe più dialogo/hint coprono una fascia ampia e possono nascondere parti di nemici molto vicini in basso. L'avviso alto resta leggibile e il retest completa senza soft-lock. Correzione minima futura: accorciare i comandi persistenti dopo il tutorial o comprimere i pannelli non urgenti, senza ridurre dimensione/contrasto del testo.
3. **Semantica MIRATO con assistenza:** il drone può essere agganciato anche lateralmente al +; l'azione ora è capita, ma «Agganciato / mira assistita» spiegherebbe meglio la tolleranza. Non restringere l'assistenza per far coincidere la grafica a scapito dell'indulgenza.
4. Resta il precedente MINOR documentale della PNG live-shipping tardiva; nessuna riapertura di R1.

Questi punti sono consegnati come voci di backlog in questa review: **non modificato `docs/BACKLOG.md`**, fuori dall'ownership autorizzata in questo raccordo. Restano valide le cinque Keep sopra.

**Esito finale:** qualità approvata per il playtest utente della slice, con rerun tecnici finali da acquisire e limiti dichiarati. Nessuna evidenza attuale giustifica un nuovo MAJOR, una nuova ondata di lavoro o una promessa di performance/durata. Nessuna autorizzazione a pubblicare o spendere.
