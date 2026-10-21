# M2 — review finale statica di integrazione

2026-10-21. **Solo codice/documenti, nessun browser avviato o test GPU concorrente.** Scritto esclusivamente questo report; non modificati core, build servita, snapshot, contratti o altri documenti. Nessun agente, acquisto o pubblicazione.

## Esito e perimetro

**CODE PASS PROVVISORIO, con MINOR e gate runtime ancora aperti. Nessun nuovo BLOCKER/MAJOR di prodotto dimostrato dalla sola analisi statica. Non è SHIP complessivo.**

| Prospettiva | Esito |
|---|---|
| Critico | Architettura e progressione indipendente coerenti nel codice. Ritorno inatteso al cortile non spiegato con certezza; entrambi gli ordini e regressioni candidate da concludere. |
| Azione/comicità | Regole di attacco indulgenti e wrap conservati. **LANDS sospeso** fino a visione del ranged live e prove dei due ordini; piccolo disallineamento muzzle da correggere/verificare sotto. |
| Narrativa | **ON TRACK per codice/testi:** ingresso a1/3, ordine libero, secondo ancoraggio complessivo a2/3, nave verso piazza a3/3; niente boss, restituzione nucleo o vittoria globale. |

Non trasformare l'assenza di un difetto statico certo in un PASS del playthrough. M2-T2 resta un **incidente osservato e gate di progressione aperto**, non una causa attribuita per supposizione al save o all'AI.

## Materiale e provenienza

Letti integralmente `src/game.ts`, `src/gameplay/types.ts`, `src/gameplay/systems/ranged.ts`, `src/storage.ts`, `src/input.ts`, `src/scenarios/{types,courtyard,toystreet}.ts`, `src/texts.ts`, `src/registries.ts`; confrontati CSS, matematica collisioni e geometria shooter pertinenti. Letti SCRIPT, ACT_02_PLAN/spec M2 già acquisiti, HANDOFF aggiornato, status gameplay-m2, BACKLOG, test dati/save e driver di integrazione. Letto direttamente il report guida in `docs/evidence/step-08/guidance/report.json`.

- Typecheck finale e build candidata `C:/Users/rosar/AppData/Local/Temp/opencode/m2-candidate-20261021/`, bundle `index-MP92z05e.js`: **PASS riportati dall'integratore**, non rieseguiti qui.
- Le catture `captures/street*`, sei preset/audit/software PASS e FAIL iniziale del determinismo si riferiscono alla **precedente build CCPcB_n9**, non certificano il codice attuale. La correzione CSS finale `.panel{box-shadow:none}` è presente (`src/style.css:5`); il builder riporta PNG identici ripetendo la sequenza. Serve rerun sulla candidata, non allentare il confronto pixel.
- Report guida precedente effettivamente letto: PASS per H immediato, pausa, soglie15.01/30.01/45.01s e reset entrando realmente in arena, zero errori. La logica attuale resta compatibile; non attribuito un nuovo run alla candidata.
- Nessuna durata completa o fresh-eyes M2 dichiarata qui. Il tentativo fresh-eyes iniziale è ancora attivo sulla dist precedente: **non sostituirla durante la sessione**. I timeout della suite completa non sono PASS; i test6dati/save+5runtime riportati non sostituiscono due completamenti con input reali.

## Ritorno inatteso COURTYARD/training — analisi delle cause possibili

### Percorsi effettivi nel codice

