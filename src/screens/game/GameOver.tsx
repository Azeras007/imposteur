import type { CSSProperties } from 'react';
import { ROLES_BY_ID } from '../../data/roles';
import { useApp } from '../../store/AppStore';
import { Actions, Avatar, CampBadge, SectionTitle } from '../../components/ui';
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
      <div className={`victory ${w.camp}`}>
        <div className="em">{head.em}</div>
        <h1>{head.title}</h1>
        <div className="muted">{w.reason}</div>
        <div className="tiny" style={{ marginTop: 10 }}>
          {game.round} tour{game.round > 1 ? 's' : ''} · {game.packName}
        </div>
      </div>

      <SectionTitle>Les mots</SectionTitle>
      <div className="wordsplit">
        <div className="wordbox civil">
          <span className="badge civil">🙂 Civils</span>
          <div className="w">{game.civilWord}</div>
        </div>
        <div className="wordbox undercover">
          <span className="badge undercover">🕵️ Imposteurs</span>
          <div className="w">{game.undercoverWord}</div>
        </div>
      </div>

      <SectionTitle>Qui était qui</SectionTitle>
      <div className="recap stagger">
        {game.players.map((p, i) => {
          const role = p.role ? ROLES_BY_ID[p.role] : null;
          const lover = p.loverOf ? game.players.find((q) => q.id === p.loverOf) : null;
          return (
            <div
              className="recaprow"
              key={p.id}
              data-win={w.playerIds.includes(p.id)}
              style={{ '--i': i } as CSSProperties}
            >
              <Avatar name={p.name} />
              <span className="nm">
                {p.name}
                <span className="tiny">
                  {p.alive ? 'survivant' : `éliminé au tour ${p.eliminatedRound}`}
                  {lover && ` · 💘 ${lover.name}`}
                </span>
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
          <summary className="label">Déroulé de la partie</summary>
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

      <div className="grow" />
      <Actions>
        <button className="btn primary" onClick={replay}>
          🔁 Rejouer avec les mêmes joueurs
        </button>
        <button className="btn ghost sm" style={{ width: '100%' }} onClick={quitGame}>
          Retour à l'accueil
        </button>
      </Actions>
    </div>
  );
}
