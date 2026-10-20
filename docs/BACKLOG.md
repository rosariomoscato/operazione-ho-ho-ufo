# Operazione Ho Ho UFO — Backlog

Raccogliere qui feedback, parole dell'utente, causa, soluzione e verifica. Nessun playtest ancora eseguito.

| ID | Fonte | Nota | Causa | Soluzione | Stato |
|---|---|---|---|---|---|
| M1-R1 | Review combinata | Il primo alieno impacchettato è coperto da Babbo | Occlusione dalla spalla e assenza di conferma spedizione | Materiali clonati di Babbo temporaneamente traslucidi solo all'occlusione, muso/zampe nel pacco, etichetta e freccia verso nave | Risolto: reviewer SHIP/LANDS, PNG live e preset 1280/1920 |
| M1-R2 | Review combinata | Tutorial schivata statico | Segnale sempre attivo/inseguimento continuo | Ciclo innocuo 2.8s, lock dopo .2s, segnale 1.2s; schivata già fatta accettata | Risolto: codice e review; nessun timing obbligatorio |
| M1-R3 | Review combinata | ID delle battute non collegati al runtime | Stringhe dirette e registro incompleto | `src/texts.ts`, `sayLine`, log ID e nuove etichette in SCRIPT | Risolto: review ON TRACK |
| M1-M1 | Review combinata | Cattura live della freccia spedizione tarda | Screenshot dopo la finestra breve del teletrasporto | Il preset mostra freccia e pacco; la PNG live della sola spedizione resta tarda | MINOR documentato: nessun difetto gameplay confermato |
| M1-F1 | Fresh-eyes | «Ho provato a cliccare direttamente sul drone» | Relazione fra mouse, camera e reticolo poco esplicita | Istruzione tira al+ non al mouse, marker MIRATO e ring sul bersaglio | Risolto: retest completato, nessun tentativo a vuoto nel tutorial |
| M1-F2 | Fresh-eyes | «Nemico dietro/a sinistra, cerchio del regalo davanti» | Nessun richiamo alla direzione del nemico vicino fuori fronte | Avviso con lato/dietro e comando gira/mira; istruzioni permanenti | Risolto: retest ha verificato volontariamente l'avviso e riallineamento |
| M1-F3 | Retest | MIRATO e tacche di un altro nemico si sovrappongono | Marker vicini in proiezione | Valutare impilamento/spaziatura delle etichette | Aperto (MINOR), corpi e tiro leggibili |
| M1-F4 | Retest | Nemici molto vicini parzialmente dietro ai pannelli inferiori | Testi e dialoghi occupano fascia inferiore ampia | Valutare UI compatta dopo feedback dell'utente | Aperto (MINOR), avviso superiore resta leggibile |
| M1-F5 | Fresh-eyes | Cura non identificata subito e freccia interpretata come mira | Oggetto senza etichetta, navigazione poco distinta | Etichetta Cura+2, prefisso Percorso, singolare1difensore | Risolto nel retest; raccolta verificata separatamente in test melee |

Stati: aperto, in corso, risolto (con verifica), non risolto (motivazione approvata).

## Lezioni promosse a regole

- Verificare la meccanica distintiva nella normale vista di gioco: un close-up non dimostra che il protagonista non copra il risultato.
- Spiegare se il clic spara al reticolo o al puntatore: non presumere che i giocatori conoscano il modello di mira. Evidenziare aggancio e minacce laterali.
