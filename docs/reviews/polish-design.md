# Passo9 — DESIGN review lean

2026-10-21. **DESIGN PASS**, nessun blocco di design. Non è SHIP finale: implementazione e gate sotto ancora da verificare. Scritto solo questo file; nessun sorgente modificato, browser/agente avviato o pubblicazione.

## Mandato e memoria

Letti POLISH_PLAN, MINOR di BACKLOG, riepilogo corrente HANDOFF, AGENTS e `src/engine/camera-contract.ts`. L'utente ha approvato l'avventura («mi sembra ok») e autorizzato a proseguire: **non ha espresso fastidio per camera, comandi o durata**. Le priorità seguenti sono scelte autonome sui difetti già documentati, non feedback attribuitogli retroattivamente.

Verifica SHA256 read-only contro i tre manifest: **M1 27/27, M2 27/27, RC D86qgQyq 27/27 intatti**, nessuna differenza. Restano immutabili `snapshots/m1-slice/`5176, `snapshots/m2-street/`5177 e `snapshots/release-candidate/`5179; nessuna rigenerazione/sovrascrittura. Nuova polished-1/5181 solo dopo gate, con approvazione utente prima di chiudere9. Il titolo storico «passo9 non avviato» in HANDOFF non prevale sulla richiesta attuale «procedi» e sul piano appena scritto.

## Priorità e confini

1. **P1 camera e primo input:** riprodurre M2-F1 (negozio/riparo destro, PNG019) e M3-F1 (tronco/fronde/quadro finale); migliorare visibilità senza cambiare solidi, percorsi o verso dei comandi. Preservare il fix frame0: nessun primo clic/E perso dopo ripresa.
2. **P1 chiarezza:** E-range dinamico e preferenza locale ragionevole, assistenza dichiarata, muzzle M2 sulla vera bocca con sweep conservato. Regali, danno, pattern/lock/finestre/checkpoint restano invariati.
3. **P2 accessibilità desktop:** sette azioni tastiera, sensibilità, invertY, FOV; opzioni esistenti davvero provate e testi aggiornati. Nessun gamepad/touch, pointer-lock obbligatorio o nuova modalità di mira.
4. **P2 qualità misurata:** budget/resource lifecycle/mix e audit dei casi peggiori, non nuovo mood, storia, voci o asset. Nessun filler o gonfiaggio degli HP per ottenere minutaggio.

M1-F3/F4 (marker e pannelli) restano rifiniture circoscritte: separare etichette e ridurre ridondanze, non rimpicciolire testi sotto soglia. Il vecchio ritornoCOURTYARD non riprodotto non autorizza refactor della progressione. Nessuna spesa, API audio, pubblicazione o requisito aggiuntivo.

## Contratto camera e ownership

Due collaboratori persistenti già previsti, non un nuovo team: **camera/visuale** possiede `src/engine/camera.ts` e helper, metadata/strutture nei tre livelli, shooter solo muzzle metadata; **UI/gameplay** possiede Game/input/storage/CSS/testi/BossChapter/ranged. Main gestisce contratti/test/docs/freeze. Non scrivere in parallelo file altrui.

`GameplayCameraResult` in `src/engine/camera-contract.ts` è già `{position,look,distance,compressed,occluded}`. `resolveGameplayCamera(world,player,yaw,pitch)` deve essere puro rispetto a player/input/physics, con risultato geometrico deterministico; le eventuali modifiche visuali degli occluder sono locali e reversibili. `world.cameraOccluders?: {id,root,bounds:Box3[]}[]` è metadata **opzionale**: assenza non rompe vecchi mondi o snapshot.

Precisare prima dell'integrazione il frame dei Box3: raccomandati **bounds locali al root dell'occluder**, trasformati in world con la matrice attuale; non mischiare AABB locali/world. Per oggetti statici cache una volta, per nodi animati aggiornare la trasformazione senza ricostruire geometrie/materiali. `occluded` contiene ID unici coinvolti nel rimedio visuale; `compressed` segnala boom accorciato rispetto alla posa desiderata, non genericamente un oggetto vicino. `distance` è la distanza fisica camera–pivot adottato, non un coefficiente 2D.