1. `reset()` entra nel ramo cortile **solo per boundary non street** (`game.ts:98–106`). `restoreStreet()` non contiene un fallback al cortile (`113–119`).
2. `retry()` usa `this.checkpoint.boundary` e lo snapshot in memoria (`369`); `save('street')` crea chapter/toystreet e boundary corretti (`92–94`). Clear, wrap, anchor e cura salvano boundary street/street-complete. Non emerge un punto del normale combattimento che scriva `training`.
3. `startNew()` è intenzionalmente distruttivo: cancella entrambe le chiavi, resetta training e mostra intro (`110`). È richiamato da `data-do=new` (`377`) e replay cortile (`81`), non da un attacco o da una sconfitta. Dopo skip/18s diventa training (`216`).
4. `continueGame()` legge il save reale e lo passa a reset (`111`). `storage.ts:18–24` rifiuta coppie chapter/boundary incoerenti: non degrada automaticamente un save M2 valido a training. Save non valido → Continua non disponibile/avviso, non nuova partita automatica.
5. **Preview è un caso diverso e legittimo:** `enterStreet(true)` non scrive il save reale (`94,112`). Retry conserva il checkpoint preview, mentre Titolo→Continua può riprendere un vecchio cortile training: non è perdita di un progresso M2 persistito, perché la prova dichiara di non salvarlo. Verificare il flag `preview` nei dati dell'incidente prima di confrontarlo con una partita ordinaria.
6. Il costruttore parte sempre dal cortile/titolo (`84`); una nuova istanza/reload non è una chiamata interna a retry. In questo incidente la build era statica: **non usare HMR come spiegazione senza evidenza**, diversamente dal retest storico M1.

### Input/menu: rischio reale, causa dell'incidente non provata

Il menu di sconfitta/pausa riceve subito il focus sul primo pulsante (`game.ts:379`), e il titolo sul primo abilitato, **Nuova partita**. I listener lasciano ai pulsanti il comportamento HTML normale (`input.ts:12–15`), incluso Spazio/Invio che li attivano. Un player/bot morto durante la mira può quindi inviare clic o una schivata alla UI comparsa nel frattempo. Il vecchio driver non verificava sempre salute/playing dopo la rotazione; il nuovo `tools/check-street.mjs:73–77` lo fa. Il semplice default focus **non esegue** Nuova partita: servono eventi ulteriori, da dimostrare.

Questo rende plausibile una catena morte→clic menu→Titolo→attivazione Nuova partita, **non la prova che sia avvenuta**. Non dichiarare corruzione dei save, soft-lock, reset automatico o causa risolta solo perché ora esiste la traccia.

### Chiusura minima del gate diagnostico

- Sul candidato immutabile, acquisire `LC.state().transitions` e checkpoint/preview/chapter/HP/playing **prima della decisione, dopo la mira, prima del clic e al primo cambio inatteso**. `recordTransition` sopravvive ai reset (`60–61`), menu-action registra button/clickDetail (`377`); `new-game` precede clear/reset (`110`). Distingue input distruttivo da reset nel flusso.
- Manca una traccia esplicita di `reset`/`continueGame`/`switchAct` nella lista persistente: aggiunta diagnostica minima consigliata con motivo, chapter/boundary richiesti ed esito lettura save, più ID di istanza/build. L'attuale evento `act-enter` nel log ordinario viene cancellato dal reset subito dopo (`97,101,114`); non basta da solo a ricostruire l'incidente. Non loggare dati personali.
- Se compare `menu-action:new`/`new-game`, correggere il driver se invia input dopo morte; per l'utente, se riprodotto, proteggere la scelta distruttiva con conferma esplicita e impedire che eventi pendenti della sessione precedente attivino il nuovo menu. Non disabilitare indiscriminatamente l'accesso tastiera.
- Se senza reload/nuova istanza né azioni distruttive si passa da street a courtyard/training, il rilievo diventerebbe **MAJOR di perdita di progressione**: correggere il primo chiamante che richiede boundary errato, non nascondere il problema con un redirect automatico a M2.

## Riscontri statici positivi

### Arene, checkpoint e cura

`restoreStreet()` istanzia le sei definizioni una sola volta e salta arene liberate/ID neutralizzati (`118`); nessuna ondata ulteriore. `activateArena()` salva l'attivazione e non viene ripetuto (`146`). `explode()` attiva e applica il danno nello stesso evento (`188–189`): un NPC inattivo non è invulnerabile. `updateStreet()` verifica clear per ciascun lato, non sul totale (`149–150`).

`interactStreet()` distingue già spento, lontano e protetto; guarda i soli difensori locali (`197–207`). Contatore =1+ID locali, doppio E vicino a spento non incrementa. Il primo E salva street, il secondo salva street-complete **immediatamente**, prima che la nave finisca il moto. `restoreStreet()` usa timestamp-3 e setter azzerato per non riavviare una discesa già conclusa (`117–119`); debug usa timestamp0 intenzionalmente (`425–426`).

