# Operazione Ho Ho UFO

Action comico 3D per browser. Concept approvato, strumenti di verifica pronti; gioco non ancora implementato.

## Avvio locale

Richiede Node 20+ e Chrome/Edge installato.

```powershell
npm.cmd ci
npm.cmd run dev
```

Aprire http://127.0.0.1:5173/tools/testscene.html per il laboratorio tecnico (non è lo stile definitivo).

## Controlli

```powershell
npm.cmd test
npm.cmd run capture
node tools/capture.mjs "tools/testscene.html?lift=0.05" --selftest --out captures/planted-error
```

L'ultimo comando **deve fallire**: riproduce un pacco sollevato di 5 cm. Senza il parametro la scena è corretta. Output in `captures/`; prove permanenti in `docs/evidence/step-02/`.

Su Windows usare `npm.cmd` se PowerShell blocca `npm.ps1`. Non è necessario cambiare la execution policy. Per un browser in posizione diversa impostare `BROWSER_PATH`.

Stato e prossimi passi in `docs/HANDOFF.md`; regole in `AGENTS.md`.
