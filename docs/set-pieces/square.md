# M3 — Piazza: Squamakk, nucleo e ultima consegna

**DESIGN PASS — reviewer combinato lean, 2026-10-21.** Nessuna contraddizione bloccante nel piano che richieda di fermare l'implementazione. Le precisazioni sotto sono condizioni del design approvato, **non prove runtime né SHIP dell'atto**. Letti ACT_03_PLAN, `src/acts/square.ts`, contratti, GAME_DESIGN, SCRIPT, DESIGN_SYSTEM e HANDOFF. Modificato soltanto questo file; nessun codice, piano o snapshot toccato, nessun browser/agente avviato.

## 1. Chiarimenti di continuità prima di costruire

- **3/3 significa nave abbassata, non vittoria.** Squamakk mantiene un proprio scudo di combattimento a finestre: il feedback deve dire «Scudo del generale», non riproporre ancoraggi da spegnere o contraddire lo scudo della nave già spento.
- Il nucleo prima è esposto per il tiro, poi liberato e raccoglibile. La presa E lo mette al sicuro, **non avvia la vittoria**: restituzione all'albero rende effettiva la chiusura del portale nel finale già approvato. Non introdurre un secondo nucleo/portale o un'altra missione per spiegare la distinzione.
- La riga storica SCRIPT «Recupera il nucleo dalla nave» può riferirsi al nucleo liberato davanti alla nave: marker e punto E sono `(0,-6.2)`, non un oggetto da cercare nella fusoliera. Registrare la variante testuale precisa nell'integrazione se necessaria.
- Le frasi M2 «piazza non ancora giocabile / ci fermeremo prima del prossimo scontro» descrivono la precedente consegna: nella **versione corrente** il gate M2→M3 deve ora indicare l'accesso E. Le copie approvate M1/M2 restano intatte, compresi i loro testi storici.

## 2. Spazio vincolante e attivazione

Fonte unica: `squareLayout` e ActDefinition in `src/acts/square.ts`, metri, piano0, bounds x[-15,15]/z[-15,13].

| Elemento | Coordinate / regola |
|---|---|
| Ingresso | `(0,10)`; accesso da M2 completo con E e motivi visibili se lontano/protetto |
| Encounter | Centro `(0,2)`, raggio **4.5m**; ingresso nel cerchio attiva il boss dopo aver salvato il checkpoint pre-scontro |
| Squamakk / bersaglio vulnerabile | `(0,-8)`; boss leggibile davanti alla nave, nucleo visivo sul suo punto di tiro, non sullo sfondo |
| Nucleo raccoglibile dopo boss | `(0,-6.2)`; E≤2.2m, linea libera |
| Albero solido | Centro `(8,-6)`; AABB **x[7.2,8.8], z[-6.8,-5.2]** |
| Interazione albero | **`(8,-4.4)`**, fuori dal tronco; E≤2.2m con linea libera verso questo punto, non verso il centro solido |
| Slitta solida | Centro `(-9,-7)`; AABB **x[-11,-7], z[-8.5,-5.5]** |
| Nave scenica | `(0,-12)`, sollevata sopra linee di tiro/movimento; eventuale fusoliera bassa fuori percorso/bounds, mai un grande solido invisibile al centro |

Ingresso→encounter→nucleo e nucleo→treeInteraction aperti; niente strettoie fra tetto e camera come il MINOR M2. Tronco/slitta devono apparire solidi dove lo sono; rami e luci non creano hitbox invisibili. Nessun salto, volo, assegnazione di nemici extra o precisione platform. Boss fermo sul punto, non un inseguitore che altera le coordinate condivise.

In beat `square`, obiettivo «Avvicinati al generale nella piazza», destinazione encounter distinta da MIRATO. Colpi anticipati danno «Avvicinati per affrontare Squamakk» e non consumano segmenti. Attivazione per avvicinamento, nessun tasto o tempo da aspettare; salvare **prima** del primo telegraph. Il bordo sud del cerchio può attivare da circa14.5m dal boss: non imporre un colpo immediato mentre il regalo ha portata12m.

