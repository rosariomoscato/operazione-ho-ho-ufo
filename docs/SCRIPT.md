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

## Primo segmento — varianti e testi di servizio

Implementazione del cortile, stessi eventi della storia approvata. Le varianti brevi mantengono il significato senza introdurre nuove regole. Dialoghi e UI solo a testo; nessuna registrazione prevista. Le parentesi `{...}` indicano variabili.

| ID | Personaggio | Testo | Direzione | Tipo | Stato |
|---|---|---|---|---|---|
| vo.briciola.theft.short | Briciola | Hanno rubato il nucleo per aprire un portale sulla Terra! | Introduzione compatta | radio | — |
| vo.briciola.training | Briciola | Hanno rubato il nucleo! Il portale minaccia la Terra. Proviamo i regali sul drone. | Dopo skip o fine introduzione | radio | — |
| vo.briciola.heal | Briciola | Campanello al centro! Se sei ferito, raccoglilo per recuperare 2 punti. | Cura facoltativa dopo il gruppo B | radio | — |
| vo.briciola.clear | Briciola | Area libera! Vai al dispositivo e premi E. | Sei difensori neutralizzati | radio | — |
| ui.new | — | Nuova partita | Reset scelto esplicitamente | UI | — |
| ui.continue | — | Continua | Solo checkpoint valido | UI | — |
| ui.restart.checkpoint | — | Ricomincia checkpoint | Pausa/sconfitta | UI | — |
| ui.title.return | — | Titolo | Menu | UI | — |
| ui.slice.replay | — | Rigioca il cortile | Fine segmento | UI | — |
| ui.slice.end | — | Fine del primo segmento · La via dei giocattoli non è ancora giocabile. | Non promettere accesso al seguito | UI | — |
| ui.slice.anchor | — | Ancoraggio 1/3 · Cortile liberato | Successo parziale, non fine del mondo | UI | — |
| ui.controls.pc | — | WASD: muovi · Destro trascinato: mira al + · Clic: tira al +, non al mouse · Spazio: schiva · E: dispositivo · Esc: pausa | Comandi permanenti | UI | — |
| ui.objective.training | — | Allinea il drone al + centrale e lancia | Tutorial | UI | — |
| ui.objective.dodge | — | Prova la schivata: Spazio | Tutorial | UI | — |
| ui.objective.battle | — | Libera il cortile · {count} difensori | Include gruppi non ancora entrati | UI | — |
| ui.objective.anchor | — | Spegni il primo ancoraggio: E | Tutti i difensori neutralizzati | UI | — |
| ui.anchor.protected | — | Ancoraggio protetto · {count} difensori da impacchettare | E premuto prima di liberare area | UI | — |
| ui.anchor.range | — | Ancoraggio a {distance} m · avvicinati a meno di 2,2 m | E fuori portata | UI | — |
| ui.drone.done | — | Drone disattivato · 1/1 | Feedback distinto da alieno sconfitto | UI | — |
| ui.gift.wait | — | Regalo in preparazione · {seconds} s | Cadenza, nessun input silenzioso | UI | — |
| ui.gift.air | — | I pacchi sono in volo: riprova fra un istante. | Pool pieno | UI | — |
| ui.gift.miss | — | Il regalo va al + centrale, non al mouse. Gira con il destro e avvicinati (12 m). | Nessun colpo riuscito | UI | — |
| ui.gift.hit | — | Colpito · 1 tacca rimasta | Primo danno a rettiliano | UI | — |
| ui.dodge.protected | — | Schivata · protetto | Schivata riuscita | UI | — |
| ui.dodge.cooldown | — | Schivata in recupero · {seconds} s | Recupero | UI | — |
| ui.hurt | — | Colpito · −1 salute · protetto 1,25 s | Invulnerabilità senza lampeggi | UI | — |
| ui.heal | — | Campanello raccolto · +2 salute | Solo se ferito | UI | — |
| ui.storage.unavailable | — | Salvataggio non disponibile: puoi continuare questa partita. | Storage negato, niente promesse di persistenza | UI | — |
| ui.retry.checkpoint | — | Si riparte dal checkpoint · salute ripristinata | Gruppi precedenti conservati | UI | — |
| ui.settings.master | — | Volume generale | Impostazione | UI | — |
| ui.settings.reduced | — | Riduci movimento | Impostazione | UI | — |
| ui.settings.assist | — | Mira assistita | Impostazione | UI | — |
| ui.wrap.parcel | — | Pacco rettiliano | Etichetta durante impacchettamento | UI | — |
| ui.wrap.shipped | — | ↑ Spedito alla nave | Conferma locale prima del teletrasporto | UI | — |
| ui.aim.locked | — | ◎ MIRATO | Indicatore collegato al bersaglio nella scena | UI | — |
| ui.aim.training | — | Destro trascinato: porta il drone al +. Poi CLIC quando è MIRATO. | Spiegare la mira, non il puntatore mouse | UI | — |
| ui.threat.side | — | ! {direction} · Destro: gira e mira | Rettiliano vicino fuori dal fronte di tiro | UI | — |
| ui.heal.marker | — | ✚ Cura +2 | Etichetta collegata alla cura quando feriti | UI | — |

