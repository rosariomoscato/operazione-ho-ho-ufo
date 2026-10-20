# Design system — Vinile morbido

Scelta **A** approvata dall'utente il 2026-10-20. Riferimento eseguibile: `design/styles/vinyl.html`. Sorgente generatore: `tools/build-style-mockups.mjs`, configurazione `vinyl` e funzione `sceneCode`. Gli altri mockup non sono riferimenti per nuovi asset.

## 1. Pilastri

- Un villaggio di giocattoli da collezione: volumi arrotondati, silhouette semplici, grandi visi.
- Natale caldo contro invasione buffa, mai gore o realismo minaccioso.
- La leggibilità in terza persona vince sui dettagli del diorama.
- Tutta la grafica è codice riproducibile: nessun modello o texture scaricati.

## 2. Palette

Colori sRGB di base dei materiali, non colori di ogni pixel dopo illuminazione e tone mapping.

| Token | Hex | Uso |
|---|---|---|
| santa-red | `#e94750` | Cappotto e cappello |
| alien-green | `#7cbf56` | Rettiliani e abeti |
| space-purple | `#7062b8` | Armature, UFO, pacco campione |
| snow | `#e1eff5` | Terreno e neve |
| cream | `#fff0d5` | Barba, guanti, bordi |
| skin | `#f4ba93` | Viso e naso |
| ink | `#202d42` | Occhi, stivali, cintura, dettagli |
| gold | `#f8be55` | Nastri, fibbia, finestre, occhi alieni |
| roof | `#596a9b` | Tetto |
| timber | `#987562` | Tronchi e basamento |
| mint | `#a4f8d9` | Segnalatori alieni luminosi |
| sack | `#9b6547` | Sacco |
| cabin | `#a5585b` | Casette |
| evening-sky | `#182c49` | Fondo e nebbia |

Non aggiungere materiali fuori palette senza aggiornare documento e `LC.visualMetadata()`. `ink` è il minimo valore per superfici importanti, nessun nero puro esteso. Rosso/verde non sono gli unici segnali: cappello e barba identificano Babbo Natale; muso, cresta e coda identificano i rettiliani. Gli obiettivi usano anche icona, testo e posizione. Accenti luminosi limitati a piccoli dettagli, non intere facciate.

## 3. Libreria materiali

Portare `toyMaterial(color, extra)` dal mockup: `MeshStandardMaterial`, roughness **0.48**, metalness **0**, flatShading **false**. Geometrie rotonde a 24 segmenti per gli elementi vicini; ridurli per quelli lontani. Non usare `grainTexture`, superfici sfaccettate o parametri lucidi della variante C.

- Vestiti, pelle e neve mantengono finitura da vinile; le forme, non texture fotorealistiche, distinguono le parti.
- `glow`: base mint, emissive `#46c9b2`, intensità **0.4**. Il colore emissivo non è una luce reale.
- Ombre di contatto: funzione `shadow`, texture radiale costruita su canvas, piano a y=0.004, depthWrite false. Non sovrapporre decal coplanari.
- Riutilizzare `mesh`, `ball`, `cube`, `cylinder`, `link`; condividere geometrie/materiali e instanziare gli oggetti ripetuti nel gioco. Il mockup non è già una soluzione ottimizzata per folle.

## 4. Personaggi

Coordinate in metri, pavimento y=0. Babbo Natale alto circa 3.01 m inclusi cappello/pompon; corpo ellissoidale con semiassi .59/.66/.43, centro a .94 m. Testa con semiassi .4/.41/.34 a 1.85 m; occhi ampi e sopracciglia bianche. Stivali con fondo a zero. Sacco marrone dietro il corpo; non deve occultare bersagli nella camera giocatore. Il cono del cappello deve restare sopra il bordo crema, senza attraversarne la superficie visibile.

Il rettiliano è più piccolo (circa 2.1 m), verde con tuta viola, muso allungato, grandi occhi gialli a pupilla verticale, cresta e coda. Non confonderlo con un umano mascherato. Niente denti realistici o sangue.

Rig a gruppi: corpo, testa, braccia/mani, regalo. Per i dialoghi futuri prevedere bocca separata sotto i baffi; il mockup attuale **non implementa lip-sync**. Forme previste: riposo, A aperta, E larga, O tonda, M/B/P chiusa; da provare nel passo 5, non considerate già approvate o funzionanti.

Guanti sferici raggio .115 m. Il regalo .54 × .44 × .42 m tocca i guanti sulle due facce laterali; misurare il contatto nelle coordinate locali, non con AABB globali di oggetti ruotati. Personaggi lontani: eliminare baffi/dita/nastri secondari, conservare silhouette e colori principali.

## 5. Movimento

Animazione fluida, non stop-motion. Loop campione **6 s**: regalo offerto con easing sinusoidale, escursione .12 m verticale/.15 m avanti; testa con oscillazione massima .07 rad, rettiliano .08 rad, UFO .1 m verticale. Tutto funzione di `(view, time)` in revisione. Nessun `Math.random()` non inizializzato o animazione dipendente dal numero di frame.

Piedi fermi nel mockup. Nel gioco i piedi devono seguire le fasi di appoggio senza scivolare. Attacchi leggibili prima dell'impatto; reazioni elastiche brevi, non deformazioni che attraversano il corpo. Riduzione movimento deve sopprimere camera shake e grandi oscillazioni decorative. Nessuno shake o lampeggio nel mockup.

