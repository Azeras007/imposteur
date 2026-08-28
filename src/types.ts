export type Camp = 'civil' | 'undercover' | 'mrblack';

export type RoleId =
  | 'bouffon'
  | 'vengeur'
  | 'maire'
  | 'voyant'
  | 'garde'
  | 'parrain'
  | 'muet'
  | 'poete'
  | 'menteur'
  | 'perroquet'
  | 'fantome';

export type RoleKind = 'mecanique' | 'gag';

export interface RoleDef {
  id: RoleId;
  name: string;
  emoji: string;
  /** Résumé montré dans les paramètres. */
  short: string;
  /** Explication complète montrée au joueur sur sa carte. */
  detail: string;
  kind: RoleKind;
  /** Camps autorisés à porter ce rôle. */
  camps: Camp[];
  minPlayers: number;
}

export interface Player {
  id: string;
  name: string;
  camp: Camp;
  /** null pour Mr Black : il n'a aucun mot. */
  word: string | null;
  role: RoleId | null;
  /** id de l'autre amoureux, si Cupidon est actif. */
  loverOf: string | null;
  alive: boolean;
  eliminatedRound: number | null;
  deathCause: DeathCause | null;
  /** Pouvoir à usage unique déjà consommé (voyant, garde). */
  usedPower: boolean;
}

export type DeathCause = 'vote' | 'chagrin' | 'vengeance';

export interface WordPair {
  id: string;
  /** Mot des civils. */
  a: string;
  /** Mot des imposteurs (undercover). */
  b: string;
}

export interface WordPack {
  id: string;
  name: string;
  emoji: string;
  builtin: boolean;
  /** Pack 18+, désactivé par défaut. */
  adult?: boolean;
  pairs: WordPair[];
}

export type VoteMode = 'rapide' | 'secret';

/**
 * Condition d'arrêt côté imposteurs.
 *  - `egalite`      : règle classique, ils gagnent dès qu'ils égalent les civils.
 *  - `dernierCivil` : la partie continue tant qu'il reste un civil — un civil
 *                     éliminé ne met plus fin à la partie, on enchaîne les tours.
 */
export type EndRule = 'egalite' | 'dernierCivil';

export interface Settings {
  undercoverCount: number;
  mrBlackCount: number;
  /** Recalcule undercover/mrBlack automatiquement selon le nombre de joueurs. */
  autoBalance: boolean;
  enabledRoles: RoleId[];
  cupidon: boolean;
  activePackIds: string[];
  voteMode: VoteMode;
  /** Mr Black ne parle jamais en premier. */
  blackNeverFirst: boolean;
  /** Chrono par joueur en secondes, 0 = désactivé. */
  timerSeconds: number;
  /** Le mot des imposteurs est parfois donné aux civils (inverse la paire au hasard). */
  swapPair: boolean;
  /** Quand les imposteurs l'emportent : à égalité, ou seulement au dernier civil. */
  endRule: EndRule;
}

export type WinnerCamp = 'civils' | 'imposteurs' | 'mrblack' | 'amoureux' | 'bouffon';

export interface Winner {
  camp: WinnerCamp;
  playerIds: string[];
  reason: string;
}

export type Phase =
  /** Distribution : le téléphone passe de main en main. */
  | 'reveal'
  /** Tour de parole + discussion. */
  | 'speaking'
  /** Vote secret : chacun vote sur le téléphone. */
  | 'voteSecret'
  /** Vote rapide : on désigne l'éliminé à la main. */
  | 'votePick'
  /** Le garde du corps peut encore intervenir. */
  | 'guardCheck'
  /** Révélation de l'éliminé. */
  | 'elimination'
  /** Mr Black tente de deviner le mot des civils. */
  | 'blackGuess'
  | 'blackGuessResult'
  /** Le Vengeur choisit qui il emporte. */
  | 'vengeance'
  /** Morts en chaîne (chagrin, vengeance). */
  | 'chainDeath'
  | 'over';

export interface LogEntry {
  round: number;
  text: string;
  icon: string;
}

export interface Game {
  players: Player[];
  /** Règle de fin figée au lancement : changer les réglages ne modifie pas la partie en cours. */
  endRule: EndRule;
  civilWord: string;
  undercoverWord: string;
  pairId: string;
  packName: string;
  round: number;
  phase: Phase;
  /** Index du joueur en cours de distribution. */
  revealIndex: number;
  /** Ordre de parole du tour courant (ids). */
  speakingOrder: string[];
  /** Vote secret : votant courant. */
  voteIndex: number;
  votes: Record<string, string>;
  /** Joueur désigné par le vote, en attente de résolution. */
  pendingId: string | null;
  /** Le garde du corps a déjà sauvé quelqu'un ce tour ? */
  guardUsedThisRound: boolean;
  blackGuess: string;
  blackGuessCorrect: boolean | null;
  blackGuesserId: string | null;
  /** File d'attente des morts à révéler après une élimination. */
  extraDeaths: { id: string; cause: DeathCause }[];
  /** Mort en chaîne en cours de révélation. */
  chainDeathId: string | null;
  /** Résultat du dernier vote secret, pour l'affichage. */
  voteTally: Record<string, number>;
  log: LogEntry[];
  winner: Winner | null;
}