- Preferire boom/spalla/pivot e volumi3D coerenti: tetti e fronde non possono essere muri infiniti sul piano. Non mettere la camera dentro un solido o ridurre arbitrariamente il suo near plane per nascondere il clipping.
- **Yaw logico/input non modificato dal resolver.** Evitare orbite automatiche che facciano andare W di lato o indietro rispetto alla visuale percepita. Piccoli offset geometrici ammessi, ma nessun cambio silenzioso della base WASD. Nessuna camera che gira per risolvere un attacco al posto del giocatore.
- Se lo spazio non consente una distanza leggibile, fallback deterministico su occluder **locale**: materiali clonati soltanto dei mesh interessati, ripristino di opacity/transparent/depthWrite originali, nessuna trasparenza di tutta la mappa o di tutti i mesh dello stesso colore. Il corpo di Santa e la sua gestione wrap restano indipendenti.
- Se un grande mesh batched contiene più edifici, separare il solo oggetto occludente nella costruzione del livello; non rendere trasparente l'intero batch condiviso. Contabilizzare le draw call aggiunte, non presumere costo nullo.
- Camera visibilità≠collisioni di gioco: cover resa traslucida continua a fermare corpi/regali/bolts e non autorizza MIRATO o acquisizione AI attraverso pareti. Non spostare AABB per fare spazio alla camera.
- Chiamare `resetCameraOcclusion(world)` passando a diorama/face/override/camera finale o lasciando l'atto; `disposeCameraOcclusion(world)` al rilascio effettivo, **solo risorse proprie**. Non disporre geometrie/materiali/texture condivisi. Cache per mondo, zero cloni per frame; smaltimento verificato, non assunto.

Nessun FOV nella firma attuale del resolver: geometria3D conservativa valida45–75 o raccordo esplicito col main, senza letture nascoste di DOM/localStorage. FOV/pannelli non devono cambiare la fisica o i timing boss. Le inquadrature finali possono restare cinematografiche con FOV proprio, purché l'opzione sia descritta come **FOV gameplay** e reducedMotion sia rispettato.

## Controlli e preferenze: criteri di accettazione

- Sette azioni: avanti/indietro/sinistra/destra/schivata/interazione/aiuto. Default WASD/Spazio/E/H, sinistro regalo e destro trascinato conservati. Schema checkpoint3 invariato; estendere solo preferenze con fallback per dati vecchi, tipi errati/NaN/valori fuori range/storage negato.
- Sensibilità positiva, default equivalente attuale; proposta iniziale **.25–3×, default1×**. Inversione verticale defaultoff, applicata una volta soltanto. FOV gameplay **45–75°, default53°**, aggiornato con resize/projection e mantenuto dopo retry/Continua. Non cambiare cadenza, velocità o portata dei regali per compensare il FOV.
- Remap: acquisizione esplicita in menu, nessun tiro/movimento durante la cattura, conflitto spiegato **senza perdere il vecchio binding**. Rifiutare Esc e combinazioni browser/OS riservate; evitare swap silenziosi. Distinguere codice fisico memorizzato da etichetta leggibile del tasto, soprattutto su layout diversi da QWERTY.
- **Esc sempre sicuro e non rimappabile:** in acquisizione annulla la cattura senza assegnazione; fuori acquisizione pausa/riprende come già previsto, anche su button/input. Non far chiudere la pagina o intrappolare il focus. Reset predefiniti riguarda preferenze, **mai cancella il salvataggio o avvia Nuova partita**.
- Testi di tutorial, how-to, HUD, hint15/30/45, menu e prompt E devono mostrare i **binding effettivi**, non vecchie stringhe Spazio/E/H. I dialoghi narrativi restano stabili; separare testo narrativo e comandi tecnici dove serve.
- Input rimane in coda fino al primo update reale dopo resume; remap/pause/blur svuotano gli stati premuti obsoleti senza perdere la successiva azione valida. Enter/Spazio su menu non devono attivare accidentalmente una Nuova partita dopo un input di gameplay pendente.

## Chiarezza: minime correzioni richieste

