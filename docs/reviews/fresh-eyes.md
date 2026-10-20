# Playtest fresh-eyes

## Esito: COMPLETED

Partito da **Nuova partita**, terminato quando la UI ha mostrato: «Fine del primo segmento · La via dei giocattoli non è ancora giocabile.» Nessuna sconfitta, nessun riavvio. Salute finale: 2 tacche su 6. Ancoraggi: 1/3; cortile liberato.

## Protocollo e strumenti reali

Solo browser Playwright già aperto, viewport 1280×720: `browser_run_code_unsafe` per mouse, tastiera, attese, screenshot e lettura del testo visibile con `locator('body').innerText()`; `browser_take_screenshot`; lettura esclusivamente delle mie immagini con `functions.read`. Nessun documento/codice/stato interno consultato, nessun LC, console, navigazione artificiale o modifica dello stato. Report scritto con patch.

Durata cronologica e numero esatto di input non misurati. Ho usato ripetutamente Esc per sospendere il combattimento tra acquisizioni e osservazioni: il ritmo di questa sessione non rappresenta un giocatore continuo. Audio non udibile/verificabile nel mio setup; nessun giudizio sul mix.

## Percorso osservato

1. Il titolo spiegava WASD, trascinamento destro, regalo, schivata, dispositivo e pausa. Ho lasciato scorrere l'introduzione senza saltarla.
2. Sono avanzato prima di sparare al drone. Ho cliccato direttamente sulla sua figura: scoppio a vuoto. Ho provato Spazio, poi ruotato la camera in entrambe le direzioni cercando di capire il puntamento.
3. Arretrando mi sono trovato accanto al drone; il pannello indicava «Drone 1/1». Un clic al centro ha completato l'esercizio, insieme alla schivata già provata.
4. Il cortile ha introdotto sei difensori a gruppi. Inizialmente sono avanzato verso il dispositivo mentre un rettiliano era dietro/a sinistra; i regali andavano nel cerchio davanti a me e non lo colpivano. Durante l'osservazione ho perso quattro tacche.
5. Ho arretrato, schivato e lanciato regali ripetuti. I feedback «Colpito», tacche residue e numero dei difensori hanno reso riconoscibile il progresso: 5, poi 3, poi 1, infine area libera. Non ho raccolto il campanello di cura suggerito dal dialogo.
6. Alla richiesta «Spegni il primo ancoraggio: E» mi sono avvicinato al dispositivo visibile usando W+A e ho premuto E. Conferma esplicita di ancoraggio disattivato e checkpoint.
7. Ho proseguito verso l'uscita, ricevendo il messaggio inequivocabile di fine segmento. Non ho tentato di proseguire oltre.

## Confusioni e suggerimenti

| Severità | Testimonianza | Fix suggerito |
| --- | --- | --- |
| Importante | «Clic: regalo» mi ha fatto provare a cliccare direttamente sul drone. Il tiro seguiva invece il puntamento/bersaglio selezionato; per qualche tentativo non capivo come allinearlo, con il drone sotto e lateralmente al reticolo. | Nel tutorial esplicitare «Porta il bersaglio al reticolo, poi clicca» e rendere evidente il bersaglio agganciato sulla scena, non solo nel pannello. |
| Importante | Primo combattimento: nemico vicino dietro/a sinistra, cerchio del regalo davanti. Ho perso quattro tacche prima di capire che dovevo riposizionarmi; il suggerimento sul reticolo era utile ma non bastava a spiegare immediatamente la relazione fra movimento, orientamento e tiro. | Un breve esercizio di riallineamento prima delle ondate; indicatore periferico per nemici fuori dal fronte di tiro. |
| Minore | L'indicatore «↑ Drone» è rimasto presente anche quando il drone era molto basso o laterale nell'immagine. Ho interpretato inizialmente la freccia come direzione precisa del puntamento. | Distinguere bussola di navigazione da indicatore del bersaglio sullo schermo. |
| Minore | Ho letto il suggerimento del campanello al centro ma non ho identificato con sicurezza l'oggetto né lo ho cercato, essendo impegnato a sparare. | Etichetta o icona di cura chiaramente collegata all'oggetto quando si è feriti. |
| Minore | «Libera il cortile · 1 difensori» usa il plurale anche con uno rimasto. | Singolare «1 difensore». |

## Cose chiare e interpretazione finale

Obiettivo aggiornato leggibile; conferme di colpo, uccisione, area libera e attivazione sufficientemente esplicite. E ha funzionato al primo tentativo vicino al dispositivo. Ho capito che il nucleo natalizio rubato alimenta la nave, che tre ancoraggi la tengono attiva e che questo segmento permette di liberare gli elfi del cortile e spegnerne uno. Gli altri due sono nella via dei giocattoli, dichiarata non ancora giocabile: non l'ho interpretato come un blocco involontario.

Controlli appresi: WASD movimento; destro trascinato camera; sinistro regalo con recupero e area d'effetto; Spazio schivata con recupero; E interazione vicina; Esc pausa/ripresa. Invio/Spazio per saltare l'introduzione erano indicati, ma non utilizzati durante l'introduzione.

## Screenshot della sessione

- `captures/fresh-eyes-01-intro.png` — introduzione.
- `captures/fresh-eyes-02-tutorial.png` — drone laterale e reticolo centrale.
- `captures/fresh-eyes-03-aim.png` — primo tentativo di rotazione.
- `captures/fresh-eyes-04-aim.png` — seconda rotazione, drone in basso a destra.
- `captures/fresh-eyes-05-position.png` — vicino al drone, selezione «Drone 1/1».
- `captures/fresh-eyes-06-combat.png` — primo nemico laterale e regalo davanti.
- `captures/fresh-eyes-07-combat.png` — due nemici vicini, salute ridotta a due tacche.
- `captures/fresh-eyes-08-cleared.png` — area libera e richiesta di E.
- `captures/fresh-eyes-09-gate.png` — conferma finale esplicita di fine segmento.

