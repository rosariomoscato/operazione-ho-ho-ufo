# Passo9 — review combinata finale · TmJx2Hx1

## Sign-off finale — 2026-10-21

**SHIP / LANDS / ON TRACK** per la nuova milestone **polished-1 da congelare**, esclusivamente sulla build **TmJx2Hx1** identificata sotto. **Nessun BLOCKER/MAJOR confermato; un MINOR di composizione finale residuo.** Non è ancora approvazione utente del polish, chiusura amministrativa del passo9 o autorizzazione al deploy.

Questa integrazione supera le condizioni aperte della review parziale conservata in fondo: non cancella la storia dei FAIL né presenta i gate di allora come già superati a quella data. Ownership: modificato **solo questo file**; nessun codice, tool/gate, HANDOFF, snapshot o altro documento modificato, nessun browser/test runtime nuovo/subagente avviato. Verifiche del reviewer: lettura di report/sorgenti e immagini, calcolo hash read-only; esecuzioni runtime attribuite ai rispettivi autori.

### 1. Provenienza e copie immutabili — PASS

- `docs/evidence/step-09/source-manifest.json`: build **TmJx2Hx1**, HTML con `index-TmJx2Hx1.js`, **42/42 file corrispondenti al working tree**, zero differenze SHA256 al controllo del reviewer.
- Report controls **5/5**, controlled **6/6**, camera **6/6** file elencati: hash before=after=sorgenti attuali. Tutte le ownership builder risultano libere; non trasferire questo sign-off a un successivo source change senza rivalidare le prove influenzate.
- `captures/summary.json`: hash dei quattro asset/HTML identici prima/dopo e corrispondenti anche ai quattro file `dist/` letti dal reviewer; HTML Tm presente anche nel nuovo fullbot. Non confondere build intermedie conservate con questa consegna.
- M1 **27/27**, M2 **27/27**, RC D86qgQyq **27/27**: ricalcolati e identici ai rispettivi manifest. **81 file congelati intatti**, RC5179 non aggiornata né sovrascritta.
- `unit-tests.txt` letto come UTF-16LE: **45/45 PASS,0fail/skip/cancel**, comprese regressioni/snapshot e migrazioni. È log verificato, non un nuovo run del reviewer.

### 2. Critico: UI, camera, regressioni — PASS

**UI reale7/7 e M3 controllato9/9 PASS**, errors vuoto. Restano validi i riscontri meccanici dettagliati nella sezione storica: timing/ID delle finestre, anti-prefire/doppio hit, dodge, late, nucleo/save, appoggi, aiuti, Esc e coda frame0. La diversa attesa del runner (`DOMContentLoaded`+`LC.ready`) evita il cold-media timeout; non è modifica alle fixture/asserzioni né al tempo del gioco.

**Due MINOR UI precedenti chiusi:** `Game.renderMenu` conserva il focus sul binding/reset dopo rerender, compresi conflitto/annullo; `renderControlSettings` mostra output live **Sensibilità× / Campo visivo gameplay°**, default e limiti espliciti. Riletti i rami di focus e output e osservata la nuova `controls/settings-1080.png`: 1×/53° visibili, sette azioni, reset, nessun controllo troncato nel campione. Il report UI reale è nuovamente PASS sugli hash correnti; non si tratta del vecchio screenshot senza valori.

**Camera gameplay: condizione clearance chiusa**, non semplicemente ignorata. `camera/report.json` contiene **864pose/288viste**, errors vuoto:

| Atto/caso | Pose/viste | Distanza minima | Clearance minima | Picco call/tri nelle sue viste |
|---|---:|---:|---:|---:|
| M1 battle-c |384/128|6.601m|.280m|74/93.314|
| M2 entrambe arene |288/96|8.080m|.280m|110/85.990|
| M3 ingresso |192/64|7.184m|.280m|52/51.000|

Precisazione: **110/85.990 è la coppia di picchi M2**, non il massimo triangoli globale della griglia: M1 arriva a93.314. Tutti entro150call/150ktri. Il vecchio .134<.2 era l'ambiguità local/world del beacon: API pubblica ora **WORLD-SPACE**, marker esplicito e cache aggiornata al cambio matrice; non trasformare una seconda volta i Box3 pubblici. Il test main non è stato indebolito e geometrie/collider non sono stati spostati per passarlo.