## 3. Configurazione precisa del boss

Un boss, **tre segmenti**, **un colpo efficace per segmento/ciclo**. Nessun HP spugna, minion, cura del boss o azzeramento dei segmenti già conquistati quando Babbo viene ferito.

| Parametro | Valore iniziale vincolante |
|---|---|
| Wind-up di **ciascun** cono | **1.4s** |
| Tracking iniziale | **.3s**, poi lock immutabile: almeno **1.1s nominali bloccati**, mai<.8s effettivi visibili prima dell'impatto |
| Raggio attivo | **.35s**, direzione ferma, nessuno sweep durante danno |
| Geometria del raggio | Settore/cone half-angle **.20rad**, range **22m**, origine bossPoint; non una linea sottile o un'intera arena |
| Danno | **1HP massimo per attackID**, anche restando dentro tutto l'attivo |
| Pausa fra coni della stessa sequenza | **.5s sicuri**, nessuna hitbox o danno residuo |
| Vulnerabilità dopo ultimo cono | **5.5s**, nessun attacco durante questa finestra |
| Pattern ciclo1 /2 /3 | **1 /2 /3 coni sequenziali**, ognuno col proprio wind-up e lock |
| Dopo colpo valido | Finestra consumata immediatamente, feedback del segmento, **.5s sicuri** prima del prossimo wind-up |
| Finestra mancata | Stesso segmento e stesso pattern si ripetono, a partire da un nuovo wind-up completo; nessun reset dei segmenti precedenti |

Durata sola sequenza offensiva: **1.75 /4 /6.25s** (inclusi i .5s fra coni). Il passaggio alla vulnerabilità avviene dopo l'ultimo attivo, senza aggiungere un'altra attesa obbligatoria. La finestra5.5s è anche recovery sicura: non aggiungere un attacco nascosto durante l'avvicinamento.

Babbo conserva **6HP**, protezione dopo danno1.25s, schivata2.6m/.35s protetta e recupero totale1.35s. Danno non resetta pattern, boss o progresso. Retry ripristina6HP e un punto pre-boss libero, senza perdere segmenti già completati. Nessun danno passivo da toccare mantello/pacco/strumento del generale.

## 4. Segnale, lock e varietà senza sovrapposizione

Ogni cono riparte mirando alla posizione attuale di Babbo: tracking solo nei primi.3s, poi arma/testa/settore indicano **lo stesso angolo bloccato** fino a fine attivo. Fra due coni spariscono il vecchio settore attivo e il vecchio danno; il nuovo appare soltanto col proprio wind-up. Non memorizzare tre direzioni all'inizio della sequenza né eseguire coni contemporanei.

- **Ciclo1:** un cono, «Capisci il segnale e il contrattacco». Primo `h.boss.warning`, carica evidente, apertura dopo un solo colpo.
- **Ciclo2:** due coni con riacquisizione dopo la pausa: «Non tornare subito nella vecchia posizione». Nessun aumento di velocità/danno/ampiezza.
- **Ciclo3:** tre coni, stessa cadenza; HUD «Raggio1/3,2/3,3/3», poi finestra. La varietà è la sequenza leggibile, non una pioggia di oggetti o nuove regole nell'ultimo ciclo.

Telegraph: settore a terra con bordo ink/crema, riempimento limitato mint/oro, punta/frecce e `!` sul generale; carica dell'arma visibile **alla sua vera bocca**, non dentro la geometria (non ripetere il muzzle arretrato M2). Fase attiva distinguibile con forma/linea e testo «Raggio», non flash bianco. Il boss non avvia un nuovo wind-up da origine completamente fuori vista: mostra avviso di riallineamento e lascia ritrovare il bersaglio, senza teletrasportare il player. Ruotare la camera dopo aver visto il segnale non annulla un attacco già annunciato.

