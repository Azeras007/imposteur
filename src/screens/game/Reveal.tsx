import { useEffect, useState } from 'react';
import { ROLES_BY_ID } from '../../data/roles';
import { nextReveal } from '../../game/engine';
import { Actions } from '../../components/ui';
import { useApp } from '../../store/AppStore';
import type { Game } from '../../types';

export function Reveal({ game }: { game: Game }) {
  const { updateGame } = useApp();
  const player = game.players[game.revealIndex];
  const [shown, setShown] = useState(false);

  // Chaque nouveau joueur repart carte cachée.
  useEffect(() => setShown(false), [game.revealIndex]);

  const lover = player.loverOf ? game.players.find((p) => p.id === player.loverOf) : null;
  const role = player.role ? ROLES_BY_ID[player.role] : null;
  const last = game.revealIndex + 1 >= game.players.length;

  return (
    <div className="screen">
      <div className="between">
        <span className="label">
          Distribution {game.revealIndex + 1}/{game.players.length}
        </span>
        <span className="tiny">{game.packName}</span>
      </div>

      {!shown ? (
        <div className="secret pop" onClick={() => setShown(true)}>
          <div className="who">Passe le téléphone à</div>
          <div className="name">{player.name}</div>
          <div style={{ fontSize: 46 }}>🤫</div>
          <div className="hint">Personne d'autre ne doit regarder.</div>
          <div className="btn primary" style={{ maxWidth: 260 }}>
            👁️ Voir mon mot
          </div>
        </div>
      ) : (
        <div className="secret pop" style={{ cursor: 'default' }}>
          <div className="who">
            {player.word ? `${player.name}, ton mot est` : `${player.name}…`}
          </div>
          {player.word ? (
            <div className="word">{player.word}</div>
          ) : (
            <>
              <div style={{ fontSize: 46 }}>🖤</div>
              <div className="noword">Tu es Mr Black</div>
              <div className="hint">
                Tu n'as aucun mot. Écoute, déduis, et fais comme si tu savais.
              </div>
            </>
          )}

          {role && (
            <div className="rolecard">
              <div className="rname">
                {role.emoji} {role.name}
              </div>
              <div className="rdesc">{role.detail}</div>
            </div>
          )}

          {lover && (
            <div className="lovecard">
              💘 Cupidon t'a lié à <b>{lover.name}</b>. Si l'un de vous meurt, l'autre meurt de
              chagrin. Si vous restez les deux derniers et que vous n'êtes pas du même camp, vous
              gagnez ensemble.
            </div>
          )}
        </div>
      )}

      <Actions>
        {shown ? (
          <button
            className="btn primary"
            onClick={() => updateGame(nextReveal(game))}
          >
            {last ? '✔︎ Tout le monde a vu — on commence' : '➜ Suivant'}
          </button>
        ) : (
          <div className="tiny center">Touche la carte pour révéler ton mot.</div>
        )}
      </Actions>
    </div>
  );
}
