import { DARES } from '../data/dares';
import type { DeathCause, Game, LogEntry, Player, Settings, Winner } from '../types';
import { buildSpeakingOrder } from './setup';
import { matchesWord, pickOne } from './text';

export const alivePlayers = (g: Game) => g.players.filter((p) => p.alive);
export const byId = (g: Game, id: string) => g.players.find((p) => p.id === id)!;

const clone = (g: Game): Game => ({
  ...g,
  players: g.players.map((p) => ({ ...p })),
  log: g.log.slice(),
  extraDeaths: g.extraDeaths.slice(),
  votes: { ...g.votes },
  voteTally: { ...g.voteTally },
});

/**
 * Ajoute une ligne au journal.
 * `blindText` est la version montrée pendant la partie quand les identités
 * restent secrètes ; chaîne vide = ligne masquée jusqu'au récapitulatif final.
 */
function log(g: Game, icon: string, text: string, blindText?: string): void {
  g.log.push({ round: g.round, icon, text, blindText });
}

/** Journal tel qu'on peut le montrer à la table en cours de partie. */
export function visibleLog(g: Game): LogEntry[] {
  if (g.revealEliminated) return g.log;
  return g.log
    .map((l) => (l.blindText === undefined ? l : { ...l, text: l.blindText }))
    .filter((l) => l.text !== '');
}

/** Ajoute l'amoureux survivant à la liste des gagnants. */
function withLovers(g: Game, ids: string[]): string[] {
  const out = new Set(ids);
  for (const id of ids) {
    const lover = byId(g, id).loverOf;
    if (lover && byId(g, lover).alive) out.add(lover);
  }
  return [...out];
}

/**
 * Conditions de victoire, évaluées après chaque vague de morts.
 *
 *  1. Amoureux de camps opposés seuls survivants → ils gagnent à deux.
 *  2. Plus aucun imposteur en vie                → les civils gagnent.
 *  3. Les imposteurs prennent la table           → les imposteurs gagnent.
 *
 * Le point 3 dépend de la règle de fin choisie au lancement :
 *  - `egalite`      : imposteurs >= civils (règle classique, la partie peut
 *                     s'arrêter sur la première élimination d'un civil) ;
 *  - `dernierCivil` : il ne reste plus aucun civil. Éliminer un civil ne clôt
 *                     donc plus la partie : on enchaîne les tours sans lui.
 *                     Seule exception, le duel final : à deux survivants de
 *                     camps opposés le vote n'a plus de sens, les imposteurs
 *                     l'emportent.
 *
 * (La victoire du Bouffon et celle de Mr Black au mot sont déclenchées ailleurs,
 *  car elles dépendent de l'évènement et non de l'état de la table.)
 */
export function checkWinner(g: Game): Winner | null {
  const alive = alivePlayers(g);
  const civils = alive.filter((p) => p.camp === 'civil');
  const imposteurs = alive.filter((p) => p.camp !== 'civil');

  if (alive.length === 2) {
    const [x, y] = alive;
    if (x.loverOf === y.id && x.camp !== y.camp) {
      return {
        camp: 'amoureux',
        playerIds: [x.id, y.id],
        reason: `${x.name} et ${y.name} étaient amoureux et de camps opposés. Ils restent seuls : l'amour l'emporte.`,
      };
    }
  }

  if (imposteurs.length === 0) {
    return {
      camp: 'civils',
      playerIds: g.players.filter((p) => p.camp === 'civil').map((p) => p.id),
      reason: 'Tous les imposteurs ont été démasqués.',
    };
  }

  const duelFinal = alive.length <= 2 && imposteurs.length >= civils.length;
  const imposteursOnt =
    g.endRule === 'dernierCivil'
      ? civils.length === 0 || duelFinal
      : imposteurs.length >= civils.length;

  if (imposteursOnt) {
    return {
      camp: 'imposteurs',
      playerIds: withLovers(
        g,
        g.players.filter((p) => p.camp !== 'civil').map((p) => p.id),
      ),
      reason:
        civils.length === 0
          ? 'Il ne reste plus un seul civil.'
          : g.endRule === 'dernierCivil'
            ? 'Duel final : à deux, le vote n\'a plus de sens. Les imposteurs l\'emportent.'
            : 'Les imposteurs sont aussi nombreux que les civils : ils contrôlent tous les votes.',
    };
  }

  return null;
}

function killPlayer(g: Game, id: string, cause: DeathCause): void {
  const p = byId(g, id);
  if (!p.alive) return;
  p.alive = false;
  p.eliminatedRound = g.round;
  p.deathCause = cause;

  // Le Streaker tire un gage à exécuter devant tout le monde — ça ne trahit
  // ni son camp ni son rôle, donc ça reste visible même en identités secrètes.
  if (p.role === 'streaker') {
    g.dare = pickOne(DARES);
    log(g, '🏃', `${p.name} tire un gage : « ${g.dare} »`);
  }

  // Cupidon : on ne survit pas à son amoureux.
  if (p.loverOf) {
    const lover = byId(g, p.loverOf);
    if (lover.alive) g.extraDeaths.push({ id: lover.id, cause: 'chagrin' });
  }
}