`polish-camera.md` distingue correttamente la fixture isolata più ampia: **2.712pose /8.136verifiche FOV45/53/75**, clearance minima.27497m in M3 e distanze diverse perché campiona altri punti. PASS matrice/parent, determinismo, input immutato e reset. Materiali locali clone-only, niente fade globale: **11/11,10/10,17/17** cloni creati/disposed M1/M2/M3, riferimenti originali ripristinati e nessun dispose geometria nel resolver. Hash normalizzati dei triangoli dei tre livelli identici a HEAD secondo misure builder; palette ricostruita con errore≈2e-8. Non dedotto dal solo selfTest.

Guardata direttamente `camera/before-after-sheet.png`: nei tre confronti shop/corner/albero l'avatar passa da enorme/occluso a figura intera, bersagli e spazio tornano leggibili; fade locale del prop, non dell'intera mappa. Questo **non** risolve automaticamente la camera cinematografica finale di BossChapter, che resta distinta sotto.

Stress builder **138call/86.494tri**: upper bound renderizzato da geometrie/sistemi reali con più attori/VFX e senza culling, **non picco di playthrough**. Nessun nuovo post/luce/mood. Raccordo muzzle/cover già verificato separatamente e registrato nel BACKLOG finale, senza variazioni di velocità/danno/lock.

### 3. Catture, accessibilità e audio — PASS nei limiti dichiarati

Conteggio indipendente dai report individuali: **27frame =20default+4accessible+3software**, non31 (numero storico M3). Tutti PASS, deterministici, errors vuoto; default con semanticPass nella summary. HTML/asset Tm invariati.

Osservati direttamente i PNG default **M2 entrambe arene**, **boss-vulnerable**, **ending1.5s**, **ending8s**, oltre al confronto camera, settings, accessible M2 e preview deuteranopia boss. M2 mostra i due lati/obiettivi senza coprire i volti; boss distingue apertura5.5s e aggancio assistito da mira libera; a1.5s la **sciarpa rossa con frange oro è chiaramente sul pacco** col generale riconoscibile e ponte sotto. A8s nave/portale/slitta assenti e vittoria/replay espliciti. Appoggi veri corroborati dai9casi controllati, non sostituiti da una descrizione.

I4audit1080 reducedMotion/aimOFF sono PASS palette/typography/flashes: cap-height minima campionata **25px**, contrasto minimo≈**9.93:1**, sopra24px/4.5. Preview daltonismo conserva forma/testo di cono, tacche e destinazione; non è certificazione universale per ogni vista/incrocio o hardware. Stesso stile A, nessun blur introdotto.

`audio/runtime-audio.json` resta **PASS tecnico**: master0, bus separati, gesto iniziale, pause/cambio musica silente finché resume, pool8 e stop senza errori. Fresh-eyes **muto**; nessun ascolto soggettivo del mix/laptop certificato. Dialoghi solo testo, nessuna voce inesistente da misurare o API audio. Rendering debug/software e microbenchmark non dimostrano60fps sul laptop.

### 4. Fullbot nuovo e fresh full — PASS, prove diverse

`playthrough/report.json`: **PASS TmJx2Hx1**,25lanci,2morti,**279.762s wall**, errors vuoto. Boundary reali: M1complete→workshop→carousel→M3entry→Squamakkdefeated→corecarried; finale `bossSegments=3`, bossDefeated/coreCarried/coreReturned/completed/portalClosed veri, elapsed≈8.819s. Entrambe le morti sono **nel boss con2segmenti già salvati**, poi completamento: non due perdite di progresso o morti M2 come nella vecchia run. Il bot è input reale con LC read per osservare; protocollo senza goto/seed/seek/damage/timeScale/pausa. Non è una simulazione controllata mascherata da partita.

I preliminari FAIL rimangono in `pre-integration`: correzioni del driver riguardano guard/clic UI e strategia M2 (affrontare minacce vicine prima di avanzare), **non velocità, difficoltà, limite12morti o gioco cambiati per farlo passare**. Non trasformare tali tentativi in PASS retroattivi.279s non è durata umana e non richiede filler.

