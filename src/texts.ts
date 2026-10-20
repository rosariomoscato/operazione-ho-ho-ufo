// Stable IDs match docs/SCRIPT.md; text-only route, no voice generation.
export const dialogueLines = {
  'vo.squamakk.battery': ['Squamakk', 'Confischiamo questa batteria decorativa!'],
  'vo.briciola.theft.short': ['Briciola', 'Hanno rubato il nucleo per aprire un portale sulla Terra!'],
  'vo.santa.coal': ['Babbo Natale', "Quest'anno, carbone per tutta la galassia."],
  'vo.briciola.training': ['Briciola', 'Hanno rubato il nucleo! Il portale minaccia la Terra. Proviamo i regali sul drone.'],
  'vo.briciola.anchors': ['Briciola', 'Tre ancoraggi, capo. Spegnili e la nave viene giù!'],
  'vo.santa.wrapped': ['Babbo Natale', 'Impacchettato. Senza scontrino.'],
  'vo.briciola.heal': ['Briciola', 'Campanello al centro! Se sei ferito, raccoglilo per recuperare 2 punti.'],
  'vo.briciola.clear': ['Briciola', 'Area libera! Vai al dispositivo e premi E.'],
  'vo.briciola.route': ['Briciola', 'Elfi liberi! Gli altri due ancoraggi sono lungo la via dei giocattoli.'],
} as const;
export type DialogueId = keyof typeof dialogueLines;