/** Fin de tour : nouvel ordre de parole, compteurs remis à zéro. */
function nextRound(g: Game, settings: Settings): Game {
  g.round += 1;
  g.phase = 'speaking';
  g.speakingOrder = buildSpeakingOrder(g.players, settings.blackNeverFirst);
  g.votes = {};
  g.voteTally = {};
  g.voteIndex = 0;
  g.pendingId = null;
  g.guardUsedThisRound = false;
  g.chainDeathId = null;
  g.blackGuess = '';
  g.blackGuessCorrect = null;
  g.blackGuesserId = null;
  return g;
}

/**
 * Vide la file des morts en chaîne, une par une, puis teste la victoire.
 * Chaque mort en chaîne est présentée au groupe avant de passer à la suivante.
 */
function advance(g: Game, settings: Settings): Game {
  const next = g.extraDeaths.shift();
  if (next) {
    const p = byId(g, next.id);
    if (p.alive) {
      killPlayer(g, next.id, next.cause);
      log(
        g,
        next.cause === 'chagrin' ? '💔' : '⚔️',
        next.cause === 'chagrin'
          ? `${p.name} meurt de chagrin.`
          : `${p.name} est emporté par le Vengeur.`,
      );
      g.chainDeathId = next.id;
      g.phase = 'chainDeath';
      return g;
    }
    return advance(g, settings);
  }

  const winner = checkWinner(g);
  if (winner) {
    g.winner = winner;
    g.phase = 'over';
    return g;
  }
  return nextRound(g, settings);
}

/** Route vers l'écran de gage si le mort qu'on vient de montrer était Le Streaker. */
function withStreakerDare(g: Game, dead: Player): Game {
  if (dead.role === 'streaker' && g.dare) {
    g.phase = 'streakerDare';
    g.pendingId = dead.id;
  }
  return g;
}

/** Appelé après la révélation d'un mort, une fois ses effets déclenchés. */
export function continueAfterDeath(game: Game, settings: Settings): Game {
  const g = clone(game);
  const dead = g.chainDeathId ? byId(g, g.chainDeathId) : null;
  g.chainDeathId = null;
  if (dead) {
    const staged = withStreakerDare(g, dead);
    if (staged.phase === 'streakerDare') return staged;
  }
  return advance(g, settings);
}

/** Après que Le Streaker a exécuté son gage. */
export function afterStreakerDare(game: Game, settings: Settings): Game {
  return advance(clone(game), settings);
}

// ---------------------------------------------------------------------------
// Distribution
// ---------------------------------------------------------------------------

export function nextReveal(game: Game): Game {
  const g = clone(game);
  if (g.revealIndex + 1 >= g.players.length) {
    g.phase = 'speaking';
    g.revealIndex = 0;
  } else {
    g.revealIndex += 1;
  }
  return g;
}

// ---------------------------------------------------------------------------
// Vote
// ---------------------------------------------------------------------------

export function startVote(game: Game, settings: Settings): Game {
  const g = clone(game);
  g.votes = {};
  g.voteTally = {};
  g.voteIndex = 0;
  g.phase = settings.voteMode === 'secret' ? 'voteSecret' : 'votePick';
  return g;
}

/** Ordre de passage du vote secret : l'ordre de parole du tour. */
export const secretVoters = (g: Game) =>
  g.speakingOrder.map((id) => byId(g, id)).filter((p) => p.alive);

export function castSecretVote(game: Game, voterId: string, targetId: string): Game {
  const g = clone(game);
  g.votes[voterId] = targetId;
  const voters = secretVoters(g);
  if (g.voteIndex + 1 < voters.length) {
    g.voteIndex += 1;
    return g;
  }

  // Dépouillement. Le Maire pèse double.
  const tally: Record<string, number> = {};
  for (const [voter, target] of Object.entries(g.votes)) {
    const weight = byId(g, voter).role === 'maire' ? 2 : 1;
    tally[target] = (tally[target] ?? 0) + weight;
  }
  g.voteTally = tally;

  const max = Math.max(...Object.values(tally));
  const top = Object.keys(tally).filter((id) => tally[id] === max);
  if (top.length === 1) {
    g.pendingId = top[0];
    g.phase = guardAvailable(g) ? 'guardCheck' : 'elimination';
  } else {
    // Égalité : le groupe tranche à la main.
    g.pendingId = null;
    g.phase = 'votePick';
  }
  return g;
}

export function guardAvailable(g: Game): boolean {
  return g.players.some((p) => p.alive && p.role === 'garde' && !p.usedPower);
}

