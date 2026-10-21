# Playtest a occhi nuovi — TmJx2Hx1

## Esito
**PASS completabilità:** Nuova partita → tre ancoraggi → Squamakk 3/3 → recupero nucleo → restituzione all’albero → finale non saltato → Nuova avventura riporta all’introduzione, salute piena e 0/3. Nessun blocco. **0 morti, 0 retry.** Browser di questo test chiuso tramite bridge.

Accesso esclusivamente alle azioni UI del bridge5190; nessuna lettura di sorgenti, documenti, LC o stato nascosto. Avvio senza Continua, anteprime o selezione capitoli. 85 richieste prima della chiusura (incluse catture e attese).

## Percorso e comprensione
- Letta l’introduzione, provati regalo sul drone e schivata. Eliminati i sei difensori, raggiunto il primo dispositivo e premuto E.
- Entrato nella via dal cancello. Scelta prima Officina dei trenini, aggirato il trenino, spento il dispositivo; poi Giostra, eliminati i difensori e spento il terzo ancoraggio.
- Raggiunto il cancello della piazza; avvicinamento al generale, regali durante le esposizioni. Prima finestra mancata perché fuori portata; nessuna perdita di progresso. Tre colpi riusciti, conclusione con una tacca di salute.
- Recuperato il nucleo con E e restituito all’albero con E. Atteso il finale senza usare Invio o Salta finale.
- Dalla UI: Squamakk ruba il nucleo natalizio per invadere la Terra; Briciola guida la liberazione degli elfi e lo spegnimento dello scudo. Il nucleo torna all’albero, il portale si chiude, Terra salva ma consegne ancora da fare. Babbo offre un regalo anche al generale.

## Chiarezza e attriti osservati
- Obiettivi persistenti e messaggi di E fuori portata sufficienti a completare tutto senza suggerimenti esterni. H usato una volta dopo il terzo ancoraggio per chiarire il cancello.
- Diversi tentativi E appena oltre soglia (2,3–2,9m): risposta esplicita e recuperabile. La freccia ↑ è una direzione ampia, non un allineamento preciso: ho dovuto correggere lateralmente presso dispositivi, cancelli e albero.
- Trenino realmente d’intralcio all’avanzamento; «aggira il riparo» ha spiegato perché non arrivavo al dispositivo. Prove036–039.
- Combattimento comprensibile tramite aggancio, tacche e conferme dei colpi. Nel cortile una coppia di nemici sparisce con lo stesso lancio: contatore scende 5→3 e poi 3→1; letto come effetto multiplo, non blocco.
- Schivata del generale meno immediata: movimento laterale e Spazio non mi hanno evitato molti danni; completato comunque al primo tentativo. Non approvo bilanciamento o difficoltà continua con questo setup.
- Talvolta screenshot e testo restituito dal bridge rappresentano istanti diversi: per esempio034 mostra ancora un tiratore mentre il testo annuncia Officina libera;071 mostra ancora 1/3 mentre il testo dice2/3. Limite della prova, non attribuito automaticamente al gioco.

## Prove
Tutti i percorsi seguenti sono sotto `captures/playtest-polish-stepped/`; registro automatico `ui-actions.json`.
- `002.png`: Nuova partita e introduzione.
- `021.png`: primo ancoraggio e invito alla via.
- `025.png`: scelta delle due arene.
- `036.png`: trenino/riparo e spiegazione di interazione.
- `043.png`, `055.png`: secondo e terzo ancoraggio (testi bridge).
- `063.png`: piazza, istruzioni e condizione di vittoria.
- `065.png`: nucleo esposto ma fuori portata.
- `074.png`: generale sconfitto, nucleo libero.
- `077.png`: nucleo recuperato.
- `082.png`: restituzione e avvio presentazione finale.
- `083.png`: vista finale con testo «Una sciarpa per il generale» e battuta del regalo. **Il dettaglio visivo della sciarpa non è distinguibile con certezza nella cattura ampia**: non dichiaro verificata l’animazione/dettaglio della sciarpa. Il passaggio testuale è stato realmente visto, non saltato.
- `084.png`: schermata finale realmente vista, portale e nave assenti, «Mondo salvato. Natale consegnato.», Nuova avventura.
- `085.png`: Nuova avventura realmente premuta, ritorno all’inizio con0/3.

## Limiti
Audio muto: nessuna approvazione di mix o ascolto. Pause ESC automatiche fra azioni; ragionamento fuori dal tempo attivo. Attese finali UI di3s+3s, nessun salto intenzionale. Circa27min di tempo wall fino al riavvio, incluse latenza, lettura e pause: **non è una misura della durata umana o del tempo attivo**. Completezza narrativa e progressione verificate; dettaglio grafico della sciarpa non verificabile dalle catture osservate.
