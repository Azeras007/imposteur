import { ROLES_BY_ID } from '../data/roles';
import type {
  Camp,
  Game,
  Player,
  RoleId,
  Settings,
  WordPack,
  WordPair,
} from '../types';
import { pickOne, shuffle } from './text';

/** Répartition conseillée : ~30 % d'imposteurs, 1 Mr Black à partir de 5 joueurs. */
export function recommendedCounts(n: number): { undercover: number; mrBlack: number } {
  if (n < 4) return { undercover: 1, mrBlack: 0 };
  if (n === 4) return { undercover: 1, mrBlack: 0 };
  const mrBlack = n >= 15 ? 2 : 1;
  const totalImposteurs = Math.max(2, Math.round(n * 0.3));
  return { undercover: Math.max(1, totalImposteurs - mrBlack), mrBlack };
}

export function civilCount(n: number, s: Pick<Settings, 'undercoverCount' | 'mrBlackCount'>) {
  return n - s.undercoverCount - s.mrBlackCount;
}

/** Message d'erreur si la configuration est injouable, sinon null. */
export function validateSetup(
  n: number,
  s: Pick<Settings, 'undercoverCount' | 'mrBlackCount'>,
): string | null {
  if (n < 3) return 'Il faut au moins 3 joueurs.';
  const civils = civilCount(n, s);
  if (s.undercoverCount + s.mrBlackCount < 1) return 'Il faut au moins un imposteur.';
  if (civils < 2) return 'Il faut au moins 2 civils. Réduis le nombre d\'imposteurs.';
  if (civils <= s.undercoverCount + s.mrBlackCount)
    return 'Les civils doivent être plus nombreux que les imposteurs, sinon ils ont déjà perdu.';
  return null;
}

export function availablePairs(packs: WordPack[], activeIds: string[]): WordPair[] {
  return packs.filter((p) => activeIds.includes(p.id)).flatMap((p) => p.pairs);
}

/** Attribue au plus un rôle spécial par joueur, en respectant les camps autorisés. */
function assignRoles(players: Player[], enabled: RoleId[]): void {
  const n = players.length;
  const candidates = shuffle(enabled).filter((id) => ROLES_BY_ID[id].minPlayers <= n);
  const free = new Set(players.map((p) => p.id));

  for (const roleId of candidates) {
    const def = ROLES_BY_ID[roleId];
    const eligible = shuffle(
      players.filter((p) => free.has(p.id) && def.camps.includes(p.camp)),
    );
    // Pas de porteur possible (ex : Parrain sans imposteur libre) → le rôle saute.
    if (eligible.length === 0) continue;
    const chosen = eligible[0];
    chosen.role = roleId;
    free.delete(chosen.id);
  }
}

/** Cupidon : lie deux joueurs au hasard. */
function assignLovers(players: Player[]): void {
  if (players.length < 4) return;
  const [x, y] = shuffle(players).slice(0, 2);
  x.loverOf = y.id;
  y.loverOf = x.id;
}

/**
 * L'ordre de parole est retiré au hasard à chaque tour.
 * Si l'option est active, un Mr Black ne peut pas ouvrir le tour :
 * il n'aurait strictement aucune information.
 */
export function buildSpeakingOrder(players: Player[], blackNeverFirst: boolean): string[] {
  const alive = players.filter((p) => p.alive);
  if (alive.length === 0) return [];
  let order = shuffle(alive);
  if (blackNeverFirst && order[0].camp === 'mrblack') {
    const firstNonBlack = order.findIndex((p) => p.camp !== 'mrblack');
    if (firstNonBlack > 0) {
      [order[0], order[firstNonBlack]] = [order[firstNonBlack], order[0]];
    }
  }
  return order.map((p) => p.id);
}

export interface NewGameInput {
  names: string[];
  settings: Settings;
  packs: WordPack[];
  /** Paires déjà jouées récemment, évitées si possible. */
  recentPairIds?: string[];
}

export function createGame({ names, settings, packs, recentPairIds = [] }: NewGameInput): Game {
  const all = availablePairs(packs, settings.activePackIds);
  if (all.length === 0) throw new Error('Aucun pack de mots actif.');
  const fresh = all.filter((p) => !recentPairIds.includes(p.id));
  const pair = pickOne(fresh.length > 0 ? fresh : all);
  const pack = packs.find((p) => p.pairs.some((q) => q.id === pair.id));

  // Par défaut le mot « a » va aux civils ; l'option inverse la paire au hasard
  // pour qu'un joueur ne puisse pas déduire son camp d'un mot vu la partie d'avant.
  const flip = settings.swapPair && Math.random() < 0.5;
  const civilWord = flip ? pair.b : pair.a;
  const undercoverWord = flip ? pair.a : pair.b;

  const camps: Camp[] = [
    ...Array<Camp>(settings.undercoverCount).fill('undercover'),
    ...Array<Camp>(settings.mrBlackCount).fill('mrblack'),
    ...Array<Camp>(names.length - settings.undercoverCount - settings.mrBlackCount).fill('civil'),
  ];
  const shuffledCamps = shuffle(camps);

  const players: Player[] = names.map((name, i) => {
    const camp = shuffledCamps[i];
    return {
      id: `p${i}`,
      name: name.trim() || `Joueur ${i + 1}`,
      camp,
      word: camp === 'mrblack' ? null : camp === 'civil' ? civilWord : undercoverWord,
      role: null,
      loverOf: null,
      alive: true,
      eliminatedRound: null,
      deathCause: null,
      usedPower: false,
    };
  });

  assignRoles(players, settings.enabledRoles);
  if (settings.cupidon) assignLovers(players);

  return {
    players,
    // La règle de fin est figée ici : modifier les réglages en cours de partie
    // ne doit pas changer la condition de victoire sous les pieds des joueurs.
    endRule: settings.endRule ?? 'dernierCivil',
    revealEliminated: settings.revealEliminated ?? false,
    civilWord,
    undercoverWord,
    pairId: pair.id,
    packName: pack ? `${pack.emoji} ${pack.name}` : '',
    round: 1,
    phase: 'reveal',
    revealIndex: 0,
    speakingOrder: buildSpeakingOrder(players, settings.blackNeverFirst),
    voteIndex: 0,
    votes: {},
    pendingId: null,
    guardUsedThisRound: false,
    blackGuess: '',
    blackGuessCorrect: null,
    blackGuesserId: null,
    extraDeaths: [],
    chainDeathId: null,
    voteTally: {},
    log: [],
    winner: null,
  };
}
