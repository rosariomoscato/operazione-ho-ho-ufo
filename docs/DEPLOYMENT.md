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

Repository e progetto Vercel creati, remote locale `origin` aggiunto. Nessun push o deployment ancora eseguito.

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

Preparazione autorizzata. Creazione, collegamento GitHub e pubblicazione ancora da eseguire.
