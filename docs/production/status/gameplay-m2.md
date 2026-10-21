# Gameplay M2 — integrazione pronta, ownership libera

2026-10-21. Solo M2; nessun boss/M3, commit, subagente, worktree o modifica allo snapshot M1. Non sono stati modificati contratti, atti, mondi, shooter/audio condivisi o strumenti dell'integratore.

## File e registri

- `src/registries.ts`: atti, livelli, sistemi e scenari caricati con glob eager e controllo ID unici. Nessun elenco di scenari nuovo nel core.
- `src/characters/index.ts` e wrapper `cast/{santa,alien,drone}.ts`: cast per ID, con `shooter` del builder visuale rilevato automaticamente; fallback alieno solo se quel modulo manca.
- `src/gameplay/types.ts`, `src/gameplay/systems/ranged.ts`: contratto locale dei sistemi e modulo ranged autonomo, configurazione esportata/registrata. Aggiunta di sistemi tramite file con default `{id,config,create}`.
- `src/scenarios/{types,courtyard,toystreet}.ts`: dati dei preset. Conservati gli scenari M1; nuovi street-start/left/right/left-clear/right-clear/one-anchor/one-anchor-right/both-active/both-clear/right-last/left-last/complete.
- `src/game.ts`: raccordo atti, arena progress, slot comune, camera/UI/aiuti e debug. `world` non più readonly; cambio atto rimuove vecchio root/luci, resetta NPC/pacchi/cue/bolts/label e conserva tre luci totali.
- `src/storage.ts`: schema2 e migrazione v1; `texts.ts` dialoghi; `style.css` pannelli senza ombra sfocata; `engine/math.ts` sweep segmento/AABB e segmento/cerchio.

## Flusso e comandi

Nuova partita resta cortile. A M1 completo il cancello nord espone **E · Entra nella via** entro2.2m; transizione ordinaria salva l'ingresso M2. Titolo offre **Prova la via dei giocattoli**, modalità esplicita che NON cancella/sostituisce il salvataggio originale (anche retry mantiene questa modalità).

M2 usa posizioni/ID da ActDefinition: sei difensori già presenti, Officina3ranged e Giostra3melee, entrambe attivabili per vicinanza o regalo efficace. Nessuna invulnerabilità dell'arena inattiva e nessun pop a contatto. E dipende dai soli tre guardiani locali. Salvataggi a neutralizzazione, arena libera, dispositivo e cura. Ordine libero, contatore1→2→3, nessuna ricompensa duplicata.

WASD relativo camera; destro trascinato allinea al+; clic sinistro tira al+, non al cursore; Spazio schiva; E dispositivo/cancello; **H aiuto**; Esc pausa anche con focus sui pulsanti. Preservati MIRATO/HP, mira senza curva quando assist off, avvisi laterali/dietro, distinzione Percorso/mira, trasparenza di Santa durante un wrap occultato. HUD M2 nomina entrambi i lati con distanza, difensori/libera/spento; titolo atto dai dati. Scheda tiro/riparo resta finché un tiro viene fermato/evitato o un tiratore neutralizzato. Aiuti15/30/45s sul clock senza progresso, con direzione/distanza al passo valido e priorità cura; H li ripresenta. Nessun padding o attesa obbligatoria.

Cura unica al centro(0,0), disponibile dopo una liberazione: +2 fino a6, non consumata a vita piena, flag persistito. A3/3 salvataggio immediato, nave8→3 in3s dal secondo E, comandi liberi e fine secondo segmento esplicita. Piazzale/M3 ancora chiuso e spiegato. Restore completo usa timestamp-3; preset review completo timestamp0, quindi seek0/1.5/3 mostra8/5.5/3 senza accumulare simulazione. Il setter viene prima azzerato per non conservare una discesa di un precedente preset.

## Tiro a distanza e correttezza

Configurazione del modulo: wind-up1.2s, lock dopo.2 (normalmente1s bloccato), recovery≥1.2s, velocità **6m/s** secondo richiesta builder, raggio.18m, portata iniziale12m, corsa18m/lifetime3s. Pool3, massimo un colpo pericoloso attivo. Slot committed **globale** include melee/wind-up/bolt anche dopo il wrap del proprietario; rilascio del pericolo lascia.6s prima del nuovo wind-up.

Proiettile mint con contorno ink, y1.2; corridoio largo1.32m, bordo/posa/muzzle/! e cue statico sfx.alien. Direzione immutabile dopo lock. Solo origine in vista, con linea player e camera controllata contro volumi; riposizionamento via grafo attorno a cover. Sweep sceglie il primo impatto con parete espansa o player(.48+.18); cover vince la parità. Un solo danno/attackID, consumo anche con invulnerabilità/schivata. Nessun danno oltre parete né attacco nuovo da fuori camera. Nessun audio nuovo/API.

## Salvataggi / API cambiata

Chiave corrente `ho-ho-ufo.checkpoint.v2`, legacy `ho-ho-ufo.checkpoint.v1` lasciata intatta finché non si sceglie Nuova partita. Continue legge/normalizza legacy e scrive copia v2; Nuova partita elimina esplicitamente entrambe le chiavi.

