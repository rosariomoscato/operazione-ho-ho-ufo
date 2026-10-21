# M2 — La via dei giocattoli

2026-10-21. L'utente ha chiesto di continuare. Domande iniziali interrotte: manteniamo impostazioni già usate (review snella, audio gratuito, cartella unica con proprietà separate), scelte tecniche coerenti e check-in dopo l'atto. Nessun consenso a spesa/pubblicazione o a copie Git separate è inferito.

## Scope e contratto narrativo

M1 resta congelato in `snapshots/m1-slice/`, mai modificato. La versione corrente collega il cortile alla nuova via attraverso il cancello; M2 termina dopo gli altri due ancoraggi, a **3/3**. La nave scende verso la piazza, ma niente boss, recupero nucleo o salvataggio del mondo ancora: M3 aspetta il playtest utente.

Due arene accessibili in qualunque ordine. Officina: tre rettiliani a distanza, colpi annunciati, ripari reali. Giostra: tre rettiliani da mischia e oggetti da giocattolo; il movimento già appreso resta utile. Regali infiniti, 2 colpi per alieno, salute6, schivata/cure/testi già collaudati. Nessun timer o ondata di riempimento per fare minutaggio.

Si può colpire un difensore prima di entrare: attiva la sua arena, non diventa invulnerabile. Un ancoraggio dipende solo dai difensori della propria arena, mai dall'altra. Salvare separatamente arene liberate, ancoraggi disattivati e cura consumata; retry non ripropone obiettivi già fatti. Le etichette devono rendere chiaro quale lato resta.

## Coordinate e geometria (metri)

Riutilizzare bounds x[-15,15], z[-15,13], piano y=0 e cerchi collisione .48/.42. Ogni atto ha coordinate locali; transizione al cancello a piedi/E, senza nuova modalità di trasporto.

Fonte eseguibile: `src/acts/toystreet.ts`.

| Anchor | x | z |
|---|---|---|
| Ingresso dal cortile | 0 | 10 |
| Ancoraggio Officina | -8 | -9 |
| Ancoraggio Giostra | 8 | -9 |
| Cura centrale | 0 | 0 |
| Uscita verso piazza | 0 | -13.5 |
| Nave scenica | 0 | -20 (y8→3 dopo3/3) |

Collider concordati, copertura senza bloccare corridoio centrale x[-3,3]:

- `street-west-shop`: x[-14,-10], z[-1,4].
- `street-east-shop`: x[10,14], z[-1,4].
- `street-train-cover`: x[-10,-6], z[-2,-.5], altezza circa1.6.
- `street-carousel-cover`: x[6,10], z[-2,-.5], altezza circa1.6.

Tutti gli spawn del file atto sono fuori dai collider. Non piazzare collider sul centro degli ancoraggi, per non far fallire la linea di vista dell'interazione. Decori grandi fuori dal percorso; niente oggetti apparentemente solidi attraversabili sul corridoio. Budget mondo ≤40k triangoli/25call per lasciare margine a6alieni, Santa, pacchi e colpi. Stile/materiali e luce A, senza nuove texture/modelli esterni.

## Pay-down prima dell'integrazione

- Registro atti da `src/acts/*.ts`, cast da `src/characters/cast/*.ts`, livelli già globbed; sistemi/scenari separati per area, non nuovo monolite di liste condivise.
- `ActDefinition` e optional `world.anchors`/`setAnchors` definiti in `src/contracts.ts`. Le arene sono dati in file atto, non coordinate duplicate nel renderer e nel gameplay.
- Portare i salvataggi a schema che conserva capitolo e progressi per lato; migrazione dei checkpoint v1 del cortile verificata, snapshot M1 non cambia. Gestire schema malformato/storage negato. Nessuna cancellazione implicita di progressi per avvio della pagina.
- Il vecchio flusso Nuova partita/Continua resta funzionante. L'accesso alla via è guidato dopo M1; una eventuale prova diretta del secondo atto deve essere un comando esplicito sul titolo, non un salto segreto automatico.
- Ranged in un modulo dedicato con test su telegraph, direzione bloccata, collisioni proiettile e pause; parametri registrati/add-a-file, capture scenari in moduli separati. Nessun colpo a sorpresa completamente fuori schermo.

## Proprietà dei file

- Integratore: contratti/dati atti/piani prima della costruzione, strumenti/test/report, raccordo finale; non modifica file dei builder mentre attivi.
- Builder gameplay: `src/game.ts`, `src/storage.ts`, `src/input.ts`, `src/style.css`, `src/texts.ts`, nuovi `src/gameplay/`, `src/registries.ts`, `src/scenarios/`, loader cast `src/characters/index.ts`, wrapper cast base. Nessun world nuovo, snapshot o tool.
- Builder visuale: solo `src/levels/toystreet.ts`, `src/characters/cast/shooter.ts`, eventuali `src/visual/street*.ts`, proprio status. Nessun core/materiale condiviso/contratto.
- Reviewer combinato: spec prima e review dopo in docs; fresh-eyes browser senza docs/codice/debug. Pochi collaboratori, nessun acquisto o deploy.

## Audio e gate

Riutilizzare file gratuiti approvati: music.village/combat, ambience.snow, sfx.alien/wrap/anchor/hurt/heal/checkpoint. **0 crediti**. Non generare audio nel browser. Nessun doppiaggio o meccanica ritmica.

Gate prima dell'utente: build/typecheck, regressioni M1, entrambi ordini di M2, interazioni prima/fuori portata, save/retry/Continua per ciascun lato, proiettili contro ripari e schivata,0errori, palette/UI/fotosensibilità/budget e prova software mirata. Review senza BLOCKER/MAJOR, playtester indipendente completa M2. Non garantire durata10–15min o60fps prima delle misure.

Quando passa, fermarsi per far provare M2: niente costruzione M3 finché non arriva il feedback.
