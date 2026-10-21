# M2 — prima prova a occhi nuovi, solo UI

## Esito e limiti

**Completato: no.** Nessun nuovo ancoraggio attivato; HUD sempre 1/3. Interrotto per stallo della prova con controllo remoto molto lento, non per un blocco di progressione dimostrato del gioco. Nessun MAJOR del gioco sufficientemente isolato da confermare.

Ho utilizzato esclusivamente i comandi UI del client, testo visibile e PNG; non ho letto codice, documentazione o stato interno. Audio muto: nessuna valutazione sonora. Browser chiuso con `close`.

Tempo reale del driver alla chiusura: **938,168 s (15 min 38 s)** dall'avvio del suo conteggio; primo snapshot a 18,725 s, quindi circa **15 min 19 s di questa osservazione**. Non è durata equivalente di una partita umana continua. 25 chiamate client, comprese snapshot e chiusura. Tra alcune azioni sono trascorsi decine di secondi, talvolta oltre un minuto. Questi intervalli contaminano fortemente la valutazione della difficoltà.

## Prima impressione e comprensione

- Titolo leggibile, tono natalizio/comico immediato. Ho scelto esplicitamente **«Prova la via dei giocattoli»**, non Nuova partita o Continua.
- Ho capito dal gioco: due destinazioni alternative, Officina e Giostra; eliminare i difensori, poi premere E sul dispositivo. Regali infiniti, due colpi per nemico. L'indicazione che la prova non sostituisce il salvataggio rassicura.
- Distanze, conteggio difensori e comandi sono persistenti. La scelta tra due lati è chiara; all'inizio entrambe le frecce puntano in avanti, mentre muovendomi a sinistra Giostra diventa una freccia verso destra.
- Molte righe grandi occupano la parte bassa dello schermo. Restano leggibili, ma prima impressione piuttosto affollata, soprattutto con battuta e avviso della prova contemporanei. Non ho dimostrato un'occlusione bloccante.

## Controlli, mira e combattimento

- W mi avvicina; A mi porta verso l'Officina. Il trenino si riconosce visivamente come ostacolo e il gioco invita ad aggirarlo, non a spararci attraverso.
- «MIRATO 2/2», HUD del bersaglio e «Colpito · 1 tacca rimasta» rendono chiaro un primo tiro riuscito. Nella schermata 005 il nemico indicato è molto a destra del + centrale: il colpo a centro schermo lo colpisce comunque. Da giocatore non ho ancora capito quanto sia necessario allineare esattamente il +; utile un'indicazione più esplicita dell'aggancio, se questa è la regola prevista. Non ne deduco l'implementazione.
- Le istruzioni spiegano schivata, linea di tiro, riparo e interruzione della carica. Ho visto anche gli avvisi «Colpo in volo» e direzione del pericolo. Non sono riuscito a reagire in tempo con la latenza di questo canale.
- Ho tentato un percorso a sinistra e un aggiramento del trenino; sono morto prima di poter verificare se il percorso fosse efficace. Ho tentato Spazio, ma la schermata successiva era già un nuovo checkpoint a salute piena: non posso attestare una schivata riuscita.
- Nessuna interazione E o aiuto H verificata, nessun dispositivo raggiunto. Nessun giudizio sul combattimento completato o sulla seconda arena.

## Morti, ripartenze e anomalie da non sovrainterpretare

- **Due morti direttamente osservate**, schermate 015 e 019, entrambe con «Consegna rimandata!». Due retry espliciti tramite «Ricomincia checkpoint» (016 e 020), con ripristino salute e 3 difensori per lato.
- Tre ingressi espliciti nella prova dal titolo (002, 008, 012).
- In due occasioni il comando successivo a un primo tiro riuscito ha restituito il titolo (006→007 e 010→011). Non ho visto la transizione intermedia. Tra i comandi passavano rispettivamente circa 41 e 25 secondi: potrebbe essere intervenuta una morte e il clic aver raggiunto un pulsante del menu. **Non lo classifico come bug “sparare torna al titolo”.**
- Dopo 021, Spazio restituisce in 022 il checkpoint appena ripartito. Anche questo può essere un input arrivato dopo una morte; non conto una terza morte come confermata visivamente.
- Si perde salute rapidamente mentre il client non riceve nuovi input; la prova remota non consente di distinguere difficoltà eccessiva da semplice inattività. Serve una riprova umana in tempo reale, non un nerf dedotto da questa sessione.

## Pausa

Ho usato Esc per poter leggere/decidere senza subire danni dovuti allo strumento (003 e 023). Menù chiaro: Riprendi, Ricomincia checkpoint, Titolo. Tra 023 e 024, distanti circa 15,7 s reali, salute a tre tacche e distanze rimangono invariate: pausa verificata su questo intervallo. Non ho mantenuto sistematicamente la pausa tra ogni azione, e questo ha compromesso i tentativi di combattimento.

## Immagini decisive

- `captures/playtest-m2/001.png` — titolo e scelta esplicita disponibile.
- `captures/playtest-m2/002.png` — ingresso M2, obiettivi e istruzioni iniziali; affollamento delle righe inferiori.
- `captures/playtest-m2/005.png` — bersaglio MIRATO a destra rispetto al + centrale.
- `captures/playtest-m2/006.png` — primo colpo riuscito, nemico a 1/2.
- `captures/playtest-m2/007.png` — ritorno al titolo osservato, causa non determinata.
- `captures/playtest-m2/014.png` — avvicinamento all'Officina e trenino davanti al personaggio.
- `captures/playtest-m2/015.png` e `captures/playtest-m2/019.png` — due sconfitte direttamente restituite dal driver.
- `captures/playtest-m2/023.png` e `captures/playtest-m2/024.png` — pausa con salute e distanze stabili.

## Raccomandazione

Non considerare questa sessione un'approvazione del segmento né una prova di MAJOR di gameplay. La consegna iniziale si comprende; la capacità di completarla resta **non verificata**. Ripetere con input a bassa latenza o un giocatore locale; chiarire percettivamente il rapporto fra + e nemico indicato come MIRATO è il principale punto di comprensione emerso.