export function pickElimination(game: Game, targetId: string): Game {
  const g = clone(game);
  g.pendingId = targetId;
  g.phase = guardAvailable(g) ? 'guardCheck' : 'elimination';
  return g;
}

export function guardSave(game: Game, settings: Settings): Game {
  const g = clone(game);
  const guard = g.players.find((p) => p.alive && p.role === 'garde' && !p.usedPower);
  const saved = g.pendingId ? byId(g, g.pendingId) : null;
  if (guard) guard.usedPower = true;
  log(
    g,
    '🛡️',
    guard && saved && guard.id === saved.id
      ? `${guard.name} se dévoile : Garde du corps, il se sauve lui-même.`
      : `${guard?.name} se dévoile et sauve ${saved?.name}. Personne n'est éliminé.`,
  );
  g.pendingId = null;
  return nextRound(g, settings);
}

export function skipGuard(game: Game): Game {
  const g = clone(game);
  g.phase = 'elimination';
  return g;
}

// ---------------------------------------------------------------------------
// Élimination et ses conséquences
// ---------------------------------------------------------------------------

/** Confirme la mort du joueur désigné et route vers la suite (Mr Black, Vengeur…). */
export function confirmElimination(game: Game, settings: Settings): Game {
  const g = clone(game);
  const id = g.pendingId!;
  const p = byId(g, id);

  killPlayer(g, id, 'vote');
  log(
    g,
    '🗳️',
    `${p.name} est éliminé au vote. C'était ${campLabel(p)}.`,
    `${p.name} est éliminé au vote.`,
  );
  g.pendingId = null;

  // Le Bouffon voulait ça depuis le début : la partie s'arrête ici.
  if (p.role === 'bouffon') {
    g.winner = {
      camp: 'bouffon',
      playerIds: withLovers(g, [p.id]),
      reason: `${p.name} était le Bouffon : se faire éliminer était son objectif. Il gagne seul.`,
    };
    g.phase = 'over';
    return g;
  }

  if (p.camp === 'mrblack') {
    g.blackGuesserId = p.id;
    g.phase = 'blackGuess';
    return g;
  }

  return afterEliminationEffects(g, settings, p);
}

/** Vengeur d'abord (il choisit), puis le gage du Streaker, puis les morts en chaîne. */
function afterEliminationEffects(g: Game, settings: Settings, dead: Player): Game {
  if (dead.role === 'vengeur' && alivePlayers(g).length > 1) {
    g.phase = 'vengeance';
    g.pendingId = dead.id;
    return g;
  }
  const staged = withStreakerDare(g, dead);
  if (staged.phase === 'streakerDare') return staged;
  return advance(g, settings);
}

export function submitBlackGuess(game: Game, guess: string): Game {
  const g = clone(game);
  g.blackGuess = guess;
  const correct = matchesWord(guess, g.civilWord);
  g.blackGuessCorrect = correct;
  g.phase = 'blackGuessResult';

  const black = byId(g, g.blackGuesserId!);
  if (correct) {
    log(g, '🖤', `${black.name} (Mr Black) devine « ${g.civilWord} ». Il gagne.`);
    g.winner = {
      camp: 'mrblack',
      playerIds: withLovers(g, [black.id]),
      reason: `${black.name} était Mr Black et a trouvé le mot des civils : « ${g.civilWord} ».`,
    };
  } else {
    log(g, '🖤', `${black.name} (Mr Black) propose « ${guess} » : raté.`, '');
  }
  return g;
}

/** Après l'écran de résultat du pari de Mr Black. */
export function afterBlackGuess(game: Game, settings: Settings): Game {
  const g = clone(game);
  if (g.winner) {
    g.phase = 'over';
    return g;
  }
  return afterEliminationEffects(g, settings, byId(g, g.blackGuesserId!));
}

export function applyVengeance(game: Game, targetId: string, settings: Settings): Game {
  const g = clone(game);
  g.extraDeaths.unshift({ id: targetId, cause: 'vengeance' });
  g.pendingId = null;
  return advance(g, settings);
}

// ---------------------------------------------------------------------------
// Pouvoir de la Voyante
// ---------------------------------------------------------------------------

export function seerTargets(g: Game, seerId: string): Player[] {
  return alivePlayers(g).filter((p) => p.id !== seerId);
}

export function applySeerPower(
  game: Game,
  seerId: string,
  targetId: string,
): { game: Game; isImposteur: boolean } {
  const g = clone(game);
  byId(g, seerId).usedPower = true;
  const target = byId(g, targetId);
  // Le Parrain passe pour un civil irréprochable.
  const isImposteur = target.camp !== 'civil' && target.role !== 'parrain';
  return { game: g, isImposteur };
}

// ---------------------------------------------------------------------------

export function campLabel(p: Player): string {
  if (p.camp === 'civil') return 'un Civil';
  if (p.camp === 'undercover') return 'un Imposteur';
  return 'Mr Black';
}
