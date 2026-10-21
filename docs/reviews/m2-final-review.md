# M2 — review combinata finale delle evidenze

2026-10-21. Scritto **solo questo report**; nessun browser, agente, commit, pubblicazione o modifica a sorgenti/build. Review di file reali e immagini, non nuovo playthrough del reviewer.

## Verdetti

| Prospettiva | Esito |
|---|---|
| Critico | **SHIP condizionato** ai due riscontri finali sulla build DpZTJjdp elencati sotto. Nessun BLOCKER/MAJOR attuale sostanziato. |
| Azione/comicità | **LANDS nell'ambito dimostrato**: due arene distinguibili, tiro annunciato, cover/schivata misurati, risultato delle azioni leggibile. Non equivale a bilanciamento umano continuo verificato. |
| Narrativa | **ON TRACK**: scelta libera, due spegnimenti locali da1/3 a3/3, nave verso la piazza, nucleo ancora da recuperare; niente vittoria globale o M3 giocabile. |

Le prove nuove superano il precedente solo «code pass provvisorio». I MINOR residui non motivano un nuovo MAJOR né una ricostruzione dell'atto. **Restano soltanto audit UI mirato e test finali del sorgente aggiornato da acquisire**, senza attribuire loro PASS prima del risultato.

## 1. Prove lette: esiti e limiti

### Due ordini e regressione M1 — input reali

Letto `docs/evidence/step-08/integration/report.json`, inclusi esiti dei due run, log e stati finali; osservate direttamente `workshop-complete.png` e `carousel-complete.png` nella stessa cartella.

- **PASS**, errors vuoto: Officina→Giostra **13 lanci**, Giostra→Officina **12 lanci**, entrambi `street-complete`, contatore3,6HP finali.
- Entrambi verificano clear→retry→reload/Continua **prima di E**, spegnimento→retry/Continua **dopo E**, nessun doppio conteggio e interazione da lontano non efficace. Sono test informati con seed del solo ingresso M2, **non fresh-eyes**.
- Walltime36,633s /40,034s è durata del bot con restore, non durata umana dell'atto.
- `docs/evidence/step-08/m1-regression/integration.json`: **PASS**,9lanci, A/B/C conservati, M1 a1/3 e **cammino reale al cancello+E** che entra in M2 con sei difensori e1/3; storage negato non fatale. I circa22,9s di combattimento non sono una misura del primo giocatore.

Il ritorno inatteso al cortile del vecchio tentativo **non si riproduce nei due completamenti documentati**. Non viene inventata una causa retroattiva: non è provato che fosse save corrotto, HMR o un reset automatico dell'AI. Le due prove corrette chiudono il gate di completamento precedentemente mancante; conservare la traccia se l'incidente riappare.

### Catture, contatti e audit — MP92z05e

Letti `captures/street/summary.json` e, programmaticamente, tutti i nove report individuali; **32fotogrammi**, report PASS, deterministic=true, errors vuoto. Il precedente FAIL4pixel non è stato nascosto: il rerun completo dopo CSSfix ora passa.

- Massimo campionato **107draw call /86.070triangoli**, entro150/150k. Non è una certificazione del picco in ogni possibile sovrapposizione VFX né dei60fps su laptop.
- Sei contatti mani shooter misurati nei preset che contengono tre shooter vivi; nessun falso contatto inventato nei preset senza shooter. Piedi/collisioni/invarianti e budget PASS tramite selfTest.
- Audit1080: palette conforme, contrasto minimo circa10,01:1, cap-height minima25px, screening lampi PASS. Software PASS per correttezza di rendering/test; probe circa3,18fps **non rappresenta la fluidità hardware del gameplay**.
- Osservate direttamente la PNG nativa `captures/street/audit-default/00-player-0.png` e la contact sheet `street-complete/_contact-sheet.png`: shooter distinguibili, ripari visibili, spunte indipendenti, nave che scende e portale ancora presente. Questi sono frame deterministici, non un video live del telegraph.