- **Assistenza:** «Aggancio assistito» sul bersaglio effettivamente aiutato; tiro libero al+ quando off, senza curva o snap nascosti. Marker di navigazione sempre distinto, margine/target locale visibili; niente pretesa che MIRATO coincida geometricamente col+ quando l'assistenza aggancia lateralmente.
- **E-range:** ricalcolare distanza/condizione quando il player si muove; appena in portata togliere il vecchio rifiuto e mostrare il prompt valido. Nei pareggi preferire il dispositivo locale pronto, ma mai spegnere quello lontano: distanza/linea libera/guardiani restano controlli obbligatori. Un feedback vecchio non deve cancellare una nuova istruzione utile.
- **Muzzle M2:** usare metadata della vera bocca nello spazio dell'attore, scala applicata una sola volta; cue/bolt coerenti con arma. Sweep **root→muzzle** prima della traiettoria, impatto se la canna entra/sporge oltre cover. Non far partire colpi dall'altro lato del riparo. Velocità, range, wind-up, lock e danno invariati.

## Gate verificabili prima del sign-off polish

| Area | Evidenza necessaria |
|---|---|
| Fonti/consegna | Hash81file M1/M2/RC ancora identici; build/source manifest univoco condiviso fra report/capture/bot. Nuova milestone separata, nessun overwrite5179 |
| Camera numerica | Griglia di player/yaw/pitch presso negozi, ripari, tronco/fronde e bounds in tutti gli atti; position/look finiti, clearance rispetto ai volumi, distanza leggibile o fallback esplicito, nessuna mutazione player/yaw/input. Casi FOV45/53/75 e aspect1280×720/1920×1080 |
| Camera visiva | Prima/dopo delle pose MINOR riproducibili, gameplay+vicino, bersaglio/avatar leggibili; niente nuova occlusione di telegraph, volto o nucleo. Trasparenza di un singolo prop, materiali degli altri invariati; reset fra viste/atti e finale/reducedMotion |
| Input/accessibilità | Tutte7azioni rimappate e funzionanti; conflitto/annullo/reset/default/persistenza; sensibilità/invertY/FOV limiti+reload; istruzioni aggiornate. Primo clic/E post-frame0, Esc su menu e cattura, focus tastiera, tab/blur/ripresa senza click distruttivi |
| Gameplay preservato | M1/M2/M3 timing/danni/windowID/save3 e ordine E invariati; tiro su cover dopo nuova bocca, assist off libero; nessun doppio pickup o segmento perso dopo retry/Continua |
| UI/audio | Audit1080, contrasto≥4.5/cap-height≥24px, PNG deuteranopia e segnali forma/testo; pannelli/marker non coprono minacce. Volumi reali e pausa/tab su mixer statico, non chiamare «mix ascoltato» un test muto |
| Budget/risorse | ≤150call/150ktri e limiti luci/post nei3atti con cloni/VFX/angoli peggiori; software mirato, determinismo e0errori. Confronto memoria/numero risorse dopo warm-up e ripetuti retry/replay/cambio atto: plateau misurato, non rimozione indiscriminata di cache condivise |
| Avventura completa | Fullbot da Nuova partita→finale con input reali e nuovi default; opzioni nondefault provate separatamente. Boss pattern finale almeno una volta in tempo reale, non solo con pause fra ogni attacco |
| Nuovo fresh-eyes | **Persona/agente realmente nuovo alla storia**, solo UI e Nuova partita, niente menu capitoli/preview, docs/LC/coordinate o coaching. Completa M1→M2→M3→nucleo→albero→sciarpa/portale/slitta. Pause reali per latenza dichiarate; correggere e retestare eventuali MAJOR, senza ribattezzare il retest un primo impatto |

Il bot precedente125.645s è un dato tecnico con retry, **non durata umana** e non base per moltiplicazioni inventate. Riportare tempi bot e umani separati, se questi ultimi esistono; nessuna attesa aggiunta per raggiungere10–15minuti. Preservare audio gratuito e mood A, senza dedurre60fps dal rendering software.

## Criterio conclusivo

Design approvato per questo perimetro: le insidie sopra sono condizioni di costruzione/test, non difetti già osservati nella futura versione. Un MAJOR futuro richiede prova concreta (camera intrappolata/bersaglio invisibile, input irrecuperabile, save perso, attacco occultato), non la mera esistenza di un MINOR storico o di un test ancora in corso. Dopo gate e review combinata, congelare una **nuova** polished-1 e farla provare all'utente; nessun SHIP finale, chiusura passo9 o consenso alla pubblicazione è inferito da questo DESIGN PASS.