`Checkpoint` ora richiede `{version:2, chapter, boundary, healed, firstWrapped, disabledAnchors, clearedArenas, activatedArenas, defeatedEnemies}`. `emptyCheckpoint()` e `normalizeCheckpoint(unknown)` esportati. BoundaryM1 invariati; M2 street/street-complete. Validati capitolo/boundary/ID/duplicati/invarianti; unknown/corrupt avvisa senza cancellazione implicita. `storageNotice()` espone il motivo. Test/tool che costruiscono direttamente v1 come tipo Checkpoint vanno aggiornati, NON aggirati.

Retry ripristina capitolo e soli difensori non neutralizzati; conserva clear prima di E, dispositivi e cura; HP6/protezione1.25s, nessun tiro o wind-up vecchio. Preview/debug non scrivono save.

## Debug e diagnostica

API LC precedente conservata, seek solo pose senza far avanzare AI/danni live. `state()` aggiunge chapter/actTitle, arene/ID/HP/tipi, anchorCount/disabled/cleared/activated/defeated, bolts, configurazioni sistemi, committed, timer aiuti e checkpoint schema2. Log lock/release/impatti/causa collider/avoid/hurt/clear/anchor/help/progress.

`LC.state().transitions` è una traccia separata che sopravvive ai reset del log: menu aperto, pulsante azionato (clickDetail distingue mouse/tastiera), new-game, retry, capitolo/checkpoint/HP precedenti. Serve a diagnosticare il ritorno imprevisto al cortile segnalato dall'integratore; **non è una dichiarazione che la causa sia risolta**. Un reload completo Vite ricrea l'istanza: durante le modifiche core non interpretare quel reset come una transizione gameplay provata.

`selfTest` controlla piedi, collisioni/spawn, registri, massimo6NPC, slot incluso bolt, conteggi/invarianti e budget effettivi; ora chiama anche **`root.userData.measureHandContacts()`** dove disponibile (sei misure sui tre shooter, limite1mm). Non inventa misure mani per cast senza hook. Report evidence separa numero attacchi osservati e contatti; log vuoto NON prova timing. `getStats().shipHeight` legge il nodo reale della nave, oppure null, e renderFrame resta reale.

## Evidenze builder

- Typecheck PASS durante implementazione e dopo aggiunta registri/sistemi iniziali. **Ultimi tentativi** `npx.cmd tsc --noEmit` e `npm.cmd run build`: timeout120s senza errori emessi; non contati PASS. Anche ispezione processiCIM è andata in timeout30s: ambiente molto carico. L'integratore ha riportato una propria build valida intermedia, non attribuita alla revisione finale corrente.
- Quindici scenari M1/M2: selfTest PASS, save invariato; massimo campionato105call/85.910triangoli a6NPC (successivo campione106/85.990 con ring protettivo). Tre luci, zero ombre/post. Attacchi assenti dai preset non dichiarati verificati da queste immagini.
- Misure mani integrate sullo start:6contatti, massimo1.78e-15m, PASS.
- Difetto determinismo street-start **riprodotto con esatta sequenza player/diorama/seek del tool**:4pixel differenti, bbox[978,171,987,173], stato/label/DOM identici; crop nell'ombra sfocata CSS sotto pannello. Tolta box-shadow (non allentato il test). Stessa sequenza successiva: PNG byte-identici, boxShadow:none. Il browser ha poi impiegato oltre il timeout a chiudersi; il risultato di confronto era già emesso. Rerun integrato sulla build finale resta opportuno.
- Test controllato del vero `Game.update`/sistema (NON playthrough): lock.21/release1.21, wind-up1.2 e1s bloccato; colpo su trenino termina a z-2.18 senza danno(6HP), variante libera un solo danno(5HP); chiamata reale `Game.dodge` durante arrivo produce hit-avoided/bolt consumato e6HP. Test separato sweep ad alto delta: parete t=.282 prima del corpo t=.534.
- Test controllato aiuti: eventi15/30/45.05s; progresso azzera stage/testo/timer. Ultimo testo45s arricchito con direzione/distanza al passo valido. Discesa vera letta da nodo:8/5.5/3 a seek0/1.5/3.
- Bot input reali: raggiunta/liberata Giostra e spenta per prima in un tentativo, poi morte in Officina (non era stato usato il campanello). Altri tentativi completi sono terminati per timeout del browser; **nessun PASS builder su entrambi gli ordini**, nessuna durata completa inventata. Un secondo bot con lettura dello stato e attesa applicazione camera ha liberato Giostra, ma il processo ha superato180s prima della conclusione; non certificato.
- Ricevuto dall'integratore: unit11+street6+ranged-runtime4PASS, capture/audit1080/software degli altri presetPASS, review visuale isolata provvisoria; Officina-clear/retry/Continue/anchor/retry/Continue già riusciti in una prova. Sono evidenze dell'integratore, non nuove prove builder né sign-off dell'atto.

## Gate ancora all'integrazione

Rerun build finale e suite input in entrambi gli ordini, diagnosi eventuale ritorno COURTYARD, budget nel picco VFX, capture deterministica aggiornata, review gameplay e fresh-eyes. Nessun verdetto SHIP/LANDS o durata/60fps inferito. Nessun M3: dopo verifica si ferma per il playtest utente. Ownership dei file gameplay **libera**.
