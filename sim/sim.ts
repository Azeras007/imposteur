import { ROLES } from '../src/data/roles';
import { BUILTIN_PACKS } from '../src/data/wordPacks';
import {
  afterBlackGuess,
  afterStreakerDare,
  alivePlayers,
  applyVengeance,
  castSecretVote,
  checkWinner,
  confirmElimination,
  continueAfterDeath,
  guardSave,
  nextReveal,
  pickElimination,
  secretVoters,
  skipGuard,
  startVote,
  submitBlackGuess,
  visibleLog,
} from '../src/game/engine';
import { createGame, recommendedCounts, validateSetup } from '../src/game/setup';
import { matchesWord } from '../src/game/text';
import { DEFAULT_SETTINGS } from '../src/store/persist';
import type { Game, Settings } from '../src/types';

const rnd = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

interface Failure { msg: string; game: Game }
const failures: Failure[] = [];
function check(cond: boolean, msg: string, game: Game) {
  if (!cond) failures.push({ msg, game });
}

function playOne(seedIdx: number): Game {
  const n = 3 + Math.floor(Math.random() * 16); // 3..18
  const names = Array.from({ length: n }, (_, i) => `J${i + 1}`);
  const rec = recommendedCounts(n);

  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    undercoverCount: rec.undercover,
    mrBlackCount: rec.mrBlack,
    cupidon: Math.random() < 0.5,
    enabledRoles: ROLES.filter(() => Math.random() < 0.45).map((r) => r.id),
    voteMode: Math.random() < 0.5 ? 'secret' : 'rapide',
    activePackIds: BUILTIN_PACKS.map((p) => p.id),
    endRule: Math.random() < 0.5 ? 'dernierCivil' : 'egalite',
    revealEliminated: Math.random() < 0.5,
  };

  const invalid = validateSetup(n, settings);
  if (invalid) {
    // Le setup recommandé doit toujours être jouable.
    throw new Error(`setup invalide pour n=${n}: ${invalid}`);
  }

  let g = createGame({ names, settings, packs: BUILTIN_PACKS });
  let steps = 0;

  while (g.phase !== 'over') {
    if (++steps > 4000) throw new Error(`partie #${seedIdx} bloquée en phase ${g.phase}`);

    // Invariants permanents.
    for (const p of g.players) {
      if (!p.alive) check(p.eliminatedRound !== null, 'mort sans tour d\'élimination', g);
      if (p.camp === 'mrblack') check(p.word === null, 'Mr Black a un mot', g);
      else check(p.word !== null, 'joueur sans mot', g);
      if (p.loverOf) {
        const lover = g.players.find((q) => q.id === p.loverOf)!;
        check(lover.loverOf === p.id, 'lien amoureux non réciproque', g);
      }
    }
    // Cupidon : un amoureux ne survit jamais à l'autre une fois la vague de morts résolue.
    if (g.phase === 'speaking') {
      for (const p of g.players) {
        if (p.loverOf && p.alive) {
          const lover = g.players.find((q) => q.id === p.loverOf)!;
          check(lover.alive, `${p.name} survit à son amoureux ${lover.name}`, g);
        }
      }
      check(checkWinner(g) === null, 'phase speaking alors que la partie est gagnée', g);
      // Règle « jusqu'au bout » : tant qu'il reste un civil et de quoi voter,
      // la partie doit continuer — éliminer un civil ne l'arrête pas.
      if (settings.endRule === 'dernierCivil') {
        const alive = alivePlayers(g);
        check(
          alive.some((p) => p.camp === 'civil') && alive.length > 2,
          'tour ouvert sans civil vivant ou à moins de 3 survivants',
          g,
        );
      }
      check(alivePlayers(g).length >= 2, 'tour ouvert avec moins de 2 survivants', g);
      // Identités secrètes : rien de ce qu'on montre à la table ne doit trahir
      // un camp, ni le pari raté de Mr Black.
      if (!settings.revealEliminated) {
        const shown = visibleLog(g).map((l) => l.text).join(' | ');
        check(
          !/C'était|Mr Black\) propose/.test(shown),
          'le journal public trahit une identité',
          g,
        );
      }
    }

    switch (g.phase) {
      case 'reveal':
        g = nextReveal(g);
        break;
      case 'speaking':
        g = startVote(g, settings);
        break;
      case 'voteSecret': {
        const voter = secretVoters(g)[g.voteIndex];
        const targets = alivePlayers(g).filter((p) => p.id !== voter.id);
        g = castSecretVote(g, voter.id, rnd(targets).id);
        break;
      }
      case 'votePick': {
        const tally = g.voteTally;
        let pool = alivePlayers(g);
        if (Object.keys(tally).length) {
          const max = Math.max(...Object.values(tally));
          const tied = Object.keys(tally).filter((id) => tally[id] === max);
          pool = pool.filter((p) => tied.includes(p.id));
        }
        g = pickElimination(g, rnd(pool).id);
        break;
      }
      case 'guardCheck':
        g = Math.random() < 0.3 ? guardSave(g, settings) : skipGuard(g);
        break;
      case 'elimination':
        g = confirmElimination(g, settings);
        break;
      case 'blackGuess': {
        // 25 % du temps Mr Black trouve vraiment le mot.
        const guess = Math.random() < 0.25 ? g.civilWord : 'nawak' + Math.random();
        const before = g.civilWord;
        g = submitBlackGuess(g, guess);
        check(
          g.blackGuessCorrect === matchesWord(guess, before),
          'résultat du pari Mr Black incohérent',
          g,
        );
        break;
      }
      case 'blackGuessResult':
        g = afterBlackGuess(g, settings);
        break;
      case 'vengeance':
        g = applyVengeance(g, rnd(alivePlayers(g)).id, settings);
        break;
      case 'chainDeath':
        g = continueAfterDeath(g, settings);
        break;
      case 'streakerDare':
        check(!!g.dare, 'phase streakerDare sans gage tiré', g);
        g = afterStreakerDare(g, settings);
        break;
    }
  }

  // Invariants de fin.
  const w = g.winner;
  if (settings.endRule === 'dernierCivil' && w?.camp === 'imposteurs') {
    const alive = alivePlayers(g);
    check(
      alive.every((p) => p.camp !== 'civil') || alive.length <= 2,
      'imposteurs vainqueurs avec des civils vivants hors duel final',
      g,
    );
  }
  check(w !== null, 'partie terminée sans vainqueur', g);
  if (w) {
    check(w.playerIds.length > 0, 'vainqueur sans joueur', g);
    if (w.camp === 'civils') {
      check(
        alivePlayers(g).every((p) => p.camp === 'civil'),
        'victoire des civils avec un imposteur en vie',
        g,
      );
    }
    if (w.camp === 'bouffon') {
      const b = g.players.find((p) => p.role === 'bouffon')!;
      check(b.deathCause === 'vote', 'le Bouffon gagne sans avoir été éliminé au vote', g);
    }
    if (w.camp === 'amoureux') {
      check(alivePlayers(g).length === 2, 'victoire des amoureux à plus de 2 survivants', g);
    }
    if (w.camp === 'mrblack') {
      check(g.blackGuessCorrect === true, 'Mr Black gagne sans avoir trouvé le mot', g);
    }
  }
  return g;
}

