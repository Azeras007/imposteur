import { useState } from 'react';
import { afterBlackGuess, byId, submitBlackGuess } from '../../game/engine';
import { Icon } from '../../components/Icon';
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
        <div className="label">Mr Black</div>
        <h2 style={{ fontSize: 24, margin: '12px 0 10px' }}>
          {secret ? `${black.name}, c'est toi.` : `${black.name} était Mr Black`}
        </h2>
        <div className="muted">
          Dernière chance : annonce le mot que tu penses être celui des civils. Si tu tombes
          juste, tu gagnes seul et la partie s'arrête net.
        </div>
        {secret && (
          <div className="tiny" style={{ marginTop: 12 }}>
            Toi seul regardes l'écran. Personne ne saura que c'était toi.
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
          className={guess.trim() ? 'btn accent' : 'btn'}
          disabled={!guess.trim()}
          onClick={() => updateGame(submitBlackGuess(game, guess))}
        >
          Je dis « {guess.trim() || '…'} »
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
          <div className="mark">
            <Icon name="skull" size={28} />
          </div>
          <div className="name">Raté</div>
          <div className="hint">
            « {game.blackGuess} » n'était pas le mot des civils. Tu es éliminé pour de bon.
          </div>
          <div className="sep" />
          <div className="hint">
            Ne dis rien : pour la table, tu es un éliminé comme un autre. Rends le téléphone.
          </div>
        </div>
        <Actions>
          <button
            className="btn primary"
            onClick={() => updateGame(afterBlackGuess(game, settings))}
          >
            <Icon name="phone" size={18} /> Rendre le téléphone
          </button>
        </Actions>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="grow" />
      <div className="card center pop">
        <div className="label">{won ? 'Dans le mille' : 'Raté'}</div>
        <h2 style={{ fontSize: 28, margin: '14px 0 10px', color: won ? 'var(--accent)' : undefined }}>
          {black.name} a dit « {game.blackGuess} »
        </h2>
        <div className="muted">
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
