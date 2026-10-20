# M1 — Cortile: consegna non richiesta

**Modalità DESIGN, reviewer combinato lean, 2026-10-20.** Specifica da implementare e misurare, non prova di funzionamento né approvazione SHIP/LANDS/ON TRACK. Nessuna modifica a trama, regole, coordinate condivise o codice. Fonti lette: AGENTS, HANDOFF, GAME_DESIGN, DESIGN_SYSTEM, TECH_PLAN, LEVEL_LAYOUT, SCRIPT, AUDIO e i tre profili `.claude/agents/`.

## Intento e limiti

- Insegnare movimento, regalo, schivata e interazione; far capire subito che gli alieni vengono rispediti alla nave, non uccisi.
- Un drone tutorial e **6 soldati totali, in tre gruppi 1 + 2 + 3**, mai più di tre vivi. Solo mischia in questo segmento: la via dei giocattoli conserva l'introduzione separata dei nemici a distanza. I tre microincontri cambiano problema spaziale, non introducono tre nuove specie.
- Chiudere con **ancoraggi 1/3**, elfi liberi e indicazione della via successiva. Niente discesa della nave, scudo spento, boss o Terra già salva.
- Le quantità e i tempi seguenti sono taratura iniziale indulgente da validare, non nuovi vincoli narrativi.

## Durata: obiettivo e onestà

Obiettivo primo giocatore circa **4–5 minuti**, esclusi menu e pause; non garantito. Con questo cortile compatto e dodici colpi efficaci il segmento può plausibilmente durare **2–3 minuti** per chi capisce subito: dichiararlo se misurato, non aumentare vita o aggiungere ondate per fare minutaggio. Il beat sheet generale colloca già il primo ancoraggio intorno al minuto 4.

| Fase | Budget primo giocatore | Attività, non attesa imposta |
|---|---|---|
| `intro` | 15–25 s, saltabile subito | Furto, portale, motivazione |
| `training` | 45–70 s | Orientamento, drone, schivata sicura |
| `battle`: gruppo A | 25–40 s | Primo inseguimento e lettura della gag |
| `battle`: gruppo B | 35–50 s | Schivare e contrattaccare fra due minacce |
| `battle`: gruppo C | 45–65 s | Avvicinarsi al dispositivo, raggruppare e colpire |
| `anchor` / `complete` | 15–25 s | E, conferma 1/3, checkpoint e direzione futura |

Totale stimato **180–275 s**; cinque minuti è un obiettivo superiore, non una durata già ottenuta. Registrare tempi di fase, errori, sconfitte e aiuti realmente richiesti. Nessun cancello temporale, camminata di riempimento, testo da attendere o nemico invulnerabile per allungare.

## Geografia e staging

Conservare le coordinate di LEVEL_LAYOUT. Partenza `(0,9)`, drone `(-2,4)`, Briciola/radio `(-4,8)`, ancoraggio `(0,-9)`, cancello `(0,-14)`. Nord = -Z. Colonna/simbolo dell'ancoraggio leggibile dalla partenza; nave decorativa a quota 8 m, non bersaglio utile.

Il corridoio centrale largo almeno 6 m resta libero. Niente barriera invisibile fra microincontri: il dispositivo può essere raggiunto prima ed espone `ui.anchor.blocked`. Non permettere di completarlo mentre esistono difensori pendenti o vivi.

| Gruppo | Entrata esistente | Destinazioni iniziali indicative (x,z), non nuovi collider |
|---|---|---|
| A, 1 soldato | `spawnNorth (0,-13)` | `(0,0)` lungo il centro |
| B, 2 soldati | `spawnWest (-9,-10)` | `(-4,-3)`, `(-2,-5)` passando **a nord** del laboratorio ovest |
| C, 3 soldati | `spawnEast (10,-11)` e `spawnNorth` | `(3,-7)`, `(-3,-8)`, `(0,-11)` passando **a nord** del magazzino est |

Le destinazioni vanno verificate con capsule e raggi: non interpolare attraverso le AABB delle casette. Il volume del dispositivo non deve chiudere l'accesso centrale. Segnalare l'entrata prima di abilitare la collisione offensiva; nessuna materializzazione dietro la camera a distanza di contatto. Se il giocatore presidia lo spawn, usare un punto libero visibile della stessa entrata e registrare la scelta, senza teletrasportare un attaccante addosso al giocatore.

