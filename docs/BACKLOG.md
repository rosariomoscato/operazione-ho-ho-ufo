# Operazione Ho Ho UFO — Backlog

Raccogliere qui feedback, parole dell'utente, causa, soluzione e verifica. M1 approvato; M2 in verifica prima del playtest utente.

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

## Verifiche M2 in corso

| ID | Fonte | Nota | Causa | Soluzione | Stato |
|---|---|---|---|---|---|
| M2-T1 | Capture suite | `street-start` non deterministico, nonostante selfTest e budget PASS; altri sei preset PASS |4pixel nell'ombra sfocata CSS, DOM/stato identici | Rimossa box-shadow, nessun allentamento del confronto | Risolto: candidata MP92z05e,4frame player/diorama deterministici PASS |
| M2-T2 | Bot integrazione | Prima prova supera Officina e relativi retry/Continua, poi ritorna al cortile training durante Giostra | Non identificata; possibile input/focus, da non confondere con HMR (build statica) | Tracciare cambi capitolo e input, riprodurre prima di correggere | Aperto, progressione M2 non ancora approvata |
| M2-T3 | Bot integrazione | Seconda prova muore durante il primo incontro (due lanci), senza riprodurre T2 | Contesa ambiente e possibile morte durante i tempi di decisione; non prova difficoltà impossibile | Guardia HP/playing dopo mira, riprova su candidata con minore contesa | Rerun PASS entrambi ordini,13/12lanci,zeroerrori; fresh-eyes distinto ancora necessario |
| M2-T4 | Bot aiuti | H, pausa e scala15/30/45s PASS; camminata finale troppo breve per attivare arena | Il test usava tempo reale mentre la simulazione rallentava nel software renderer | Test aggiornato: attendere coordinate/attivazione con input reale | Risolto: rerun PASS, ingresso reale azzera la scala;0errori |
| M2-V1 | Review visuale | Icone lontane e distinzione ranged dietro cover da verificare con HUD | Limiti della vista isolata, non MAJOR confermati | Marker nominati e telegraph da osservare nella build integrata | MINOR / verifica finale |
| M2-C1 | Review statica | Origine colpo/cue arretrata rispetto alla bocca del cannone | Offset gameplay .52m, arma visiva circa1.045m | Allineare in rifinitura conservando sweep root→muzzle contro cover; non cambiare timing | MINOR aperto, nessuna illeggibilità bloccante provata |
| M2-C2 | Review statica | Obiettivo principale senza verbo operativo, «1 difensori» | Titolo/contatore al posto dell'azione; plurale fisso | Obiettivo «Libera un lato, poi E»/«Spegni l'ancoraggio pronto» e singolare locale | Risolto, build DpZTJjdp e audit UI1080 PASS |
| M2-C3 | Review statica | Scheda ranged ritorna anche dopo neutralizzazioni già salvate | Flag azzerato al restore | Derivare apprendimento dai difensori ranged già neutralizzati o arena liberata; nessun nuovo campo save | Risolto: entrambi ordini finali dopo retry/Continua e audit checkpoint con2rangedneutralizzati PASS |
| M2-F1 | Retest UI-only | Camera ostruita vicino a edificio/riparo destro | Compressione camera in un corridoio stretto, protagonista vicino | Migliorare collisione/trasparenza in rifinitura; episodio recuperato muovendosi lateralmente | MINOR aperto, PNG019; retest completato senza morti |
| M2-F2 | Retest UI-only | Distanza E vecchia resta dopo essere entrati in portata | Feedback temporaneo prevale sul prompt locale per2.7s | Aggiornare/cancellare il messaggio di fuori portata quando cambia la condizione | MINOR aperto, E funziona subito; PNG045/046 |
| M2-F3 | Retest UI-only | MIRATO lontano dal +, alcuni clic senza esito | Aggancio permissivo; eventuale latenza/pausa del driver non isolata | Spiegare aggancio assistito; riprodurre input locale prima di attribuire bug | MINOR / da isolare, nessun MAJOR confermato |

## Lezioni promosse a regole

- Verificare la meccanica distintiva nella normale vista di gioco: un close-up non dimostra che il protagonista non copra il risultato.
- Spiegare se il clic spara al reticolo o al puntatore: non presumere che i giocatori conoscano il modello di mira. Evidenziare aggancio e minacce laterali.
