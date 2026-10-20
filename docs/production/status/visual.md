# Visuale M1 — implementato, integrazione/review finale da eseguire

## File ed export

- `src/visual/style.ts`: `palette`, `toyMaterial`, `materials`, `Batch`, `addLighting`, `contactShadow`. MeshStandardMaterial identico ad A: roughness .48, metalness 0, flatShading false; glow mint/emissive .4. Materiali e primitive condivisi; `mergeGeometries` per materiale, senza gruppi multi-materiale. Canvas radiale di contatto condiviso, y=.004, depthWrite false. Nessuna texture/modello scaricato.
- `src/visual/actors.ts`: `createSanta():VisualActor`, `createAlien():VisualActor`, `createDrone():VisualActor`, `createGift():Group`. Root locali y=0, fronte locale +Z. Root gameplay gestisce direzione/posizione. `update(time,moving,attacking)` deterministico; testa/braccia articolate e lancio con mani protese. Nessun regalo permanentemente in mano: il proiettile appartiene al gameplay. Stivali in morph alternati, una suola sempre in appoggio; geometria morph condivisa, pesi indipendenti per attore. Nessun labiale.
- `src/levels/courtyard.ts`: `createWorld(scene):CourtyardWorld`, `ANCHORS` (Vector3), `OBSTACLES`. Quattro AABB esatte del layout; copie restituite al gameplay. Il mondo aggiunge root alla scena e restituisce anchor Group a `(0,0,-9)`.

## Scena

Pavimento neve 32x30 con superficie y=0, basamento, laboratorio ovest, magazzino est, due casse corrispondenti ai collider. Fasce di neve sui tetti, finestre incrociate, insegne geometriche martello/pacco. Abeti ripetuti uniti per materiale, collinette esterne ai bordi, recinzione continua e cancello visibilmente chiuso verso la prossima area. Radio/cappello/occhialoni di Briciola a (-4,8), piccoli e non bersagliabili; nessun nuovo collider nel corridoio centrale.

Ancora: piedistallo basso, simbolo geometrico aperto ben visibile senza colonna piena che nasconda nemici. In `complete` simbolo spento sostituito da spunta oro. Nessuna discesa della nave o chiusura del portale: nave sempre y=8, portale decorativo y=10, anche a 1/3. Nessun mood aggiuntivo: sempre snowy-evening A, tre luci (hemi/key/rim), zero ombre dinamiche, zero post. ACES/output/esposizione rimangono al core renderer. Riduzione movimento sopprime il piccolo galleggiamento del simbolo.

## Misure reali

- `npx.cmd tsc --noEmit`: PASS ultima esecuzione. Una prima esecuzione rilevava solo `src/game.ts` non ancora presente, ora integrato dagli altri collaboratori.
- Verifica geometrica Node/Three: Santa altezza 2.970 m, alieno 1.990 m, drone 1.918 m; `floorError()` 0 m per tutti. Quattro collider e tre luci verificati programmaticamente.
- Budget geometrico completo, prima del frustum culling: mondo 22 call / 56.336 triangoli; Santa 12 / 12.878; alieno 11 / 7.466; drone 6 / 1.646, inclusi decal di contatto browser. Regalo 2 / 804. Cortile + Santa + 3 alieni + drone: **73 call / 93.258 triangoli**, lasciando 77 call e circa 56k triangoli ai VFX/UI 3D. Il costo degli attori è circa 10 call più il decal.
- Edge headless/SwiftShader 1440x900, render reale con cortile + Santa + tre alieni: **66 call / 91.420 triangoli** dopo culling (prima dell'aggiunta dei morph, che non aggiungono geometria o call).
- Dopo i morph: 48 render deterministici campionati fra 0 e 6 s con Santa + tre alieni + drone in camminata/attacco, `complete` e riduzione movimento; errore massimo delle suole **0 m**, anchor `[0,0,-9]`, ultimo render 72 call / 92.826 triangoli dopo culling. La successiva screenshot di questa seconda prova è scaduta dopo 30 s in SwiftShader: nessuna cattura post-morph dichiarata acquisita.
- Catture osservate direttamente: composizione gameplay con corridoio libero e tutti e tre i nemici leggibili; close-up Santa con silhouette/materiali A, nessun piede sospeso o cappello che attraversa il bordo. Screenshot di lavoro fuori dal repository: `C:/Users/rosar/AppData/Local/Temp/opencode/courtyard-visual-gameplay.png` e `courtyard-visual-close.png`. Possono essere acquisiti nelle prove permanenti dall'integratore; non spostati qui per rispettare la proprietà dei file.
- Il browser desktop di questa sessione non è connesso: la verifica è stata eseguita tramite playwright-core locale ed Edge installato, senza download.

## Limiti / raccordo

- Non dichiarato superato il gate integrato `LC.selfTest`, performance 1080p, gag, UI, mood di combattimento o completamento: le catture qui sono isolate per il dominio visuale, non un playtest del gameplay. Servono catture integrate di tutti i beat, GPU software, review e occhi nuovi dell'integratore.
- I morph muovono solo gli stivali; gambe corte restano nascoste nel volume del cappotto. È una camminata stilizzata, non un sistema IK locomotorio.
- Server Vite avviato tramite `npm.cmd run dev` sulla porta 5174 per il controllo visuale; nessun package/config/main/contratto modificato.
