# Operazione Ho Ho UFO — Sceneggiatura v1

Prima stesura derivata dal concept approvato il 2026-10-20. Le singole battute possono essere riviste. Al passo 4 l'utente ha scelto audio gratuito e dialoghi solo a testo: nessuna voce da registrare, nessun casting. Gli ID `vo.*` restano stabili e identificano le battute dei personaggi, non file vocali.

## Registro e politica audio

ID stabili: `vo.*` battute, `h.*` suggerimenti, `ui.*` interfaccia. Stati: ⏳ non registrato (solo candidato al doppiaggio, non autorizzazione di spesa); — non doppiato; ✅ registrato (aggiungere percorso e take).

Mai rigenerare o modificare manifest di una riga ✅ senza richiesta esplicita. Lo strumento `tools/gen-audio.mjs` implementa soltanto il percorso gratuito per musica ed effetti, con cache e registro a zero crediti; non può registrare voci. Un eventuale futuro doppiaggio richiede nuova decisione, preventivo e approvazione dei costi.

Direzione espressiva dei testi: Babbo Natale bonario e asciutto; Briciola rapida ed energica; Squamakk pomposo e buffo. Nessun doppiaggio previsto. Le indicazioni spoken/radio descrivono la scena, non riproduzione vocale.

## Menu e apertura (0–1 min)

| ID | Personaggio | Testo | Direzione | Tipo | Stato |
|---|---|---|---|---|---|
| ui.title | — | Operazione Ho Ho UFO | Titolo | UI | — |
| ui.start | — | Gioca | Pulsante | UI | — |
| ui.settings | — | Impostazioni | Pulsante | UI | — |
| vo.squamakk.battery | Squamakk | Confischiamo questa batteria decorativa! | Trionfante, durante il furto | spoken | — |
| vo.briciola.theft | Briciola | Hanno rubato il nucleo! Lo stanno usando per aprire un portale sulla Terra! | Allarme, chiara | radio | — |
| vo.santa.coal | Babbo Natale | Quest'anno, carbone per tutta la galassia. | Calmo, deciso | spoken | — |
| ui.skip | — | Salta introduzione | Azione attivabile anche da tastiera | UI | — |

## Cortile e primo ancoraggio (1–4 min)

| ID | Personaggio | Testo | Direzione | Tipo | Stato |
|---|---|---|---|---|---|
| ui.move | — | WASD: muoviti · Mouse: guarda e mira | Mostrare in zona sicura | UI | — |
| h.throw | — | Mira al drone e premi il clic sinistro per lanciare un regalo. | Nascondere dopo il primo colpo riuscito | hint | — |
| h.dodge | — | Premi Spazio per schivare. | Prova sicura, attacco annunciato | hint | — |
| vo.santa.wrapped | Babbo Natale | Impacchettato. Senza scontrino. | Dopo il primo alieno neutralizzato | spoken | — |
| vo.briciola.anchors | Briciola | Tre ancoraggi, capo. Spegnili e la nave viene giù! | Istruzione alla radio | radio | — |
| ui.goal.anchors | — | Disattiva gli ancoraggi: {count}/3 | Obiettivo persistente | UI | — |
| h.anchor | — | Libera l'area, poi premi E vicino all'ancoraggio per disattivarlo. | Presso il primo dispositivo | hint | — |
| ui.anchor.blocked | — | Ancoraggio protetto: impacchetta i nemici segnalati. | Feedback all'interazione prematura | UI | — |
| ui.interact | — | E: interagisci | Solo a distanza valida | UI | — |
| ui.anchor.done | — | Ancoraggio disattivato: {count}/3 | Conferma immediata | UI | — |
| vo.briciola.route | Briciola | Elfi liberi! Gli altri due ancoraggi sono lungo la via dei giocattoli. | Sollievo, indicazione breve | radio | — |

## Via dei giocattoli (4–8 min)

