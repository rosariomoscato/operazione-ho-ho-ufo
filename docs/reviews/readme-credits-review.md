# README, credits e MIT — review mirata

2026-10-21 · **PASS mirato** sulla build locale **CM79yoZg**. Nessun BLOCKER/MAJOR o nuovo MINOR confermato nel perimetro richiesto. Non è una nuova certificazione full-game né una verifica del sito Vercel aggiornato.

Ownership rispettata: creato solo questo report. Nessuna modifica a sorgenti, README, tool, vecchie review, HANDOFF o snapshot; nessun nuovo asset, browser, subagente, push o deployment. Letti README, credits condivisi, diff Game/BossChapter/input/CSS/test, tool e report UI, DESIGN_SYSTEM, package e DEPLOYMENT. Guardati direttamente hero e tutti i cinque PNG title720/1080, ending720/1080, pause1080. Non ripetuti fullstory/fullbot: il diff applicativo è circoscritto all'attribuzione e al filtro input sui link.

## README — accuratezza e scope

- Descrizione, tre atti, sei difensori M1, due arene M2 in ordine libero, tre ancoraggi complessivi, boss e restituzione finale coerenti con il gioco approvato. Nessuna nuova promessa narrativa o meccanica.
- Stack TypeScript/Three.js/Vite, UI HTML/CSS, output statico `dist`, audio HTMLAudio e11WAV coerenti. Contati11file WAV; Node locale verificato **22.23.1**. Comandi npm, porte dev5174/preview5175 e quattro snapshot concordano con package.json. Nessuna richiesta di chiavi/backend o supporto mobile/gamepad inventato.
- Sette azioni rimappabili, mouse destro trascinato, assistenza dichiarata, FOV45–75/default53 e preferenze corrispondono al sorgente e alle prove precedenti; durata10–15min esplicitamente obiettivo, non misura garantita. Nessun claim60fps.
- Progressi/localStorage per origine, Continua da checkpoint, anteprime separate e reset progressi distinto dalle preferenze spiegati correttamente. Non viene promessa assenza di log dell'hosting o anonimato assoluto.
- Repository dichiarato **privato**, clone richiede accesso; link relativi a screenshot/documenti validi nel repository. Hero `docs/images/gameplay.png` presente, **1920×1080**, alt text e didascalia pertinenti: vero frame M2, non concept art o screenshot della vecchia milestone.
- URL live e push automatico da **master** concordano con DEPLOYMENT. Le badge esterne riguardano il README, non dipendenze runtime del gioco. Non visitati GitHub, Vercel o sito autore in questa review.
- I45test/864pose/27frame del paragrafo storico sono attribuiti esplicitamente a **polished-1/TmJx2Hx1**, non alla nuova build. Il main riporta **46/46test prima dell'aggiunta dei metadati MIT**, build/typecheck CM79yoZg e hash polished1/1PASS; non rieseguiti qui né presentati come nuovo run dopo MIT. Il README non spaccia45 per il totale attuale o per certificazione automatica dei nuovi credits.
- **MIT aggiunta su richiesta esplicita successiva dell'utente:** `LICENSE` contiene il testo standard con `Copyright (c) 2026 Rosario Moscato`, inclusione degli avvisi nelle copie/porzioni sostanziali e clausole senza garanzie/responsabilità. README collega `[LICENSE](LICENSE)` e riassume correttamente uso/modifica/distribuzione anche commerciale. `package.json.license` e `package-lock.json.packages[""].license` sono entrambi `MIT`; diff limitato a questi metadati, nessuna dipendenza cambiata. Questa verifica aggiorna la precedente review, che precedeva il consenso MIT.
- Licenze delle dipendenze e condizioni hosting rimangono distinte: MIT non elimina i vincoli del piano Vercel Hobby. `private:true` del package resta invariato, non contraddice MIT e non rende pubblico il repository GitHub. Verifica di coerenza tecnica/documentale, **non certificazione legale o dei diritti di ogni componente terzo**.