const N = Number(process.argv[2] ?? 4000);
const tally: Record<string, number> = {};
const perRule: Record<string, { games: number; rounds: number }> = {};
let totalRounds = 0;
for (let i = 0; i < N; i++) {
  const g = playOne(i);
  tally[g.winner!.camp] = (tally[g.winner!.camp] ?? 0) + 1;
  totalRounds += g.round;
  const bucket = (perRule[g.endRule] ??= { games: 0, rounds: 0 });
  bucket.games += 1;
  bucket.rounds += g.round;
}

console.log(`${N} parties simulées, ${totalRounds / N} tours en moyenne`);
console.log('Durée par règle de fin :');
for (const [rule, b] of Object.entries(perRule)) {
  console.log(`  ${rule.padEnd(12)} ${(b.rounds / b.games).toFixed(2)} tours (${b.games} parties)`);
}
console.log('Répartition des victoires :');
for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(12)} ${((v / N) * 100).toFixed(1)} %`);
}

// Contrôles ciblés sur la tolérance du pari de Mr Black.
const cases: [string, string, boolean][] = [
  ['casserole', 'casserole', true],
  ['CASSEROLE', 'casserole', true],
  ['la casserole', 'casserole', true],
  ['casserolle', 'casserole', true],
  ['poele', 'poêle', true],
  ['  Poêle ', 'poêle', true],
  ['casserole', 'poêle', false],
  ['', 'poêle', false],
  ['chat', 'chien', false],
  ['tram', 'tramway', false],
];
for (const [guess, target, expected] of cases) {
  const got = matchesWord(guess, target);
  if (got !== expected) {
    console.log(`❌ matchesWord("${guess}", "${target}") = ${got}, attendu ${expected}`);
    failures.push({ msg: 'matchesWord', game: null as unknown as Game });
  }
}

if (failures.length) {
  console.log(`\n❌ ${failures.length} violations d'invariant`);
  const seen = new Set<string>();
  for (const f of failures) {
    if (seen.has(f.msg)) continue;
    seen.add(f.msg);
    console.log('  - ' + f.msg);
  }
  process.exit(1);
}
console.log('\n✅ Tous les invariants tiennent.');