### Aiuti — report reale

`docs/evidence/step-08/guidance/report.json`: **PASS**, H immediato, pausa congela clock/stage, soglie15.01/30.01/45.01s, ingresso effettivo in arena azzera scala, errors vuoto. Non si richiede di attendere un aiuto per progredire.

### Combattimento controllato — report presente, non ipotetico

`docs/evidence/step-08/combat/report.json` **esiste ed è PASS**: letti tutti i sette casi e le condizioni del fixture. Il test usa il vero Game.update/sistema, non un playthrough: RAF fermo, posizioni/HP/arene iniziali predisposti e NPC irrilevanti esclusi; formule, metodi e ostacoli non sostituiti. Non è una prova UI-only e non va presentato come tale.

1. Ranged: wind-up1.2s, direzione bloccata per1s,94campioni di lock; recovery circa1.21s. **Max committed1** anche con bolt vivo; variante melee-first impedisce il contemporaneo ranged. Acquisizione fuori schermo respinta.
2. Cover reale: sweep con stress-delta2s termina sul trenino a z=-2.18, **6HP**, nessun tunneling fino al corpo dietro.
3. Linea coperta non acquisita; variante libera dà **un solo danno** e consuma il bolt.
4. Vera `Game.dodge` durante arrivo: `hit-avoided`,6HP, bolt consumato. Non si deduce la protezione dal solo screenshot di una schivata.
5. Cura reale3→5, cap5→6, pickup non consumato a piena salute; flag healed conservato e cura non farmabile dopo retry/Continua. Le HP3 nei sottofixture retry/continue sono condizioni controllate della prova, non una modifica alla regola di ripristino6HP.
6. Nodo nave misurato8/5.5/3 sia a seek sia dopo E; restore completato già a quota3 e contatore3.
7. E protetto/lontano spiega ragione, ciascun ancoraggio locale funziona con gli altri tre difensori ancora vivi; doppia attivazione non incrementa.

**Verifica aggiuntiva del reviewer:** SHA256 attuali dei sei file indicati dal report (`game.ts`, ranged, math, storage, livello, contratti) coincidono tutti con `sourceHashes`, che coincidono a loro volta con `sourceHashesAfter`. Questa prova controllata è quindi pertinente anche al sorgente attuale letto, non soltanto a un vecchio stato non identificabile. Non è necessario lasciare un gate combattimento condizionale per un report assente: il report è presente e verificato.

## 2. Retest UI-only: fotogrammi live osservati

Letto integralmente `docs/reviews/m2-fresh-eyes-retest.md`. Osservate direttamente almeno le PNG decisive **005,019,023,047**, più028,030,046 in `captures/playtest-m2-stepped/`.

**Esito documentato:** Giostra→Officina completato a3/3, **zero morti, zero retry,3HP finali**, attraverso sola UI senza coordinate interne/docs/LC. Il giocatore conosce già i comandi dalla prima prova interrotta dalla latenza: **è un retest, non un nuovo primo impatto blind**.

Il client usa vere pause/riprese tramite il driver fra azioni; il report precisa che il playtester **non ha premuto personalmente Esc** a ogni passo. Questo lascia decidere senza subire danni durante il ragionamento remoto. Dimostra completabilità UI a passi, **non equilibrio per umano in tempo reale**. I365,833s wallclock del driver non sono durata gameplay continua; audio muto, mix non valutato.

### Cosa vedo nelle immagini, distinto dalle asserzioni del codice

