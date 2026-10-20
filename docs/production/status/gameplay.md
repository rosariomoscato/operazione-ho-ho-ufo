# Gameplay — consegna M1

Implementato nei soli file assegnati: `src/main.ts`, `src/game.ts`, `src/input.ts`, `src/storage.ts`, `src/style.css`, `src/engine/math.ts`. Nessun commit, subagente, modifica ai contratti, al cast, al mondo o all'audio.

## Avvio e contratto

- `npm.cmd run dev`, `http://127.0.0.1:5174/`. HTML deve avere `#app` e importare `/src/main.ts`.
- `main.ts` avvia `new Game(app)`; `game.ts` esporta `Game`.
- Registro automatico `import.meta.glob('./levels/*.ts', { eager:true })`: include moduli con `createWorld`, ID dal nome file oppure export `id`; rifiuta duplicati e assenza di `courtyard`.
- Dipendenze esterne: `createSanta/createAlien/createDrone`, `createWorld` dal registro e `createGameAudio`; dopo raccordo integrazione riusato anche `toyMaterial` da `visual/style` al posto del clone locale. Nessuna bocca/lip-sync.
- `engine/math.ts`: `blocked`, `move`, `lineClear`, `nextWaypoint`, `distance`, `clamp`, tipo `Point`; funzioni pure, nessuna dipendenza browser.

## Partita

Nuova partita resetta il salvataggio solo al clic. Continua controlla schema/versione. Intro saltabile da pulsante, Invio o Spazio; tutorial accetta schivata prima o dopo il drone. Poi 1+2+3 soldati, checkpoint A/B/C, campanello dopo B, E entro 2,2 m solo dopo tutti e sei. Fine a **1/3**, niente boss o mondo già salvato; esplorazione libera e replay esplicito.

WASD relativo alla camera; **tasto destro trascinato** per guardare; clic sinistro regalo; Spazio schivata; E dispositivo; Esc pausa. Nessun pointer lock richiesto. I pannelli e i pulsanti si usano da tastiera. Pausa: Riprendi, Ricomincia checkpoint, Titolo. Tab nascosta sospende clock/input/audio.

Regali infiniti, CD .55 s, rimbalzo e scoppio entro .85 s, area 2 m e linea di vista verificata per ogni bersaglio; mai danno oltre una casetta. Mira assistita volutamente indulgente (raggio .5 nello spazio proiettato, entro 12 m e nello schermo), disattivabile. Cerchi .48/.42 contro AABB con substep, grafo di visibilità per percorsi attorno alle casette. FOV53 con spalla e boom camera accorciato contro i collider; camera può superare il recinto basso senza accorciarsi inutilmente alla partenza.

Salute 6; soldato 2 colpi. Un solo wind-up/attacco impegnato; wind-up1 s, lock dopo .2 s, settore numerico frontale25°, segnale più ampio38°, reach2.68 m comprensivo del raggio player, recovery≥1.2 s. Inizio attacco entro2.6 m, così un bersaglio immobile può essere effettivamente colpito. Primo regalo interrompe il wind-up, senza cancellare una recovery già in corso. Danno una volta per attackID, protezione danno1.25 s. Pacco attorno al corpo con testa/zampe visibili, oscillazione locale soppressa da riduzione movimento e sparizione; prima gag1.4 s senza fermare la partita.

Audio statico sbloccato dal gesto, mixer e pausa collegati; checkpoint sonoro sul clock di simulazione (dopo1.5 s per non sovrapporlo allo spegnimento ancoraggio). Errori storage e audio non bloccanti.

## Debug

`window.LC`: `ready`, `duration:6` (**loop di revisione, non durata della partita**), viste `player/diorama/face`, `setView`, `seek`, `play`, `pause`, `renderNow`, `getStats`, `selfTest`, `visualMetadata`, `goto`, `camera`, `state`.

Scenari: `intro`, `training`, `battle`, `battle-a`, `first-wrap`, `battle-b`, `battle-c`, `anchor`, `complete`. `goto` sospende e abilita review senza scrivere save; `seek` cambia pose/tempo di revisione senza simulare danni, AI o progressione; `play` abilita la simulazione. `first-wrap` presenta direttamente il pacco a t0–1.4, non un combattimento precalcolato. `camera([x,y,z],[x,y,z])` consente una ripresa ravvicinata della gag. `face` guarda il viso di Babbo e nasconde HUD per la cattura.