| ID | Personaggio | Testo | Direzione | Tipo | Stato |
|---|---|---|---|---|---|
| h.route | — | Segui gli indicatori: puoi disattivare i due ancoraggi in qualunque ordine. | Entrando nella via | hint | — |
| h.health | — | Raccogli un campanello per recuperare salute. | Prima cura, mai bloccare il controllo | hint | — |
| ui.health | — | Salute | Etichetta della barra | UI | — |
| ui.dodge.ready | — | Schivata pronta | Indicatore | UI | — |
| ui.dodge.wait | — | Schivata in ricarica | Feedback alla richiesta durante recupero | UI | — |
| h.shield | — | La nave ha ancora lo scudo: disattiva tutti e tre gli ancoraggi. | Primo colpo sullo scudo; non ripetere continuamente | hint | — |
| vo.squamakk.gifts | Squamakk | Smettetela di accettare pacchi dal nemico! | Dopo il secondo ancoraggio complessivo | spoken | — |

## Discesa della nave (8–9 min)

| ID | Personaggio | Testo | Direzione | Tipo | Stato |
|---|---|---|---|---|---|
| vo.briciola.square | Briciola | Scudo spento! La nave scende in piazza. È il tuo momento! | Entusiasta | radio | — |
| vo.squamakk.parking | Squamakk | Questo non era il parcheggio riservato! | Offeso mentre la nave scende | spoken | — |
| ui.goal.square | — | Raggiungi la piazza dell'albero. | Obiettivo con indicatore | UI | — |
| ui.checkpoint | — | Checkpoint raggiunto | Breve conferma | UI | — |

## Boss (9–12 min)

| ID | Personaggio | Testo | Direzione | Tipo | Stato |
|---|---|---|---|---|---|
| ui.boss.name | — | Generale Squamakk | Barra boss | UI | — |
| ui.goal.boss | — | Schiva il raggio e colpisci il nucleo quando si illumina. | Obiettivo durante lo scontro | UI | — |
| h.boss.warning | — | Raggio in arrivo: esci dalla zona segnalata! | Primo attacco | hint | — |
| h.boss.window | — | Il nucleo è scoperto: lancia i regali! | Prima finestra vulnerabile | hint | — |
| vo.squamakk.defeat | Squamakk | Protesto! Non ho nemmeno scritto la letterina! | Sconfitto, sorpreso | spoken | — |

## Restituzione e finale (12–13 min)

| ID | Personaggio | Testo | Direzione | Tipo | Stato |
|---|---|---|---|---|---|
| ui.goal.core | — | Recupera il nucleo dalla nave: premi E. | Interazione guidata | UI | — |
| ui.goal.tree | — | Riporta il nucleo all'albero: premi E. | Indicatore albero | UI | — |
| vo.briciola.saved | Briciola | Portale chiuso. Terra salva. Ma ci sono ancora le consegne! | Sollevata, poi vivace | radio | — |
| vo.santa.scarf | Babbo Natale | Anche per te, Squamakk. Niente invasioni fino al prossimo Natale. | Gentile, consegna della sciarpa | spoken | — |
| ui.ending | — | Mondo salvato. Natale consegnato. | Titolo finale | UI | — |
| ui.replay | — | Gioca di nuovo | Pulsante finale | UI | — |

## Testi condivisi e impostazioni

| ID | Personaggio | Testo | Direzione | Tipo | Stato |
|---|---|---|---|---|---|
| ui.pause | — | Pausa | Menu; sospendere anche il suono | UI | — |
| ui.resume | — | Riprendi | Pulsante | UI | — |
| ui.retry | — | Si riparte dal checkpoint! | Sconfitta o caduta; nessun obiettivo completato perso | UI | — |
| ui.retry.action | — | Riprova | Pulsante | UI | — |
| ui.music | — | Volume musica | Impostazione | UI | — |
| ui.effects | — | Volume effetti | Impostazione | UI | — |
| ui.voice | — | Volume voci | Mostrare solo se presenti | UI | — |
| ui.subtitles | — | Sottotitoli | Impostazione | UI | — |
| ui.motion | — | Riduci movimento e lampi | Impostazione | UI | — |
| ui.aim | — | Mira assistita | Impostazione | UI | — |
| ui.loading | — | Preparazione dei regali… | Caricamento | UI | — |
| ui.load.error | — | Caricamento non riuscito. Riprova. | Errore recuperabile, pulsante Riprova | UI | — |

Le variabili come `{count}` vengono sostituite dal gioco; non sono battute da registrare. Nuovi testi emersi durante lo sviluppo vanno aggiunti qui con nuovi ID prima della registrazione.