- **005:** due destinazioni nominate, sei difensori e MIRATO sul nemico a destra del+. Aggancio assistito molto permissivo ma marcato nella scena; comandi e tutorial presenti. La fascia inferiore è ampia, senza impedire la scelta del lato in questo campione.
- **019:** occlusione reale e marcata presso edificio/riparo destro: tetto, parete e testa riempiono quasi tutta la vista. **È un difetto visuale**, non qualcosa smentito dai test collisioni. Il retest documenta recupero con movimento laterale e prosecuzione senza danni/stallo: classificazione MINOR confermata per questo episodio, non dichiarazione che la camera sia perfetta.
- **023:** Giostra con spunta/spento,2/3 e Officina ancora con tre difensori; battuta Squamakk nel punto corretto. Progresso locale e ordine libero visivamente sostenuti.
- **028/030:** avviso laterale, posa/corridoio del tiro e poi «Colpo in volo»; schivata/cooldown e fronte ritrovato. La sequenza di fotogrammi live sostiene la leggibilità operativa degli scontri. Non misura da sola1.2s di telegraph o gli fps: quei tempi sono corroborati dal report controllato.
- **046:** obiettivo a0,9m ma feedback precedente ancora a2,3m: messaggio temporaneamente stantio **confermato**, non interazione rotta. **047** subito dopo mostra entrambi spenti,3/3 e fine secondo segmento,3HP. La battuta lascia il nucleo da recuperare, nessun boss/finale globale.

I clic talvolta senza tiro restano osservazione da isolare fra driver/pausa e gioco; non c'è una prova di un tasto definitivamente perso o di soft-lock. Non attribuire MAJOR all'input senza riproduzione controllata. La prima prova non completata per latenza non diventa retroattivamente un PASS: è il retest a fornire il completamento UI.

## 3. Differenza fra build provata e build finale

Bot, capture complete e retest sono attribuiti a **MP92z05e**. La build finale standard **DpZTJjdp** è PASS secondo l'integratore e incorpora tre modifiche circoscritte, lette nel sorgente corrente:

1. `game.ts:164`: obiettivo persistente con verbo «Libera un lato, poi E» / «Spegni l'ancoraggio pronto: E».
2. `game.ts:357`: singolare locale «1difensore» anziché «1difensori».
3. `game.ts:119`: scheda ranged appresa derivata da clear/defeated ranged al restore; **schema save invariato**. Il caso imparato solo tramite cover/evitamento, senza defeat, può ancora ripresentare il ripasso dopo reload: innocuo, non perdita d'obiettivo.

Non risultano da queste tre patch cambiamenti a danni, muzzle, camera, timing, persistenza o geometria. **Accettabile non rifare un intero primo-impatto** per questi ritocchi: verificare il nuovo testo/layout e il restore tutorial, mantenendo il retest come prova di comportamento della versione precedente praticamente equivalente. La prova controllata con hash coincidenti fornisce inoltre copertura meccanica attuale.

`docs/evidence/step-08/final-start/report.json` presente:4frame PASS/deterministici, nessun errore; tuttavia la PNG osservata `00-player-0.png` mostra ancora il **vecchio titolo** «La via dei giocattoli · Ancoraggi1/3». **Non la uso come prova visiva del nuovo verbo DpZTJjdp né come audit aggiornato.** Serve l'audit mirato che il main sta eseguendo.

## 4. Residui MINOR da tenere nel backlog

- **Camera vicino al riparo/negozio destro** (019; `game.ts:updateCamera`): riprodurre la stessa strettoia e aumentare la visibilità senza attraversare muri, ad esempio correggendo pivot/spalla o trasparenza della sola occlusione. Non cambiare layout/difficoltà per un episodio recuperabile.
- **Aggancio MIRATO ampio e fascia HUD inferiore** (005): usare «Agganciato / mira assistita» e compattare pannelli non urgenti senza diminuire font/contrasto. Non rimuovere l'assistenza indulgente.
- **Feedback E stantio / scelta di lato a pari distanza** (046 e report017): cancellare/aggiornare l'avviso range entrando in portata, preferire un dispositivo locale pronto quando non c'è un'intenzione univoca. Nessuna attivazione sbagliata osservata.
- **Muzzle C1** (`ranged.ts:37,58` rispetto a `shooter.ts:58`): cue e origine arretrati rispetto alla bocca visiva. Rinviabile a rifinitura; mantenere test root→muzzle contro cover se si sposta l'origine. Gli altri segnali e la meccanica passano, nessun MAJOR confermato da questi frame.
- **Clic senza nuova risposta nel driver a passi:** isolare in seguito, conservando trace/input; non diagnosticarne la causa con supposizioni.

