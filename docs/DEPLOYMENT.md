# Pubblicazione — Operazione Ho Ho UFO

## Piano autorizzato (2026-10-21)

- Gioco statico Vite/Three.js, build `npm run build`, output `dist`.
- Progetto Vercel nuovo `operazione-ho-ho-ufo`, team `ros-projects-592f0548` (Ros' projects), piano Hobby. Nessun acquisto o servizio aggiuntivo.
- Indirizzo gratuito: leggere quello assegnato dalla piattaforma, non costruirlo dal nome.
- L'utente ha autorizzato il piano Hobby per uso personale non commerciale e ha richiesto GitHub per le pubblicazioni automatiche.
- Nuovo repository GitHub privato: `rosariomoscato/operazione-ho-ho-ufo`; branch produzione `master`. Non modificare altri progetti o repository.
- Pubblicare solo il gioco compilato; preservare tutte le copie congelate. Nessuna conversione a Next.js.
- Controlli: build/test locali, hash snapshot, risposte HTTPS/asset/audio e smoke browser pubblico; revisione delle prove.
- Nessuna chiave, database, autenticazione, pagamento, storage esterno o variabile applicativa richiesta. Salvataggi nel browser, separati per indirizzo.
- Nessun intervento browser previsto, salvo eventuale autorizzazione dell'integrazione GitHub richiesta dalla piattaforma.

## Registro risorse

| Risorsa | Dove | Costo | Rimozione |
|---|---|---|---|
| Repository GitHub privato | https://github.com/rosariomoscato/operazione-ho-ho-ufo | Nessun acquisto | Impostazioni GitHub → eliminazione repository, solo con consenso |
| Progetto Vercel | `operazione-ho-ho-ufo`, team `ros-projects-592f0548` | Hobby gratuito entro quote, uso personale non commerciale | Settings del progetto → eliminazione, solo con consenso |
| Collegamento GitHub | Repository privato → progetto Vercel, produzione `master` | Nessun acquisto | Project Settings → Git → Disconnect |
| Primo deployment produzione | `dpl_CskRf1MFZxtVmPWbG8uFqjjRBZFM`, commit `ec48093` | Incluso nel piano Hobby entro quote | Gestione deployment del solo progetto, solo con consenso |

Repository e progetto Vercel creati, remote locale `origin` aggiunto. Primo push `3596a9e` completato prima del collegamento Vercel/GitHub.

Progetto Vercel ID `prj_6fGbsacHJ7djSleYM0iFUEIE8zeR`. Impostazioni applicate: preset `vite`, install `npm ci`, build `npm run build`, output `dist`. Nessun URL produzione mostrato prima del primo deployment. Collegamento locale in `.vercel/` ignorata da Git. Il comando link ha creato automaticamente `.env.local` con credenziale OIDC locale: contenuto mai letto/stampato, ignorato da Git, nessuna variabile richiesta dal gioco o impostata in produzione. Lista variabili produzione vuota.

La CLI ha aggiunto `.vercel` a `.gitignore`; rimosso solo il pattern ridondante `.env*` aggiunto dalla CLI, mantenendo i pattern esistenti e l'eccezione `.env.example`.

## Controlli preliminari

- Account Vercel autenticato `rosmoscato`, unico team disponibile Ros' projects, Hobby. Nessun progetto omonimo nella lista.
- Account GitHub autenticato `rosariomoscato`; repository omonimo non trovato. Nessun remote Git iniziale.
- Build locale PASS, bundle applicativo `index-TmJx2Hx1.js`, stessa build della rifinitura approvata.
- Test comuni 45/45 PASS; test hash polished-1 1/1 PASS. Le quattro copie congelate restano inalterate.
- Nessun file `.env` presente; pattern `.env` e `.env.*` ignorati. Nessuna variabile ambiente letta dal codice applicativo.
- Inventario Git: 891 file, 118642066 byte, nessun file oltre 25 MiB. Scansione mirata di chiavi private/token comuni: nessuna corrispondenza; non costituisce una certificazione generale di assenza di segreti.
- Ricerca hosting aggiornata: supportato Vite statico e GitHub. `project create` non pubblica; URL produzione potrebbe essere disponibile solo al primo deployment. In questo gioco nessuna configurazione dipende anticipatamente dall'URL.
- Warning build: chunk Three.js grande, non errore; nessuna soppressione o modifica al gameplay.

## Stato

Collegamento GitHub riuscito tramite `vercel git connect`. Push `ec48093` ha avviato la prima build GitHub, arrivata READY/Production. Log: clone branch `master`, commit `ec48093`; `npm ci`, typecheck e Vite riusciti. Nessun caricamento diretto CLI e nessun secondo deployment.

Indirizzi letti da `vercel inspect`:
- Pubblico: https://operazione-ho-ho-ufo.vercel.app
- Deployment immutabile: https://operazione-ho-ho-hrpt59zhu-ros-projects-592f0548.vercel.app

Verifica HTTP/browser PASS. Nessun rollback a un deployment precedente disponibile per questa prima pubblicazione.

## Gate pubblico — prove

Fonti in `docs/evidence/step-10/`:

- `deployment.txt`: READY, target production, ID e alias letti dalla piattaforma.
- `build-log.txt`: clone GitHub `master`/`ec48093`, install e typecheck/build completati, bundle `TmJx2Hx1`. Nessuna migrazione necessaria.
- `github-status.json`: SHA completo `ec48093b00fd84ed0974f4ec873ccea70afdc7e1`, stato Vercel `success`. Coincide con HEAD al momento della pubblicazione; successive modifiche al registro/prove sono solo documentali.
- `http.json`: tutti i 27 file pubblici rispondono 200 e hanno SHA256 identico a `snapshots/polished-1/`, inclusi 11 WAV, CSS, JS, indice e HTML. HTTPS valido tramite client con verifica certificato; HTTP → HTTPS 308.
- File non pubblici verificati: `/.env`, `/.env.local`, `/.git/config`, `/src/game.ts`, `/docs/HANDOFF.md` tutti 404. Nessun sorgente/documento/credenziale locale servito su questi percorsi.
- `browser.json`: Edge headless sul dominio pubblico, 1920×1080, titolo → Nuova partita → Invio → tutorial → Esc pausa/riprendi → movimento W reale. `LC.selfTest()` PASS; zero pageerror, errori console o risposte HTTP fallite nel run. Audio caricato, errore mixer nullo.
- `title.png` e `training-paused.png` osservate: titolo, istruzioni e menu pausa leggibili. Un secondo browser desktop integrato ha aperto il dominio e letto titolo/canvas/LC; non è un ulteriore playtest.

Non eseguiti sul sito pubblico: playthrough completo e valutazione d'ascolto umano, prestazioni su laptop utente, mobile (gioco progettato per desktop), rollback reale. Nessun ramo auth/database/pagamenti/email/jobs/MCP presente, quindi relativi check non applicabili. Non dichiarare 60fps o durata umana garantiti.

Due tentativi di archiviare log con redirezione PowerShell hanno restituito exit1 per gestione stderr, non per un build fallito; acquisizione rieseguita con `spawnSync`, exit0 per entrambi, file UTF8 corretti. Nessun deployment ripetuto per questo.

## Costi e gestione

- Hobby: solo uso personale non commerciale. Quote documentate alla verifica: 100 GB/mese di trasferimento e un milione di richieste CDN/mese; non è disponibilità illimitata. Nessun piano a pagamento attivato.
- GitHub repository privato, nessun acquisto. Progetto statico senza risorse database/storage aggiuntive.
- Dopo verifica del collegamento, un `git push origin master` pubblica automaticamente: non usare questo comando per archiviare modifiche che non si vogliono mettere online.
- Per fermare gli aggiornamenti automatici: scollegare il repository nelle impostazioni Git del solo progetto Vercel. Per togliere il sito: impostazioni del solo progetto Vercel; non eliminare altri progetti del team.
- Per tornare a questa prima release dopo un aggiornamento: dashboard Vercel → Deployments → questa release → Instant Rollback, oppure `npx --yes vercel@latest rollback https://operazione-ho-ho-hrpt59zhu-ros-projects-592f0548.vercel.app --scope ros-projects-592f0548`. Comando verificato tramite help, non eseguito. Allineare anche i sorgenti con un revert Git revisionato prima di un nuovo push, altrimenti il prossimo push rimette online le modifiche.
- Nessun passo manuale rimasto. Prima pubblicazione unica, nessuna risorsa orfana nota o servizio a pagamento creato.

## Revisione e chiusura

Due reviewer indipendenti hanno ricevuto piano e prove, senza accesso mutativo: piano/risorse e claim/segreti. Entrambi senza rilievi; verbatim in `docs/reviews/deploy-final-review.md`.

Il commit finale contiene solo registro, handoff e prove: rimane locale, senza push, per conservare l'unico deployment verificato. Nessun sorgente applicativo cambiato. Il prossimo `git push origin master` sincronizza anche questi documenti e avvia automaticamente la pubblicazione.

### Aggiornamenti necessari ai riferimenti upstream

L'help ha segnalato `link --team` e argomento posizionale di `env ls` come deprecati: usare `--scope` e `--environment` nei comandi futuri. Il collegamento è comunque riuscito; nessuna configurazione globale modificata. Riferimenti upstream da aggiornare: `preflight.md`, `project-and-url.md` (URL non disponibile prima del primo deploy), `env.md` (sintassi ambiente), `deploy.md` (ramo statico e workflow Git). Nessun file upstream della skill modificato in questa esecuzione.