## Appendice — retest chiarezza nella stessa sessione

**Esito: COMPLETED, con interruzione della pagina prima dell'ancoraggio.** Non è un nuovo playtest fresh-eyes: conoscevo già comandi e segmento. Ho selezionato esplicitamente **Nuova partita**, saltato l'introduzione con Invio, completato tutorial e tutti i combattimenti, poi raggiunto nuovamente il messaggio di fine segmento. Stessi strumenti e restrizioni del test iniziale; solo UI, mouse/tastiera e mie immagini. Nessuna durata o conteggio input misurati; audio ancora non verificato. Pause Esc fra osservazioni.

### Verifica delle due confusioni importanti

- **Puntamento al drone: RISOLVE la confusione operativa.** «Tira al +, non al mouse», istruzione di trascinare il destro e marker MIRATO rendono esplicita la regola prima del tiro. Ho ruotato leggermente per avvicinare il drone al centro, cliccato al centro e completato drone e schivata senza tentativi a vuoto. Resta una piccola imprecisione semantica: MIRATO compare anche con il drone visibilmente a sinistra del +; ora lo interpreto come aggancio assistito, non come obbligo di sovrapposizione geometrica perfetta.
- **Nemici laterali/dietro e orientamento: RISOLVE la mancanza di indicazione, con riserva di leggibilità dei marker.** Nel primo scontro ho ruotato verso il rettiliano visibile e avanzato prima di sparare: colpi riconosciuti, primo gruppo superato senza perdere salute. Ho poi ruotato volontariamente lontano dal gruppo successivo: è comparso «! Dietro, ← a sinistra · Destro: gira e mira», con direzione e azione comprensibili. Tornando con il trascinamento destro e sparando ho eliminato i restanti nemici. Una tacca persa durante la verifica volontaria dell'avviso; nessuna sconfitta. Questo retest non può dimostrare che un nuovo giocatore imparerebbe altrettanto rapidamente.

### Altri punti e occlusioni

- **Percorso distinto dalla mira: RISOLVE.** Prefisso «Percorso» presente; non lo ho confuso con la posizione precisa da colpire.
- **Cura: RISOLVE l'identificazione visiva, raccolta non verificata in modo isolato.** Da ferito, dopo il combattimento ho visto chiaramente «✚ Cura +2» sopra l'oggetto dorato. Il marker si trova vicino al cappello/reticolo nella vista acquisita ma rimane leggibile.
- **Singolare: RISOLVE.** Ho letto «Libera il cortile · 1 difensore» prima dell'ultima eliminazione.
- **Nuovo difetto minore osservato:** nel gruppo di tre rettiliani il pannellino delle tacche di salute si sovrappone alla parte sinistra di MIRATO (screenshot 03). I corpi rimangono distinguibili e il tiro funziona, ma il marker perde pulizia. Suggerimento: impilare salute e MIRATO su righe separate o riservare spazio al marker selezionato.
- I testi permanenti a 1280×720 vanno su due righe; sommati a dialogo e tutorial occupano una fascia inferiore ampia. Nel tutorial non hanno impedito di vedere il drone. Durante la verifica dell'avviso alcuni nemici molto vicini in basso a sinistra erano parzialmente dietro ai pannelli inferiori: l'avviso superiore restava leggibile.

### Completamento e limite della sessione

Dopo l'area libera ho visto Cura +2 e cinque tacche. Durante il successivo tentativo di avvicinamento/E la pagina è tornata al titolo senza una mia richiesta di titolo; causa non accertabile usando solo UI. Ho premuto **Continua**, ritrovando l'obiettivo «Spegni il primo ancoraggio: E», distanza 5 m e salute piena. Non attribuisco quindi quel recupero alla raccolta della cura. Ho avanzato, premuto E, ottenuto checkpoint 1/3 e proseguito fino a «Fine del primo segmento · La via dei giocattoli non è ancora giocabile». Nessun controllo risultato rotto; completamento non ininterrotto a causa del ritorno al titolo.

### Screenshot conservati del retest

1. `captures/retest-clarity-01-tutorial.png` — nuove istruzioni, drone MIRATO e cerchio.
2. `captures/retest-clarity-02-first-enemy.png` — nonostante il nome, cattura finale **dopo** gli scontri: Cura +2 visibile, area libera e cinque tacche. La cattura precedente nello stesso percorso è stata sostituita.
3. `captures/retest-clarity-03-markers.png` — gruppo di tre, sovrapposizione fra tacche e MIRATO.
4. `captures/retest-clarity-04-warning-heal.png` — avviso dietro/sinistra durante il combattimento e perdita di una tacca; il nome non implica che la cura sia visibile in questa immagine.

### Nota di archiviazione dell'integratore

I percorsi screenshot sopra si riferiscono agli artefatti della sessione Playwright: al momento dell'archiviazione non risultano PNG locali nella directory `captures/` di questo workspace. Non sono quindi dichiarati copiati/versionati. Restano questo report e le catture integrate locali permanenti in `docs/evidence/step-06/`. L'interruzione al titolo nel retest coincide con modifiche sorgente eseguite mentre Vite/HMR era attivo; non è stata riprodotta nei test della build statica. La consegna utente usa preview produzione sulla porta5175, senza HMR. Questa nota non trasforma il retest in una nuova prova indipendente né certifica la durata o l'ascolto.
