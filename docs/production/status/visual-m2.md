# Visuale M2 — pronta per integrazione

## Export e ownership

- Creati solo `src/levels/toystreet.ts`, `src/characters/cast/shooter.ts` e questo status. Nessuna modifica a materiali/attori comuni, core, contratti, atti, tool, snapshot o package. Nessun commit, worktree o agente aggiuntivo.
- Livello: `id = 'toystreet'`, `createWorld(scene): CourtyardWorld`, `OBSTACLES`. Root standalone con esattamente tre luci A; nessun NPC/cura nel mondo. Ancoraggi/uscita derivati da `src/acts/toystreet.ts`, quattro AABB copiate esattamente dal piano.
- World: `.anchor === .anchors.workshop`, `.anchors = { workshop, carousel }`, `.setAnchors(disabled, time)`, `.update(time, beat, reducedMotion)`.
- Cast: default `{ id: 'shooter', create: createShooter }`, anche export nominato `createShooter(): VisualActor`. Delega update/floorError al rig alieno base, nasconde solo le braccia della propria istanza e aggiunge nuova presa/cannone giocattolo. Geometrie e materiali condivisi, nessun materiale comune modificato; niente shader/texture nuovi.

## Aspetto e stati

Negozi con tende natalizie rivolte alla via centrale, trenino-riparo rosso con ruote e finestrino a ovest, banco statico di pacchi a est. Giostra grande con pacchi sospesi oltre la recinzione est, non sul percorso. Alberi, colline e skyline fuori dai bounds. Recinzioni e cancelli chiusi evidenti; uscita nord marcata con freccia, M3 non costruito. Il testo esplicito «Fine del secondo segmento» resta responsabilità dell'HUD core: il mondo non introduce canvas text né UI duplicata.

Icone distinte dei beacon: locomotiva e regalo; spegnimento indipendente con spunta oro, anche se l'altra arena è ancora ostile. Nessun grande oggetto solido aggiunto nel corridoio centrale. Chassis dei ripari pieni fino a circa 1.6 m, con dettagli superficiali separati di pochi millimetri/centimetri per evitare z-fighting.

Nave `(0,8,-20)` finché entrambi gli ID locali non sono disabilitati. Quando il set passa a due ID validi, `time` diventa il timestamp iniziale della discesa; chiamate ripetute con gli stessi due ID **non** la riavviano. Cubic smoothstep 8→3 m in 3 s, anche con reducedMotion (nessuno shake/flash/oscillazione aggiuntiva); il portale rimane acceso e immobile. Seek inverso riproducibile. Tornare a meno di due ID azzera la discesa e riporta la nave a8 al successivo update.

**Raccordo reload/debug:** per ripristinare una partita già a3/3, chiamare una prima volta `setAnchors(ids, currentTime - 3)` prima di `update(currentTime,...)`: il setter usa il timestamp ricevuto e non può dedurre se la chiamata rappresenti un'interazione nuova o un caricamento. Per la discesa live passare il tempo reale del secondo E. Non usare il beat da solo per spegnere dispositivi o abbassare la nave.

## Misure e controlli eseguiti