Nessun altro file modificato: queste sono raccomandazioni di backlog, non patch applicate dal reviewer.

## 5. Condizioni precise per trasformare SHIP condizionato in sign-off

1. **Audit mirato DpZTJjdp** con nuovo verbo visibile, singolare e pannelli integri a1080p: palette/contrasto/cap-height e determinismo senza errori; conservare screenshot della UI davvero aggiornata. Non riutilizzare `final-start` con il vecchio titolo come se fosse nuovo.
2. **Esito finale GAMETEST/unit/regressioni del sorgente aggiornato**, incluso hash snapshot M1 e restore tutorial derivato dai progressi, con build associata. Nessun timeout conteggiato come PASS. Il controllo runtime del combattimento già presente non va reinventato né richiesto come report mancante.

Se questi due esiti passano senza nuove modifiche meccaniche, **SHIP / LANDS / ON TRACK** per far provare M2 all'utente: non serve un altro agente o un intero ciclo di playtest cieco. Se emergono regressioni concrete, classificare quelle, non bloccare per il solo lavoro ancora in corso.

## Keep — cinque

1. Due arene in ordine libero, sei difensori totali e progressi per lato realmente persistenti.
2. Tiro lento annunciato, cover numericamente efficace, schivata protettiva e un pericolo committed alla volta.
3. Conferme locali E e progressione1→2→3/3 comprensibile, senza finale globale.
4. Stile A e silhouette ranged conservati entro i budget campionati; nessun asset/audio esterno aggiunto.
5. Aiuti verificati, salvataggi retrocompatibili, prove informate distinte da UI-only e limiti dichiarati senza inventare durata/60fps.

**Conclusione:** nessun BLOCKER/MAJOR sostanziato nelle nuove evidenze. Combattimento, due ordini, raccordo M1→M2 e completabilità UI a passi sono documentati. Ultimo sign-off condizionato soltanto ai due riscontri finali DpZTJjdp sopra; poi check-in utente M2, non costruzione M3 o pubblicazione automatica.

## 6. Chiusura delle condizioni — integratore

2026-10-21, dopo il report del reviewer. Entrambe le condizioni del §5 sono soddisfatte, senza ulteriori cambi meccanici:

1. `docs/evidence/step-08/final-ui/report.json` e PNG: nuovo obiettivo operativo a1080p, selfTest/determinismo/audit PASS. `final-singular/report.json` e `singular-ui.png`: «1 difensore», verbo operativo e memoria ranged da checkpoint osservati, audit1080 PASS. `final-clear/report.json`: obiettivo pronto-E PASS. Le immagini sono state guardate dall'integratore, non attribuite a una nuova sessione del reviewer.
2. Build standard DpZTJjdp PASS; `npm.cmd test` **22/22 PASS**, incluso hash27file M1. `docs/evidence/step-08/integration-final/report.json`: entrambi ordini sulla build finale PASS,12/10lanci,0errori; retry/Continua e conteggi verificati. `tutorial-restore.json` conferma `rangedLearned:true` dopo l'ultimo retry/Continua di ciascun ordine. M1/cancello e meccanica invariati rispetto alle prove già lette dal reviewer.

Si applica quindi il verdetto autorizzato al §5: **SHIP / LANDS / ON TRACK per il playtest utente M2**. Non è approvazione dell'utente, certificazione60fps/durata o autorizzazione M3/pubblicazione. I MINOR rimangono documentati.
