# M3 — review parziale scena/cast

2026-10-21. **VISUAL PASS PROVVISORIO. Nessun BLOCKER/MAJOR visivo confermato nei materiali esaminati.** Non è SHIP/LANDS dell'atto, né prova del boss giocabile o del finale completo.

Ownership rispettata: scritto solo questo documento. Non letti game/storage/core, non avviati browser, agenti, build/test o commit. Il typecheck globale concorrente non è un gate di questa consegna e non è stato atteso né corretto.

## Perimetro ed evidenze

Letti `src/levels/square.ts`, `src/characters/cast/squamakk.ts`, `src/visual/square-batch.ts`, `docs/production/status/visual-m3.md`, `docs/set-pieces/square.md`, DESIGN_SYSTEM e i punti di raccordo in `src/acts/square.ts`.

**Osservate direttamente tutte le sei PNG native**, non solo descrizioni:

| File in `captures/visual-m3/` | Riscontro visivo |
|---|---|
| `gameplay.png` | Boss centrato e libero davanti alla nave, albero a destra, slitta a sinistra; piazza ampia senza tetti nel percorso centrale. Santa non occulta il boss in questa composizione. |
| `squamakk-close.png` | Muso/occhi/cresta rettiliani, corona oro e mantello rosso distinguono il generale; emettitore arrotondato sul petto. Stivali apparentemente a terra, nessuna compenetrazione macroscopica evidente nel campione. |
| `parcel-support.png` | Ponte crema anteriore collegato alla nave, cupola arretrata. La superficie è libera e leggibile; **non c'è un pacco in appoggio**, quindi non prova ancora il contatto pacco–ponte. |
| `ending-start.png` | Piccoli accenti dell'albero/sede, nave e portale ancora presenti per il gesto previsto; nessun lampo globale o cambio evidente di mood. |
| `sled-departure.png` | Slitta e due renne restano insieme, chiaramente giocattoli; distacco dal terreno compatibile con una partenza scenica, non piedi erroneamente sospesi durante il gameplay. |
| `ending-terminal-reduced.png` | Nave, portale e slitta non più visibili, albero ancora attivo nella stessa sera. Campione terminale coerente; non prova da solo l'interpolazione o lo screening dei lampi. |

Sono render isolati software1440×900, **senza HUD/VFX/nucleo/pacco/sciarpa core**. L'assenza di questi elementi in tali immagini non è classificata come difetto o MAJOR della consegna visuale.

## Giudizio combinato

- **Critico — pass visuale provvisorio:** composizione funzionale e margine di budget ampio; contatti pavimento documentati separatamente. Da verificare camera reale, nucleo interattivo e appoggi del vero pacco una volta integrati.
- **Genere — base coerente:** generale buffo con megafono pettorale, leggibile senza armi realistiche/gore; nave e supporto consentono la gag di spedizione. Cono/lock/vulnerabilità/wrap non presenti nei frame isolati: nessun verdetto sulla loro efficacia live.
- **Narrativa — ON TRACK limitatamente al mondo:** niente vittoria in core/carrying nel codice del mondo; portale si chiude soltanto nello stato ending, slitta parte dopo. **Sciarpa e generosità non ancora valutabili**, restano responsabilità dell'integrazione, non sostituibili con il solo titolo finale.

## Riscontri su layout, materiali e cast

### Geografia e solidi

`square.ts:8–11` mantiene le due AABB concordate. Tronco `59–66` con impronta1.6×1.6 e prime fronde da circa3.1m: il punto albero `(8,-4.4)` resta esterno al solido e sotto una chioma alta. Il percorso centro→nucleo→albero non contiene nuove casette o altri collider. Negozi/paesaggio sono fuori bounds (`19–46`): scelta coerente per evitare la strettoia camera M2.

