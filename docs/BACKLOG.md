# Operazione Ho Ho UFO — Backlog

Raccogliere qui feedback, parole dell'utente, causa, soluzione e verifica. M1/M2/avventura completa approvati; rifinitura passo9 in verifica. Gli stati nelle sezioni storiche sotto sono aggiornati dal riepilogo passo9 finale, senza alterare le copie conservate.

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

## Verifiche M3 in costruzione

| ID | Fonte | Nota | Causa | Soluzione | Stato |
|---|---|---|---|---|---|
| M3-S1 | Test save3 | Versione stringa «3» accettata produce ending con boss0 e nucleo non restituito | Coercizione `Number(version)` al primo filtro, poi confronto stretto nel ramo flag | Accettare solo versioni numeriche2/3; invalidi rifiutati senza nuova partita automatica | Risolto dal builder: rerun `square-storage.test.mjs`5/5PASS |
| M3-V1 | Review visuale parziale | Slitta/renne leggibili meglio di lato che all'ingresso | Composizione frontale, non asset rotto | Raccordare ripresa partenza con renne/pattini visibili | MINOR / verifica integrazione |
| M3-V2 | Review visuale parziale | Appoggi pacco/sciarpa e nucleo nella sede da verificare sul core reale | Scena isolata non contiene quegli oggetti per ownership corretta | Misurare fondo pacco→supporto e sciarpa, allineare nucleo a sede locale(0,1.5,.825) dell'albero | Verificato: appoggi entro1mm,9fixture e31frame finali PASS; asset sciarpa realmente visibile |
| M3-I1 | Prima build BFh1iWzC | Render/selfTest numerici PASS, ma preset vulnerable mostra scudo; ending non ritira nave/portale né mostra pacco/sciarpa | Integrazione pose/seed/stato ancora incompleta durante lavoro builder | Completare bridge Game↔BossChapter e verificare immagini, fasi effettive e finale | Risolto:31frame semantici D86qgQyq PASS e immagini guardate; sciarpa/ritiro reali |
| M3-I2 | Full bot BFh1iWzC | Nuova partita→M1→M2→piazza riuscito, poi manca LC.state().boss per la verifica | API debug finale ancora non esportata nella build intermedia | Esporre fase/segmenti/flag reali, poi rieseguire senza seed o salti | Risolto: fullbot Nuova partita→fine D86qgQyq PASS20lanci1retry,nessun seed/goto/danno iniettato |
| M3-I3 | Test frame/input + fresh-eyes | Primo clic/E dopo ripresa può essere ignorato | Primo RAF con lastFrame0 produce dt0, salta update ma cancella gli input con endFrame | Preservare coda nel frame0 fino al primo update reale, senza cambiare tempi boss | Risolto:9/9controlli PASS inclusi click/E e pausaEsc; causa esatta dell'E esitante nel vecchio fresh-eyes non attribuita retroattivamente |
| M3-F1 | Fresh-eyes | Camera molto vicina presso tronco, Santa in parte sotto chioma nel quadro finale | Collisione camera/chioma e composizione | Rifinire pivot/inquadratura nel passo9, senza cambiare collider o obiettivo | MINOR aperto, recuperabile senza danno o stallo |
| M3-F2 | Fresh-eyes | Messaggio fuori portata mantiene distanza vecchia finché si entra nel raggio | Feedback temporaneo dopo E | Aggiornare il valore o abbreviarlo durante movimento | MINOR aperto; il prompt si sblocca in portata |
| M3-F3 | Fresh-eyes | MIRATO permissivo e «riallinea davanti» poco preciso | Assistenza e soglia di acquisizione rispetto alla proiezione camera | Chiarire aggancio e «centra meglio con il destro» in rifinitura | MINOR aperto, completato0morti/5HP |

## Verifica rifinitura — TmJx2Hx1

| Riferimenti | Esito sorgente rifinito | Prova / limite |
|---|---|---|
| M1-F3/F4 | Etichette impilate fuori dai volumi facciali, pannelli inferiori compattati senza ridurre font | Catture1080/M2 e audit PASS; non garantisce ogni possibile incrocio di6NPC |
| M2-C1 | Bocca reale/cue/bolt raccordati, sweep root→mouth conserva ripari/player | `step-09/controls/muzzle.json`3/3; timing invariato |
| M2-F1, M3-F1 camera gameplay | Risolto boom dentro testa: volumi3D e trasparenza locale clone-only |864pose main/288viste, clearance≥.28m;2712pose builder/FOV45/53/75;nessuna geometria/collider spostata |
| M3-F1 quadro finale | MINOR residuo: Santa vicino all'albero ancora in parte sotto chioma nella ripresa ampia | Freshfull083/084; payoff testuale leggibile e finale completato. Non dichiarato risolto dalla camera gameplay |
| M2-F2, M3-F2 | Feedback range live con coordinate/condizione strutturate, pronto locale preferito nei pareggi limitati | Prove builder e freshfull: E fuori2.2m spiegato, riposizionamento/E riuscito |
| M2-F3, M3-F3 | AGGANCIATO·assistenza distinto da MIRATO·tiro al+; OFF non devia la traiettoria | UI7/7, catture ON/OFF e nuovo fullfresh completato senza coaching |
| POLISH-UI1/2 | Focus rimappatura preservato; sensibilità×/FOVgameplay° mostrati e aggiornati | Main browser7/7 inclusi focus dopo successo/rifiuto/annullo e valori live |
| POLISH-T1 | Fullbot finale PASS:25lanci2morti,Nuova partita→tutti atti→finale; precedenti problemi del driver corretti | Report falliti preservati in step-09/pre-integration; gift clicca angolo canvas fuori dai pulsanti e bot affronta minacceM2 prima di avanzare. Nessun cambio gioco/difficoltà, limite retry12 invariato;279.762swall non tempo umano |
| POLISH-F1 | FreshfullPASS: tutti gli atti da Nuova partita, finale non saltato,0morti/retry,riavvio verificato |85richiesteUI, pausaEsc fraazioni/audio muto; non misura difficoltà continua/durataumana. Sciarpa letta ma dettaglio visivo non distinto dal tester; screenshot controllato1.5 lo mostra |

M2-T2 storico non attribuito retroattivamente a una causa: nel bot passo9 è invece misurato un distinto clickTitle dopo morte, corretto nel driver. Nessuna regressione di progressione osservata nel freshfull. Review/freeze finale ancora da chiudere.