## Taratura combattimento e correttezza

| Elemento | Specifica iniziale |
|---|---|
| Babbo Natale | **6 punti salute**; ogni attacco nemico toglie 1; niente danno da contatto passivo |
| Protezione dopo danno | **1,25 s** invulnerabile; icona/contorno stabile, non lampeggio; nessuna catena di colpi nello stesso attacco |
| Drone | **1 colpo**, immobile; non ostile, nessun teletrasporto rettiliano fittizio |
| Soldato standard | **2 colpi**; primo colpo interrompe il wind-up e provoca reazione di 0,35 s; il secondo impacchetta |
| Regalo | Munizioni infinite, intervallo **0,55 s**; 1 danno per esplosione per bersaglio; rimbalzo singolo, scoppio entro **0,9 s** o al contatto con nemico |
| Area regalo | Raggio **2 m**, limite visibile nella traiettoria/anteprima; niente danno oltre pareti solide, niente danno a Babbo o Briciola |
| Schivata | Spostamento **2,6 m / 0,35 s**, protezione durante il movimento, recupero **1 s dopo il movimento**; muri invalicabili, anche a delta alto |
| Cura | Un campanello dopo B, in spazio centrale libero `(0,-4)`; recupera **2**, massimo 6; non consumare a salute piena |

Mira assistita attiva di default, disattivabile: aiuta un bersaglio visibile vicino al reticolo (entro circa 8° e 12 m), non curva il tiro attraverso ripari. Mostrare traiettoria/atterraggio; privilegiare il punto mirato anziché un bersaglio fuori schermo. Nessun headshot necessario. Colpo riuscito: numero di tacche residue sul bersaglio e reazione, mai sola variazione cromatica.

### Attacco unico, tre usi spaziali

- Avvicinamento leggibile, velocità massima **2,4 m/s**; in A limitarla a **1,8 m/s**. Distanza di avvio attacco ≤3,5 m con linea libera.
- **Telegraph 1 s, mai meno di 0,8 s effettivi visibili**: rettiliano si accovaccia, alza il giocattolo/arma e mostra settore a terra con bordo, punta e simbolo. `sfx.alien` all'inizio è un rinforzo, non un nuovo fischio audio da generare.
- Direzione segue il giocatore solo nei primi **0,2 s**, poi si blocca: rimangono **0,8 s** per uscire dalla zona definitiva. Il nemico non ruota durante il colpo.
- Colpo: breve affondo, **0,2 s** di hitbox attiva dentro il settore dichiarato; al massimo 1 danno allo stesso giocatore per ID attacco. L'affondo si ferma contro i collider.
- **Recovery 1,2 s minimo** dopo il colpo: arma abbassata, posa sbilanciata, vulnerabile. Non cancellarlo per attaccare ancora. Dopo interruzione da regalo ripartire con un telegraph completo.
- **Un solo attacco impegnato alla volta** nel cortile (wind-up + colpo); gli altri possono riposizionarsi ma non comprimere il giocatore contro i muri. Lasciare almeno 0,6 s fra un impatto e l'inizio del prossimo wind-up.
- Se il segnale sarebbe completamente fuori camera o occultato, riposizionare prima di iniziare; non danneggiare a sorpresa. Indicatori direzionali aiutano a ritrovare gli altri nemici, non sostituiscono il telegraph.

### Hitbox e collisioni da rendere ispezionabili

- Player: capsula/cerchio di movimento raggio **0,48 m**, come TECH_PLAN; hitbox danneggiabile sul corpo, altezza circa **1,9 m**, cappello, barba e sacco esclusi.
- Soldato: raggio collisione **0,42 m**, volume colpibile centrale alto circa **1,7 m**; muso/coda decorativi non causano danno. Hitbox non più grande della sagoma letta dalla camera.
- Affondo: settore frontale fino a **2,2 m**, semiangolo **25°**. Il segnale a terra deve includere l'intera zona in cui il centro della capsula del player potrebbe subire danno, tenendo conto del suo raggio; niente bordo visivo più piccolo del test numerico.
- Debug deve distinguere collider di movimento, hurtbox, hitbox attiva, area regalo e segnale. Sweep/substep impedisce attraversamento di muri o bersagli; un'esplosione non applica due danni per overlap di più parti dello stesso rig.

