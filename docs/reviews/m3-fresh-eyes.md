# M3 — playtest boss e finale, solo UI

## Esito

**Completato: sì.** Tre colpi riusciti su Squamakk, nucleo recuperato con E, restituito all'albero con E; finale guardato senza saltarlo fino a «Mondo salvato. Natale consegnato.» e comparsa di «Nuova avventura». **Zero morti, zero retry. Salute finale 5/6. Nessun MAJOR bloccante confermato.**

Ho poi premuto «Nuova avventura»: riparte realmente l'introduzione del cortile, con ancoraggi 0/3 e salute 6/6. Non ho proseguito M1. Driver chiuso con `close`.

## Metodo e tempi

Solo comandi del client, testo visibile e screenshot restituiti; nessuna lettura di codice, documentazione, stato interno, LC o API di gioco. Ricordavo i controlli da M2: movimento, destro trascinato, clic, E vicino al dispositivo. **Il boss e il finale erano nuovi per me.** Audio muto, non valutato.

`pauseBetweenActions: true` in tutte le risposte: il driver mette in pausa dopo la cattura e riprende prima della prossima azione. Non ho usato pause esplicite. Il tempo per interpretare le immagini non provoca danni: questo è un test di comprensione/completabilità a passi, **non una misura della difficoltà di una partita umana continua**.

37 chiamate client comprese snapshot e close, entro il limite di 100. Tempo wall del driver alla chiusura **434,444 s (7 min 14 s)**; primo snapshot a 24,188 s, circa **6 min 50 s tra prima osservazione e chiusura**. Primo colpo 106,625 s, terzo 230,703 s, restituzione/finale 369,269 s, schermata con «Nuova avventura» 409,883 s. Sono tempi wall del canale, non human playtime.

## Comprensione ricavata dal gioco

Dal titolo ho scelto «Prova la piazza e Squamakk». Il gioco dice di avvicinarmi, evitare il cono e lanciare contro il nucleo esposto entro 12 m, un regalo valido per ciclo. Dice già esplicitamente che non basta il generale: «Nessuna vittoria finché il nucleo non torna all’albero».

Ho capito progressivamente che il numero di cariche aumenta dopo ciascun colpo: prima 1/1, poi 1/2 e 2/2, infine fino a 3/3. La finestra «Nucleo esposto» con secondi rimasti e «lancia ora» è molto leggibile. Dopo ogni tiro ho atteso 900 ms live per vederne l'esito; il contatore «colpi riusciti» passa distintamente 0→1→2→3. Non ho dovuto dedurre danni da sole animazioni.

Al terzo colpo l'obiettivo diventa **«Recupera il nucleo libero: E»**, non vittoria. Dopo il recupero diventa **«Riporta il nucleo all’albero: E»** con freccia/distanza. È chiaro cosa manca e dove andare, senza consultare fonti esterne.

## Azioni e motivi

- **W iniziale:** seguire l'invito ad avvicinarmi; parte lo scontro e compare il cono. La destinazione iniziale «Generale · 8.0m» diventa «Nucleo sul generale · 14.5m» dopo l'avvicinamento: un cambio di riferimento un po' sorprendente, ma la distanza successiva e la portata 12 m mi hanno guidato correttamente.
- **D per uscire dal primo cono**, poi W per entrare nella portata: a 10,8 m compare MIRATO/nucleo vulnerabile, clic e attesa danno 1/3.
- **A per il cono seguente:** ho perso una tacca; il gioco lo segnala con «Colpito · −1 salute · protetto 1,25 s». Ho quindi invertito lateralmente con D alla carica successiva. Seconda finestra, clic, 2/3.
- Per le tre cariche finali ho alternato spostamenti laterali e una breve attesa per leggere il nuovo segnale; non ho premuto Spazio, quindi **non considero verificata la schivata di M3**.
- Quando compare **«Riallinea il generale davanti alla camera»**, ho usato un trascinamento destro a sinistra di 70 pixel; le cariche riprendono e arrivo alla terza finestra. Clic e attesa danno 3/3.
- **E da lontano sul nucleo:** risposta esplicita «9.6 m · E entro2,2m», non input ignorato. W poi A seguendo il nucleo visibile; a 1,5 m il prompt locale conferma che posso raccoglierlo. E riuscito.
- Seguendo «Albero» ho usato D, poi S quando la freccia indicava che dovevo tornare verso il punto di restituzione. Il prompt locale compare a 1,1 m. La restituzione richiede vari tentativi descritti sotto, ma riesce.
- Nel finale ho usato soltanto **wait 2000, wait 2500, wait 3000**, non «Salta finale». Poi «Nuova avventura» per verificarne l'esito visibile.

## Cono, mira e risultati

Il cono è visibile come una grande zona molto chiara con bordi scuri, più il testo «Raggio in carica». Il contrasto del riempimento sulla neve è tenue; i bordi e il testo sono gli indizi più efficaci. Ho potuto evitare tutti i danni tranne una tacca. Non assegno un problema di bilanciamento da questa prova a passi.

La mira è permissiva: in 005 il nucleo è nettamente a sinistra del +, ma è indicato come MIRATO e il clic a centro schermo riesce. Ho seguito **MIRATO** più che l'allineamento geometrico esatto. Questo consente di giocare, ma «porta il nucleo al+» descrive una precisione maggiore di quella apparentemente necessaria. Il feedback «scudo del generale» rispetto a «nucleo vulnerabile» distingue bene i due stati.

