# Passo9 — Camera/visuale: pronto per integrazione finale

**Ownership libera alla chiusura. Nessun SHIP del polish.** Modificati soltanto `src/engine/camera.ts`, `src/engine/camera-props.ts`, i tre `src/levels/{courtyard,toystreet,square}.ts`, shooter per metadata muzzle, questo status e immagini proprie `captures/polish-camera/`. Nessuna modifica a Game/UI/input/storage/BossChapter/ranged/contratti/atti/tool/package/snapshot. Nessun nuovo asset, mood, luce, post, agente, worktree, commit, spesa o API.

## API e frame definitivo dei bounds

`src/engine/camera.ts` esporta:

- `resolveGameplayCamera(world,player,yaw,pitch): GameplayCameraResult`, tipo da `camera-contract.ts` del main, Point da math.
- `resetCameraOcclusion(world)`: ripristina riferimenti/materiali originali e invalida memo della posa; chiamare fuori gameplay, override e finale.
- `disposeCameraOcclusion(world)`: reset + dispose **solo** dei materiali clonati dalla camera, niente geometrie/texture/materiali condivisi.
- `CAMERA_RADIUS=.25`.

**`world.cameraOccluders[].bounds` sono WORLD-SPACE, già pronti per `box.distanceToPoint(camera.position)`. Non applicare una seconda volta root.matrixWorld.** Marker esplicito `occluder.root.userData.cameraBoundsSpace === 'world'`. Il getter restituisce gli stessi Box3/array cached: originali locali privati, riproiezione soltanto se cambia la matrice del root. Così anche nave/slitta/portale animati e parent trasformati restano corretti. Per metadata esterni senza marker, il resolver conserva il fallback local-space; mondi legacy senza metadata hanno fallback conservativo senza fade globale.

Il FAIL preliminare main `.13448360373668242` era l'ambiguità local/world sul beacon. Riprodotto alla stessa posa `player(-9.3,1.5), yaw=π/2, pitch=.08, camera(-.8,2.3792749,-.15)`: il volume reale è vicino a(-8,-9), non all'origine. L'API pubblica è stata uniformata a world-space senza spostare geometrie o allentare margini; **tool main passato senza modificarlo**.

## Strategia

Conservata la formula nominale originale: pivot1.7m, boom8.5m, spalla1.65m, look avanti5.2m a quota1.1. Nessuna scrittura di player/yaw/pitch/input o collider/LOS. La camera non ruota90° autonomamente.

- Volumi3D costruiti una sola volta dalla **vera geometria**, clipping dei triangoli a fasce verticali: pareti/tetti/aggetti/camini, ripari, tronco e sezioni di chioma, slitta, nave/portale e beacon. Nessun raycast/scan triangoli nel resolver. Protezione endpoint: volumi espansi di **.25+.02m**, anche se resi traslucidi.
- Se endpoint nominale sicuro, distanza conservata; sfumati soltanto i props specifici lungo camera→avatar (sonde piedi/pivot/testa). Un ostacolo traslucido rimane fisicamente solido per tutti i sistemi del core.
- Se endpoint solido, proiezioni sulle facce più vicine e candidati deterministici di spalla/boom/altezza, senza cambiare yaw logico. Scoring per minimo scostamento; envelope broadphase e pruning prima dei test di visibilità. Avatar intero verificato anche al FOV45 con margine, senza leggere DOM/preferenze: valida la fascia45–75 e aspect almeno4:3; i due aspect richiesti sono16:9.
- Alpha geometrico continuo lungo l'intersezione, non smoothing temporale: da opaco a minimo.16 su.65m di penetrazione della linea nei volumi. Niente blur, camera shake o memoria di animazione; stessa posa produce la stessa alpha.
- Background/foresta batched marcati `cameraNoFade`: solo volumi regionali piccoli per sicurezza dell'endpoint, mai trasparenza dell'intera scena. Caso radio M1 separato per non coinvolgere il background. Nessun fallback nella griglia finale.
- Diagnostica `occluded`: ID unici dei props coinvolti; eventuali casi patologici esplicitati da `fallback:vertical-clearance` / `fallback:opaque-background`, mai nascosti accorciando fino alla testa. `distance` è distanza fisica camera–pivot; `compressed` confronta questa con il boom nominale3D.

## Batching, palette e risorse

Casette/ripari/cancelli/radio M1/M2 separati **per singolo prop**, un draw ciascuno: merge con colori vertex della medesima palette, materiale Standard base crema, roughness.48/metalness0. Colore linear vertex moltiplicato per il base crema ricostruisce quello originale: errore massimo misurato **2.05e-8**, niente default-white/custom shader/texture. Emissivi e cast comuni non compattati/modificati.

Hash SHA256 delle posizioni di tutti i triangoli visibili (ordine normalizzato, quantizzazione1e-5) contro i livelli originali HEAD: **identici nei tre atti**. Collider invariati. Costi world prima/dopo, a pari stato:

| Mondo | Call prima→dopo | Triangoli invariati |
|---|---:|---:|
| M1 |21→19|56.144|
| M2 |23→27|24.988|
| M3 |22→22|26.304|

Clone pigro **una volta per mesh**, solo al primo coinvolgimento. Le pose ripetute usano memo keyed da x/z/yaw/pitch e versione delle matrici/visibilità; nessuna ricostruzione dei bounds se statici. Risultati restituiti con vettori indipendenti (mutarli non corrompe la cache). Invalida correttamente anche con parent trasformato. **Non è smoothing storico.**

