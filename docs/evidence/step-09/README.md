# Prove rifinitura — TmJx2Hx1

Fonte autorevole: `release-gates.json`, `source-manifest.json` e `docs/reviews/polish-final-review.md`. La versione consegnata è `snapshots/polished-1/`, su5181; approvata dall'utente con «si, mi sembra pronta». Passo9 completato, nessuna pubblicazione autorizzata.

- `unit-tests.txt`:45PASS (log PowerShell UTF-16LE).
- `camera/`, `controls/`, `controlled/`: griglia864pose,7casiUI e9casiM3; hash prima/dopo nei report.
- `captures/`:27frame finali, audit1080/colore/software, hash build invariati.
- `playthrough/report.json` + `ending.png`: partita reale completata25lanci2morti,279.762swall, non durataumana.
- `fresh-eyes/`:14fotogrammi e registro UI del nuovo tester completo; pauseEsc reali/audio muto dichiarati nel report testuale.
- `frozen-smoke/`: verifica della copia congelata su5181 (Nuova partita, impostazioni, sciarpa/finale/selfTest).
- `audio/`: test del mixer reale, non nuova approvazione soggettiva d'ascolto.

## Artefatti storici: non confondere i fotogrammi fra tentativi

`pre-integration/` conserva i report falliti prima dei fix del driver e dei retry a freddo; nessuno è promosso retroattivamente a PASS. I tool riusano la directory `captures/full-playthrough/` senza cancellare vecchi PNG: nelle copie preliminari `ending.png` può appartenere a una precedente esecuzione riuscita, e **`playthrough/failure.png` è un residuo del tentativo precedente, non un errore della partita finale PASS**. Sono conservati per non nascondere la cronologia, ma non usati come prova finale: per attribuire un esito leggere sempre `report.json`; soltanto `playthrough/ending.png` è la cattura di vittoria prodotta dal run finale qui dichiarato.

Nessuna misura garantisce60fps su hardware utente o durata umana10–15min. Un MINOR residuo nella composizione finale ampia è documentato nel BACKLOG/review; non è la compressione della camera gameplay, che è stata corretta.
