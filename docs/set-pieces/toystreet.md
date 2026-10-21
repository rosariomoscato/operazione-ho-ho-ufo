# M2 — Via dei giocattoli: due consegne, una nave

**DESIGN lean combinato — 2026-10-21.** Specifica, non prova d'implementazione né sign-off SHIP/LANDS/ON TRACK. Fonti: ACT_02_PLAN, `src/acts/toystreet.ts`, nuovi contratti, HANDOFF, GAME_DESIGN e DESIGN_SYSTEM approvati. Solo questo file è modificato; M1 congelato, core, contratti e trama restano intatti.

## 1. Patto giocabile e layout

- Ingresso `(0,10)` dopo il cortile: contatore **1/3**. Due arene in ordine libero, **sei difensori totali**, nessuna riserva/ondata aggiuntiva: Officina 3 ranged, Giostra 3 melee. Entrambe possono essere attive insieme, senza recinti invisibili o reset tornando al centro.
- Fonte unica delle posizioni: `src/acts/toystreet.ts`. Officina centro `(-8,-4)`, Giostra `(8,-4)`, raggio attivazione 5,5 m. Spawn Officina `(-11,-5)`, `(-7,-8)`, `(-4.5,-10.5)`; Giostra `(5,-5)`, `(10,-7)`, `(6,-10.5)`. Non duplicare coordinate nel renderer/debug.
- Ancoraggi `workshop (-8,-9)` e `carousel (8,-9)` dipendono **solo dalla propria arena**. Tre difensori neutralizzati → E disponibile anche se l'altra arena è intatta o in combattimento. E entro 2,2 m e linea libera, senza hold. Fuori portata/protetto dà sempre motivo, nome del lato e difensori locali restanti.
- Cura unica `(0,0)`; uscita `(0,-13.5)`. Corridoio centrale x[-3,3] libero. AABB negozi e coperture sono esattamente quelle del piano: non aggiungere collider sul dispositivo o decori solidi attraversabili.
- Visivamente: trenino fermo/cassa arrotondata = cover Officina; piattaforma giocattolo/decoro statico = Giostra. Nessuna giostra pilotabile, piattaforma mobile necessaria o nuova meccanica di trasporto. I collider alti circa 1,6 m devono corrispondere ai volumi visibili.

## 2. Progressione, attivazione e libertà

Stati per arena: **inattiva → attiva → libera → ancoraggio spento**. L'attivazione scatta entrando nel raggio **oppure al primo colpo efficace** contro un suo difensore. Applicare quel colpo nello stesso evento: mai bersaglio invulnerabile perché il player è fuori dall'arena. L'esplosione che colpisce due arene può attivarle entrambe; nessun ordine imposto dal tutorial o dai dialoghi.

Difensori inattivi sono visibili e bersagliabili ma non attaccano. All'attivazione orientano testa/arma, mostrano nome arena e intenzione; il primo attacco ha comunque telegraph completo e origine visibile. Nessuno spawn extra. Gli alieni attivi possono muoversi su percorsi validi attorno alla cover e non guariscono quando Babbo si allontana. Un nemico colpito da lontano cerca una posizione raggiungibile: mai attesa infinita fuori portata dei regali.

| Evento | Conferma e destinazione |
|---|---|
| Ingresso via | «Due ancoraggi: Officina o Giostra, scegli tu»; entrambi i nomi/indicatori visibili, 1/3 |
| Arena attivata | «Officina · 3 tiratori» / «Giostra · 3 difensori»; numero aggiornato a ogni neutralizzazione |
| Tre neutralizzati | «Officina libera · E all'ancoraggio» (o Giostra); non annunciare l'altra libera |
| Primo ancoraggio M2 | **2/3**, lato completato con spunta; indicare l'altro, non imporre transizione immediata |
| Entrambi spenti | **3/3**, nave scende verso piazza; uscita marcata e fine M2 esplicita |

Se il giocatore libera entrambe le arene prima di usare E, mostrare due dispositivi pronti e lasciare scegliere. Conteggio totale = primo ancoraggio del cortile + ID locali unici disattivati: E ripetuto non incrementa. Stato `street` durante le attività; `street-complete` solo dopo entrambi gli ancoraggi, non dopo sei soli wrap.

