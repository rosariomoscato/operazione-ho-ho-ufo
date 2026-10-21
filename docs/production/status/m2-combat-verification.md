# M2 — verifica controllata combattimento: PASS

2026-10-21. **7 gruppi di verifica PASS**, zero pageerror. Strumento ripetibile: `node tools/check-street-combat.mjs`. Server sorgente Vite già attivo su `http://127.0.0.1:5174/`; override opzionale `COMBAT_URL` solo per server locale.

Report completo con dati numerici, eventi, fixture e hash sorgenti:

- `docs/evidence/step-08/combat/report.json` — copia permanente.
- `captures/street-combat/report.json` — copia di lavoro.

## Metodo e limiti

È una **verifica controllata della vera classe Game e dei veri sistemi**, non un playthrough, fresh-eyes o misura FPS. Un solo browser/context/pagina, viewport960×540, niente capture/video o timer lunghi. La risposta di `/src/main.ts` viene sostituita **solo nel browser**, anche quando Vite aggiunge una query timestamp: importa style/Game e conserva l'istanza in `window.__testGame` soltanto nella fixture. Nessun hook aggiunto al prodotto.

RAF fermo con `playing=false`; review normalmente true. Tempo avanzato chiamando `Game.update(.01)`, non aspettando secondi reali. La prova sweep usa intenzionalmente un singolo update2s, oltre al clamp del frame normale. Review disattivata solo per verificare il salvataggio automatico della cura e il restore reale; immediatamente congelati retry/Continue, senza un RAF intermedio.

Le fixture impostano posizione iniziale di player/NPC, HP iniziali, arena attiva e rimuovono dalla simulazione NPC non pertinenti (`hp0/gone`). Non sostituiscono damage, dodge, visible, committed, formule, metodi, collider o sistemi. Gli ostacoli rimangono quelli del mondo reale; acquisizione positiva, camera girata e cover usano `Game.visible()` vero. Conteggio slot controllato a **ogni tick**, contando singoli bolt vivi più ogni NPC in wind-up/active, non soltanto il booleano del sistema.

Hash dei sei sorgenti coinvolti identici prima/dopo il run. **Nessuna modifica a core, dist, snapshot o strumenti dell'integratore**, nessun commit/agente/spesa. La build/fresh-eyes su5175 non è stata rimpiazzata o rigenerata.

## Risultati effettivi

| Gruppo | Evidenza osservata |
|---|---|
| Telegraph, lock, recovery, slot globale | Release a1.21s, wind-up1.2000000000000008s, lockedFor1.0000000000000009s. Direzione0.0570807824rad immutata in94campioni dopo lock, vettore del bolt invariato. Recovery1.21s. Massimo committed1 con melee eleggibile e durante301campioni di volo. Caso inverso: melee acquisisce, ranged non avvia wind-up. Acquisizione off-screen realmente rifiutata. |
| Cover e sweep | Dopo lock il player è posto dietro il trenino reale. Update2s: primo impatto `street-train-cover`, z=-2.18, bolt consumato, HP6, nessun hurt. Non è un test del solo estremo del segmento. |
| Parete / corsia libera | Cover prima dell'acquisizione impedisce wind-up. Corsia centrale libera: un unico `player-hurt`, HP6→5, stesso attackID dell'impatto/consumo; nessun secondo danno al tick successivo. |
| Schivata reale | `Game.dodge()` a1.88s con bolt a1.46m; protezione reale fino2.23s. Contatto a1.94s: `hit-avoided` ranged, bolt consumato, HP6, zero hurt. Nessun override di invulnerabilità/damage. |
| Cura e persistenza | Pickup3→5, flag `healed:true` scritto automaticamente nello schema2. Non ripete sul posto. Retry reale e Continue reale conservano flag/capitolo; ferita controllata a3HP sul punto cura rimane3, quindi niente farm. A6HP il pickup resta disponibile; a5HP cura fino6, non7. |
| Nave e fine locale | Nodo reale della nave: seek0/1.5/3→y8/5.5/3. Secondo E vero a.7s completa immediatamente3/3; quote live8/5.5/3 ai tempi.7/2.2/3.7. Continue completo riparte a tempo0 con nave giày3 e contatore3. |
| Interazioni indipendenti | E vicino a Officina protetta: motivo protected, IDworkshop,3guardie e spiegazione nel DOM. E da20.6155m: motivo out-of-range, nome/distanza e spiegazione nel DOM. Officina libera si spegne con3melee ancora vivi; Giostra libera si spegne con3ranged ancora vivi. E ripetuto resta2/3, nessun doppio conteggio. |

Scadenza del bolt mancato osservata al successivo tick a età3.01s: quantizzazione del test. Non viene presentata come precisione esatta al millisecondo o simulazione continua.

## Cosa non conclude questa verifica

Non ripete i due ordini E2E già verificati dall'integratore e non attribuisce nuovi giudizi narrativi/visivi. Non diagnostica il vecchio ritorno al cortile: non riprodotto qui, nessun fix core effettuato. Il primo tentativo dello strumento non intercettava la query Vite dell'entry ed è terminato in timeout; corretta soltanto la regex del nuovo tool e successivi run completi PASS.

Nessun M3 costruito. **Ownership del nuovo tool e di questo status libera per l'integratore.**