**Hitbox fair:** danno sul corpo/capsula player, non cappello/sacco. Usare un test coerente settore-vs-corpo, con raggio player.48m; il bordo grafico deve includere tutta la zona in cui il centro del player può subire danno (margine corpo incluso), mentre il cono base conserva half-angle.20/range22. Non mostrare una zona più piccola del test numerico. Gli eventuali solidi reali intercettano il raggio nella linea boss→corpo: non danneggiare attraverso tronco/slitta se il volume visibile blocca il raggio. Non basare la soluzione obbligata su quel riparo: uscire di lato/schivare basta nello spazio libero.

**Slot unico:** wind-up/active del cono costituiscono il solo attacco committed di M3. Nessun bolt ranged o melee di M2 sopravvive al cambio atto. I nuovi coni non si sommano a quelli vecchi per errori di update, pause o seek; reset distrugge tutti i pericoli precedenti.

## 5. Vulnerabilità, regalo e anti-abuso

Il nucleo esposto è il **bersaglio di gioco sul bossPoint `(0,-8)`**, rappresentato sul torace/strumento del generale a quota circa1.2–1.6m e mai coperto dalla nave. Collider di tiro semplice e permissivo: conta l'esplosione regalo entro **2m dal bossPoint con linea libera**. Non serve headshot o colpire un piccolo oggetto separato.

Regali come M1/M2: portata12m, volo entro.85s, cadenza.55s, area2m, assistenza opzionale. La finestra5.5s lascia margine per avvicinarsi dai14.5m di attivazione, allineare e completare il volo. Da oltre12m mostra «Avvicinati al nucleo: portata12m»; entro portata e visibile, marker «MIRATO · nucleo vulnerabile». Con assist off il marker non modifica traiettoria. «Percorso» resta destinazione, non sinonimo di aggancio.

**Regola atomica del colpo:** creare un `windowID` distinto a ogni apertura, compresi i tentativi ripetuti dello stesso segmento. Per infliggere il colpo, il regalo deve essere **lanciato durante quella finestra** e impattare mentre la stessa finestra è ancora aperta; verificare windowID e latch `windowConsumed` prima di applicare il danno. Il primo hit chiude/consuma atomicamente la finestra e incrementa diuno il segmento; altri splash, rimbalzi, regali già in volo o doppio invio nello stesso frame non contano. Non riutilizzare il vecchio windowID nel ciclo successivo.

Un lancio anticipato contro scudo non può attendere l'apertura e rubare un segmento; un regalo di una finestra precedente non colpisce la successiva. Il miss/timeout ripete il medesimo pattern senza sottrarre progressi. Le munizioni restano infinite. Mostrare subito «Scudo del generale attivo · schiva il raggio» oppure «Nucleo esposto: lancia ora»; un colpo rifiutato non è input ignorato.

L'hit valido toglie una delle **tre tacche grandi** e conferma «Colpo riuscito1/3» ecc.; prima del terzo non dichiara la sconfitta. Danneggiare Babbo durante la sequenza non azzera il latch/progresso e non crea una finestra gratis. Nessuna durata promessa: la run ottimale può essere breve; misurarla, non allungare con fasi invulnerabili aggiuntive.

## 6. Tre colpi → nucleo → albero: ordine inviolabile

| Beat / stato mondo | Condizione e azione | Conferma / divieto |
|---|---|---|
| `square` / battle | Arrivo e approach encounter | Ancoraggi già3/3, obiettivo affrontare generale |
| `boss` / battle | Tre segmenti, pattern1/2/3 | Nessun nucleo raccoglibile; E prematuro spiega «Prima impacchetta Squamakk» |
| `core` / core | **Terzo hit valido**, fine immediata dei danni; checkpoint boss sconfitto | Obiettivo «Recupera il nucleo: E», marker `(0,-6.2)`; portale ancora aperto, niente vittoria |
| `return-core` / carrying | E≤2.2m e linea libera sul nucleo | Stato trasportato sicuro, singolo pickup, obiettivo «Riporta il nucleo all'albero: E» su **treeInteraction** |
| `ending` / ending | E≤2.2m e linea libera a `(8,-4.4)`, coreCarried=true | Salva restituzione prima delle animazioni; soltanto ora avvio finale/chiusura e successivo titolo vittoria |

