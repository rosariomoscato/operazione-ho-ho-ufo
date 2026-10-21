# «La missione» — review mirata

2026-10-21 · **PASS mirato** per la build locale **B6IH5ndD**. Nessun BLOCKER/MAJOR o nuovo MINOR confermato nel perimetro. Questo esito precede la pubblicazione della missione: non certifica che sia già online.

Ownership: creato solo questo documento. Nessun codice, asset, tool, README, altra review o snapshot modificato; nessun browser, subagente, push o deploy avviato. Letti `src/ui/mission.ts`, diff Game/CSS/README, test unitario e tool/report missione; osservati direttamente title720, mission720/1080 e mission-bottom720/1080. Non eseguito un nuovo run indipendente.

## Testo e integrazione — PASS

- I **due paragrafi** di `missionParagraphs` coincidono con quelli richiesti e con il testo leggibile del README, esclusi soltanto i marcatori Markdown di grassetto. Punteggiatura, accenti e apostrofi conservati. Nessuna nuova trama: furto del nucleo, villaggio, impacchettamento non letale e sorpresa per il generale restano quelli approvati.
- Sezione solo nel **menu iniziale**, prima delle azioni, inizialmente collassata. Aprirla modifica esclusivamente `hidden` e `aria-expanded`, senza start, timer, salvataggio o combattimento. Nessuna aggiunta a HUD gameplay, pausa o finale.
- Pulsante nativo `type="button"`, `aria-controls` con ID corrispondente, stato espanso sincronizzato, contenuto nascosto quando chiuso. Enter/Spazio nativi preservati dal filtro input sui button. Testi costanti nel markup, nessuna interpolazione di dati utente o nuova richiesta esterna.
- Focus predefinito ora seleziona `button[data-do]:not(:disabled)`: **Nuova partita** resta l'azione primaria, non il nuovo disclosure. Conservato il ramo di ripristino focus dei binding; nessun secondo `details`, quindi Impostazioni/remapping non vengono agganciati per errore.

## Leggibilità e uso — PASS nei viewport provati

Nei PNG720/1080 il testo è intero, crema su pannello scuro, font root e spaziatura coerenti con lo stile A. Pulsante oro/focus ereditato e segno+/− distinguono apertura e chiusura. Nessuna nuova grafica3D, mood, audio o riduzione del font.

Da chiuso, title720 mostra subito Nuova partita, impostazioni e credits. Da aperto, i due paragrafi occupano spazio e le azioni successive richiedono scroll: **comportamento voluto**, non testo troncato o soft-lock. Il report misura overflow auto, client689/scroll935px a720 e client1035/scroll1396px a1080. Le immagini bottom mostrano il termine del secondo paragrafo, non una prova separata di tutti i controlli sottostanti contemporaneamente; il tool verifica poi credits/impostazioni e avvio dopo richiusura. Nessuna evidenza di controlli irraggiungibili. Desktop tastiera/mouse resta il supporto concordato, senza pretesa mobile o audit universale screen-reader.

## Evidenze e regressioni circoscritte

`captures/mission/report.json`: **4/4PASS, errors vuoto**, HTML **index-B6IH5ndD.js**. Letto anche `tools/check-mission.mjs`:

1. Focus Nuova partita, disclosure chiuso, una sola sezione `details`.
2. Due stringhe esatte e menu scrollabile entro viewport720/1080.
3. Lettura per300ms con playing=false, clock e checkpoint identici; Enter chiude e Spazio apre.
4. Richiusura, credits e Impostazioni raggiungibili, Nuova partita→tutorial→pausa, selfTestPASS e missione assente fuori titolo.

È un **test UI controllato**, non un fullplaythrough né una misura del ritmo umano. Il nuovo unit test `tools/game.test.mjs` controlla corrispondenza README e disclosure ARIA/hidden. Il main riporta build/typecheckPASS, **47/47unitPASS** e hash polished1/1PASS (altre81copie-file nei test comuni): risultati attribuiti al main, non rieseguiti dal reviewer.

`captures/readme-credits/report.json` nuovamente letto: **6/6PASS sulla stessa B6IH5ndD**, zero errori. Credits esatti, link sicuro e MIT standard restano invariati; popup autore intercettato localmente, nessuna visita reale implicita. Nessun motivo osservato per riaprire fullstory/fullbot o modificare snapshot.

## Consegna

README descrive «La missione» e la lettura senza timer correttamente. Il repository è ora descritto come pubblico; stato remoto e precedente pubblicazione credits riferiti dal main, non rivalidati qui. L'avviso sul trigger Git non partito evita di confondere push e sito aggiornato: la nuova pubblicazione dovrà essere verificata dopo il deploy.

**PASS per l'aggiornamento limitato della missione nel titolo.** Nessun blocco tecnico rilevato prima della pubblicazione richiesta dall'utente. Questo reviewer non pubblica: restano al main push/deploy della build revisionata e verifica che il sito online mostri davvero i due paragrafi. Nessuna modifica alle quattro milestone congelate o nuova spesa autorizzata da questo report.
