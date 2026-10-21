# M2 — review parziale di scena e cast

2026-10-21. Reviewer combinato lean; **solo visuale isolata**, non review del gameplay né approvazione dell'atto. Scritto esclusivamente questo file. Non consultato `src/game.ts`, non richiesti aggiornamenti ai builder, non avviati agenti o strumenti di pubblicazione.

## Esito

**VISUAL PASS PROVVISORIO — nessun BLOCKER/MAJOR confermato nella scena e nel cast esaminati.**

| Prospettiva | Giudizio circoscritto |
|---|---|
| Critico | Composizione leggibile, ripari solidi coerenti con il layout, personaggi e finiture A conservati. Contatti e budget isolati documentati; gate integrato ancora da acquisire. |
| Azione/comicità | Tiratore distinguibile dal melee per cannoncino/posa, trenino e banco leggibili come ripari. Buona base per tiro lento e comicità da giocattolo; telegraph, projectile e wrap **non valutabili** nelle immagini statiche fornite. |
| Narrativa | **ON TRACK per la sola scena:** due dispositivi locali, nave abbassata oltre l'uscita, portale ancora presente, nessun boss o vittoria globale rappresentati. Il contatore 3/3 e il testo di fine M2 dipendono dall'integrazione. |

Nessun SHIP/LANDS dell'atto, nessuna dichiarazione di playtest completato, fluidità a60fps o UI già verificata. L'assenza di HUD nella scena isolata **non è un difetto**.

## Materiale esaminato

Letti `docs/DESIGN_SYSTEM.md`, `docs/ACT_02_PLAN.md`, `docs/set-pieces/toystreet.md`, `src/levels/toystreet.ts`, `src/characters/cast/shooter.ts` e `docs/production/status/visual-m2.md`.

Osservate direttamente, a risoluzione nativa, tutte le PNG permanenti:

- `docs/evidence/step-08/visual/m2-visual-player.png`: Santa, sei NPC e due accessi laterali; corridoio centrale aperto, trenino a sinistra e banco a destra; due beacon visibili.
- `m2-visual-shooter.png`: muso, cresta, occhi e corpo rettiliano leggibili; cannone arrotondato, bocca mint e presa distinguono il ranged senza travestimento umano o realismo bellico. Piedi visivamente in appoggio; nessuna compenetrazione evidente della presa nel campione.
- `m2-visual-cover.png`: chassis pieno del trenino, ruote aderenti e superfici distinguibili; nessun evidente z-fighting nella PNG. Non è una prova che il proiettile venga bloccato.
- `m2-visual-complete.png`: due spunte, nessun NPC lasciato artificialmente vivo nella scena conclusa, nave bassa oltre il cancello e portale ancora aperto. Nessun albero col nucleo restituito o altro simbolo di vittoria globale.

## Riscontri su scena e sorgenti assegnati

### Layout, cover e obiettivi

`src/levels/toystreet.ts:7–12` conserva esattamente le quattro AABB del piano. I volumi dei negozi (`14–37`) e i chassis pieni dei due ripari (`40–62`) corrispondono alle posizioni previste. Le finiture sporgono di pochi centimetri, non costruiscono un grande muro invisibile. Il centro x[-3,3] è libero e le coperture non occupano gli ancoraggi. Non emerge una richiesta motivata di spostare coordinate o aggiungere collider.

Il trenino comunica massa e riparo continuo, non una piattaforma da saltare. Il banco di pacchi a est resta un ostacolo statico; la vera silhouette di giostra è oltre la recinzione (`96–107`), fuori dal percorso. Nella vista player una parte del primo tiratore è coperta dal trenino: è una situazione sensata per la nuova meccanica, **non un MAJOR di visibilità di per sé**. Diventerebbe un problema se l'integrazione gli consentisse di colpire attraverso quel riparo o di iniziare un attacco completamente occultato: da provare, non inferire dalla posa.

Beacon (`116–134`) con icone differenti, locomotiva/regalo, e spunta come cambio di forma oltre al colore. In campo lungo le icone sono piccole: la presenza e la distinzione dei due dispositivi si leggono, il nome esatto richiederà i marker HUD previsti. Non ingrandire automaticamente i beacon fino a coprire i difensori.

### Stile A e tiratore

Il mondo e il cast importano Batch/materiali condivisi (`toystreet.ts:4`, `shooter.ts:4`), senza nuovo materiale esterno o texture scaricata. Sera innevata, neve chiara, viola/rosso/oro e luci calde restano coerenti con A. Blocchi di negozi/ripari sono semplici come in M1; cannone e personaggi conservano volumi morbidi. Nessun blur, flash, sangue o arma realistica nelle immagini.

`shooter.ts:65–78` riusa il rig alieno e nasconde le braccia soltanto dell'istanza ranged; aggiunge cannone/presa e modifica la posa dell'arma durante attacco. La bocca dell'arma risulta circa a quota1,2m, coerente con tiro intercettabile dalla cover1,6m. Questa corrispondenza geometrica **non certifica l'origine o l'altezza del proiettile runtime**, che qui non sono stati letti.

### Contatti e budget: cosa è misurato e cosa è solo riportato

Lo status visuale riporta mondo **23 call / 24.988 triangoli**, sotto40k/25call; scena Edge/SwiftShader1440×900 con Santa, tre shooter e tre melee **104 call / 85.830 triangoli**, tre luci, zero post. Margine al campione:46call/64.170triangoli. Palette isolata conforme e nessun errore shader riportati. Sono misure del collaboratore lette nel report, **non rieseguite dal reviewer** e non comprensive dei futuri effetti/HUD integrati.