Boss sconfitto: `vo.squamakk.defeat`, nastri, pacco con muso/zampe/corona ancora riconoscibili per circa1.4s, poi spedizione alla nave con feedback già scelto. Nessun cadavere, esplosione bianca o player obbligato a guardare una camera forzata. Il nucleo diventa disponibile subito: non attendere la fine della gag per accettare E. Pacco non solido/non dannoso. Occlusione Santa gestita come nel design system, identica in reducedMotion.

Il nucleo trasportato è un **flag + visuale solidale al player**, non un rigid body: non si lascia a terra, non si perde contro collider o andando al titolo. Preferire sospensione magica vicino al sacco/guanto senza rappresentare una presa non misurata. E ripetuto sul punto di recupero: «Nucleo già al sicuro: portalo all'albero», non secondo pickup. E albero senza nucleo: ragione esplicita e direzione al recupero. Aggiornare/rimuovere feedback vecchio di distanza quando entra in portata, evitando il MINOR E-stale M2.

## 7. Finale unico: generosità, sciarpa e consegne

Una sola timeline seek-safe, avviata **esclusivamente dalla restituzione** e salvata immediatamente. `setStoryState(state,time)` viene chiamato al cambio di stato; non resettare il timestamp ogni frame. Frame indicativi relativi all'E finale, non vincoli che trattengono il player:

1. **0–1s:** nucleo raggiunge la sede dell'albero, piccoli accenti oro/mint confermano energia restituita. Non una grande variazione dell'esposizione o un lampo globale.
2. **1–2.5s:** il pacco-Squamakk è riconoscibile sulla nave attraverso una breve inquadratura/inserto leggibile; trova il regalo di Babbo con **sciarpa**. Sciarpa al collo/nel pacco, sorriso/perplessità, `vo.santa.scarf`. Non riattivare il boss, non togliere la neutralizzazione, non mostrare una seconda battaglia o una seconda restituzione.
3. **2.5–5s:** portale risucchia nave e pacchi con easing continuo e scala/traslazione locale, poi si chiude; niente strobe. La sciarpa è stata mostrata **prima** che il destinatario scompaia. Il mondo non deve mantenere un clone del generale abbandonato nella piazza.
4. **Dopo la chiusura effettiva:** `vo.briciola.saved`, slitta pronta e partenza breve scenica con renne se già costruite in codice; `ui.ending` «Mondo salvato. Natale consegnato.». Nessun controllo di guida o nuova missione.

La rappresentazione del pacco sulla nave/inserto è un raccordo visivo della spedizione già prevista, non un nuovo spostamento giocabile. Core/gameplay possiede boss, pacco e sciarpa; mondo possiede albero/portale/nave/slitta come ACT_03_PLAN, evitando doppioni. Un testo finale da solo **non sostituisce l'asset sciarpa e il gesto generoso visibile**.

Controlli non bloccati dal dialogo prima della restituzione. Dopo E finale è ammessa la breve presentazione guidata, con pausa e «Salta finale» esplicito: skip applica lo **stesso stato terminale coerente**, non restituisce prima il nucleo o cancella il save. Reload a ending prepara direttamente il finale già concluso o un replay esplicito, mai obbliga a rifare boss/pickup. ReducedMotion conserva sciarpa/chiusura con minimi spostamenti/dissolvenze locali, senza grande volo camera.

## 8. HUD, aiuti e checkpoint