Test risorse finale: M1 **11** cloni creati/11disposed, M2 **10/10**, M3 **17/17**; ripristinati tutti i riferimenti e proprietà dei materiali originali, inclusi il materiale vertex condiviso e la palette comune. **0 dispose di geometrie** durante resolve/reset/dispose. Il compattatore iniziale smaltisce solo i merge appena allocati dal proprio Batch esclusivo, mai primitive/attori comuni.

Microbenchmark finale Node separato:50.000 pose identiche in1.421s, **28.4µs/chiamata**;3.000 pose in movimento in3.304s, circa1.10ms/chiamata. Misura locale sotto carico concorrente, **non fps renderer/hardware utente**. Pose identiche non scandiscono bounds/triangoli né creano nuovi materiali.

## Muzzle shooter

`getShooterMuzzleWorld(actor,target?)` nominato e `actor.root.userData.getMuzzleWorld(target?)` restituiscono la vera bocca **world-space** usando gun.matrixWorld. La costante condivisa `(0,.15,1.045)` alimenta sia geometria del ring sia misura; include posizione gun1.05 e sua rotazione, scale/parent una sola volta. Default cast invariato. Il ranged del core ora preferisce il callback (verificato in lettura), mantenendo il proprio sweep root→mouth e collisioni.

48pose con movimento/attacco, root yaw/traslazione e parent affine: errore callback contro centro del ring ricavato dai vertici **2.02e-8m**; hook mani già esistente ancora≤**5.42e-15m**. Non dedotto da floorError.

## Prove numeriche e main integration

Fixture isolata Node senza Game: **2.712 pose**,8yaw e pitch.08/.3/.65, lati/corner di tutti i collider, bordi e anello intorno alla chioma. **8.136 verifiche di FOV45/53/75**, avatar-box intero in quadro, determinismo/reset, input immutato, clearance, matrici e materiali. Tutto PASS.

| Atto | Pose | Distanza minima nuova | Vecchia minima | Clearance minima |
|---|---:|---:|---:|---:|
| M1 |984|6.601m|.695m|.280m|
| M2 |840|6.187m|.695m|.280m|
| M3 |888|5.476m|.695m|.27497m|

Massima frazione verticale testa nella griglia al FOV45:18.27%, niente fallback. Fixture riproducibile locale `C:/Users/rosar/AppData/Local/Temp/opencode/polish-camera-test.mjs`; nessun file temporaneo nel root del progetto.

**Tool main non modificato:** `COMBAT_URL=http://127.0.0.1:5178/ node tools/check-polish-camera.mjs` eseguito, **PASS** in `captures/polish-camera-integration/report.json`:864pose e288viste renderizzate su Game reale, clearance minima28cm, zero errori. Picchi delle viste campionate: M1 **74call/93.314tri**, M2 **110/85.990**, M3 **52/51.000**. I5file camera/livelli nell'hash del report corrispondono al sorgente finale, controllati dopo le prove. Nessuna asserzione su hash Game dopo modifiche altrui.

**Stress GPU M2 conservativo**, scena senza culling con geometrie reali: mondo + Santa +6alieni +5pacchi-wrap +un vero cue RangedSystem +2regali3mesh +blast/ring/vita/lock +cura: **138call/86.494triangoli**, sotto150/150k. È un upper-bound renderizzato source-derived, **non una run o il picco osservato in un playthrough**. Preserva margine anche quando la camera sfuma un prop; nessuna luce/post aggiuntiva.

Typecheck completo finale `npx.cmd tsc --noEmit`: **PASS**.

## Immagini e limite del gate

Immagini proprie osservate in `captures/polish-camera/`, Edge/SwiftShader1920×1080, renderer A, server isolato5178 senza caricare Game per le fixture:

- `before-after-sheet.png`: sinistra algoritmo originale riprodotto su geometria invariata, destra resolver nuovo; tre righe negozio/corner M2 e albero M3.
- `m2-shop-{old,new}.png`: player(10,-1.51),yaw0,pitch.3, distanza **.721→9.016m**.
- `m2-corner-{old,new}.png`: player(9.49,1.5),yawπ/2,pitch.08, **.695→8.685m**.
- `m3-tree-{old,new}.png`: player(6.69,-7.31),yaw0,pitch.3, **1.653→9.016m**.
- `m2-shop-fov45.png`, `m2-shop-fov75.png`: avatar intero, props estranei opachi.
- `m2-peak-source-fixture.png`: stress138call sopra descritto. Console/page:0errori.

Questo non è audit UI/mix/playtest o SHIP finale. Restano al main fullbot/fresh-eyes e audit globale. La segnalazione fullbot BFXRzGPm (5morti, abort gift guard) **non è dichiarata risolta né attribuita al solver**. Nel suo frame finale, yaw.98/pitch.5/player(-6.305,-5.46), la formula originale senza compressione produce camera `(1.67331485,5.77511708,-2.09562901)` e look `(-10.62358633,1.1,-8.35651724)`: coincidono con i valori riportati, con zero occluder. Nessun auto-yaw o boom alternativo in quel frame. Serve il fresh full integrato richiesto dal main, senza alterare difficoltà o allentare test.

**File liberi per main; nessuna ulteriore modifica prevista.** Le tre copie congelate non sono state toccate. Server proprio5178 ancora disponibile; nessuna pubblicazione.