Nave a quota4.4, fondo circa3.78, oltre il boss e senza grande collider aggiunto: nella PNG gameplay non chiude la linea di vista. Slitta/renne/corpo sono nello stesso parent (`92–117`); l'insieme rispetta sostanzialmente l'impronta del solido concordato. La partenza è scenografia, non una nuova modalità di guida.

### Stile A e contatti piedi

Cast `squamakk.ts:36–48`: alieno base scalato1.35, corona segue il gruppo testa, regalia separate e nessuna modifica alle braccia condivise. Il generale è più massiccio dei soldati, non deve superare necessariamente il cappello di Santa. La PNG close-up conserva finitura vinile, palette e silhouette; corona/mantello restano distinguibili. Non è dichiarata una presa dell'emettitore: è **montato sul torace** (`28–31`), quindi non richiede un falso test mani–arma.

`SquareBatch:7–27` riduce le sfere di ornamenti/paesaggio a12×8 e riunisce per materiali condivisi; nave e cast restano sul Batch comune. Nessun nuovo modello o materiale esterno, nessuna luce per decorazione. La riduzione dei dettagli non rende irriconoscibili albero o renne nei campioni.

Lo status riporta48pose con `floorError=0` e misura dei vertici reali degli stivali dopo morph=0, con root traslata/ruotata. **Misure riportate dal builder, non rieseguite dal reviewer.** La moltiplicazione per scala in `squamakk.ts:48` conserva l'unità in metri del controllo base; non certifica corona, mantello, sciarpa o prese inesistenti. Piedi in appoggio nella PNG sono un riscontro visuale, non la misura numerica≤2mm.

## Raccordi obbligatori, non bug core diagnosticati

1. **Scala del boss:** conservare base1.35 quando si applicano shrink/wrap (`squamakk.ts:6,38`). Sovrascrivere root.scale con1 perderebbe la silhouette approvata; moltiplicare la scala base invece. Non verificato nel core, volutamente non letto.
2. **Bocca reale:** usare `root.localToWorld(muzzleLocal.clone())` per il punto esposto a `squamakk.ts:44`, già trasformato dalla scala. Evitare doppia moltiplicazione o offset arbitrario dentro la canna. Cono danno da bossPoint e carica visuale devono essere leggibili insieme; questa review non misura il raggio runtime.
3. **Appoggio pacco sulla nave:** `square.ts:124–131` espone `parcelSupport`: piano locale **y=.4**, centroz=.8, width1.8/depth1.4. In posa iniziale è **world `(0,4.8,-11.2)`**. Collocare su quel piano il **fondo del pacco**, non il suo centro. Parent alla nave o formula affine equivalente per scala/ritiro; non lasciare un pacco sospeso nella piazza quando la nave si ritira. La PNG supporto prova lo spazio disponibile, non i contatti dell'oggetto futuro.
4. **Nucleo unico:** `square.ts:77–89` costruisce sede/anello, non un secondo nucleo. Il nucleo restituito visibile è del core: allinearlo alla sede locale `(0,1.5,.825)` dell'albero, senza considerare il punto E esterno come posizione fisica del nucleo. Non è richiesto che il player entri nel tronco per consegnarlo.
5. **Sciarpa vera e misurata:** ancora assente dal mondo per ownership corretta. Derivare appoggi dalle dimensioni del pacco effettivo; misurare≤1mm negli appoggi e mantenere margine anticlip sulle parti libere (consigliati≥3mm), senza dichiarare l'intera sciarpa una presa della mano. Cattura vicino+gameplay prima del ritiro nave è un gate narrativo/visivo finale.

## Ending e seek: cosa garantisce il mondo

`square.ts:150–151` cambia timestamp soltanto al cambio stato. `153–165` ricostruisce scale/posizioni/visibilità da tempo assoluto:

- battle/core/carrying: nave/portale/slitta in posa iniziale, nessun accento vittoria;
- ending0–2.5: nave/portale fermi, albero attivo; spazio per il gesto sciarpa;
- ending2.5–5: easing di ritiro nave e scala portale1→0, entrambi invisibili a5;
- ending5–8: slitta e renne insieme, invisibili a8;
- reducedMotion: stessi eventi e chiusura ma spostamenti molto ridotti, niente camera mossa dal mondo.