- Obiettivo operativo sempre presente: «Avvicinati», «Schiva il cono; poi colpisci il nucleo», «Recupera: E», «Riporta all'albero: E». Stato boss: ciclo/segmenti e «Raggio1/2» oppure «Nucleo esposto», non due contatori3/3 indistinguibili dagli ancoraggi.
- `ui.boss.name`, `ui.goal.boss`, `h.boss.warning`, `h.boss.window`, `vo.squamakk.defeat`, `ui.goal.core`, `ui.goal.tree`, `vo.santa.scarf`, `vo.briciola.saved`, `ui.ending`: riusare ID SCRIPT coerenti. Varianti tecniche/scudo/miss vanno registrate dall'integratore; nessun ID nuovo è dichiarato già implementato qui.
- Scheda «Esci dal cono, poi avvicina il nucleo al+ e lancia quando è esposto» finché il primo segmento non è riuscito, anche se altri comandi sono già noti. H ripresenta subito l'aiuto, nessuna attesa per sbloccare attacco/interazione.
- Scala dopo15/30/45s **senza progresso rilevante**, su tempo simulato:15s spiega stato corrente/scudo;30s direzione/distanza/portata al bersaglio o E;45s indica un'azione concreta e varco sicuro, senza rallentare il boss o teletrasportare il player. Danno al boss, ingresso encounter, presa e restituzione azzerano timer; rotazione/tiro a vuoto non lo azzerano. Pausa/tab nascosta congelano aiuti e tutti i pericoli. Le finestre5.5s restano anch'esse ferme in pausa.
- Aiuti non sovrapposti al settore/raggio; evitare quattro righe permanenti sotto un boss vicino. Pannelli opachi, cap-height≥24px e contrasto≥4.5 a1080p. Marker E/mira/navigazione distinti anche in muto e senza discriminare colori.

**Save3:** checkpoint ingresso, pre-boss, ogni segmento completato, boss sconfitto, nucleo preso, restituzione. Campi/invarianti equivalenti a segmenti0..3, bossDefeated, coreCarried e coreReturned; bossDefeated richiede3segmenti, presa richiede sconfitta, restituzione richiede presa. Nomi tecnici finali al builder, non modifica dei contratti da questo reviewer.

Retry/Continua ripristina6HP e riparte con wind-up completo del **segmento ancora incompleto**, non con un attivo già a metà. Segmenti riusciti non persi; miss ripete solo il segmento corrente. Nessun attacco dopo bossDefeated; carrying mantiene il nucleo e obiettivo albero; ending mantiene restituzione. Prova esplicita M3/debug non sostituisce il save della partita ordinaria. Chiave nuova v3, migrazione v1/v2 non scrive all'apertura, validazione rifiuta flag impossibili senza nuova partita automatica; Nuova partita esplicita elimina le versioni previste. Snapshot M1/M2 e loro hash restano immutabili.

Non introdurre una cura farmabile come soluzione al boss. La protezione di accessibilità è retry6HP + segmenti persistenti; eventuale campanello pre-boss già previsto dalla presentazione generale deve avere posizione concordata, consumo persistente e nessuna duplicazione. Non aggiungere asset/pickup arbitrari al layout in parallelo.

## 9. Visivo, contatti, budget e audio

Squamakk: rettiliano più grande, muso/cresta/corona/mantello buffi, materiali `toyMaterial` A condivisi, niente umano o arma realistica. Mondo **≤35k/25call**, boss **≤18k/20call**, scena completa con Santa/nucleo/pacco/sciarpa/VFX **≤150k/150call**. Tre luci e zero post preferiti; niente luce per effetto, nessun nuovo mood globale o blur. Finale con piccoli accenti palette, metadati aggiornati e audit proprio.

Contatti numerici: piedi in appoggio≤2mm; ogni effettiva presa mano–regalo/sciarpa≤1mm in frame locale/trasformazioni animate, con hook dedicato. Se sciarpa drappeggiata, misurare punti di appoggio collo/pacco e distanza dalle superfici per evitare clipping/z-fighting; non certificare la presa con floorError. Corona/cappello/sciarpa non attraversano muso o mantello. Catturare pose boss idle/carica/attivo/recovery/wrap e finale sciarpa **gameplay + vicino**, normale/ridotto movimento. Budget finale include pacchi visibili senza istanziare di nuovo tutte le folle sconfitte.