In 014 mi viene chiesto di riallineare il generale anche se è già ben visibile quasi al centro. Il piccolo trascinamento risolve: un'indicazione tipo «centra meglio il generale con il destro» sarebbe più precisa di «davanti alla camera». Nessuno stallo persistente.

## Attriti concreti, non MAJOR confermati

### E sull'albero non risponde ai primi tentativi

A 1,1 m il prompt dice «E · Restituisci all’albero» (024). E 1 ms (025), E 100 ms (026), attesa 900 ms (027), un piccolo W (028) ed E 500 ms a 1,2 m (029) **non cambiano l'obiettivo né danno una nuova ragione visibile**. Il nucleo rimane accanto a Babbo Natale. Mi sono spostato fuori portata con A, poi rientrato con D a 1,7 m; E 1000 ms (032) avvia finalmente il finale.

È un attrito importante e riproducibile come sequenza osservata, ma **non ne determino la causa**: angolo/posizione, input del gioco o interazione con pausa automatica del driver. Non affermo che E vada tenuto premuto per un secondo: nella stessa prova la raccolta del nucleo con E 1 ms era riuscita. Da isolare con controllo umano locale; non bloccante in questa sessione perché recuperato con un riposizionamento ragionevole.

### Camera estremamente vicina vicino all'albero

In 023, durante il ritorno, la testa di Babbo Natale, il nucleo e il tronco riempiono quasi tutto lo schermo. La freccia/distanza resta leggibile; S mi porta al prompt utile in un'azione. Problema visivo recuperabile, senza danni perché il combattimento è finito.

### Avviso distanza vecchio

Dopo E lontano, l'avviso inferiore continua a dire 9,6 m anche quando l'HUD superiore segna 5,0 m (020). Il prompt si aggiorna quando entro in portata. Non blocca il percorso ma crea due valori concorrenti.

## Finale: cosa ho realmente visto

- Squamakk resta **impacchettato**, sollevato sulla nave: la gag della cattura è comprensibile; battuta «Non ho nemmeno scritto la letterina!».
- Dopo la restituzione la camera mostra il generale da vicino, con **sciarpa rossa** sul pacco. Testo di Babbo Natale: «Anche per te, Squamakk. Niente invasioni fino al prossimo Natale.» Ho capito che riceve comunque un regalo, non che viene distrutto.
- L'inquadratura poi si allarga sulla piazza, con nave/portale sopra e albero a destra. In seguito **nave e portale non sono più visibili**, il nucleo è visibile sull'albero e la slitta è più lontana.
- Conferme testuali finali inequivocabili: «Mondo salvato. Natale consegnato.», «Portale chiuso · le consegne possono cominciare» e Briciola che annuncia Terra salva e consegne ancora da fare.
- Aspettando ancora, «Salta finale» viene sostituito da **«Nuova avventura»**. Non ho scambiato la sconfitta del boss per questo momento conclusivo.
- HUD di salute, schivata, percorso e comandi continua a occupare parti dell'inquadratura durante il finale; sottrae pulizia alla scena ma non impedisce di capire l'esito.
- Dopo il clic su «Nuova avventura» ho visto l'introduzione del cortile: **«Il nucleo è stato rubato», 0/3, salute piena, «Salta introduzione»**. Esito del bottone verificato, non soltanto presenza del bottone.

## Immagini decisive

Tutti i riferimenti sono della sessione M3, senza alterazioni:

- `captures/playtest-m3-stepped/001.png` — titolo, scelta esplicita prova M3.
- `captures/playtest-m3-stepped/002.png` — istruzioni iniziali e requisito restituzione all'albero.
- `captures/playtest-m3-stepped/003.png` — cono e raggio in carica.
- `captures/playtest-m3-stepped/005.png` — finestra esposta, portata e MIRATO fuori dal + esatto.
- `captures/playtest-m3-stepped/007.png` — primo colpo riuscito e nuova serie.
- `captures/playtest-m3-stepped/008.png` — unica perdita di salute, seconda carica.
- `captures/playtest-m3-stepped/014.png` — richiesta di riallineamento con generale visibile.
- `captures/playtest-m3-stepped/018.png` — 3/3, generale impacchettato, obiettivo nucleo libero.
- `captures/playtest-m3-stepped/020.png` — nucleo visibile e messaggio distanza vecchio.
- `captures/playtest-m3-stepped/022.png` — nucleo raccolto, obiettivo albero e generale sulla nave.
- `captures/playtest-m3-stepped/023.png` — camera molto ravvicinata presso il tronco.
- `captures/playtest-m3-stepped/026.png` — prompt restituzione, nucleo ancora trasportato dopo tentativi E.
- `captures/playtest-m3-stepped/032.png` — restituzione riuscita e primo piano del generale con sciarpa.
- `captures/playtest-m3-stepped/033.png` — finale guardato, inquadratura allargata con nave/portale.
- `captures/playtest-m3-stepped/034.png` — portale non più visibile, Terra salva, nucleo sull'albero.
- `captures/playtest-m3-stepped/035.png` — conclusione stabile e «Nuova avventura».
- `captures/playtest-m3-stepped/036.png` — esito reale di «Nuova avventura», ritorno all'introduzione M1.

## Conclusione

Boss e catena **sconfiggi → raccogli → restituisci → finale** completati attraverso la sola UI. Le finestre e il conteggio dei risultati sono chiari, gli obiettivi dopo il boss non si perdono. Finale guardabile e comprensibile anche muto. Priorità di verifica: i tentativi E senza risposta sull'albero; poi camera presso il tronco, avvisi distanza obsoleti e formulazione dell'aggancio/riallineamento. Nessun MAJOR bloccante dimostrato, nessun test di retry perché non sono morto.