## Sequenza giocabile e microincontri

### `intro`: un motivo per partire

Furto breve con `vo.squamakk.battery`, `vo.briciola.theft`, `vo.santa.coal`, solo testo con nome. `ui.skip` attivo immediatamente anche da tastiera. Skip porta allo stesso stato del tutorial e presenta comunque l'obiettivo. Non richiedere lettura completa per muoversi.

### `training`: prova senza rischio

Mostrare `ui.move`, poi `h.throw` sul drone. Primo colpo: reazione visibile del bersaglio, 1/1 completato, nessuna gag riservata agli alieni. Drone disabilitato ma ancora identificabile.

Per `h.dodge` il drone proietta **un settore di esercizio senza danno**, con la medesima geometria e telegraph di 1 s del soldato: si verifica che la schivata funzioni, non la precisione del timing. Una schivata già eseguita conta, anche prima del colpo al drone. Se manca, ripresentare l'aiuto senza togliere controlli; nessuna sequenza di schivate obbligatoria. I due flag `droneHit` e `dodgeUsed` chiudono il tutorial in qualunque ordine. Prima di uscire, `vo.briciola.anchors` chiarisce il nesso tre ancoraggi → nave giù; resta `ui.goal.anchors` a 0/3.

### A — «Un pacco per uno»: apprendere inseguimento e risultato

Un solo rettiliano raggiunge il centro; attacco lento e isolato. Attivazione al termine del training, con ingresso visibile, senza attesa fissa. Il player può colpire durante l'arrivo: nessuna invulnerabilità di presentazione.

La prima neutralizzazione deve essere leggibile nella normale camera gameplay. Nessuna rotazione forzata o fermo immagine. Questo gruppo insegna il ciclo osserva → schiva/spostati → tira nella recovery e la trasformazione comica, non serve solo a riempire il contatore.

### B — «Passo di lato»: scelta di posizione contro una coppia

Due soldati entrano da ovest dopo la neutralizzazione di A. Si distribuiscono a ventaglio nel centro, non inseguono in fila nello stesso punto. Uno si impegna nell'affondo, l'altro avanza lateralmente; il player può spostarsi fuori dalla linea e colpire il recupero oppure usare l'area per entrambi.

Nessun tiro nemico: l'ostacolo è leggere lo spazio fra due corpi, non un nuovo sistema. La cassa est è un riparo facoltativo, non la soluzione obbligata. Dopo B compare il campanello con `h.health`; non obbligare a raccoglierlo, non annullare una cura già usata al checkpoint successivo.

### C — «Consegna al dispositivo»: cambiare obiettivo senza perdere chiarezza

Tre difensori si dispongono attorno all'ancoraggio, senza sovrapporsi al volume interagibile. Due si avvicinano se Babbo entra nell'area, il terzo mantiene una posizione laterale finché si avvicina o viene colpito; nessuno resta irraggiungibile dietro una casetta. L'incentivo è far convergere i difensori per il regalo ad area, quindi raggiungere E.

Non è una terza ondata identica: dispositivo raggiungibile e feedback di protezione, due possibili accessi laterali e tre bersagli raggruppabili. Usare `h.anchor`; chi corre subito a E vede `ui.anchor.blocked` e i difensori indicati. Se il giocatore torna indietro, i nemici possono inseguire su percorso libero: niente reset salute o blocco di distanza che renda lo scontro interminabile.

Ingresso B/C immediatamente consentito quando i precedenti sono **neutralizzati**, senza attendere la fine del teletrasporto. Un nuovo wind-up però non può oscurare la prima gag: concedere almeno la sua breve lettura di 1,4 s dal primo wrap (non una pausa di fase). Gli attacchi successivi mantengono il limite di contemporaneità.

## Gag impacchettamento: setup → sorpresa → consegna

Timeline relativa al colpo finale del **primo soldato**, senza bloccare movimento o mira:

