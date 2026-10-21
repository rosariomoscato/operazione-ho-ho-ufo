# Operazione Ho Ho UFO

Action comico 3D per browser. **Avventura completa approvata dall'utente**, dal cortile al boss Squamakk e alla restituzione del nucleo. Copia conservata su5179; rifinitura finale non ancora avviata, nessuna pubblicazione autorizzata.

## Avvio locale

Richiede Node 22.13+ e Chrome/Edge installato (ambiente verificato: Node 22.23.1). I test di integrazione usano la rimozione nativa dei tipi TypeScript di Node, ancora contrassegnata sperimentale.

```powershell
npm.cmd ci
npm.cmd run dev
```

Sviluppo su http://127.0.0.1:5174/. Per giocare senza ricariche automatiche da modifiche sorgente:

```powershell
npm.cmd run build
npm.cmd run preview
```

La preview5175 segue le build correnti. Per la versione stabile conservata:

```powershell
npm.cmd run snapshot:release
```

Aprire **http://127.0.0.1:5179/**. **Nuova partita** per l'intera avventura; **Prova la piazza e Squamakk** per il nuovo atto. Build,38test sorgente+hashRC,fullbot da Nuova partita al finale,review e playtest UI-only superati; limiti in `docs/HANDOFF.md`.

Comandi: **WASD** muovi, **destro trascinato** mira al +, **clic sinistro** regalo, **Spazio** schiva, **E** dispositivo/cancello/nucleo/albero, **H** aiuto, **Esc** pausa. Cortile → due arene in ordine libero → tre cicli di Squamakk → recupero e restituzione del nucleo → finale. **Invio/Salta finale** conclude la presentazione. Progressi e opzioni restano nel browser locale; salvataggi v1/v2 migrano a v3 senza modificare le copie congelate. Porte diverse hanno salvataggi separati.

Le prove esplicite M2/M3 sul titolo non sostituiscono il salvataggio. **Nuova partita** riparte dal cortile e cancella i progressi precedenti delle tre versioni; non le impostazioni.

### Copia approvata, immutabile

`npm.cmd run snapshot:m1` → **http://127.0.0.1:5176/**. Serve `snapshots/m1-slice/` senza ricostruirla: questa copia non va mai modificata o sovrascritta, anche quando il gioco principale cambia.

Anche la via dei giocattoli è stata approvata: `npm.cmd run snapshot:m2` → **http://127.0.0.1:5177/** serve `snapshots/m2-street/`. È la build DpZTJjdp, indipendente dallo sviluppo successivo della piazza e del boss.

La release candidate dell'avventura completa è `snapshots/release-candidate/`, build D86qgQyq, porta5179. È immutabile e non pubblicata: non rigenerarla, modificarla o sovrascriverla durante fix e polish.

Le demo dei passi precedenti restano disponibili: `npm.cmd run dev:labs`, poi http://127.0.0.1:5173/tools/testscene.html per il laboratorio tecnico.

Confronto delle tre varianti giocattoli 3D: http://127.0.0.1:5173/design/styles/index.html. Le demo interattive richiedono Internet per Three.js da CDN; le immagini del confronto sono locali.

Stile scelto: **A — Vinile morbido**. Regole in `docs/DESIGN_SYSTEM.md`.

Per rigenerare gli HTML: `node tools/build-style-mockups.mjs`. Per verificare i controlli del confronto e delle anteprime: `node tools/check-styles.mjs`.

## Audio gratuito

Ascolto: http://127.0.0.1:5173/tools/audio/audition.html. Due musiche originali, vento e otto effetti; dialoghi solo a testo, zero API. Audio approvato.

```powershell
npm.cmd run audio:plan
npm.cmd run audio:build
node tools/check-audio.mjs
```

File statici in `public/audio/`, regole in `docs/AUDIO.md`. Audio approvato dall'utente. Se avevi già avviato il server prima dell'aggiunta audio, riavvialo per il supporto a durate e seek.

## Controlli

```powershell
npm.cmd test
npm.cmd run capture
node tools/capture.mjs design/styles/vinyl.html --views diorama,player,turntable,face --size 1920x1080 --selftest --visual-checks --out captures/style-a
node tools/capture.mjs "tools/testscene.html?lift=0.05" --selftest --out captures/planted-error
```

L'ultimo comando **deve fallire**: riproduce un pacco sollevato di 5 cm. Senza il parametro la scena è corretta. Output in `captures/`; prove permanenti in `docs/evidence/step-02/`.

Su Windows usare `npm.cmd` se PowerShell blocca `npm.ps1`. Non è necessario cambiare la execution policy. Per un browser in posizione diversa impostare `BROWSER_PATH`.

Stato e prossimi passi in `docs/HANDOFF.md`; regole in `AGENTS.md`.

## Build e catture del gioco

```powershell
npm.cmd run build
npm.cmd run preview
node tools/capture-game.mjs
npm.cmd run test:street
npm.cmd run capture:street
node tools/check-street.mjs
npm.cmd run test:square
npm.cmd run capture:square
npm.cmd run test:playthrough
```

Preview produzione su porta 5175. Cattura di uno scenario specifico: `node tools/capture.mjs index.html --build --scenario battle-c --views player,diorama --times 0,1 --out captures/game/manual --selftest`. `--url http://127.0.0.1:5174/` usa invece il server di sviluppo già acceso; non combinarlo con `--build`.