`state()` è serializzabile: beat, gruppo, player/camera, flag tutorial/cura, nemici con HP/stato/attackID/direzione, pending, neutralizzati, checkpoint, esito storage, log con timestamp. `selfTest` misura contatti piedi tramite gli attori, penetrazioni, regressioni sweep/raggi, unicità registro, attacchi contemporanei, tempi presenti nel log, duplicazioni danno e budget renderer. **Non dichiara verificati i contatti mani**, non esposti dal contratto VisualActor; non finge FPS o prove di attacchi assenti dal log. Metadata restituisce palette e colori materiali effettivamente attraversati nella scena. Solo mood `snowy-evening`.

## Prove eseguite

- `npx.cmd tsc --noEmit`: PASS.
- `npm.cmd run build`: PASS. Rimane il warning non bloccante sul chunk Three.js539 kB minificato; nessuna modifica config da parte mia.
- Browser Edge headless isolato 1920×1080: **partita completa con input reali, senza goto**, tutorial con schivata prima del colpo, gruppiA/B/C, E e salvataggio complete; zero pageerror, 6/6HP, sei neutralizzati. Run ottimizzato circa **16 secondi di simulazione**, E a15.05 s: NON prova di durata da primo giocatore, né di cinque minuti. Il bot conosce stati/coordinate tramite `LC.state()` e usa trascinamenti/clic/tasti: non è un playtester a occhi nuovi.
- Continua dopo reload per A/B/C/anchor/complete: gruppi e HP coerenti; ID [1], [2,3], [4,5,6], nessun nemico già completato ricreato; flag cura consumata conservato.
- Pausa: tempo prima/dopo400 ms identico. `goto`/`seek` su tutti gli scenari non alterano il valore salvato.
- Storage `setItem` forzato a errore: nuova partita funziona, `storageAvailable:false`, avviso visibile.
- Mischia A lasciando fermo il player: wind-up1.0003 s, lock a.2, recovery1.2004 s; HP6→5→4 con due attackID distinti, nessun danno duplicato. `selfTest` PASS.
- 16 catture degli otto scenari in viste player/face, unico mood; massimi campionati **67 call / 91.528 triangoli**, 3 luci, 0 ombre, 0 post. Catture di completamento, combattimentoC e gag guardate; corretti camera viso rivolta al retro, pillola hint vuota nei preset e testa del rettiliano nascosta nel pacco.
- Catture temporanee in `C:/Users/rosar/AppData/Local/Temp/opencode/gameplay-*.png`; l'integratore deve produrre/conservare prove permanenti e audit definitivi con i propri strumenti. Le prime catture prima delle correzioni sono storiche, non golden aggiornate.

## Caveat per l'integratore / review

- Non attribuire approvazione SHIP/LANDS/ON TRACK o durata4–5 minuti: review e playtest indipendenti restano necessari.
- Il run ottimizzato è molto breve; nessun padding/ondata aggiuntiva introdotto per fare minutaggio.
- Intro testuale con nave già presente, non una nuova cinematica del furto. Nessun mood alternativo inventato.
- Audit automatici contrasto/cap-height/lampeggi, GPU software e contatti mani da fare tramite integratore/cast. Font nominale36px a1920×1080, pannelli opachi, nessun blur/shake/flash globale.
- Il gate del telegraph utilizza un settore geometrico pieno e simbolo `!` sopra la testa; una review può richiedere bordo/arma più espressivi. Nessun verdetto visuale è implicito nel pass dei test numerici.

## Raccordo finale richiesto dall'integratore

- `Game.frame` continua a programmare RAF ma esce immediatamente se titolo/pausa/review/tab nascosta, senza pose/HUD/render GPU. Menu, resize e API debug ridisegnano una volta sincronicamente; nessun titolo nero. `getStats().renderFrame` espone il contatore reale del renderer per verificarlo.
- Smoke test350 ms: titolo frame3→3, pausa23→23, review30→30; nessun pageerror. Nessun secondo browser/tool dell'integratore alterato.
- Esc gestito **prima** del filtro dei target button/input: ripresa con focus su Riprendi verificata.
- Tolto il minimo `.6 m` per l'attacco; separazione circolare player/soldato `.48+.42=.9 m` con rispetto AABB. Il settore di un nemico già impegnato non viene spostato per risolvere la sovrapposizione; può cedere solo un corpo in approach.
- Build rieseguita dopo queste correzioni: PASS, solo warning chunkThree539kB. SelfTestC nuovamente PASS,67call/91.528triangoli. Ownership dei file gameplay ora libera per l'integratore.