## Credits, accessibilità e sicurezza — PASS

Testo esatto, condiviso da `src/ui/credits.ts`:

> © 2026 Rosario Moscato - handcrafted by a human, upgraded by agents.

Solo **Rosario Moscato** è link a `https://rosmoscato.xyz`, con `target="_blank" rel="noopener noreferrer"`. Markup costante, nessun dato utente interpolato o script remoto. Link nativo sottolineato, oro/crema su pannello scuro, font1rem e focus-visible3px: coerenti col DESIGN_SYSTEM. I PNG720/1080 mostrano testo intero e leggibile; il normale ritorno a capo nel titolo non tronca l'attribuzione. Nessun audit clinico/accessibilità universale implicito.

`Game.renderMenu` aggiunge una sola fonte nei menu titolo/pausa/sconfitta; `BossChapter.renderHUD` soltanto durante ending con elapsed≥8. Il rerender sostituisce il vecchio HTML prima di appendere: niente accumulo. Assenti da gameplay attivo e dalla presentazione sciarpa1.5s; vittoria, dialogo e Nuova avventura restano leggibili nel finale. Il limite storico di Santa parzialmente sotto chioma non è introdotto dal footer né dichiarato risolto.

`pointer-events:auto` sul link permette il clic sotto HUD altrimenti non interattivo. Filtro `input.ts` esteso ad `a` preserva Enter nativo senza accodare comandi; Esc mantiene la propria gestione precedente. Nuovo test `polish-input` copre Enter/Space/E su anchor senza preventDefault/held/pressed. Nessun cambio a combattimento, salvataggi o timing.

## Prove lette e limiti

`captures/readme-credits/report.json` aggiornato: **6/6PASS, errors vuoto**, HTML sempre CM79yoZg. Ai cinque casi UI/hero precedenti si aggiunge **MIT license, README link and package metadata agree**. I cinque casi originali restano PASS: testo esatto/URL/attributi e bounding box nei due viewport, popup con Enter senza avanzare beat e opener nullo, assenza gameplay/presenza pausa, finale senza duplicati e popup via mouse, hero reale con selfTestPASS (**110call/85.990tri**, non misura fps). Nessuna nuova modifica UI rispetto alla review precedente dichiarata dal main; nessun nuovo browser avviato dal reviewer.

Navigazione autore **intercettata localmente**: test reale di attivazione link/popup, non prova di disponibilità del sito autore e nessuna visita esterna. Le pose ending/hero usano LC.goto/seek nel tool: sono test UI controllati, **non un nuovo playthrough**. Il reviewer ha letto prove e immagini senza avviare un ulteriore browser. Stato dead dedotto dal ramo menu condiviso, non separatamente esercitato nei casi UI.

Il main riferisce verifica read-only `gh repo view`: homepage già **https://operazione-ho-ho-ufo.vercel.app**. Nessuna modifica necessaria al link GitHub; dato attribuito alla verifica del main, non a un nuovo accesso remoto del reviewer. Nessun cambio di visibilità/description, push o pubblicazione dedotto dalla richiesta del link.

SHA256 ricalcolati read-only sulle quattro baseline: **M1 27/27, M2 27/27, RC27/27, polished-1 27/27 identici:108file congelati intatti**.

## Esito e consegna

**PASS mirato per README, MIT e attribuzione locale CM79yoZg**, entro la richiesta post-release aggiornata. Credits visibili al giocatore nei menu e nel finale completo della build locale; disponibilità degli stessi sul sito live non certificata. Storia e stile stabili; nessun rischio concreto bloccante aggiunto dai metadati/licenza. Nessun gate fullstory/fullbot aggiuntivo richiesto per questa variazione limitata.

L'aggiornamento resta **locale**: non dichiarare i credits già presenti su Vercel. Il primo deploy documentato resta distinto; un nuovo push master pubblica automaticamente e **non è autorizzato da questa review**. Nessuna spesa, nuovo deploy o modifica alle quattro milestone approvate autorizzati.
