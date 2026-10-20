# Cortile — coordinate condivise

Metri, y verso l'alto, pavimento y=0, Nord=-Z. Area giocabile x[-15,15], z[-15,13]. Babbo Natale alto circa3m, raggio collisione .48m. Nessun salto/piattaforma richiesto.

| Anchor | x | z | Uso |
|---|---|---|---|
| playerStart | 0 | 9 | Partenza, visuale verso Nord |
| trainingDrone | -2 | 4 | Primo bersaglio tutorial immobile |
| firstAnchor | 0 | -9 | Dispositivo raggiungibile dopo scontro |
| briciola | -4 | 8 | Elfa o stazione radio amichevole, non bersaglio |
| cabinWest | -10 | -3 | Laboratorio, collisione x[-13,-7], z[-6,0] |
| cabinEast | 10 | -6 | Magazzino, collisione x[7,13], z[-9,-3] |
| crateWest | -7 | 6 | Riparo, collisione x[-8,-6], z[5,7] |
| crateEast | 6 | 2 | Riparo, collisione x[5,7], z[1,3] |
| spawnWest | -9 | -10 | Entrata alieni |
| spawnNorth | 0 | -13 | Entrata alieni |
| spawnEast | 10 | -11 | Entrata alieni |
| saucer | 0 | -11 | UFO decorativo alto8m, non bersaglio della slice |
| exitGate | 0 | -14 | Via dei giocattoli chiusa; segnale finale, non giocabile ancora |

Pista centrale libera larga almeno6m; tutti i collider devono usare esattamente queste AABB esportate da `src/levels/courtyard.ts`. Briciola/radio a lato non ostruisce movimento. Alberi, regali decorativi e recinzioni solo fuori dal corridoio o fuori dai bordi; collider semplici per i volumi grandi. Posizioni nemiche di spawn devono essere fuori dagli ostacoli. Non nascondere il primo ancoraggio dietro un laboratorio.

Luci e materiali dal mockup A. Obiettivo/dispositivo segnalato con colonna geometrica, simbolo chiaro e distanza nell'HUD; non una luce costosa per ogni indicatore. Tutti gli aggiornamenti ad ancoraggi/AABB vanno sincronizzati qui prima di modifiche parallele.
