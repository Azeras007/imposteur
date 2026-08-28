import { ROLES_BY_ID } from '../../data/roles';
import { useApp } from '../../store/AppStore';
import { Actions, CampBadge } from '../../components/ui';
import type { Game } from '../../types';

const TITLES: Record<string, { em: string; title: string }> = {
  civils: { em: '🙂', title: 'Les Civils gagnent' },
  imposteurs: { em: '🕵️', title: 'Les Imposteurs gagnent' },
  mrblack: { em: '🖤', title: 'Mr Black gagne' },
  amoureux: { em: '💘', title: "L'amour l'emporte" },
  bouffon: { em: '🃏', title: 'Le Bouffon gagne seul' },
};

export function GameOver({ game }: { game: Game }) {
  const { replay, quitGame } = useApp();
  const w = game.winner!;
  const head = TITLES[w.camp];

  return (
    <div className="screen">
      <div className={`victory ${w.camp} pop`}>
        <div className="em">{head.em}</div>
        <h1>{head.title}</h1>
        <div className="muted">{w.reason}</div>
      </div>

      <div className="card">
        <div className="label" style={{ marginBottom: 10 }}>Les mots</div>
        <div className="row between">
          <span className="badge civil">🙂 Civils</span>
          <b style={{ fontSize: 19 }}>{game.civilWord}</b>
        </div>
        <div className="row between" style={{ marginTop: 10 }}>
          <span className="badge undercover">🕵️ Imposteurs</span>
          <b style={{ fontSize: 19 }}>{game.undercoverWord}</b>
        </div>
        <div className="tiny" style={{ marginTop: 10 }}>{game.packName}</div>
      </div>

      <div className="label">Tout le monde</div>
      <div className="recap">
        {game.players.map((p) => {
          const role = p.role ? ROLES_BY_ID[p.role] : null;
          const lover = p.loverOf ? game.players.find((q) => q.id === p.loverOf) : null;
          return (
            <div className="recaprow" key={p.id} data-win={w.playerIds.includes(p.id)}>
              <span className="nm">
                {p.name}
                {!p.alive && <span className="tiny"> · éliminé T{p.eliminatedRound}</span>}
                {lover && <span className="tiny"> · 💘 {lover.name}</span>}
              </span>
              {role && (
                <span className="badge role">
                  {role.emoji} {role.name}
                </span>
              )}
              <CampBadge player={p} />
            </div>
          );
        })}
      </div>

      {game.log.length > 0 && (
        <details className="card tight">
          <summary className="label" style={{ cursor: 'pointer' }}>Déroulé de la partie</summary>
          <div style={{ marginTop: 8 }}>
            {game.log.map((l, i) => (
              <div className="logline" key={i}>
                <span>{l.icon}</span>
                <span>
                  <b>T{l.round}</b> · {l.text}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      <Actions>
        <button className="btn primary" onClick={replay}>
          🔁 Rejouer avec les mêmes joueurs
        </button>
        <button className="btn ghost" onClick={quitGame}>
          Retour à l'accueil
        </button>
      </Actions>
    </div>
  );
}
