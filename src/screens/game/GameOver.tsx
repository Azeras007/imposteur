import type { CSSProperties } from 'react';
import { ROLES_BY_ID } from '../../data/roles';
import { useApp } from '../../store/AppStore';
import { Icon } from '../../components/Icon';
import { Actions, Avatar, CampBadge, SectionTitle } from '../../components/ui';
import type { Game } from '../../types';

const TITLES: Record<string, { kicker: string; title: string }> = {
  civils: { kicker: 'Fin de partie', title: 'Les Civils gagnent' },
  imposteurs: { kicker: 'Fin de partie', title: 'Les Imposteurs gagnent' },
  mrblack: { kicker: 'Fin de partie', title: 'Mr Black gagne' },
  amoureux: { kicker: 'Fin de partie', title: "L'amour l'emporte" },
  bouffon: { kicker: 'Fin de partie', title: 'Le Bouffon gagne seul' },
};

export function GameOver({ game }: { game: Game }) {
  const { replay, quitGame } = useApp();
  const w = game.winner!;
  const head = TITLES[w.camp];

  return (
    <div className="screen">
      <div className={`victory ${w.camp}`}>
        <div className="em">{head.kicker}</div>
        <h1>{head.title}</h1>
        <div className="muted">{w.reason}</div>
        <div className="tiny" style={{ marginTop: 14 }}>
          {game.round} tour{game.round > 1 ? 's' : ''} · {game.packName}
        </div>
      </div>

      <div className="wordsplit">
        <div className="wordbox civil">
          <span className="badge civil">Civils</span>
          <div className="w">{game.civilWord}</div>
        </div>
        <div className="wordbox undercover">
          <span className="badge undercover">Imposteurs</span>
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
                  {p.alive ? 'survivant' : `sorti au tour ${p.eliminatedRound}`}
                  {lover && ` · lié à ${lover.name}`}
                  {role && ` · ${role.name}`}
                </span>
              </span>
              <CampBadge player={p} />
            </div>
          );
        })}
      </div>

      {game.log.length > 0 && (
        <details className="card tight">
          <summary className="label">Déroulé de la partie</summary>
          <div style={{ marginTop: 10 }}>
            {game.log.map((l, i) => (
              <div className="logline" key={i}>
                <span className="t">T{l.round}</span>
                <span>{l.text}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="grow" />
      <Actions>
        <button className="btn primary" onClick={replay}>
          <Icon name="reset" size={18} /> Rejouer avec les mêmes joueurs
        </button>
        <button className="btn ghost sm" style={{ width: '100%' }} onClick={quitGame}>
          Retour à l'accueil
        </button>
      </Actions>
    </div>
  );
}