I testi tecnici di reticolo, distanza, HP e recupero sono indicatori dinamici, non battute. La presenza di una riga in questa sezione non certifica che l'interazione sia stata verificata: prove nel report M1.

## Secondo segmento — varianti e testi di servizio M2

Testi implementati nella versione corrente; non cambiano lo snapshot M1. Le durate indicate nei titoli della prima stesura sono obiettivi narrativi, non tempi misurati. La piazza e il boss non sono ancora giocabili.

| ID | Personaggio | Testo | Direzione | Tipo | Stato |
|---|---|---|---|---|---|
| vo.briciola.street | Briciola | Due ancoraggi: Officina o Giostra, scegli tu. Libera un lato, poi premi E sul suo dispositivo. | Ingresso M2, ordine libero | radio | — |
| vo.briciola.square | Briciola | Scudo spento! La nave scende verso la piazza. Il nucleo è ancora là: ci fermeremo prima del prossimo scontro. | Variante M2; non vittoria globale | radio | — |
| ui.street.preview | — | Prova la via dei giocattoli | Partita di prova separata, non sostituisce il salvataggio | UI | — |
| ui.street.end | — | Tre ancoraggi spenti · Fine del secondo segmento. La piazza non è ancora giocabile. | Limite esplicito della build | UI | — |
| ui.street.protected | — | {name} protetto · {count} difensori locali | L'altra arena non blocca il dispositivo | UI | — |
| ui.street.range | — | {name} · {distance} m: avvicinati entro 2,2 m | E fuori portata | UI | — |
| ui.street.clear | — | {name} libera · E al suo ancoraggio | Progresso locale distinto da ancoraggio spento | UI | — |
| ui.street.cover | — | Riparo: colpo fermato | Conferma collisione reale del proiettile | UI | — |
| ui.street.help | — | H: aiuto | Aiuto immediato; scala automatica dopo 15/30/45s senza progresso | UI | — |
| ui.street.goal | — | Libera un lato, poi E · Ancoraggi {count}/3 | Obiettivo operativo persistente | UI | — |
| ui.street.goal.ready | — | Spegni l’ancoraggio pronto: E · Ancoraggi {count}/3 | Il lato indicato è libero ma ancora acceso | UI | — |

`ui.slice.end` rimane testo storico della copia congelata; non descrive più il raccordo corrente dal cortile alla via. Review e prove M2 devono verificare separatamente quanto dichiarato qui.

## Terzo segmento — testi runtime e continuità finale

La variante `vo.briciola.square` della sezione M2 resta nello snapshot approvato. Nella versione corrente con M3 accessibile viene sostituita dal testo sotto; stesso ID narrativo, nessuna voce. Boss sconfitto e nucleo raccolto **non** significano ancora vittoria: restituzione all'albero e chiusura effettiva del portale vengono prima di `vo.briciola.saved`.

| ID | Personaggio | Testo | Direzione | Tipo | Stato |
|---|---|---|---|---|---|
| vo.briciola.square | Briciola | Scudo spento! La nave scende verso la piazza. Il nucleo è ancora là: raggiungi il cancello e premi E! | Variante corrente, accessoM3 | radio | — |
| ui.square.approach | — | Avvicinati al generale nella piazza | Prima del cerchio encounter | UI | — |
| ui.square.boss | — | Schiva il cono; poi colpisci il nucleo esposto | Obiettivo persistente durante boss | UI | — |
| ui.square.howto | — | Esci dal cono, poi porta il nucleo al+ e lancia quando è esposto. Un regalo valido per ciclo. | Finché non riesce il primo colpo | hint | — |
| ui.square.shield | — | Scudo del generale attivo · schiva il raggio | Scudo personale, non ancoraggi da ripetere | UI | — |
| ui.square.range | — | Avvicinati al nucleo: portata12m | Regalo fuori portata | UI | — |
| ui.square.hit | — | Colpo riuscito {count}/3 | Un solo segmento per finestra | UI | — |
| ui.square.miss | — | Finestra mancata: stesso ciclo. Schiva e riprova, nessun segmento perso. | Ripetizione senza perdere progressi | UI | — |
| ui.square.core | — | Recupera il nucleo libero: E | Dopo terzo colpo, interazione immediata | UI | — |
| ui.square.tree | — | Riporta il nucleo all’albero: E | Nucleo al sicuro, punto E fuori dal tronco | UI | — |
| ui.square.already | — | Nucleo già al sicuro: portalo all’albero. | Nessun pickup duplicato | UI | — |
| ui.square.returned | — | Nucleo restituito · un regalo anche per Squamakk | Prima della chiusura effettiva | UI | — |
| ui.square.skip | — | Salta finale | Stesso stato terminale e stesso salvataggio | UI | — |
| ui.square.replay | — | Nuova avventura | Reset esplicito dopo conclusione | UI | — |

Il finale riusa `vo.squamakk.defeat`, `vo.santa.scarf`, `vo.briciola.saved` e `ui.ending` già previsti. La sciarpa è visiva sul pacco prima del ritiro della nave; portale chiuso, partenza slitta e vittoria seguono in quest'ordine. Gli aiutiH/15/30/45 e i messaggi di distanza sono feedback dinamici, non battute doppiate. Tempi del bot/tester remoto non sono durata umana promessa.