## 3. Taratura comune: indulgente e verificabile

- Babbo: **6 HP**, attacco nemico = **1 HP**, protezione dopo danno **1,25 s**. Nessun danno da contatto passivo o amichevole. Retry ripristina 6 HP; la semplice entrata/uscita da un'arena non cura.
- NPC: **2 colpi** da regalo; primo interrompe wind-up e dà reazione breve 0,35 s senza cancellare una recovery già in corso; secondo impacchetta e teletrasporta. Regali infiniti, cadenza .55 s e area 2 m come M1; cover blocca anche esplosioni oltre parete.
- Schivata M1: **2,6 m / .35 s**, invulnerabilità durante lo spostamento, pronta dopo 1,35 s dall'inizio. Non attraversa cover/muri. Feedback pronto/recupero conservato.
- **Un attacco committed globale** fra tutte le arene e tutti i tipi, non uno per gruppo: wind-up, fase attiva e **proiettile ancora pericoloso in volo** occupano lo stesso slot. Nessuna mischia mentre un tiro è ancora capace di colpire. Liberazione su interruzione, impatto o scadenza; almeno .6 s prima di un nuovo wind-up dopo fine pericolo. Recovery individuale **≥1,2 s**, mai cancellata per riattaccare.
- Attaccante completamente fuori schermo/occultato non inizia: riposiziona prima, avviso direzionale per ritrovarlo. Una volta telegrafato, il proiettile può continuare se il player gira la camera: mantenerne avviso periferico, non farlo curvare o ricomparire davanti.
- Non rendere obbligatoria la schivata precisa: uscire dalla linea o usare cover deve funzionare. Segnali geometrici e testo oltre al colore, piena giocabilità in muto.

## 4. Officina — scoprire tiro lento e cover reale

**Problema nuovo:** un rettiliano carica un colpo mentre Babbo decide se passare dietro il trenino, schivare di lato o interrompere col regalo. Tre origini spaziali già nel file atto, non tre proiettili simultanei. Shooter riconoscibile da strumento arrotondato e posa a due mani; medesimo rettiliano vinile, nessuna nuova fazione.

Parametri iniziali da integrare nel modulo ranged dedicato, senza alterare contratti condivisi:

| Fase | Specifica |
|---|---|
| Acquisizione | Cerca linea libera e origine visibile; portata iniziale **12 m**, compatibile coi regali. Se troppo lontano avanza sul navmesh/grafo di collisione; non spara da oltre portata utile |
| Telegraph | **1,2 s**: posa di carica, `!`, piccola sfera sulla bocca dell'arma e corridoio a terra con bordo/freccia; `sfx.alien` all'inizio |
| Lock | Segue fino a **.2 s**, poi direzione immutabile: **1 s dopo lock**, mai meno di **.8 s effettivi** prima del rilascio. Registrare direzione/tempo; nessun tracking occulto durante il rilascio |
| Proiettile | Sfera giocattolo raggio **.18 m**, velocità **5 m/s**, rettilinea, massimo **18 m / 3,6 s**. Niente homing, splash o rimbalzo ostile. Scia corta/contorno, non lampo |
| Altezza | Lancio/viaggio circa **1,2 m** dal suolo: la cover di 1,6 m intercetta davvero il colpo. Origine fuori dalla propria geometria e dai collider; vietato spostarla dall'altra parte del riparo |
| Collisione | Sweep sfera sul segmento percorso nel tick contro cover, muri e hurtbox corpo player; scegliere il primo impatto. Cover vince a parità di distanza. Mai test solo sull'estremo del frame |
| Impatto | Dissolvenza locale; su cover piccolo segno/pop visivo, **zero danno** dietro. Su player massimo un danno per projectile/attack ID, poi rimozione; schivata/protezione impediscono il danno e consumano il proiettile al contatto |
| Recovery | Tiratore vulnerabile **≥1,2 s** dal rilascio, arma abbassata. Slot globale resta impegnato finché il proiettile è vivo, anche se il tiratore viene impacchettato |

