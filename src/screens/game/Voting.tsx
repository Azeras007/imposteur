import { useState } from 'react';
import {
  alivePlayers,
  byId,
  castSecretVote,
  pickElimination,
  secretVoters,
} from '../../game/engine';
import { useApp } from '../../store/AppStore';
import { Actions, PlayerGrid } from '../../components/ui';
import type { Game } from '../../types';

/** Vote à bulletin secret : le téléphone passe de main en main. */
export function VoteSecret({ game }: { game: Game }) {
  const { updateGame } = useApp();
  const voters = secretVoters(game);
  const voter = voters[game.voteIndex];
  const [ready, setReady] = useState(false);

  if (!voter) return null;

  if (!ready) {
    return (
      <div className="screen">
        <div className="between">
          <span className="label">
            Vote {game.voteIndex + 1}/{voters.length}
          </span>
          <span className="tiny">Tour {game.round}</span>
        </div>
        <div className="secret" onClick={() => setReady(true)}>
          <div className="who">Passe le téléphone à</div>
          <div className="name">{voter.name}</div>
          <div style={{ fontSize: 44 }}>🗳️</div>
          {voter.role === 'maire' && <span className="badge role">👑 Ton vote compte double</span>}
          <div className="btn primary" style={{ maxWidth: 260 }}>
            Voter
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="card center">
        <div className="label">{voter.name}, qui accuses-tu ?</div>
        <div className="tiny" style={{ marginTop: 6 }}>Ton vote reste secret.</div>
      </div>
      <PlayerGrid
        players={alivePlayers(game)}
        disabledIds={[voter.id]}
        onPick={(targetId) => {
          setReady(false);
          updateGame(castSecretVote(game, voter.id, targetId));
        }}
      />
      <div className="tiny center">Tu ne peux pas voter contre toi-même.</div>
    </div>
  );
}

/** Vote à main levée, ou départage après égalité au vote secret. */
export function VotePick({ game }: { game: Game }) {
  const { updateGame, settings } = useApp();
  const [sel, setSel] = useState<string | null>(null);
  const tie = Object.keys(game.voteTally).length > 0;
  const max = tie ? Math.max(...Object.values(game.voteTally)) : 0;
  const tied = tie ? Object.keys(game.voteTally).filter((id) => game.voteTally[id] === max) : [];

  return (
    <div className="screen">
      <div className="between">
        <span className="label">Tour {game.round} · Vote</span>
        <span className="tiny">{alivePlayers(game).length} en vie</span>
      </div>

      {tie ? (
        <div className="card">
          <div className="err">
            Égalité à {max} voix entre {tied.map((id) => byId(game, id).name).join(', ')}.
          </div>
          <div className="tiny" style={{ marginTop: 8 }}>
            Débattez et tranchez à la main.
          </div>
        </div>
      ) : (
        <div className="card center">
          <div className="label">Qui part ?</div>
          <div className="tiny" style={{ marginTop: 6 }}>
            {settings.voteMode === 'rapide'
              ? 'Votez à main levée, puis touchez le nom de la personne éliminée.'
              : 'Désignez la personne éliminée.'}
          </div>
        </div>
      )}

      <PlayerGrid
        players={alivePlayers(game)}
        selectedId={sel}
        disabledIds={tie ? alivePlayers(game).filter((p) => !tied.includes(p.id)).map((p) => p.id) : []}
        onPick={setSel}
      />

      <div className="grow" />
      <Actions>
        <button
          className="btn primary"
          disabled={!sel}
          onClick={() => sel && updateGame(pickElimination(game, sel))}
        >
          ⚖️ Éliminer {sel ? byId(game, sel).name : ''}
        </button>
      </Actions>
    </div>
  );
}