Piedi shooter: status con48pose e floorError0. Mani: `shooter.ts:6–43` definisce una misura dedicata con le stesse costanti che costruiscono mani e handle; non deduce la presa dal test dei piedi. Lo status riporta96contatti in48pose, errore massimo circa1,07e-14m sotto1mm, anche con trasformazioni affini comuni. Hook `actor.root.userData.measureHandContacts()` esposto a riga81. Da includere nei report integrati senza confonderlo con il solo floorError. La PNG close-up sostiene l'assenza di difetti macroscopici, non sostituisce il test numerico o la verifica delle pose di wind-up e wrap.

### Finale locale e raccordo discesa

`toystreet.ts:154–180` gestisce separatamente i due ID validi, spunte indipendenti e nessun doppio conteggio per ID duplicati. `187–189` calcola la quota8→3 in3s con smoothstep; ripetere il setter con lo stesso set non riavvia il moto. Portale e cancello restano presenti. Questo è coerente con **fine atto a3/3, non Terra salva**.

**Raccordo obbligatorio, non difetto confermato:** il mondo non può distinguere da solo un secondo E live da un caricamento già a3/3. Come documentato nello status, al restore inizializzare `setAnchors(ids, currentTime - 3)` prima di update; al completamento live passare il tempo effettivo. La proprietà della correzione/integrazione è del core, qui non esaminato. Non diagnosticare un bug di reload senza provarlo.

## MINOR / attenzioni, non bloccanti per questa consegna

1. **Icone piccole da distanza ingresso:** verificare con HUD finale che Officina e Giostra siano nominabili e raggiungibili senza affidarsi al solo colore. Correzione minima, se necessario: marker locale col nome; non richiede ricostruzione della scena. Riferimento: beacon `toystreet.ts:121–129`, PNG player.
2. **Distinzione ranged lontano:** il cannoncino frontale funziona nel close-up e sui tiratori centrali, ma il primo dietro cover mostra soprattutto testa/arma. In review finale verificare posa di carica e `!` prima del rilascio; non basta imporre un nuovo colore alla tuta. Riferimento: `shooter.ts:55–60,74–77`, PNG player/shooter.

Sono attenzioni di integrazione, non nuovi MAJOR né modifiche richieste al builder in questa review parziale.

## Checklist per review finale integrata

- [ ] **Due ordini reali:** Officina→Giostra e Giostra→Officina, ingresso e attivazione da colpo; sei difensori totali, nessun invulnerabile fuori raggio. Nome/marker di ciascun lato leggibili dalla normale camera, percorso distinto dalla mira.
- [ ] **Cover vera:** video/fotogrammi+log con proiettile a1,2m, sweep contro chassis/estremità; primo impatto sul riparo, zero danni dietro. Regalo non colpisce attraverso cover. Attraversamento/aggiramento coerenti con le AABB visibili, anche vicino a negozi/camera.
- [ ] **Ranged leggibile:** frame gameplay a inizio/.2s/lock/rilascio, direzione bloccata≥.8s; proiettile lento visibile e distinguibile dal pacco, nessun attacco iniziato completamente fuori vista. Un committed globale anche con sei NPC attivi e un tiro in volo, recovery≥1,2s. Non presentare un render statico come prova di questi timing.
- [ ] **Contatti/VFX:** selfTest feet≤2mm e hook mani shooter≤1mm in movimento/wind-up/recovery; guardare wrap vicino e da gameplay, normale/ridotto movimento, ripristino trasparenza Santa. Nessun cannoncino separato che sembri ferire nel pacco, nessun flash bianco o clip evidente.
- [ ] **Stati indipendenti:** screenshot e log con sola Officina spenta, sola Giostra spenta, entrambi pronti ma non interagiti; E protetto/lontano spiega il motivo. Ancoraggi1→2→3/3 senza doppi incrementi, cura+2 una volta, retry/Continua senza ricreare obiettivi completati.
- [ ] **Discesa e restore:** screenshot player a quota8/5,5/3, tre luci e palette riconoscibili; reload già a3/3 parte a quota3 e non rigioca la discesa. Portale presente, nessun boss/nucleo/finale globale; testo esplicito fineM2 al cancello chiuso.
- [ ] **HUD/aiuti:** cap-height≥24px e contrasto≥4,5 a1080p; marker non coprono muso/colpo; pannelli inferiori non nascondono la linea di tiro. Scheda nuovo comando finché usato, aiuti15/30/45s realmente osservabili con log, pausa ferma timer e progresso azzera; tasto aiuto funzionante.
- [ ] **Budget completo e software:** mondo≤40k/25call; picco con6NPC+Santa+pacchi+tiro+wrap≤150k/150call, luci/post entro limiti; palette/console/rete/determinismo verificati. Default1080 e software mirato sono prove di correttezza, non garanzia60fps su CPU/laptop.
- [ ] **Regressioni e protocollo:** build/typecheck, migrazione save e hash snapshot M1; report input reali distinti dal debug; fresh-eyes M2 senza docs/LC. Conservare evidenze e fermarsi al playtest utente prima diM3.

**Consegna conclusa:** visuale isolata pronta per integrazione, senza correzioni bloccanti confermate. Ownership limitata a questo report terminata; il giudizio finale dell'atto aspetta le prove integrate.
