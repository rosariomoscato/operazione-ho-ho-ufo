# Visuale M3 — pronto per integrazione, non SHIP dell'atto

## File ed export

Creati solo `src/levels/square.ts`, `src/characters/cast/squamakk.ts`, `src/visual/square-batch.ts`, questo status e immagini proprie in `captures/visual-m3/`. Nessuna modifica a core/contratti/atti/materiali o attori comuni/tool/package/snapshot. Nessuna API, spesa, modello scaricato, worktree, commit o altro agente.

- Livello: `id='square'`, `createWorld(scene):CourtyardWorld`, `OBSTACLES`. Root standalone, tre luci A, fog/background della sera, zero post. `.anchor` è un gruppo vuoto; `.anchors` assente. Dati dei nodi da `squareLayout`.
- Cast: default `{id:'squamakk',create:createSquamakk}`, anche funzione nominata `createSquamakk():VisualActor`. Alieno base con scala **1.35**, corona solidale alla testa, mantello rosso, dettagli crema/oro e megafono da pettorale buffo. Nessuna modifica al rig braccia o alle geometrie/materiali comuni; update delegato. Nessun oggetto afferrato o presa della mano dichiarata.
- `SquareBatch` estende Batch solo per sfere piccole/lontane a12×8 segmenti. Usa gli stessi materiali e unisce nuovamente per materiale, senza aumentare le draw call. Cast vicino e nave conservano la risoluzione del Batch comune.

## Geografia e punti di raccordo

Due soli collider esatti:

```text
square-tree: x[7.2,8.8] z[-6.8,-5.2]
square-sled: x[-11,-7] z[-8.5,-5.5]
```

Tronco con impronta1.6×1.6, connesso alle fronde; primo ramo sopra quota3.1, così il cappello non entra nella chioma presso l'interazione `(8,-4.4)`. Albero decorato con palline/nastri oro e sede vuota crema, **nessun nucleo3D duplicato** prima o dopo il finale. Slitta/renne/runners/redini uniti nello stesso parent; niente modelli sostitutivi durante la partenza. I negozi, collinette e alberi di sfondo sono fuori dai bounds; centro e percorso nucleo→albero liberi. Nessuna cura/NPC/boss/pacco/sciarpa nel mondo.

Nomi esatti esposti:

- `Nave di Squamakk`
- `Portale alieno`
- `Slitta delle consegne`
- `Albero della Stella Polare`

Nave centrata `(0,4.4,-12)`, fondo fusoliera a3.78m: nessun ostacolo al tiro o al movimento. Cupola arretrata al centro locale z=-1: non sopra il pacco. Supporto crema anteriore **superficie superiore world y=4.8**, centro `(0,4.8,-11.2)`, larghezza1.8/profondità1.4; base viola collega il supporto alla fusoliera. Descrittore `ship.userData.parcelSupport` in coordinate locali nave: `{center:{x:0,y:.4,z:.8},width:1.8,depth:1.4}`. Core decide il corretto offset del **fondo** del proprio pacco rispetto a questa superficie, senza spostare il punto condiviso arbitrariamente. Se aggancia il pacco al nodo nave con coordinate locali corrette, ritiro/scala/reducedMotion rimangono coerenti automaticamente; altrimenti deve riprodurre la medesima formula temporale.

Squamakk espone `root.userData.muzzleLocal = Vector3(0,1,.84)`: usare `root.localToWorld(muzzleLocal.clone())` per la carica **davanti** alla bocca reale. Il punto include la scala tramite la matrice root, non moltiplicarla due volte. Il megafono è montato sul torace, non tenuto dalle mani. Se il core anima la scala del boss, moltiplicare la scala base1.35 invece di sovrascriverla con1.

## Story API / timeline deterministica

`world.setStoryState('battle'|'core'|'carrying'|'ending', time)` registra `time` solo quando cambia stato; richiami ripetuti a ending non riavviano il finale. Tornare a battle/core/carrying azzera la timeline. Dopo il setter chiamare `update` per applicare la posa.

`update(time,beat,reducedMotion)` ricostruisce tutte le trasformazioni da coordinate originali, senza delta accumulato o random:

- Prima di ending: nave/portale aperti e fermi; slitta a terra; niente accenti restituzione.
- Ending0–1: piccoli punti mint e bordo della sede dell'albero, non un secondo nucleo o un cambio globale d'illuminazione. Oro decorativo sempre presente. Nessuna esposizione animata o nuova luce.
- Fino a2.5s: nave ferma, spazio per il gesto sciarpa/pacco del core.
-2.5–5s: smoothstep ritiro nave e portale, scala locale1→0. Nave trasla verso il portale; reducedMotion mantiene la stessa scala/eventi e limita traslazione a.12m verticale/.3m orizzontale. Portale chiuso/nave invisibile da5s.
-5–8s: unica slitta con le stesse renne si allontana e si riduce fino a0; reducedMotion limita spostamento a.15m verticale/.4m in avanti. Da8s partenza conclusa e nodo invisibile.