`docs/reviews/polish-fresh-eyes.md`: **PASS nuovo UI-only completo**, nessuna lettura di LC/sorgenti/coordinate/docs/coaching, nessuna preview o selezione capitoli. Nuova partita→tutti gli atti→nucleo→albero→finale **non saltato**→Nuova avventura; **0morti/0retry**, H una volta per il cancello. Il registro conservato contiene **85richieste prima della chiusura,86inclusa close**: richieste UI/attese/catture, non85attacchi o85decisioni di gameplay.14PNG conservati; guardati direttamente083/084 oltre alle catture controllate.

Il tester comprende obiettivi, range E e restituzione, e legge la generosità verso Squamakk. Registra recuperi da E oltre soglia e aggiramento del trenino, non soft-lock. Limiti espliciti: Esc fraazioni, screenshot/testo bridge talvolta su istanti diversi, audio muto,≈27minwall incluse latenze/pause. **Non approvazione della difficoltà continua, misura umana o ascolto.** Il fullbot senza pause e le fixture dodge/lock forniscono il riscontro complementare, non cancellano questi limiti.

### 5. Genre e fullstory — LANDS / ON TRACK

La lettura fullstory in ordine già documentata sotto resta valida sulla fonte ora manifestata: furto motivato e risposta secca di Santa; tutorial non punitivo; tre ancoraggi complessivi con due arene libere; escalation sequenziale del generale senza simultaneità illeggibile; presa/restituzione guidate; generosità prima della chiusura e consegne dopo Terra salva. SCRIPT registra le varianti correnti e conserva gli ID; niente nuova trama o ancoraggi aggiunti.

**LANDS:** impacchettamento non letale, battute asciutte e pacchi contro il generale sostengono la comicità senza nascondere il risultato delle azioni. **ON TRACK:** vittoria soltanto dopo nucleo restituito e portale chiuso. Il fresh full conferma comprensione della catena e regalo al generale; il dettaglio visivo sciarpa, non distinto dal tester nel quadro ampio, è verificato dal reviewer nella cattura controllata1.5s. Non attribuire al tester una verifica che dichiara di non aver fatto.

### 6. Residuo e condizioni di consegna

**Un MINOR residuo, non bloccante:** nella ripresa finale ampia Santa è ancora parzialmente sotto chioma/pannelli (`BossChapter.applyCamera`, fresh083/084 e default8s). Il problema di **compressione gameplay è risolto**, quello di **composizione cinematografica no**. Il testo payoff/vittoria resta leggibile, il nucleo è restituito, non ci sono più attacchi o input necessari dietro la chioma, il finale è stato visto e replay riuscito. Già MINOR nella RC approvata: nessuna prova qui che lo trasformi in MAJOR. Eventuale futura rifinitura solo del look/pivot finale con nuove catture normale/ridotto, non colliders o difficoltà.

**Nessuna condizione tecnica bloccante residua nelle prove lette.** Sign-off per congelare **esattamente TmJx2Hx1** come nuova polished-1, distinta dalle tre copie intoccabili; il main dovrà creare/verificare il manifest della nuova copia e presentarla all'utente. Freeze non ancora eseguito da questa review, approvazione utente del polish ancora da ottenere. Qualunque nuovo source change richiede nuovo raccordo hash/prove, non eredita automaticamente SHIP.

**Esito finale: SHIP / LANDS / ON TRACK per polished-1 TmJx2Hx1.** Costo/API audio0, nessuna pubblicazione o spesa autorizzata. Nessun filler, stima umana inventata, claim60fps o mix soggettivo aggiunti.

---

## Registro storico — review parziale, superata dall'integrazione sopra

2026-10-21. **Review condizionata, NON SHIP finale.** Camera builder ancora attivo; il nome di questo file non certifica la conclusione del polish.

