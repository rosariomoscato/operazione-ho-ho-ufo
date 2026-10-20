# Piano tecnico — M1, il cortile

Scelte utente: primo cortile, review snella, TypeScript + Vite + Three.js. Audio approvato; nessun doppiaggio/gamepad/mobile richiesto. Riferimenti obbligatori: AGENTS, GAME_DESIGN, DESIGN_SYSTEM, SCRIPT, AUDIO e LEVEL_LAYOUT.

## Architettura e proprietà

- `src/contracts.ts`: contratti condivisi, modificati solo dall'integratore.
- `src/levels/courtyard.ts`, `src/visual/*.ts`: collaboratore visuale, mondo/cast costruiti in codice dallo stile A; layout definito in LEVEL_LAYOUT.
- `src/audio.ts`: collaboratore audio; file WAV esistenti, nessuna generazione o API browser.
- `src/game.ts`, `src/main.ts`, `src/input.ts`, `src/storage.ts`, `src/style.css`: collaboratore gameplay/fondazione. UI e integrazione, nessuna modifica ai moduli degli altri.
- Integratore: configurazione, HTML, contratti, strumenti, prove end-to-end, raccordo e correzioni dopo review.
- `docs/production/status/`: stato per dominio. Reviewer combinato scrive in `docs/reviews/` e specifiche in `docs/set-pieces/`. Playtester non legge docs o codice, usa solo il browser.

Usare `import.meta.glob` per registri di livelli e futuri sistemi aggiuntivi, verificando gli ID unici in selfTest. Un solo livello adesso; non costruire l'intero gioco.

## Sistemi e contratti

Three.js con renderer sRGB/ACES e palette A. Il mondo restituisce radice, ostacoli AABB semplificati, ancoraggio e aggiornamento visivo. Il cast restituisce gruppi articolati leggeri e posa deterministica. Geometrie statiche raggruppate per materiale, ripetizioni instanziate, pochi materiali condivisi. Massimo 150 call/150k triangoli, tre luci, nessuna ombra dinamica, zero post.

Un clock di simulazione in secondi con delta limitato e sospensione in pausa. Nessun input musicale; l'audio non governa attacchi o movimento. Random deterministico se necessario, niente casualità nei jump di revisione.

Movimento sul piano con cerchio/capsula di raggio .48 m contro AABB espanse; bordi invalicabili. Collisione swept/substep e scivolamento; schivata non attraversa i muri. Camera terza persona FOV53, mouse per ruotare, offset spalla, correzione distanza se interseca colliders. Preferire mouse relativo con trascinamento come fallback senza obbligare pointer lock. WASD relativo alla camera, clic sinistro lancia, Spazio schiva, E interagisce, Esc pausa. Feedback anche per schivata in recupero e ancoraggio protetto/fuori portata.

Lancio pacchi con munizioni infinite, cadenza limitata, traiettoria visibile, rimbalzo a terra e danno/area leggibile. Mira assistita predefinita, opzionalmente disattivabile. Nemici limitati simultaneamente, avviso visivo prima dell'attacco e tempi di recupero, breve invulnerabilità al colpo. Alieni sconfitti impacchettati/teletrasportati, nessun cadavere o gore.

Beat graph: `intro` → `training` → `battle` → `anchor` → `complete`. Enter condition univoca, obiettivo sempre persistente. Tutorial riconosce azioni già fatte. Intro saltabile; dialoghi con nome a testo, mai bloccare i comandi durante il combattimento. Un solo ancoraggio disattivabile in questo segmento: finale **1/3**, non mondo già salvato. Gli altri due e il boss sono nei passi futuri.

Salvataggio locale versionato: checkpoint tutorial e pre-scontro, fine ancoraggio; Continue solo se save valido. Errori/quota/storage vietato non bloccano il gioco. Sconfitta ripristina salute e checkpoint senza perdita di obiettivi completati. Titolo Nuova partita/Continua, pausa Riprendi/Ricomincia checkpoint/Torna al titolo, finale segmento con Rigioca. Reset nuova partita elimina progresso precedente solo al clic esplicito.

Audio HTMLAudio, indice locale `/audio/index.json`; bus volume master/music/effects, tracce statiche precaricate, riuso limitato degli effetti, errori audio non bloccanti. In pausa/tab nascosta tutti i suoni sono sospesi. Nessun ducking vocale perché non ci sono voci. Non servono nuove generazioni, budget **0 crediti**.

Accessibilità: UI italiana crema su pannelli opachi, contrasto≥4.5 e cap-height≥24px a1080p, segnali geometrici oltre ai colori, volume regolabile, mira assistita, riduzione movimento/lampeggi; zero flash a pieno schermo. Dialoghi leggibili anche con audio spento. Focus/menu tastiera.

## Debug API e prove

`window.LC`: ready, duration, views, setView, seek, play, pause, renderNow, getStats, selfTest, goto(beat), camera(pos,look), state(). `goto` prepara stato coerente e non altera i salvataggi; `seek` determina pose per screenshot senza far avanzare il combattimento live. `state` riporta fase, player, nemici, checkpoint, obiettivo e log eventi; non espone chiavi o dati personali.

Gate M1: TypeScript/build ok; flusso completo con controlli reali; suite snapshot per intro/training/battle/anchor/complete e mood combat/sera/completamento; contacts/collisioni/registri/budget misurati, 0 errori console; prova GPU software; nessun BLOCKER/MAJOR dopo review combinata (SHIP/LANDS/ON TRACK); playtester indipendente completa il segmento senza debug o file.

L'obiettivo è circa cinque minuti per il primo giocatore, non cinque minuti di attesa forzata. Misurare durata reale e dichiararla; se il prototipo risulta più breve non inventare una durata o aggiungere ondate vuote per raggiungere un numero.

## Milestone

- M0: struttura, contratti, registri, collisioni/input/camera, stile e audio portati.
- M1: cortile completo e verificato con primo ancoraggio; segue playtest utente (passo7).
- M2: via dei giocattoli e due ancoraggi, solo passo8.
- M3: piazza e Squamakk, finale; poi polish (passo9).
- Deploy solo passo10 con permesso esplicito.

Nessun gate è già superato solo perché pianificato; riportare evidenze reali in HANDOFF.