Restore terminale: primo `setStoryState('ending', currentTime-8)` + `update(currentTime,...)`; anche `setStoryState('ending',-8); update(0,...)` verificato. Seek indietro ripristina nave, portale e slitta; tornare a battle ripristina completamente la posa iniziale.

## Misure reali e prove

- **Mondo battle:22 call /26.304 triangoli. Picco ending:23 call /28.200 triangoli**, entro35k/25call. Tree accents sono un solo mesh aggiuntivo.
- **Squamakk browser:17 call /11.738 triangoli**, incluso il decal; Node senza canvas16/11.736. Altezza corona2.754m, entro18k/20call.
- Render reale Edge/SwiftShader1440×900, mondo + Squamakk + Santa: **51 call /50.920 triangoli**. Conteggio teorico con tutti presenti anche al picco ending:52call/52.816triangoli, ampio margine per i VFX del core. Nessun claim60fps su hardware utente.
- Test isolato Node/Three PASS: esattamente3luci, collider esatti, nessun anchors aggiuntivo; stati core/carrying non avviano vittoria; setter ripetuto non azzera il timestamp; seek avanti/indietro produce le stesse posizioni/scale/visibilità; resetbattle e restoreterminaleridotto coerenti.
-48pose cast fra0 e6s, moving/attacking alternati, root traslata e yaw ruotato. `floorError` massimo **0m**. Verificato anche il minimo world y dei vertici reali degli stivali **dopo morph**: massimo errore appoggio **0m**. Questo non certifica mani/corona/sciarpa.
- Palette della scena isolata verificata su tutti i materiali: **0 colori base fuori palette**. Console/page Edge nella cattura finale: **0errori**.
- Typecheck iniziale completo PASS; ultimo typecheck completo durante modifiche concorrenti segnala soltanto `src/game.ts(93,22): TS2322 Type '2' is not assignable to type '3'`. Nessun file core modificato qui. Typecheck finale **isolato dei tre nuovi moduli:PASS** con `npx.cmd tsc --ignoreConfig --noEmit --strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution bundler --lib ES2022,DOM src/levels/square.ts src/characters/cast/squamakk.ts src/visual/square-batch.ts`.

## Immagini proprie osservate

Da Edge installato, renderer A (ACES1.12/sRGB), GPU software, pagina isolata intercettata in memoria su server proprio5178 per non subire reload HMR del core. Non sono screenshot di una partita completa né prove dei VFX core.

- `captures/visual-m3/gameplay.png`: piazza/boss/Santa da distanza gameplay.
- `captures/visual-m3/squamakk-close.png`: corona, mantello, emettitore e piedi.
- `captures/visual-m3/parcel-support.png`: ponte frontale libero dalla cupola, supporto connesso alla nave; nessun pacco duplicato.
- `captures/visual-m3/ending-start.png`: accenti piccoli, nave/portale ancora aperti per il gesto del core.
- `captures/visual-m3/sled-departure.png`: slitta e due renne sullo stesso parent durante il decollo.
- `captures/visual-m3/ending-terminal-reduced.png`: nave/portale/slitta chiusi, albero attivo, stessa sera senza full flash.

Correzioni dopo le prime immagini: collegati tronco/chioma, bocca megafono e supporto nave; alzati i piccoli oblò fuori dalla fusoliera; abbassato schienale slitta per leggere meglio le renne. Immagini finali ricontrollate.

## Consiglio per i contatti sciarpa core

Preferire la sciarpa drappeggiata sul **pacco realmente costruito dal core**, non su una posizione di collo inferita dal boss vivo (ha altre dimensioni/scala e cresta). Derivare due punti di appoggio e le superfici top/fronte dalle stesse costanti delle geometrie del pacco; misurare sciarpa→superficie in frame comune e poi lungo normale trasformata, soglia appoggi≤1mm. Fuori dagli appoggi mantenere un piccolo distacco visibile di almeno3mm per evitare facce coplanari/clipping. Le estremità libere non sono contatti. Un eventuale nucleo trasportato resta sospensione magica solidale al player, non presa della mano non misurata. Qui nessuna sciarpa, nessun hook mano fittizio e nessun sign-off sulle superfici finali core.

Restano all'integratore boss/VFX/core/pacco/sciarpa, contatti di quei veri oggetti, LC.selfTest e catture1080integrate, UI/mix, regressioni snapshot, review/fresh-eyes e playthrough. **Nessun SHIP/LANDS dell'atto dichiarato. Ownership visuale M3 libera alla chiusura.**