Audio solo statici già approvati: village/combat/ambience.snow; alien sul wind-up, throw/wrap/hurt/checkpoint e conferme esistenti coerenti. Nessun nuovo raggio/sciarpa/slitta sintetizzato nel browser, nessuna voce/spesa. Testo sempre leggibile senza audio; la prova in muto non approva il mix percepito.

## 10. Prove richieste prima del sign-off

Preset proposti, da registrare in modulo dedicato: `square-entry`, `square-approach`, `boss-cycle-1/2/3`, `boss-locked`, `boss-vulnerable`, `boss-miss`, `boss-wrapped`, `square-core`, `square-carrying`, `square-ending`. Non sono strumenti già dichiarati funzionanti. `goto/seek` non scrivono save e non fingono una simulazione live; clock e stato per frame deterministici.

### Controllate, vero update/formule

1. Ogni cono: tracking.3, lock≥.8 effettivi, wind-up1.4, attivo.35, un danno/ID, pause sicure.5. Pattern1/2/3 senza due hitbox insieme; fuori settore/range innocuo, margine grafico/hurtbox coerente. Protezione schivata e danno1.25, muri/bounds rispettati, pause/tab congelano tutti i timer.
2. Window5.5: colpo lanciato e arrivato nello stesso windowID, late flight rifiutato, due regali/splash nello stesso frame danno **un solo segmento**; spam pre-finestra non conta. Miss ripete stesso pattern; ferita del player non resetta segmenti; terzo hit spegne subito ogni pericolo.
3. Attivazione approach salva pre-boss prima dell'attacco; dal bordo sud encounter dimostrare avvicinamento entro12m e impatto entro finestra con volo.85, senza aiuti debug. BossPoint marker e nucleo visivo coincidono; non usare il punto pickup come collider di combattimento per errore.
4. Ogni confine save/retry/reload e migrazioniv1/v2/v3, flag impossibili, storage negato, preview non distruttiva. Nessun boss resuscitato o nucleo perso/duplicato. Albero interagibile al punto esterno anche se il tronco è solido; E precoce/lontano/albero senza core ne spiega la ragione.
5. H e aiuti15/30/45 osservati; progresso azzera, pausa ferma. Finale non parte su bossDefeated o coreCarried; soltanto coreReturned. Timeline nave/portale/sciarpa/slitta e skip/reload coerenti; setter ripetuto non riavvia il tempo.

### Input reali, immagini e fresh-eyes

6. Run M3 con normali comandi, almeno una finestra mancata e recuperata, almeno una sequenza finale di tre coni letta senza pause iniettate nel mezzo; distinguere questo **realtime** dalle prove controllate e dai passi del tester remoto. Acquisire screenshot/video di segnale→lock→attivo→vulnerabilità e tiro, senza asserire timing dal solo frame.
7. **Bot reale Nuova partita→M1→entrambi ancoraggiM2→M3→albero→finale**, nessun seed/goto/glitch per release pass. Conservare log confini, input e build; morte/timing del bot da distinguere da difetto del gioco. Hash snapshot e regressioniM1/M2, build/typecheck/unit prima della consegna.
8. Capture/audit1080/default e software mirato, budget nel picco, contatti reali e determinismo anche seek andata/ritorno; zero errori console/rete. Guardare immagini, non solo summary. Rendering CPU/software corretto non dimostra60fps.
9. Playtester indipendente M3 soloUI, nessun docs/codice/LC; vere pause fra decisioni consentite e dichiarate, non nuovo primo impatto se è un retest. Deve capire cono, finestra, recupero e alberoE; vedere sciarpa, portale chiuso e slitta, non confondere terzo hit con vittoria anticipata. Durata umana/audio vanno misurati separatamente, non dedotti dal wallclock del driver.

**Conclusione:** DESIGN PASS per implementare questi tre cicli e il finale approvato. Nessun nuovo atto, filler o trama; nessun SHIP/LANDS finale prima delle evidenze. Raccordare prima slot/windowID/save invarianti e treeInteraction accessibile, poi staging sciarpa/portale e prove complete.