Retry e Continua ripristinano 6HP, protezione1.25s e soli difensori non completati; sistemi/bolts vengono resettati. Le liste sono ricopiate, non mutate tramite alias del checkpoint. Cura unica +2 solo da ferito (`232`), disponibile dopo una liberazione, consumo persistente separato dal clear. Nessuna cura automatica entrando nella seconda arena; 6HP al retry è la regola approvata, non un pickup duplicato.

Migrazione v1 conserva la chiave legacy finché Nuova partita non viene scelta (`storage.ts:15,26–33`); v2 valida ID unici, ordine indipendente, clear→activated, disabled→clear e completamento↔due ancoraggi. Non c'è fallback silenzioso dal v2 invalido al vecchio training. La validazione non dimostra che tutte le combinazioni runtime siano state giocate: mantenere i test reali prima/dopo E in entrambi i lati.

### Slot globale, collisioni e schivata

`committed()` comprende wind-up/active dei vivi **e** sistemi con bolt vivo (`142`). Melee si prenota prima con guardia locale, ranged consulta il contesto dinamico: non può acquisire un secondo slot nello stesso tick. Al rilascio il ranged passa in recovery e trasferisce il pericolo al bolt (`ranged.ts:36–40`), che continua anche se il proprietario viene impacchettato. `remove()` libera e impone .6s (`22`); recovery NPC≥1.2s (`game.ts:240`). Nessun respawn per ripetere il tutorial.

Wind-up ranged1.2s, lock.2s e rilascio registrati; direzione non inseguita dopo lock (`ranged.ts:33–40`). Sweep contro pareti espanse e player, impatto più vicino, parete favorita nella parità (`24–30`). Bolt consumato anche se il player è invulnerabile; un danno per ID e protezione1.25s (`game.ts:144`). Schivata .35s e recupero totale1.35s, movimento substep contro ostacoli; melee non danneggia attraverso cover (`194–195,248–253`).

Visibilità player/camera e linea libera controllate prima di nuovi attacchi (`game.ts:166,255`; `ranged.ts:44`), percorso attorno cover e avvicinamento ranged se fuori portata (`47–51`). Nessun tiro homing. **Parametri effettivi:6m/s/lifetime3s**, non i5m/s/3.6s inizialmente proposti: deviazione di taratura dichiarata nello status, da giudicare con prova live, non modifica di trama o difetto automaticamente MAJOR.

### Aiuti, UI di base e narrativa

H è immediato; scala15/30/45 usa simulation time e `progress()` azzera stage/testo/timer (`145,153–162,215`). Pausa/tab nascosta fermano update. Colpo/arena/clear/anchor/cura sono progressi, non semplice rotazione camera. Scheda ranged compare dopo avvistamento e resta fino a cover/evitamento o neutralizzazione riusciti (`143–144,193,361`), quindi non costringe a far sparare un NPC già risolto.

Overlay principale pointer-events none e menu hidden effettivamente display:none!important: **non riscontrato un overlay invisibile che intercetti i clic in partita**. Esc è gestito prima del filtro input/button e resume riporta focus sul canvas (`input.ts:12–13`, `game.ts:368`). La mappa azioni menu non usa shortcut WASD/E per Nuova partita. Cap-height/contrasto/overlap della candidata richiedono comunque audit/immagini proprie.

`vo.briciola.street` descrive due percorsi e azione locale; `vo.squamakk.gifts` è sul primo E M2 (2/3), `vo.briciola.square` sul secondo (3/3), qualunque sia il lato (`texts.ts:12–14`, `game.ts:206`). Il nucleo resta da recuperare, piazza non giocabile e fine M2 esplicita. SCRIPT contiene varianti coerenti e testi di servizio. Nessun finale globale o M3 introdotto dal codice letto.

## MINOR concreti e correzioni minime

### C1 — Muzzle di carica/proiettile arretrato rispetto al cannone

