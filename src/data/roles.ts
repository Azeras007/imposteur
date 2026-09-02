import type { RoleDef, RoleId } from '../types';

/**
 * Deux familles de rôles :
 *  - « mecanique » : l'app applique vraiment la règle (pouvoir, condition de victoire...)
 *  - « gag »       : contrainte de langage, appliquée par le groupe. L'app la rappelle
 *                    en privé au porteur du rôle uniquement.
 */
export const ROLES: RoleDef[] = [
  {
    id: 'bouffon',
    name: 'Le Bouffon',
    emoji: '🃏',
    kind: 'mecanique',
    camps: ['civil'],
    minPlayers: 5,
    short: "S'il se fait éliminer au vote, il gagne seul et la partie s'arrête net.",
    detail:
      "Tu es un civil, mais ton objectif est inversé : tu veux te faire éliminer au vote. Si le groupe vote contre toi, tu gagnes SEUL et la partie s'arrête immédiatement. Sois louche… mais pas trop, sinon ils vont se méfier.",
  },
  {
    id: 'vengeur',
    name: 'Le Vengeur',
    emoji: '⚔️',
    kind: 'mecanique',
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 5,
    short: 'Quand il meurt, il emporte quelqu\'un avec lui.',
    detail:
      "Si tu es éliminé, tu ne pars pas seul : juste après la révélation, tu choisis un joueur encore en vie et il meurt avec toi. Choisis bien.",
  },
  {
    id: 'maire',
    name: 'Le Maire',
    emoji: '👑',
    kind: 'mecanique',
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 5,
    short: 'Son vote compte double. Tout le monde sait qui il est.',
    detail:
      "Ton rôle est public : annonce-le au groupe dès le début. Ton vote compte double. En contrepartie, tu es une cible évidente.",
  },
  {
    id: 'voyant',
    name: 'La Voyante',
    emoji: '🔮',
    kind: 'mecanique',
    camps: ['civil'],
    minPlayers: 6,
    short: 'Une fois par partie, découvre en secret si un joueur est un imposteur.',
    detail:
      "Une fois dans la partie, pendant la phase de discussion, appuie sur le bouton « Pouvoir secret » et choisis un joueur : l'app te dira s'il est un imposteur ou un civil. Attention, certains rôles savent se cacher…",
  },
  {
    id: 'garde',
    name: 'Le Garde du corps',
    emoji: '🛡️',
    kind: 'mecanique',
    camps: ['civil'],
    minPlayers: 6,
    short: 'Une fois par partie, il annule publiquement une élimination.',
    detail:
      "Une fois par partie, juste après un vote et avant la révélation, tu peux te lever et annoncer que tu sauves la personne désignée. Elle survit, le tour passe. Mais tu révèles ton rôle à tout le monde.",
  },
  {
    id: 'parrain',
    name: 'Le Parrain',
    emoji: '🕴️',
    kind: 'mecanique',
    camps: ['undercover', 'mrblack'],
    minPlayers: 7,
    short: 'Imposteur qui apparaît comme « civil » à la Voyante.',
    detail:
      "Tu es un imposteur, mais la Voyante te verra comme un civil parfaitement innocent. Profites-en pour te faire passer pour la personne la plus fiable de la table.",
  },
  {
    id: 'muet',
    name: 'Le Muet',
    emoji: '🤐',
    kind: 'gag',
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 4,
    short: 'Au premier tour, il doit mimer son indice. Zéro son.',
    detail:
      "Pendant le tout premier tour de parole, tu n'as pas le droit d'émettre le moindre son : ton indice doit être mimé. À partir du deuxième tour, tu parles normalement.",
  },
  {
    id: 'poete',
    name: 'Le Poète',
    emoji: '🎭',
    kind: 'gag',
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 4,
    short: 'Chacun de ses indices doit rimer avec celui du joueur précédent.',
    detail:
      "Tous tes indices doivent rimer avec l'indice donné juste avant toi. Si tu parles en premier, tu es libre… mais le suivant devra rimer avec toi. Bon courage.",
  },
  {
    id: 'menteur',
    name: 'Le Menteur',
    emoji: '🤥',
    kind: 'gag',
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 4,
    short: 'Tous ses indices doivent être faux. Il gagne quand même avec son camp.',
    detail:
      "Aucun de tes indices n'a le droit d'être vrai : ils ne doivent rien avoir à voir avec ton mot. Tu gagnes normalement avec ton camp — à toi de leur faire comprendre que tu mens exprès.",
  },
  {
    id: 'perroquet',
    name: 'Le Perroquet',
    emoji: '🦜',
    kind: 'gag',
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 4,
    short: "Il doit recaser le dernier mot du joueur précédent dans son indice.",
    detail:
      "Ton indice doit obligatoirement contenir le dernier mot prononcé par le joueur juste avant toi. Si tu parles en premier, tu es tranquille pour ce tour.",
  },
  {
    id: 'fantome',
    name: 'Le Fantôme',
    emoji: '👻',
    kind: 'gag',
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 5,
    short: "Quand il est éliminé, il donne un dernier indice depuis l'au-delà.",
    detail:
      "Au moment où tu es éliminé, tu as droit à un dernier indice avant de quitter la partie. Une dernière chance d'aider ton camp… ou de tout faire foirer.",
  },

  // ---- Rôles 18+ : purement gaguesques, à réserver à un groupe consentant. ----
  {
    id: 'obsede',
    name: "L'Obsédé",
    emoji: '😈',
    kind: 'gag',
    adult: true,
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 4,
    short: 'Chacun de ses indices doit sonner limite déplacé.',
    detail:
      "Peu importe ton mot, chaque indice que tu donnes doit pouvoir passer pour une private joke bien lourde. Plus c'est gratuit, mieux c'est.",
  },
  {
    id: 'cochon',
    name: 'Le Cochon',
    emoji: '🐷',
    kind: 'gag',
    adult: true,
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 4,
    short: "Il doit pousser un vrai grognement de cochon avant chaque indice.",
    detail:
      "Avant de donner ton indice, tu dois émettre un grognement de cochon parfaitement audible et assumé. Aucun rapport avec ton mot, c'est justement le principe.",
  },
  {
    id: 'glacons',
    name: 'Le Suceur de Glaçons',
    emoji: '🧊',
    kind: 'gag',
    adult: true,
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 4,
    short: 'Il doit sucer un glaçon (ou mimer) avant de parler, à chaque tour.',
    detail:
      "Prévois un glaçon (ou mime-le, si le frigo est loin) : tu dois le sucer ostensiblement juste avant de donner ton indice, à chaque tour de parole.",
  },
  {
    id: 'chaises',
    name: 'Le Renifleur de Chaises',
    emoji: '🪑',
    kind: 'gag',
    adult: true,
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 4,
    short: "Avant de parler, il renifle bruyamment sa propre chaise.",
    detail:
      "Aucun rapport avec ton mot ni avec quoi que ce soit de sensé : avant chaque indice, tu dois te pencher et renifler bruyamment ta chaise, l'air très concentré.",
  },
  {
    id: 'streaker',
    name: 'Le Streaker',
    emoji: '🏃',
    kind: 'mecanique',
    adult: true,
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 4,
    short: "S'il est éliminé, l'app lui tire un gage corsé à exécuter devant tout le monde.",
    detail:
      "Si tu es éliminé, l'app tire au sort un gage à exécuter devant tout le monde avant de reprendre ta place. Ça ne dit rien sur ton camp — le groupe reste libre de remplacer ou d'annuler un gage si quelqu'un n'est pas à l'aise.",
  },
  {
    id: 'lapin',
    name: 'Le Chaud Lapin',
    emoji: '🐰',
    kind: 'gag',
    adult: true,
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 4,
    short: 'Il doit faire un clin d\'œil ou un bisou-flèche à chaque indice.',
    detail:
      "À chaque indice que tu donnes, tu dois l'accompagner d'un clin d'œil appuyé ou d'un bisou envoyé façon flèche à quelqu'un de la table. Change de cible à chaque fois.",
  },
  {
    id: 'seducteur',
    name: 'Le Séducteur',
    emoji: '💋',
    kind: 'gag',
    adult: true,
    camps: ['civil', 'undercover', 'mrblack'],
    minPlayers: 4,
    short: "Il doit commencer chaque indice par un compliment à la table.",
    detail:
      "Avant de donner ton indice, tu dois d'abord balancer un compliment (sincère ou complètement bidon) à quelqu'un de la table. Ensuite seulement, tu donnes ton indice.",
  },
];

export const ROLES_BY_ID: Record<RoleId, RoleDef> = Object.fromEntries(
  ROLES.map((r) => [r.id, r]),
) as Record<RoleId, RoleDef>;

export const MECHANIC_ROLES = ROLES.filter((r) => r.kind === 'mecanique' && !r.adult);
export const GAG_ROLES = ROLES.filter((r) => r.kind === 'gag' && !r.adult);
export const ADULT_ROLES = ROLES.filter((r) => r.adult);