Capsule/cerchi M1 raggio player .48, alieno .42; cappello, sacco e coda non estendono il danno. Il corridoio indicato deve includere il raggio del proiettile e il centro della hurtbox che può subire danno: non disegnare una linea più stretta del test numerico. Il tiro non colpisce NPC alleati o dispositivi e non crea danni multipli.

**Raggiungibilità:** il tiratore preferisce 5–9 m ma non ha una zona invulnerabile se Babbo gli arriva vicino; arretra solo lungo spazio libero e può usare lo stesso telegraph lento da fermo se non c'è fuga. Mai attraversare cover, uscire dai bounds o orbitare più velocemente del player. Il trenino è aggirabile dalle estremità, i tre NPC raggiungibili in entrambi i versi; l'ultimo non deve rimanere dietro un negozio a sparare senza farsi vedere. Controllare concretamente il regalo contro il bersaglio dietro cover: indicare «Riparo davanti: aggira il trenino», non un falso MIRATO attraverso parete.

**Tutorial contestuale, non cancello:** al primo tiratore visibile «Carica il tiro: esci dalla linea o usa il trenino come riparo». Alla prima collisione su cover, conferma «Riparo: colpo fermato» una volta. Se Babbo lo impacchetta prima che spari, riconoscere il successo e non ricrearlo per mostrare l'esercizio. Se sceglie prima Giostra, questa scoperta resta disponibile al primo ingresso Officina.

## 5. Giostra — muoversi, raggruppare, consegnare

Tre melee usano wind-up **1 s**, lock dopo .2 s (≥.8 s bloccati), attivo .2 s e recovery ≥1,2 s già verificati in M1. Lo slot globale include i tiratori eventualmente attivati. Uno si avvicina dal fianco della cover, uno occupa l'accesso al dispositivo, uno resta più arretrato finché Babbo si avvicina o lo colpisce. Non costruire tre nuovi comportamenti: separazione e posizioni del file atto bastano.

Il piccolo riparo della Giostra permette di interrompere l'inseguimento e far convergere una coppia nell'area del regalo; il corridoio centrale permette di arretrare senza essere schiacciati. Melee fermi dietro cover trovano un percorso, non infliggono danno attraverso di essa. La variante resta diversa dall'Officina: leggere un avvicinamento e una recovery, non aspettare munizioni o una finestra obbligata.

**Gag breve, stessa regola:** pacco che si agita con muso/piedi visibili → «Pacco rettiliano» → «↑ Spedito alla nave». Il tiratore può alzare il proprio strumento come fosse un'etichetta di consegna, senza cambiare hitbox o creare un oggetto raccoglibile. Riutilizzare gestione occlusione Santa e feedback M1; niente battuta duplicata a ogni NPC, niente gag sopra un telegraph. Riduzione movimento conserva informazioni e spedizione senza oscillazioni ampie.

## 6. Cura, progressi e checkpoint

- Un solo campanello centrale, **+2 HP**, massimo 6, consumabile solo se feriti. Marker «✚ Cura +2» e distanza; a vita piena rimane disponibile. Nessuna seconda copia completando l'altra arena o tornando dal titolo.
- Persistenza separata per capitolo, **arene attivate/liberate**, ancoraggi spenti e cura consumata. Preferire anche ID dei difensori già neutralizzati per arena: salvare le neutralizzazioni, non ogni tick o proiettile. Non usare un unico indice lineare Officina→Giostra.
- Checkpoint all'ingresso via, a liberazione di ciascuna arena, a ciascun ancoraggio, al consumo cura e a 3/3. Stato «arena libera ma ancoraggio ancora acceso» è valido e deve sopravvivere a reload/Continua. Salvataggio e conferma obiettivo immediati, non dopo l'animazione.
- Retry: salute 6, posizione centrale libera dell'ingresso o ultimo punto sicuro verificato; preserva arene liberate, ancoraggi e cura. Ripristina coerentemente i soli difensori non neutralizzati, nessun tiro già in volo/wind-up a metà; protezione iniziale 1,25 s. Mai richiedere di riaprire il cortile o rigiocare un'arena completata.
- Migrazione save M1 v1 e schema malformato sono responsabilità dell'integratore secondo piano: M1 completato entra con **1/3**, non 0/3 né 3/3. Storage negato avvisa senza bloccare. Debug non scrive il salvataggio reale.