## 6. Luci e mood

Riferimento attuale: **sera innevata** (`snowy-evening`). Hemisphere cielo `#c9e6ff`/suolo `#51435a`, intensità 2.5; key direzionale calda `#ffdfba`, intensità 3.8, posizione (-4,7,5); rim `#8aabff`, intensità 2, posizione (5,4,-4). Tre luci reali, nessuna ombra dinamica. ACESFilmic, esposizione 1.12, output sRGB; nebbia cielo da 18 a 42 m.

Questi valori sono verificati nel diorama, non vincoli di coordinate per tutti i livelli. Nuovi mood di allarme o vittoria devono mantenere riconoscibili pelle, neve e tute, essere documentati e catturati separatamente. Non sono ancora implementati: non attribuire loro test della scena attuale.

## 7. Post, effetti e camera

Zero passaggi post nel riferimento, massimo tre nel gioco. Nessun blur, profondità di campo o tilt-shift durante il gameplay. Glow decorativo senza accumulo di bloom obbligatorio.

VFX regali: nastri curvi, stelle, pacco che si chiude; non una grande esplosione bianca. Raggio alieno telegrafato con zona a terra, bordo riconoscibile e simbolo, mai solo colore. Particelle istanziate, niente luci per ogni proiettile. I nuovi VFX richiedono test propri prima di essere accettati.

Camera terza persona: FOV riferimento **53°**, distanza sufficiente a mostrare stivali e nemico; offset laterale per non coprire il bersaglio con il sacco. Diorama 38°, turntable 36°, volto 32°. In turntable/volto nascondere scenografia che ostacola il personaggio e intestazione che copre il cappello. La camera gameplay futura deve gestire collisioni con muri; non ancora implementata.

Oggetti ispezionabili leggibili da vicino; nessun indizio dipende da una texture minuscola. Le anteprime conservano tutte le viste, controlli e timeline.

## 8. UI e accessibilità

Pannelli scuri opachi, testo crema, accento oro e focus ben visibile. Nel riferimento: pannello `#121d32`, pulsante `#293c58`, testo `#fff5df`, evidenza `#ffda88`. Non mettere testo chiaro direttamente sulla neve. Contrasto minimo **4.5:1**, anche per testo secondario. A 1080p altezza delle maiuscole almeno **24 px**: nel mockup font 36 px per testi/controlli e 48 px per titolo. Non assumere che font-size 24 equivalga a maiuscola alta 24.

Obiettivo persistente, contatore ancoraggi, vita e conferme d'interazione nel gioco; non fingere che siano già nel mockup. Sottotitoli e audio indipendenti dal colore. Tasti utilizzabili da tastiera, focus visibile, pausa e controlli volume. Il supporto smartphone riguarda solo leggibilità della pagina confronto, non gameplay touch.

## 9. Budget

60 fps a 1080p su laptop medio: ≤150 draw call, ≤150k triangoli per vista, ≤3 post pass, ≤2 luci con ombre, ≤6 luci reali. Il mockup A arriva a **94 call / 23.016 triangoli**: non moltiplicare questo costo per ogni nemico. Il frame rate headless non prova prestazioni su altri dispositivi.

## 10. Fare / evitare

- **Sì:** volumi rotondi, grande naso e barba, rettiliano riconoscibile, bersaglio visibile accanto al protagonista.
- **No:** corpo squadrato con spalline della variante C, legno venato della B, modelli realistici scaricati.
- **Sì:** nastri luminosi piccoli, animazione leggibile e feedback d'impatto.
- **No:** lampeggi a pieno schermo, shake continuo, blur gameplay, oggetti sospesi o mani nel pacco.

## 11. Checklist misurata

1. `LC.selfTest()` positivo: contatti mani–oggetti ≤1 mm; piedi–pavimento ≤2 mm (il mockup usa 1 mm).
2. Budget rispettati in tutte le viste e mood implementati; 0 errori console/rete.
3. Palette dei materiali conforme a `visualMetadata`; nuove texture procedurali revisionate separatamente. Il lint dei colori base non classifica tutti i pixel illuminati.
4. Contrasto DOM ≥4.5:1 e maiuscole ≥24 px a 1080p. Testi canvas futuri richiedono misure dedicate, non sono coperti dall'audit DOM.
5. Probe del loop a 12 Hz: non più di tre variazioni di luminosità >20% su >20% dei pixel in ogni secondo. È uno screening conservativo, **non una certificazione clinica**; effetti rapidi futuri richiedono campionamento più fitto e revisione.
6. Guardare il PNG diagnostico deuteranopia; controllare anche forme, icone e testo. Non è una garanzia automatica per ogni forma di daltonismo.
7. Catture da distanza gameplay e vicino, determinismo verificato, nessuna occlusione del bersaglio o taglio del personaggio nelle viste dedicate.
8. Prima del passo 6 autocritica documentata; dal passo 6 reviewer critico, genere e narrativa, più playtester indipendente. Nessun sign-off di agenti dichiarato per gli attuali mockup.

Comando: `node tools/capture.mjs design/styles/vinyl.html --times 0,1.5,3,4.5 --views diorama,player,turntable,face --size 1920x1080 --out captures/styles/vinyl-approved --selftest --visual-checks`.

Report e immagini approvate in `docs/evidence/step-03/approved/`. La scelta A è approvata; eventuale doppiaggio e costi restano da decidere al passo 4.