Ownership esercitata solo su questo documento. Nessuna modifica a codice, polish-design, HANDOFF, piano o snapshot; nessun browser, test GPU, subagente, acquisto o pubblicazione. Letti GAME_DESIGN e SCRIPT nell'ordine della storia, Game/BossChapter/texts, input/storage/UI controls/ranged, piano, HANDOFF e stato controls. Osservata direttamente `docs/evidence/step-09/controls/settings-1080.png`. I risultati runtime sotto sono prove esistenti lette, non nuovi run del reviewer.

## Verdetto per prospettiva

| Prospettiva | Giudizio limitato alle prove disponibili |
|---|---|
| Narrativa | **ON TRACK** sulla continuità completa di documenti e sorgenti: furto→tre ancoraggi→boss→presa→restituzione→sciarpa→chiusura→slitta. La resa dell'intera nuova build resta da giocare |
| Azione/comicità | **LANDS condizionato** su struttura e riscontri controllati; conservati escalation, gag non letali e payoff della generosità. Non è approvazione live della camera o del ritmo umano |
| Critico | **UI/comandi supportati dai PASS parziali**, con MINOR sotto. Sign-off generale sospeso per clearance camera, nuova prova completa e gate mancanti |

Nessun nuovo BLOCKER/MAJOR dimostrato nel perimetro UI/narrativa letto. **Il FAIL camera segnalato dal main è reale gate aperto**, non cancellato dai PASS UI/M3: workshop M2 clearance **.134m < .2m**. Non misurato nuovamente qui, non dichiarato risolto e non attribuito alla storia o alla difficoltà.

## 1. Continuità full story

- Apertura: Squamakk tratta il nucleo come batteria, Briciola esplicita il portale/Terra, Santa risponde col carbone. Skip porta al tutorial con la motivazione conservata, non a un conflitto senza contesto.
- M1: drone e schivata sicura insegnano le azioni; «Impacchettato. Senza scontrino.» e spedizione alla nave comunicano neutralizzazione non cruenta. Il primo ancoraggio vale **1/3**, non una vittoria globale.
- M2: Officina e Giostra restano due obiettivi locali in ordine libero. `Game.interactStreet:229–239` controlla distanza, linea libera e arena liberata prima di contare; passaggio a piazza soltanto dopo entrambi. «Smettetela di accettare pacchi dal nemico!» lega la gag alla meccanica invece di aggiungere un'interruzione.
- Il raccordo `vo.briciola.square` runtime manda al cancello: SCRIPT§Terzo segmento registra ora la variante corrente. Il vecchio «ci fermeremo» è esplicitamente storico; non è una promessa runtime errata. **Il raccordo documentale M3 della review precedente è chiuso**, senza modificare le copie congelate.
- M3: tre segmenti, sequenze crescenti, poi nucleo libero; sconfitta/pickup non bastano per salvare la Terra. `BossChapter:52–61` richiede presa e restituzione, impedisce E anticipato/doppio pickup e salva i confini.
- Finale: `BossChapter:65–80,98` mostra/annuncia la sciarpa da1s, dichiara Terra salva da5s solo col portale realmente chiuso e completed da8s dopo restituzione. Slitta come conclusione, non nuova modalità. Skip/Continua applicano uno stato terminale coerente; il nuovo fresh-eyes dovrà comunque vedere il finale non saltato.

Nessuna trama, difficoltà, conteggio ancoraggi o asset nuovo rilevato nell'ambito letto. Il concept contiene idee preliminari più ampie (es. power-up), ma non sono requisiti da reinserire nel polish dell'avventura già approvata. Le intestazioni minuti di SCRIPT sono obiettivi storici, non misure. Nessun minutaggio umano inventato o filler richiesto.

## 2. UI/comandi: evidenza e riscontro statico

`controls/report.json`: **7/7 PASS, errors vuoto**. Per tutti i cinque sorgenti elencati, SHA256 before=after=working tree al confronto read-only del reviewer. `controlled/report.json`: stesso riscontro su tutti i sei sorgenti elencati, **9/9 PASS**. Questo riallineamento vale per i file elencati, **non congela il solver camera** né crea un manifest dell'intera build.

I sette casi UI reale coprono:

