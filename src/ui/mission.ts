/** The README's introduction, available before starting the adventure. */
export const missionParagraphs = Object.freeze([
  "Il generale Squamakk ha rubato il nucleo natalizio e vuole usarlo per invadere la Terra. Nei panni di Babbo Natale, attraversi un villaggio innevato, liberi la strada dagli invasori e cerchi di riportare il nucleo al suo posto.",
  "Non servono armi convenzionali: i tuoi regali impacchettano i rettiliani e li rispediscono alla nave. L'avventura è in terza persona, con movimento, mira, schivata e interazioni guidate. Tono leggero, nessun sangue e una sorpresa natalizia anche per il generale.",
]);

export const missionHTML = `<section class="mission"><button type="button" class="mission-toggle" id="mission-toggle" data-mission-toggle aria-expanded="false" aria-controls="mission-description">La missione</button><div class="mission-description" id="mission-description" aria-labelledby="mission-toggle" hidden>${missionParagraphs.map(text=>`<p>${text}</p>`).join('')}</div></section>`;