`ranged.ts:37,58` mette origine del bolt e sfera cue a **.52m** davanti alla root; la bocca visiva del cannone è circa **1.045m** (`src/characters/cast/shooter.ts:56–58,70`). La sfera cue è quindi dentro la parte piena della canna, non davanti alla bocca; il colpo percorre inizialmente circa mezzo metro dentro l'arma. Corridoio, posa e ! restano segnali alternativi: **non basta a dichiarare un telegraph illeggibile o un MAJOR senza prova live**.

**Fix minimo:** condividere/leggere un offset muzzle corrispondente all'arma e usarlo per cue e rilascio. Conservare il test di segmento **dalla root fino alla nuova bocca**, per non creare un tiro dall'altra parte della cover quando il cannone sporge. Verificare a distanza gameplay e da vicino durante wind-up/rilascio; non cambiare timing per compensare uno spostamento visivo.

### C2 — Obiettivo persistente principale privo di verbo operativo

`game.ts:164` in street mostra titolo+contatore, righe `357` nomi+difensori, hint `359` dice «scegli» e «due colpi impacchettano». L'istruzione completa «Libera un lato, poi E» è nel dialogo temporaneo, non nell'obiettivo persistente, salvo vicinanza al dispositivo pronto. È una regressione rispetto alla regola di chiarezza del passo8, non un soft-lock confermato.

**Fix minimo:** titolo operativo «Libera Officina o Giostra, poi spegni i loro ancoraggi»; se resta solo E, «Spegni l'ancoraggio pronto». Conservare nomi, distanze e contatore, senza aggiungere un altro pannello o ridurre i font. Applicare il singolare locale «1 difensore» (`357`) insieme alla correzione.

### C3 — Due piccoli limiti della scheda/aiuto al resume

`restoreStreet():119` azzera `rangedLearned`: chi aveva già imparato il tiro può rivedere la scheda dopo ogni retry/Continua. Non blocca input o obiettivi, ma non è una memoria del comando già usato. Inoltre H su un menu/input non passa al gioco (`input.ts:13`), coerentemente col focus HTML: il tasto è una scorciatoia **in partita**, non un pulsante di aiuto nel menu.

**Fix minimo eventuale:** mantenere il flag tutorial appreso almeno nella sessione al retry, o derivarlo da una neutralizzazione ranged già salvata; chiarire H nei comandi. Non aggiungere un campo di save incompatibile senza migrazione. Non classificare il ripasso innocuo come perdita di progressione.

## Gate necessari prima del sign-off di atto

1. **Due completamenti con input reali sulla candidata identificata**, Officina→Giostra e inverso; lo stesso risultato non deve dipendere da `goto`, danni iniettati o seed di arene già libere. Seed del solo ingresso M2 accettabile per bot informato; provare separatamente il raccordo dal cortile.
2. Clear prima di E, dopo primo E, entrambe libere, cura consumata e3/3: retry+reload/Continua preservano ciascun lato, NPC neutralizzati e cura; E doppio/protetto/lontano spiega il motivo. Nessun ritorno inspiegato training; conservare tracce dell'incidente, non dichiararlo risolto per assenza di riproduzione singola.
3. Misurare attacco ranged live (lock≥.8s), cover, schivata/impatti unici, due arene attive, aiuti/H/pausa/progresso e discesa/reload sulla candidata; visualizzare Muzzle C1. Le sole asserzioni statiche su pool o log vuoto non costituiscono queste prove.
4. Rerun catture/audit/default/software e determinismo street-start dopo CSSfix, con budget picco sei NPC+wrap/pacchi/bolt; regressioni M1 e hash immutabile. Nessun claim60fps dal probe CPU o da budget sotto soglia.
5. Fresh-eyes M2 e relativa review sulle evidenze effettive, con build dichiarata; eventuali correzioni da retestare. Non promuovere un test della dist precedente a sign-off della candidata senza confronto. Audio in muto non è approvazione del mix; durata da misurare, nessun padding.

**Consegna codice conclusa.** Nessun blocco statico certo nuovo; C1–C3 circoscritti, incidente M2-T2 e prove mancanti separati dai difetti dimostrati. Il main può applicare le correzioni minime, ma questo reviewer non ha modificato sorgenti né interferito con il fresh-eyes. Fermarsi al playtest M2 prima di M3.