1. slider/checkbox e persistenza dopo reload;
2. conflitti/tasti riservati spiegati, Esc annulla remap senza chiudere impostazioni;
3. sette azioni assegnabili dalla UI;
4. avanti rimappato realmente usato e keyup rilasciato;
5. sensibilità/invertY/FOV applicati alla camera reale;
6. eventi DOM per tutte le azioni e HUD con binding configurati;
7. Esc apre pausa; reset ripristina preferenze senza cancellare checkpoint.

Il codice conferma mappa fisica→azioni canoniche, keyup sulla mappa registrata, repeat orfani ignorati e clear al blur (`input.ts:6,17–25,30–34`). Esc precede il filtro focus ed è separato dalla cattura; niente gamepad/touch o pointer lock aggiunto. `storage.ts:50–54` normalizza dati malformati, clamp e vecchie preferenze, senza migrazione checkpoint: sensibilità **.25–2× default1**, invertY off, **FOV45–75 default53**. Il massimo2× è scelta contenuta, non regressione rispetto alla proposta iniziale3× del design.

`Game:406,411–435` e `ui/controls.ts` aggiornano i token dei prompt con i binding effettivi, senza riscrivere ID narrativi o rimappare due volte gli stessi text node. `frame:441–446` conserva il pending input nel primo RAF dt0. Il menu reset comunica progressi invariati e usa freshSettings, non clearCheckpoint.

**PNG1080 osservata:** testo grande, pannello opaco, sette binding e reset distinti, focus evidente su Riprendi, preferenze entro viewport nel campione. Nessun taglio dei controlli in questa PNG; non dimostra automaticamente fit720p, zoom, contrasto numerico, layout di ogni conflitto o navigazione completa solo tastiera.

### Chiarezza e muzzle

- `Game.aimLabel:65` distingue **AGGANCIATO · assistenza** da **MIRATO · tiro al+**; `aim:201–203` modifica il punto verso il candidato solo con assist ON. OFF conserva la traiettoria libera: il marker non equivale a snap occulto.
- Feedback range strutturato e live, con distanza/linea libera e disponibilità; `interactStreet:231–236` non permette che la preferenza per un lato pronto disattivi da lontano. `BossChapter:50,58–60` raccorda anche nucleo/albero. Il builder riporta prove range/assist dedicate: non chiamate qui nuovi playtest indipendenti.
- `ranged.ts:rangedMuzzle` trasforma la bocca reale una sola volta e conserva angolo locked; il ramo root→muzzle cerca primo impatto prima del volo. Lo stato builder riporta **3/3 mouth/cover/player PASS** e cue .14m davanti alla bocca. Evidenza utile ma non inclusa nei sette casi settings: resta da raccordare alla build finale e alle catture M2. Nessuna autorizzazione a tirare attraverso un riparo traslucido.
- Lifecycle: il builder riporta plateau65/60/60 geometrie e4texture dopo cicli, con rilascio delle sole merged esclusive. Riscontro di stato, non nuovo audit indipendente del reviewer; verificare ancora dopo l'ultima revisione camera/materiali.

## 3. Nove casi M3: cosa dimostrano

`controlled/report.json` è **controlled-real-Game-update-not-playthrough**. PASS su checkpoint preattacco e danno singolo, schivata reale, prefire/doppio lancio respinti, regalo late respinto, ordine nucleo/Continue terminale, appoggi pacco/sciarpa e ritiro/seek world, aiuti15/30/45 con reset al progresso.

Rispetto alle prime prove M3 sono presenti anche:

- **Esc vero:** clock pausa e afterPause identici .05s; ripresa esplicita avanza a .9004 con windowUntil5.5. Non è soltanto una deduzione statica dal loop.
- **Primo input post-resume:** pending dopo il primo RAF, un lancio e pickup E riusciti. Il report lo qualifica correttamente come controllo della coda, non misura del timing umano.

Contatti misurati sui veri oggetti, non immagini sostitutive. Questi nove PASS proteggono regressioni specifiche, ma non provano la nuova camera M2, un'intera partita con impostazioni nondefault o la comprensione spontanea di un giocatore nuovo.

## 4. Audio: PASS tecnico, nessuna voce

