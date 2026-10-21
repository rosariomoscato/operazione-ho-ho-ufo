# M2 — retest UI-only con pausa automatica

## Esito

**Completato: sì.** Giostra dei regali spenta, poi Officina dei trenini spenta; HUD 3/3 e messaggio «Fine del secondo segmento». Salute finale 3/6. **Zero morti, zero retry. Nessun MAJOR bloccante sostanziato.** Browser chiuso con `close` dopo il completamento.

Questa è una riprova, **non un nuovo primo impatto**: dalla sessione precedente ricordavo comandi base, scelta tra i due lati, due colpi per nemico, necessità di E sul dispositivo e possibilità di aggirare i ripari. Non conoscevo coordinate interne né ho letto file del progetto, codice, documentazione, debug o stato. Ho usato solo client UI, testo visibile e PNG restituiti.

Il driver dichiara `pauseBetweenActions: true`: pausa automatica dopo la cattura, ripresa prima dell'azione seguente. Non ho usato Esc esplicito. Ho potuto decidere senza danni durante il ragionamento: differenza decisiva rispetto alla prima prova. **Questo dimostra la completabilità con controllo a passi, non misura il bilanciamento per un umano in tempo reale.** Audio muto, non valutato.

48 chiamate client, incluse snapshot iniziale e chiusura, entro il limite di 80. Tempo wall del driver: **365,833 s (6 min 06 s)** alla chiusura; prima osservazione a 21,660 s, quindi circa **5 min 44 s di sessione osservata**. Completamento a 349,903 s del driver. Nessuna di queste durate è tempo di gioco umano continuo.

## Cosa ho capito e fatto

1. Dal titolo ho scelto esplicitamente «Prova la via dei giocattoli».
2. Ho avanzato e tirato contro i nemici indicati come MIRATO. Ho atteso circa 900 ms live dopo i tiri per vedere l'esito. I contatori della Giostra sono scesi da tre a zero: «Giostra libera · E al suo ancoraggio».
3. Ho premuto E da lontano: risposta esplicita con distanza e soglia 2,2 m. Poi ho seguito la destinazione a destra. Un ostacolo mi ha fermato; spostandomi a sinistra e avanzando l'ho aggirato.
4. A 1,1 m il prompt dice «E · Spegni Giostra dei regali». E dà conferma e porta gli ancoraggi a 2/3.
5. Ho seguito l'Officina a sinistra, combattuto i tre tiratori, girato la visuale col destro trascinato quando erano fuori dal centro e usato una schivata.
6. A 2,3 m E mi ha chiesto di avvicinarmi entro 2,2 m; un piccolo movimento laterale mi ha portato a 0,9 m. E spegne l'Officina, porta a 3/3 e annuncia chiaramente la fine del segmento. La battuta spiega che il nucleo è ancora sulla nave e che il prossimo scontro non è incluso: non ho cercato un'uscita inesistente.

## Obiettivi e quattro controlli verificati

- **Movimento WASD:** W, A e D usati con successo; distanze e frecce reagiscono. S non provato. Nomi «Officina dei trenini» e «Giostra dei regali» riconoscibili anche attraverso icone trenino/regalo sui dispositivi.
- **Mira col destro trascinato:** due trascinamenti a sinistra hanno riportato i nemici in vista e fatto ricomparire MIRATO. La risposta è comprensibile, ma l'aggancio è molto più permissivo del +: nella schermata 005 il nemico selezionato è nettamente a destra del centro. Colpire non ha richiesto una precisione da sparatutto. Un testo che chiarisca l'aggancio aiuterebbe a interpretare il +.
- **Regalo con clic sinistro:** conferme «Bersaglio», «Regalo in recupero», «Colpito» e tacche 2/2→1/2 rendono leggibile il risultato; tutti i sei difensori eliminati. Alcuni clic non hanno prodotto un tiro né una nuova spiegazione visibile, pur con HUD «Regali ∞» (004, 012, 038–039); un clic ripetuto o spostato e/o una breve attesa hanno risolto. Non separo qui un problema di input del gioco da un effetto del driver/pausa automatica: **osservazione da riprodurre, non MAJOR assegnato**.
- **E locale:** verificato sia fuori portata sia su entrambi i dispositivi. Le attivazioni sono indipendenti: la Giostra rimane spenta mentre combatto all'Officina; soltanto il secondo E porta a 3/3. Nessuna attivazione remota osservata.