La funzione pura, senza delta accumulato/random, sostiene seek avanti/indietro. Lo status riporta assert isolati PASS per reset, setter ripetuto, terminale ridotto e stati core/carrying; **non è una nuova prova eseguita qui**. Le PNG iniziale/terminale sono coerenti con quelle asserzioni.

**Restore:** inizializzare un mondo/stato non-ending, poi `setStoryState('ending', currentTime-8)` e update corrente. Se la stessa istanza è già ending, richiamare il setter col medesimo stato non può cambiare l'origine temporale per design: per reseed di un preset riportare prima a battle. Questo è un requisito di raccordo, non motivo di modificare il setter a ogni frame. La vittoria non deve essere attivata dal mondo perché il boss non è più visibile: core decide solo dopo restituzione valida.

## MINOR / attenzioni di presentazione

- **M1 — slitta frontale poco leggibile dalla camera d'ingresso:** in gameplay/ending-start si leggono soprattutto cassone e teste delle renne; `sled-departure.png` mostra invece bene le due renne e i pattini. Non è un oggetto rotto. Raccordo minimo: nella sequenza di partenza usare una ripresa che mostri le renne, senza muovere l'asset durante il combattimento né aggiungere nuova geometria. Riferimento `square.ts:92–117`.
- **M2 — campione terminale non adatto da solo alla schermata finale:** `ending-terminal-reduced.png` taglia quasi tutto Santa al bordo inferiore. Non è diagnosi della camera core: è una ripresa isolata. In integrazione comporre il quadro di vittoria con albero, Santa e pannelli senza tagli involontari; la PNG attuale dimostra solo la rimozione dei nodi e il mood terminale.

Nessuna correzione visuale BLOCKER/MAJOR giustificata dai sei campioni. Il pass non certifica contatti futuri o occlusioni da qualsiasi angolo.

## Budget e verifiche finali da acquisire

Status: mondo battle22call/26.304tri, picco ending **23call/28.200tri** (<25/35k); Squamakk **17call/11.738tri** (<20/18k); render software mondo+Santa+boss **51call/50.920tri**, tre luci/zero post, palette isolata conforme e0errori riportati. L'ampio margine **non è un claim60fps** o un budget integrato con tutti i VFX.

- [ ] `LC.selfTest` e contatti reali del boss nelle pose idle/carica/active/recovery/wrap, inclusa scala1.35; nessuna certificazione mani dal solo floorError.
- [ ] Segnale cono/muzzle/nucleo visibili da gameplay, frame close-up e normale/ridotto movimento; copertura dei pannelli valutata solo quando esiste l'HUD integrato.
- [ ] Appoggio del **vero pacco** sul supporto e sciarpa con misure numeriche; muso/corona/pacco leggibili dalla ripresa finale1–2.5s, nessun doppione o clipping.
- [ ] E sul punto albero accessibile, nucleo unico presente nella sede dopo restituzione, nessun ending in core/carrying.
- [ ] Timeline ending a0/1/2.5/5/6.5/8, seek indietro e restore terminale; nave/pacco solidali e slitta/renne solidali. Confrontare con normale e reducedMotion, non solo ultimo frame.
- [ ] Audit1080 palette/contrasto/font/lampi, immagini player+vicino, budget al picco completo e software mirato. Zero errori; build/regressioni e hash snapshot in integrazione.
- [ ] Boss reale, salvataggi, percorso Nuova partita→finale e fresh-eyes secondo spec: fuori dal presente pass parziale.

**Consegna conclusa:** scena/cast pronti per integrazione con raccordi espliciti. Nessun'attesa del typecheck core concorrente, nessuna modifica ai file dei builder. Giudizio finale dell'atto rinviato alle prove integrate, non inferito dalle immagini isolate.
