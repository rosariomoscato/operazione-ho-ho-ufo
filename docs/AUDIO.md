# Audio — Natale arcade

Scelta utente del 2026-10-20: **percorso gratuito**, **Natale arcade**. Solo dialoghi a testo, nessun casting o voce sintetica. Il verso rettiliano è un effetto non verbale. Passo 5 (labiale) saltato come previsto dalla skill per il percorso gratuito.

## Stato

Proposta **approvata dall'utente** il 2026-10-20 con «va bene», dopo la presentazione della pagina ascolto. Controlli tecnici e playback browser verificati. Nessun gioco ancora implementato.

## File e strumenti

- `tools/audio/manifest/opening.json`: 11 asset per apertura e futuro primo segmento giocabile.
- `tools/gen-audio.mjs`: renderer offline deterministico, WAV PCM16 mono a 44.1 kHz. Nessuna chiamata di rete, nessuna chiave API.
- `public/audio/<hash>.wav`: file statici. Hash della richiesta completa, versione generatore e sample rate; file esistenti riutilizzati senza rigenerarli. Cambiare una ricetta richiede incrementare VERSION prima di generare nuovi file; mai cancellare audio di demo storiche.
- `public/audio/<hash>.svg`: forme d'onda generate dal PCM.
- `public/audio/index.json`: indice con ID, percorsi relativi, nomi, durata, bpm, loop e analisi.
- `tools/audio/ledger/opening-free.json`: registro riproducibile delle richieste, **0 crediti, 0 chiamate API**. Non è un estratto conto di un servizio: nessun account è coinvolto.
- `tools/audio/audition.html`: ascolto singolo e prova narrativa di 12 secondi.

```powershell
npm.cmd run audio:plan
npm.cmd run audio:build
npm.cmd test
node tools/check-audio.mjs
```

Dry-run sempre prima della generazione. Non esiste modalità a pagamento; qualsiasi futuro cambio di percorso richiede documentazione, preventivo, approvazione e implementazione separata.

## Contenuto

| ID | Durata | Uso | Picco |
|---|---|---|---|
| music.village | 16 s, loop | Campanelli, basso morbido, arpeggi | -9 dBFS |
| music.combat | 16 s, loop | Tema originale più ritmato, piccole percussioni | -9 dBFS |
| ambience.snow | 8 s, loop | Vento lieve e ronzio alieno | -22 dBFS |
| sfx.throw | .5 s | Fischio e campanello del lancio | -6 dBFS |
| sfx.wrap | .9 s | Pop e cascata di note | -6 dBFS |
| sfx.dodge | .35 s | Fruscio della schivata | -10 dBFS |
| sfx.alien | .65 s | Protesta elettronica non verbale | -9 dBFS |
| sfx.anchor | 1.4 s | Spegnimento e conferma | -7 dBFS |
| sfx.checkpoint | 1 s | Tre note ascendenti | -9 dBFS |
| sfx.hurt | .4 s | Tonfo da giocattolo | -10 dBFS |
| sfx.heal | .9 s | Scintillio curativo | -9 dBFS |

Musica originale di 8 battute, 4/4, 120 BPM; nessuna citazione di brani natalizi esistenti. Sintesi di campane con armoniche inarmoniche, basso sinusoidale e rumore con seed. I loop chiudono a zero per evitare salti nel PCM; la piacevolezza della ripetizione va confermata all'ascolto. Non è un gioco ritmico: nessun input dipende dal beat.

## Mix e interazione

Anteprima: musica .30, vento .20, effetto .65. Singoli asset al volume iniziale .55. Iniziare a volume moderato. Musica ed effetti hanno controlli indipendenti nei player di prova; mixer gameplay separato da costruire al passo 6.

Solo file statici riprodotti con HTMLAudio: nessun oscillatore/API generativa nel browser. Avvio dopo clic, stop e reset di tutti i player, stop se la scheda diventa nascosta. La prova usa il tempo della traccia per le didascalie; non è sincronizzazione musicale di gameplay. La musica va in pausa insieme al gioco in futuro.

I dialoghi in SCRIPT sono obbligatoriamente leggibili senza audio, con nome del personaggio. Non applicare ducking vocale fittizio: non ci sono voci. Suoni di pericolo e conferme devono avere anche feedback visivo.

## Qualità verificata

- Tutti gli 11 WAV deterministici byte per byte a parità di richiesta.
- Nessun campione clippato/non finito, offset DC < .01, salto alle estremità ≤.001, durata e picco conformi al manifest.
- Analisi RMS/peak salvata nell'indice; **nessuna normalizzazione LUFS dichiarata**. I livelli sono peak-normalized, non loudness-matched per percezione.
- Browser Edge carica e avvia tutti gli asset, rileva correttamente le durate, esegue la prova di 12 s e ferma ogni traccia. Riavvio e stop verificati.
- Server locale aggiornato con Content-Length, MIME WAV e richieste byte-range per durata/seek affidabili.
- Pagina senza overflow a 390 px, waveform osservate. Screenshot e report: `docs/evidence/step-04/`.

Audio approvato per iniziare il primo segmento giocabile. Eventuali modifiche successive vengono registrate nel backlog senza sovrascrivere gli asset delle demo storiche.