| Tempo | Evento visivo/testo | Cue statico esistente |
|---|---|---|
| 0–0,25 s | Arma abbassata, nastri avvolgono la sagoma; escluso da attacchi/danno da subito | `sfx.wrap` una volta |
| 0,25–0,9 s | Pacco chiuso, muso/zampe buffi visibili; due piccoli colpetti elastici, non sofferenza | Nessun secondo suono obbligatorio |
| 0,9–1,4 s | Piccolo simbolo di spedizione verso la nave, pacco si contrae e scompare in stelle locali | Nessun flash o nuovo asset audio |
| Dopo la chiusura | `vo.santa.wrapped`: «Impacchettato. Senza scontrino.» una sola volta | Nessuna voce |

Il pacco non diventa un ostacolo fisico, non infligge danni e non deve nascondere un settore d'attacco. Per gli altri soldati durata totale 0,8–1 s, stessa regola del mondo. Se più bersagli cadono insieme, spaziare i pacchi nelle rispettive posizioni, limitare particelle e voci sovrapposte di `sfx.wrap`; non spostare i bersagli per la camera. Riduzione movimento: niente rimbalzi del pacco o traiettorie ampie, chiusura e dissolvenza locali leggibili, nessuno shake.

## `anchor` → `complete`: risultato e checkpoint

- Tutti e sei neutralizzati → dispositivo non protetto, simbolo cambia forma e `ui.interact` appare entro **2,2 m** con linea libera. E singolo, non pressione prolungata.
- E fuori portata dà distanza/direzione, E prima della liberazione dà `ui.anchor.blocked`; nessun input ignorato. Non promettere danno da regalo sul dispositivo: l'azione risolutiva è E come da SCRIPT.
- Al successo, stato e HUD passano subito a **1/3**, dispositivo spento con `sfx.anchor` e `ui.anchor.done`. La breve animazione non ritarda salvataggio o conferma.
- `vo.briciola.route` solo ora: gli elfi sono liberi, gli altri due ancoraggi stanno lungo la via. Mostrare cancello/direzione con simbolo; fine segmento esplicita, non un corridoio apparentemente giocabile con muro invisibile. Nessuna battuta della discesa/finale.
- Checkpoint completo con `ui.checkpoint` e `sfx.checkpoint`, quest'ultimo dopo la conferma sonora dell'ancoraggio per non confonderli. `complete` resta a 1/3; Rigioca è scelta esplicita, mai reset automatico.

### Ripresa indulgente

Checkpoint versionati come TECH_PLAN: tutorial completato, pre-scontro, ancoraggio completato. Nel cortile pre-scontro coincide spazialmente con l'uscita dal tutorial, ma mantiene uno stato coerente distinto. Salvare anche l'avanzamento ai confini **A→B e B→C** come aggiornamento del checkpoint pre-scontro: gruppi già neutralizzati non tornano. Non serve salvare ogni singolo colpo.

Sconfitta: `ui.retry`, ripristino 6/6 e posizione sicura `(0,3)` per A/B, `(0,-4)` per C, verificata libera; si ricrea intero solo il gruppo corrente. Niente tutorial rifatto, doppia cura già consumata o battuta del primo wrap ripetuta. La ripresa dà 1,25 s di protezione e nessun nemico già a metà wind-up. Se lo storage fallisce, continuare la partita e dichiarare salvataggio non disponibile; non fingere una persistenza riuscita.

## HUD, testi e mix

- Sempre: obiettivo corrente, **0/3 → 1/3**, salute 6 tacche con `ui.health`, schivata pronta/in recupero (`ui.dodge.ready` / `ui.dodge.wait`). Durante battle indicare difensori restanti totali, includendo i gruppi non entrati, per non mostrare 0 nemici con dispositivo ancora protetto.
- Destinazione con simbolo e metri, freccia sul bordo se fuori vista; non solo rosso/verde. Tutorial evidenzia il drone, poi l'ancoraggio. Distanza E non confondibile con portata del tiro.
- Un suggerimento e una battuta al massimo contemporaneamente, su pannelli separati che non coprano reticolo, nemici o settori. Le informazioni cruciali sopravvivono alla sparizione della battuta. Non rimettere automaticamente suggerimenti già soddisfatti.
- UI opaca e palette A; contrasto ≥4,5:1, maiuscole ≥24 px a 1080p misurate. Zero blur, flash a schermo intero o shake obbligatorio. Pausa e tab nascosta congelano simulazione, attacchi e audio.
- Audio: `ambience.snow` continuo, `music.village` in intro/training e dopo il dispositivo, `music.combat` in battle; cambio senza sommare due loop a pieno volume. `sfx.throw`, `sfx.dodge`, `sfx.hurt`, `sfx.heal` rispondono alle azioni reali. Nessun suono di cura a salute piena. Mix moderato secondo AUDIO; telegraph udibile sopra i lanci, ma sempre comprensibile in muto.
- Gli ID `vo.*` sono **testi**, non file vocali. Gli ID audio sopra esistono già: zero generazioni, zero costo. Per nuove etichette tecniche (fuori portata, difensori restanti, fine segmento, storage) l'integratore deve assegnare ID in SCRIPT; qui non si modifica la sceneggiatura né si dichiarano quegli ID esistenti.