`audio/runtime-audio.json`: **PASS, errors vuoto**. Mixer reale attivato dal gesto, un loop musicale più ambience, bus separati, master0 silenzia tutte le tracce, pool limitato anche con8richieste, pausa ferma le tracce e cambio musica resta silente fino a resume; stop pulisce playback senza errori.

Questo è runtime/mixer, **non ascolto soggettivo del mix**, analisi di clipping o prova di udibilità su laptop. I dialoghi sono testi: nessuna voce presente da mixare, nessun margine speech8dB inventato, nessuna API/generazione audio o costo richiesti.

## 5. MINOR concreti e fix circoscritti proposti

1. **Focus tastiera dopo remap:** `Game.renderMenu:436` rifocalizza sempre il primo pulsante abilitato dopo ogni render. Dopo assegnazione/rifiuto/annullo si torna quindi a Riprendi o Nuova partita invece che al binding scelto. Non è un soft-lock: Tab/Esc funzionano; è attrito reale nella rimappatura solo tastiera. **Fix proposto, non implementato:** conservare focus logico sull'azione remap o sul relativo status/controllo dopo il render; verificare Tab/Spazio/Enter senza attivazioni distruttive inattese.
2. **Valori slider poco espliciti:** in PNG e `Game:413` sensibilità/FOV non mostrano valore/unità né che il FOV è gameplay (il finale usa FOV proprio in `BossChapter:79–80`). **Fix proposto:** testo «Sensibilità1×», «FOV gameplay53°» aggiornato, con default/limiti accessibili. Non cambiare l'inquadratura cinematografica per uniformarla a forza.

Nessun MAJOR assegnato a presunte incomprensioni senza fresh-eyes. Nessuna necessità di riaprire concept o aggiungere difficoltà. Lo stato builder riporta un timeout browser.close in una prova accessoria held-repeat: conservarlo come limite di quel run, non confonderlo con i sette PASS UI senza errori o cancellarlo dalla storia.

## 6. Gate ancora aperti — NON fix già consegnati

- **Camera:** correggere il caso workshop .134<.2 e rieseguire griglia clearance/distanza/visibilità con pose riproducibili; altre zone M2, tronco/fronde M3, FOV45/53/75, yaw/pitch, reducedMotion e fine. Non basta abbassare soglia/spostare collider. Solver ancora attivo, nessun pass camera dedotto qui.
- **Trasparenza/materiali:** prova locale clone-only, reset fuori gameplay/finale/cambio atto, nessuna mutazione dei materiali condivisi, cover fisica invariata. Verifica risorse dopo l'ultimo solver.
- **Build e regressioni:** manifest source/build univoco dopo stop dei builder; rerun test e hash, fullbot della **nuova** build da Nuova partita al finale, salvataggi/retry/Continua, default e prove mirate nondefault. I vecchi bot125/169s non sostituiscono questo run e non sono tempi umani.
- **Audit/catture:** budget worst-case e contatti dei3atti, semantica boss e finale, determinismo, software,1080/720, cap-height/contrasto/colore. La PNG settings non certifica tutti questi gate né60fps.
- **Fresh full realmente nuovo:** solo UI, Nuova partita, nessun menu capitoli/preview, docs/LC/coordinate o coaching; attraversare tutti gli atti e vedere sciarpa→chiusura→slitta. Dichiarare pause/latency/audio e correggere eventuali MAJOR. Nessun esito ancora attribuito.
- **Review finale/freeze:** tornare su questo report con le ultime prove; solo allora eventuale sign-off per nuova polished-1 distinta, seguito da check-in utente. Nessun freeze o chiusura passo9 effettuato dalla presente review.

## 7. Copie preservate e conclusione parziale

Confronto SHA256 read-only effettuato: **27/27 M1,27/27 M2,27/27 RC D86qgQyq invariati** rispetto ai rispettivi manifest. RC5179 rimane la copia approvata, non viene aggiornata con il polish. Nessun file congelato modificato dal reviewer.

**Conclusione: ON TRACK narrativo / LANDS condizionato incontri-comicità / review critica UI parziale positiva con due MINOR. Nessun SHIP finale.** La clearance camera fallita e i gate completi restano esplicitamente aperti; il main potrà richiedere l'integrazione di questo giudizio soltanto dopo le nuove prove.
