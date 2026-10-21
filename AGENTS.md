# AGENTS.md: Operazione Ho Ho UFO

Babbo Natale salva la Terra da invasori con la testa di rettile usando regali esplosivi e magia natalizia. Action comico 3D in terza persona, browser desktop con Three.js, tastiera e mouse, durata 10–15 minuti. Concept approvato dall'utente il 2026-10-20.

Progetto basato sulla pipeline in 10 passi della skill `build-a-game`. Iniziare da `docs/HANDOFF.md`.

## Fonti di verità

- `docs/HANDOFF.md`: stato, decisioni, domande aperte e demo.
- `docs/GAME_DESIGN.md`: concept approvato, storia, meccaniche e livelli.
- `docs/SCRIPT.md`: prima sceneggiatura derivata dal concept; battute con ID stabili. Scelta utente: solo testi, nessun doppiaggio.
- `docs/AUDIO.md`: audio gratuito offline, manifest, cache, livelli, controlli e pagina ascolto. Nessuna API o chiave necessaria.
- `docs/DESIGN_SYSTEM.md`: stile scelto A, Vinile morbido; regole per palette, materiali, personaggi, luci, UI e verifiche.
- `design/styles/vinyl.html`: riferimento grafico eseguibile; sorgente `tools/build-style-mockups.mjs`. Conservare anche le varianti B e C.
- `docs/TECH_PLAN.md`, `docs/LEVEL_LAYOUT.md`: architettura, proprietà dei file, gate e coordinate condivise del cortile (passo 6).
- `docs/set-pieces/courtyard.md`: specifica dell'incontro e dei segnali di combattimento prima dell'implementazione.
- `docs/ACT_02_PLAN.md`, `docs/set-pieces/toystreet.md`: piano e incontri M2, due arene in ordine libero; fermarsi al playtest prima di M3.
- `.claude/agents/*.md`: tre prospettive di review; nel percorso snello un singolo reviewer le combina.
- `docs/BACKLOG.md`: feedback e difetti da verificare.
- Reviewer dal passo 6: critico, direttore degli incontri/comicità, direttore narrativo.

## Regole

1. I file sono la memoria: aggiornare HANDOFF e i documenti interessati dopo ogni passo.
2. Conservare tutte le demo, pagine di confronto e snapshot congelati; mantenerli funzionanti e indicizzati in HANDOFF.
3. Tutta la grafica è costruita in codice (Three.js/GLSL), senza Blender o modelli scaricati.
4. Verificare numericamente contatti, clipping e z-fighting con `LC.selfTest()`.
5. Dal passo 2 ogni demo espone `window.LC` per catture deterministiche. Non dichiarare strumenti non ancora implementati come funzionanti.
6. Audio solo da file statici preparati prima, mai generato dal gioco. Eventuali generazioni a pagamento passano da un unico strumento con preventivo, limite di spesa e registro anti-duplicati.
7. Nessun segreto nel gioco o nella chat. Chiavi solo in `.env.local`, escluso da git, lette da strumenti locali.
8. Budget: 60 fps a 1080p su laptop medio; massimo 150 draw call, 150k triangoli, 3 passaggi post, 2 luci con ombre e 6 luci reali per vista. Instanziare elementi ripetuti.
9. Rendere sempre chiari obiettivo, direzione, comandi e risultato delle azioni. Mai ignorare input silenziosamente.
10. Prima del passo 6 autocritica; dal passo 6 reviewer e playtester a occhi nuovi prima dell'utente. Risolvere problemi bloccanti e importanti. Incontri approvati dal direttore di genere e storia dal direttore narrativo.
11. Nessuna spesa o pubblicazione senza consenso esplicito, anche in autonomia. Decisioni autonome registrate come tali.
12. Quando previsti dalla skill, pochi collaboratori persistenti per area, non decine di micro-agenti.
13. Se si approva il doppiaggio, misurare la chiarezza delle voci rispetto al mix e abbassare musica/effetti durante le battute (obiettivo almeno 8 dB di margine).
14. Prima di creare qualunque asset visivo leggere DESIGN_SYSTEM, riusare le funzioni materiali del mockup A, catturare ogni mood implementato da distanza gameplay e da vicino, verificare contatti e budget con selfTest e ottenere revisione prevista per il passo. Non reinventare lo stile o introdurre blur nel gameplay.
15. Dal passo8: obiettivo persistente in parole semplici, scheda del nuovo comando finché usato una volta, indicatore di destinazione distinto dalla mira e aiuti a15/30/45s senza progresso più tasto aiuto. Verificare che gli aiuti scattino davvero e che pausa/progresso fermino o azzerino il timer; mai introdurre attese per mostrarli.
16. Progressione e interazioni si misurano: arene/ancoraggi/cure indipendenti, nessun doppio conteggio o pickup duplicato dopo retry/Continua. Nuovi atti devono migrare i salvataggi precedenti senza alterare la copia congelata. Interagire fuori portata o con oggetto protetto dà sempre una ragione visibile.
17. `snapshots/m1-slice/` è immutabile e approvato: non modificarlo, rigenerarlo o sovrascriverlo. Il test di hash in `tools/street.test.mjs` deve restare positivo.

## Debug visivo disponibile

`node tools/capture.mjs <page.html> --times 0,2.4,5 --views diorama,fp --out captures/<name> --selftest`

Lo strumento dovrà produrre fotogrammi, contact sheet e report. Guardare le immagini e verificare i test prima di dichiarare completata una scena.
