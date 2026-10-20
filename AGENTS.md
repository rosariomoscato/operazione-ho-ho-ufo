# AGENTS.md: Operazione Ho Ho UFO

Babbo Natale salva la Terra da invasori con la testa di rettile usando regali esplosivi e magia natalizia. Action comico 3D in terza persona, browser desktop con Three.js, tastiera e mouse, durata 10–15 minuti. Concept approvato dall'utente il 2026-10-20.

Progetto basato sulla pipeline in 10 passi della skill `build-a-game`. Iniziare da `docs/HANDOFF.md`.

## Fonti di verità

- `docs/HANDOFF.md`: stato, decisioni, domande aperte e demo.
- `docs/GAME_DESIGN.md`: concept approvato, storia, meccaniche e livelli.
- `docs/SCRIPT.md`: prima sceneggiatura derivata dal concept; battute con ID e stato audio. Doppiaggio ancora da decidere. Mai rigenerare audio già registrato.
- `docs/DESIGN_SYSTEM.md`: da creare al passo 3, insieme ai mockup conservati in `design/styles/`.
- `docs/TECH_PLAN.md`, `docs/LEVEL_LAYOUT.md`: da creare al passo 6.
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

## Debug visivo (previsto al passo 2)

`node tools/capture.mjs <page.html> --times 0,2.4,5 --views diorama,fp --out captures/<name> --selftest`

Lo strumento dovrà produrre fotogrammi, contact sheet e report. Guardare le immagini e verificare i test prima di dichiarare completata una scena.