## 7. HUD e aiuti a 15 / 30 / 45 s

HUD compatto: **Ancoraggi 1/3→2/3→3/3**, righe «Officina: 2/3 difensori restanti / libera: E / spenta» e analogo Giostra, vita e schivata. Non confondere 2/3 *difensori* con 2/3 *ancoraggi*: nomi ed etichette sempre espliciti. MIRATO/ring sul bersaglio realmente agganciato, Percorso per navigazione, avvisi lati/dietro per nemici; impilare marker e tacche per evitare regressione M1. Non coprire il proiettile con tre pannelli inferiori permanenti.

Aiuti basati sul **tempo di simulazione senza progresso rilevante nel compito corrente**, azzerato da primo colpo riuscito, neutralizzazione, ingresso nell'arena scelta, cura utile o ancoraggio. Pausa/tab nascosta fermano il tempo; muovere il mouse non conta come progresso. Nessuna azione viene ritardata o resa obbligatoria per aspettare questi messaggi.

| Soglia | Aiuto breve contestuale, una sola scheda |
|---|---|
| **15 s** | Senza arena scelta: due marker nominati. In combattimento: «Destro: porta il bersaglio al +; clic quando è agganciato» oppure ricorda cover se il tiro è bloccato |
| **30 s** | Evidenzia **una** soluzione concreta visibile: estremità libera del trenino / nemico laterale da ritrovare / E sul dispositivo locale già libero. Non imporre di lasciare l'arena scelta |
| **45 s** | Direzione+distanza al prossimo passo valido; se ferito e cura disponibile, priorità «Cura +2 al centro». Se la cover blocca il tiro, «Aggira il riparo dal lato libero» con marker sul varco, non auto-teletrasporto |

Loggare aiuto, motivo e tempo; stop automatico al progresso. Aiuti non accodati sopra messaggi di danno o telegraph; ripresentabili su richiesta/menu, non ripetuti ogni frame. Nuovi testi vanno registrati dall'integratore con ID stabili in SCRIPT/texts; qui nessun ID nuovo è dichiarato già esistente.

## 8. Da 2/3 a 3/3: promettere M3 senza costruirlo

Al primo dispositivo M2 usare il contatore 2/3 e `vo.squamakk.gifts` già previsto per il **secondo ancoraggio complessivo**, qualunque sia il lato. Al secondo, `vo.briciola.square`: scudo spento e nave che scende **verso la piazza**, non nucleo restituito. Nave scenica `(0,-20)`, quota **8→3 m in circa 3 s**, ease dolce, nessun urto gameplay; traslazione solo della nave, niente nuova camera forzata.

Contatore/checkpoint **3/3 subito**; controlli liberi durante la discesa e possibilità di saltare il solo riepilogo. Dopo reload a 3/3 la nave è già a quota finale, nessun salvataggio ritardato. Mostrare «Tre ancoraggi spenti · La nave è scesa verso la piazza · Fine del secondo segmento». Uscita segnalata ma M3 non ancora percorribile: non lasciare il player contro un limite muto. Niente boss, recupero nucleo, portale chiuso o «Terra salva». `vo.squamakk.parking` opzionale, una volta e senza sommergere l'istruzione.

Audio solo file approvati: `music.village` per ingresso/area calma, `music.combat` se almeno un'arena è impegnata, `ambience.snow`; `sfx.alien` per telegraph, `sfx.wrap`, `sfx.anchor`, `sfx.checkpoint`, `sfx.hurt`, `sfx.heal`, `sfx.throw`, `sfx.dodge` sulle azioni reali. Nessun nuovo suono di cannone/discesa da acquistare o sintetizzare. Conferme anchor/checkpoint distanziate come M1, non due temi sovrapposti. Audio in pausa, nessuna voce.

