import { useState } from 'react';
import { afterBlackGuess, byId, submitBlackGuess } from '../../game/engine';
import { Actions, Avatar } from '../../components/ui';
import { useApp } from '../../store/AppStore';
import type { Game } from '../../types';

/**
 * Dernière carte de Mr Black. En mode secret l'écran est privé : la table ne
 * sait même pas qu'elle vient d'éliminer Mr Black.
 */
export function BlackGuess({ game }: { game: Game }) {
  const { updateGame } = useApp();
  const [guess, setGuess] = useState('');
  const black = byId(game, game.blackGuesserId!);
  const secret = !game.revealEliminated;

  return (
    <div className="screen">
      <div className="card center pop">
        <div style={{ fontSize: 46 }}>🖤</div>
        <div style={{ fontSize: 21, fontWeight: 800, margin: '10px 0 6px' }}>
          {secret ? `${black.name}, tu es Mr Black` : `${black.name} était Mr Black`}
        </div>
        <div className="muted">
          Dernière chance : annonce le mot que tu penses être celui des civils. Si tu tombes
          juste, tu gagnes seul et la partie s'arrête net.
        </div>
        {secret && (
          <div className="tiny" style={{ marginTop: 10 }}>
            🤫 Toi seul regardes l'écran. Personne ne saura que c'était toi.
          </div>
        )}
      </div>

      <input
        type="text"
        value={guess}
        placeholder="Le mot des civils…"
        autoCapitalize="none"
        autoCorrect="off"
        autoFocus
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && guess.trim()) updateGame(submitBlackGuess(game, guess));
        }}
      />
      <div className="tiny center">Les accents et les fautes de frappe sont tolérés.</div>

      <div className="grow" />
      <Actions>
        <button
          className="btn primary"
          disabled={!guess.trim()}
          onClick={() => updateGame(submitBlackGuess(game, guess))}
        >
          🎤 Je dis « {guess.trim() || '…'} »
        </button>
      </Actions>
    </div>
  );
}

export function BlackGuessResult({ game }: { game: Game }) {
  const { updateGame, settings } = useApp();
  const black = byId(game, game.blackGuesserId!);
  const won = game.blackGuessCorrect === true;
  const secret = !game.revealEliminated;

  // Raté en mode secret : la nouvelle reste entre Mr Black et le téléphone.
  if (!won && secret) {
    return (
      <div className="screen">
        <div className="secret private pop" style={{ cursor: 'default' }}>
          <Avatar name={black.name} large />
          <div className="emoji">💀</div>
          <div className="name" style={{ fontSize: 26 }}>
            Raté
          </div>
          <div className="hint">
            « {game.blackGuess} » n'était pas le mot des civils. Tu es éliminé pour de bon.
          </div>
          <div className="hint">
            Ne dis rien : pour la table, tu es un éliminé comme un autre. Rends le téléphone.
          </div>
        </div>
        <Actions>
          <button
            className="btn primary"
            onClick={() => updateGame(afterBlackGuess(game, settings))}
          >
            📱 Rendre le téléphone
          </button>
        </Actions>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="grow" />
      <div className="card center pop">
        <div style={{ fontSize: 56 }}>{won ? '🏆' : '💀'}</div>
        <div style={{ fontSize: 24, fontWeight: 800, margin: '10px 0 8px' }}>
          {won ? 'Dans le mille.' : 'Raté.'}
        </div>
        <div className="muted">
          {black.name} a dit <b>« {game.blackGuess} »</b>.
          <br />
          {won ? (
            <>
              Le mot des civils était bien <b>{game.civilWord}</b>.
            </>
          ) : (
            <>Ce n'était pas le mot des civils. Mr Black est éliminé pour de bon.</>
          )}
        </div>
      </div>
      <div className="grow" />
      <Actions>
        <button className="btn primary" onClick={() => updateGame(afterBlackGuess(game, settings))}>
          {won ? 'Voir le résultat' : 'La partie continue'}
        </button>
      </Actions>
    </div>
  );
}