## Scenari debug richiesti, non ancora dichiarati implementati

Usare il contratto LC del TECH_PLAN. `goto(beat)` prepara lo stato senza toccare i salvataggi reali; `seek` congela pose deterministiche, non è un sostituto del playtest con input. Proposta di preset aggiuntivi da raccordare dall'integratore senza rompere le cinque fasi canoniche:

| Scenario | Stato da preparare | Prova da conservare |
|---|---|---|
| `intro` | Prima del furto e dopo skip | Stesso obiettivo, nessun flag tutorial perso |
| `training` | Entrambi flag falsi; variante schivata già fatta | Un colpo al drone; ordine inverso accettato |
| `battle-a` | 6/6 HP, solo A attivo | Wind-up 0 / 0,2 / 1 s, colpo e recovery; frontiera hitbox |
| `first-wrap` | Primo soldato a 1 HP, regalo in arrivo | Gag a 0 / 0,25 / 0,9 / 1,4 s, gameplay e vicino |
| `battle-b` | A completato, due soldati attivi | Ventaglio, una sola hitbox offensiva, ostacoli solidi |
| `battle-c` | A/B completati, tre difensori, 2 HP player | E protetto, area regalo multipla, cura e retry |
| `anchor` | Sei neutralizzati, 0/3 | E lontano/vicino, conferma immediata e salvataggio |
| `complete` | Dispositivo spento, 1/3 | Via indicata ma fine slice chiara; nessuna nave che scende |

`LC.state()` / log devono rendere osservabili: fase e gruppo, flag tutorial, HP e invulnerabilità, nemici pendenti/vivi/neutralizzati, ID attacco, inizio wind-up/lock/active/recovery, hitbox e direzione, colpi ricevuti, wrap/teletrasporto, motivo di E negato, checkpoint e risultato storage. Timestamp in secondi di simulazione; pausa non li fa avanzare.

### Gate per la successiva REVIEW

1. Partita reale completa, anche con audio muto, senza `goto`; playtester a occhi nuovi trova drone, schivata, E e comprende 1/3. Riportare durata effettiva e non chiamare «cinque minuti» un run di due.
2. Prove numeriche: telegraph visibile ≥0,8 s dopo lock, recovery ≥1 s, massimo un attacco impegnato, nessun danno duplicato, colpo fuori settore innocuo, muri non attraversabili e nessun tiro attraverso casette.
3. Test retry/Continua ai confini A/B/C e dopo 1/3; niente gruppi completati ripetuti, doppie ricompense, scudo spento o ancoraggio completato perso. Storage vietato non blocca.
4. Catture gameplay e vicino per gag, combattimento e completamento; palette/materiali dal mockup A, contatti `LC.selfTest()` (mani ≤1 mm, piedi in appoggio ≤2 mm), collisioni e spawn liberi verificati. Mood diversi solo se davvero implementati e catturati.
5. Budget nel caso peggiore di tre soldati + pacchi/VFX: ≤150 draw call, ≤150k triangoli, tre luci, zero post previsti; geometrie condivise/istanziate. Build, log console/rete, GPU software e audit UI/lampeggi senza errori bloccanti.

**Stato reviewer:** specifica pronta per implementazione; verdetti critico **SHIP**, azione/comicità **LANDS** e narrativa **ON TRACK** sospesi fino a prove reali. In review, qualsiasi danno illeggibile, input silenzioso, salvataggio incoerente o finale diverso da 1/3 è almeno MAJOR; fornire causa, effetto e correzione puntuale prima dell'utente.