## 9. Scenari debug e gate futuri

Proposta di preset nel registro scenari dedicato, **non API già implementate**. Ogni preset deriva coordinate da ActDefinition e non altera save reale; `seek` prepara immagini deterministiche, non sostituisce la prova live.

| Scenario | Stato preparato / misura richiesta |
|---|---|
| `street-entry` | 1/3, due arene inattive, cura intatta, entrambe raggiungibili e nominate |
| `street-workshop-first` / `street-carousel-first` | Ingresso reale nel rispettivo raggio; attivazione e progressione indipendenti |
| `street-hit-activation` | Player esterno al raggio, regalo in arrivo: danno e attivazione nello stesso evento |
| `street-ranged-lock` | Tiratore visibile, pose a 0 / .2 / 1 / 1.2 s; direzione costante dopo lock, rilascio non prima di .8 s bloccati |
| `street-cover` | Proiettile verso Babbo dietro trenino, poi variante percorso libero; sweep ad alto delta e angoli del riparo; nessun danno attraverso cover |
| `street-dodge-shot` | Stessa traiettoria: hit senza schivata, nessun danno durante protezione; un solo hit per ID |
| `street-both-active` | Sei NPC vivi, ranged+melee richiedono attacco; massimo un committed compreso proiettile vivo, nessuna starvation dell'altra arena |
| `street-local-clear` | Officina libera/ancora accesa, Giostra ostile (e variante inversa): E funziona solo sul lato valido |
| `street-2of3` | Primo locale spento, altro ancora da risolvere; checkpoint/Continua in entrambi gli ordini |
| `street-heal` | 3 HP, cura centrale disponibile: 3→5 una volta, retry→6 senza ricreare cura |
| `street-hints` | Nessun progresso a 14,9/15/30/45 s; pausa e nuovo progresso azzerano/sospendono correttamente, nessun cancello temporale |
| `street-descent` / `street-complete` | 3/3 appena ottenuto e stato dopo reload: nave 8→3 / già 3, uscita/fine M2 chiare |

`state`/log devono permettere di leggere: act/arena, ID NPC/tipo/HP, attivazione e causa, arena libera, ID ancoraggi spenti, cura consumata, checkpoint, attaccante committed, direzione e timestamp lock/rilascio/recovery, projectile ID/posizione/velocità/primo collider/causa rimozione, danno evitato/applicato, aiuti e loro timer. Nessun falso PASS per attacchi assenti dal log.

**Prima della REVIEW:** entrambi ordini con input reali; attivazione da colpo; interazioni protette/lontane; entrambi lati attivi; reload/retry dopo arena libera ma prima di E, dopo 2/3, cura e 3/3; migrazione M1 e regressioni del cortile corrente, snapshot immutato. Bot informato distinto da fresh-eyes; fermarsi per playtest utente dopo M2.

**Grafica/budget:** mondo da solo **≤40k triangoli / 25 call**; caso peggiore con **sei NPC + Santa + regali/proiettile/wrap** ≤150k/150call. Con il cast M1 come stima: 40k + 6×7.466 + 12.878 ≈97.674 triangoli, prima di armi/VFX: misurare shooter e margine, non assumere equivalenza. Materiali `toyMaterial` e luci A condivisi, tre luci/zero post previsti, nessuna luce per proiettile. Nessun modello, texture o audio esterno. Catture player e vicino per shooter/cover/wrap/discesa, ridotto movimento, audit 1080/default e software; contatti piedi ≤2 mm, eventuali prese effettive ≤1 mm, collisioni e palette verificabili in selfTest. Non attribuire contatti mani o 60 fps a controlli che misurano solo piedi/budget.

**Stato:** pronto per integrazione e prove, nessun verdetto approvativo. Consiglio minimo: raccordare prima stato per-arena/save e slot d'attacco globale, poi costruire il solo tiro lento con cover reale; solo dopo collegare discesa, HUD e aiuti. Non allungare l'atto: sei difensori e due scelte spaziali bastano; durata reale da misurare e dichiarare.
