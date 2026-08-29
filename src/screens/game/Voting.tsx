import { useState } from 'react';
import {
  alivePlayers,
  byId,
  castSecretVote,
  pickElimination,
  secretVoters,
} from '../../game/engine';
import { useApp } from '../../store/AppStore';
import { Icon } from '../../components/Icon';
import { Actions, HandoffCard, PlayerGrid } from '../../components/ui';
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
            Bulletin {game.voteIndex + 1} / {voters.length}
          </span>
          <span className="tiny">Tour {game.round}</span>
        </div>
        <HandoffCard
          name={voter.name}
          hint="Ton vote reste secret. Cache l'écran."
          cta="Voter"
          variant="private"
          onOpen={() => setReady(true)}
          extra={
            voter.role === 'maire' ? (
              <span className="badge role">Ton vote compte double</span>
            ) : null
          }
        />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="card center">
        <div className="strong" style={{ fontSize: 18 }}>
          {voter.name}, qui accuses-tu ?
        </div>
        <div className="tiny" style={{ marginTop: 6 }}>
          Un seul nom. Ton vote reste secret.
        </div>
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
        <h2 style={{ fontSize: 30 }}>Le vote</h2>
        <span className="badge neutral">Tour {game.round}</span>
      </div>

      {tie ? (
        <>
          <div className="err">
            Égalité à {max} voix entre {tied.map((id) => byId(game, id).name).join(', ')}.
          </div>
          <div className="tiny">Débattez une dernière fois, puis tranchez à la main.</div>
        </>
      ) : (
        <div className="tiny">
          {settings.voteMode === 'rapide'
            ? 'Votez à main levée, puis touchez le nom de la personne éliminée.'
            : 'Désignez la personne éliminée.'}
        </div>
      )}

      <PlayerGrid
        players={alivePlayers(game)}
        selectedId={sel}
        disabledIds={
          tie ? alivePlayers(game).filter((p) => !tied.includes(p.id)).map((p) => p.id) : []
        }
        onPick={setSel}
      />

      <div className="grow" />
      <Actions>
        <button
          className={sel ? 'btn accent' : 'btn'}
          disabled={!sel}
          onClick={() => sel && updateGame(pickElimination(game, sel))}
        >
          <Icon name="userMinus" size={18} /> Éliminer {sel ? byId(game, sel).name : ''}
        </button>
      </Actions>
    </div>
  );
}