Inoltre **Spazio verificato**: schermata 028 «Schivata · protetto», cooldown 1,1 s e spostamento; salute invariata immediatamente dopo. Non rivendico di aver misurato quanta protezione abbia fornito contro quel singolo proiettile.

## Danni e leggibilità degli scontri

Ho visto avvisi di colpo in volo, nemico in carica e pericolo «Dietro, ← a sinistra · Destro: gira e mira». Sono istruzioni utilizzabili: ho girato la visuale e ritrovato i tiratori. Dopo una perdita di salute è apparso «Colpito · −1 salute · protetto 1,25 s». Non ho verificato tutti gli avvisi su ogni singolo impatto: per esempio in 037 la salute cala ma il messaggio dominante riguarda il nemico colpito. La barra salute rimane comunque leggibile.

Con pause automatiche e attese brevi il combattimento è risultato gestibile senza morte, contrariamente allo stallo iniziale. Non posso dedurre da questa prova che sia troppo facile o troppo difficile in continuo. Il contatore «1 difensori» è una piccola imperfezione grammaticale, non un problema di comprensione.

## Problemi non bloccanti osservati

### Camera molto ostruita vicino al riparo destro

In 019, avanzando verso la Giostra, tetto/parete e testa di Babbo Natale occupano quasi tutta la visuale, con camera estremamente ravvicinata. Mi sono orientato usando HUD e un movimento a sinistra; in 021 la vista è nuovamente utile. È un problema visivo concreto e recuperabile, da controllare vicino all'edificio/riparo: **non lo classifico MAJOR sulla base di un solo breve episodio senza danni né stallo**.

### Messaggio E non sempre allineato alla mia intenzione/stato corrente

In 017, dopo aver liberato la Giostra, E da posizione centrale a pari distanza nomina invece l'Officina. Non è un'attivazione sbagliata: sono fuori portata di entrambe. Tuttavia il testo può suggerire il lato ancora protetto anziché quello appena liberato.

In 045 E dice correttamente «2.3 m: avvicinati entro 2,2 m»; dopo il movimento a 0,9 m (046), lo stesso messaggio con 2,3 m resta temporaneamente sotto l'HUD aggiornato. Un nuovo E funziona immediatamente. Meglio aggiornare/cancellare l'avviso vecchio quando si entra in portata; il contatore in alto mi ha comunque permesso di capire.

## Screenshot decisivi

Tutti di questa riprova, senza confonderli con `captures/playtest-m2/`:

- `captures/playtest-m2-stepped/001.png` — titolo e scelta della prova.
- `captures/playtest-m2-stepped/005.png` — MIRATO molto a destra del +.
- `captures/playtest-m2-stepped/016.png` — Giostra libera, ancora 1/3.
- `captures/playtest-m2-stepped/017.png` — E da lontano, risposta distanza/portata riferita all'Officina.
- `captures/playtest-m2-stepped/019.png` — forte occlusione della camera vicino al riparo.
- `captures/playtest-m2-stepped/022.png` — prompt locale «E · Spegni Giostra dei regali» a 1,1 m.
- `captures/playtest-m2-stepped/023.png` — Giostra spenta e 2/3.
- `captures/playtest-m2-stepped/028.png` — schivata, protezione e cooldown.
- `captures/playtest-m2-stepped/030.png` — nemici ritrovati girando, avviso colpo in volo.
- `captures/playtest-m2-stepped/042.png` — Officina libera, danno e protezione temporanea.
- `captures/playtest-m2-stepped/045.png` e `captures/playtest-m2-stepped/046.png` — soglia E e messaggio distanza rimasto vecchio dopo il movimento.
- `captures/playtest-m2-stepped/047.png` — **completamento 3/3**, entrambe le destinazioni spente e fine segmento esplicita.

## Conclusione

L'obiettivo si comprende e **il segmento si completa attraverso la sola UI**, senza conoscere dati interni. I nomi delle destinazioni, i contatori e l'interazione locale E bastano a guidare il percorso. Nessuna morte o necessità di retry in questa riprova. Restano migliorabili camera vicino agli edifici, spiegazione dell'aggancio di mira e aggiornamento degli avvisi E; i clic senza risposta vanno prima isolati dal controllo automatico. Nessun nuovo MAJOR confermato.