- **Typecheck finale `npx.cmd tsc --noEmit`: PASS.** Una build intermedia era bloccata solo da `src/game.ts(42,26)`, `(89,22)`, `(99,22)`, TS2322 «Type '1' is not assignable to type '2'», mentre il core era in modifica; errori ora risolti dagli altri collaboratori, nessun intervento qui sul core. Build produzione completa non rieseguita dopo quel tentativo.
- Test isolato Node/Three con assert: world sotto budget; ID sconosciuti ignorati, duplicati non contano; Officina spenta non spegne Giostra; nave ferma a8 con un solo ID; quote `[8,5.5,3,8]` ai tempi `[10,11.5,13,10]` dopo doppio spegnimento a10; chiamata ripetuta non azzera inizio; reset ripristina8. Quattro collider esatti verificati.
- Shooter: `floorError() = 0 m` per48 pose fra0 e6s, movimento/attacco. Questa funzione verifica solo i piedi. Le mani hanno ora una misura separata, documentata nel raccordo sotto.
- Budget finale reale, conteggio visibile prima del culling: **mondo 23 call / 24.988 triangoli** (target30k, limite40k/25call). Dispositivi spenti riducono il costo. Shooter browser: **12 call / 8.522 triangoli** incluso decal; alieno base11/7.466, Santa12/12.878.
- Render reale Edge/SwiftShader1440×900 con mondo, Santa e sei NPC (3 shooter +3 melee): **104 call / 85.830 triangoli**. Restano46call /64.170triangoli per VFX/proiettili/UI3D rispetto ai150/150k. Nessuna luce extra per cannone, zero post.
- Palette controllata su tutti i materiali della scena isolata: **0 colori base fuori palette**, incluso il decal ink. Nel primo controllo Edge:0errori console/page. Il test software finale ha renderizzato i nuovi moduli senza errori di shader; cattura finale pulita isolata da HMR.
- Catture proprie osservate direttamente: `C:/Users/rosar/AppData/Local/Temp/opencode/m2-visual-player.png`, `m2-visual-shooter.png`, `m2-visual-cover.png`, `m2-visual-complete.png`. Gameplay con tutti i sei NPC, close-up cannoncino, riparo vicino, dispositivi spenti/nave a3/portale aperto. Corretto dopo la prima cattura uno z-fighting sui dischi delle ruote e sul bordo inferiore del banco; immagini finali ricontrollate. La scena completa finale contiene solo il mondo, non NPC finti ancora vivi.

## Restano all'integratore

Playtest/review M2 e LC.selfTest integrato, catture dei segnali ranged e wrap, test proiettili/collisioni, dimensionamento UI e indicazione esplicita fineM2, restore3/3 col timestamp concordato. Il test isolato non prova60fps su laptop medio né sign-off narrativo/genere. Nessun nuovo mood: sempre snowy-evening A, ACES/esposizione gestite dal core.

Server Vite di verifica separato avviato su **5178** per non contendere la porta5174 del core. Nessun asset o screenshot nel repository fuori ownership.

## Raccordo finale — misura reale presa shooter

Modificati **solo** `src/characters/cast/shooter.ts` e questo status. Disponibili:

- `measureShooterContacts(actor: VisualActor): {name:string,error:number}[]`.
- `actor.root.userData.measureHandContacts()` restituisce gli stessi due risultati, utilizzabile dal selfTest core senza modifiche ai contratti.
- Nomi: `shooter-left-hand-handle`, `shooter-right-hand-handle`. Default `{id:'shooter',create:createShooter}` invariato.

Centri delle due mani `(±.34,.04,.66)`, raggio `.12`, centri handle `(±.2,.04,.66)` e dimensioni `(.04,.2,.18)` sono costanti comuni alla costruzione Batch e alla misura. Nessuna deduzione da floorError. Sfera→AABB nel frame comune del gun dopo round-trip del centro attraverso matrixWorld/inversa; punti di contatto riportati nel mondo e separazione proiettata sulla normale inverse-transpose. Questo evita AABB globali gonfiate dalla rotazione e raggio errato con scala non uniforme/trasformazioni affini comuni. Aggiornate esplicitamente le matrici degli antenati prima della misura. Trasformazioni singolari segnalate con errore, non falso PASS. Nessuna variazione di geometrie/materiali/shader o budget.

Prova isolata Node/Three, **48 pose / 96 contatti**, moving e attacking alternati, root traslata/yaw/scala non uniforme sotto parent traslato/ruotato/scala non uniforme (anche shear affine comune). Hook e funzione nominata confrontati ad ogni posa; entrambi registrano le stesse misure. Print della prova:

```text
test: shooter sphere-AABB world-normal contacts
poses: 48
contacts: 96
maxErrorMeters: 1.0693581056832585e-14
toleranceMeters: 0.001
root: translated + yaw + nonuniform scale
parent: translated + rotated + nonuniform scale (common affine/shear)
hook: root.userData.measureHandContacts agrees with named export
defaultRegistry: unchanged
result: PASS
```

`npx.cmd tsc --noEmit`: **PASS** dopo il raccordo. Nessun browser/nuovo agente avviato per questa prova. SelfTest integrato ancora di proprietà del core; **ownership di shooter e status nuovamente libera** al termine di questo raccordo.
