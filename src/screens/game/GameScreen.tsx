import { useState } from 'react';
import { useApp } from '../../store/AppStore';
import { Actions } from '../../components/ui';
import { BlackGuess, BlackGuessResult } from './BlackGuess';
import { ChainDeath, EliminationReveal, GuardCheck, Vengeance } from './Elimination';
import { GameOver } from './GameOver';
import { Reveal } from './Reveal';
import { Speaking } from './Speaking';
import { VotePick, VoteSecret } from './Voting';

export function GameScreen() {
  const { game, quitGame } = useApp();
  const [confirmQuit, setConfirmQuit] = useState(false);
  if (!game) return null;

  if (confirmQuit) {
    return (
      <div className="screen">
        <div className="grow" />
        <div className="card center pop">
          <div style={{ fontSize: 44 }}>🚪</div>
          <div style={{ fontSize: 20, fontWeight: 800, margin: '10px 0 6px' }}>
            Abandonner la partie ?
          </div>
          <div className="muted">
            Les mots et les rôles seront perdus. Impossible de revenir en arrière.
          </div>
        </div>
        <div className="grow" />
        <Actions>
          <button className="btn danger" onClick={quitGame}>
            Oui, tout arrêter
          </button>
          <button className="btn primary" onClick={() => setConfirmQuit(false)}>
            Continuer à jouer
          </button>
        </Actions>
      </div>
    );
  }

  const body = (() => {
    switch (game.phase) {
      case 'reveal':
        return <Reveal game={game} />;
      case 'speaking':
        return <Speaking game={game} />;
      case 'voteSecret':
        return <VoteSecret game={game} />;
      case 'votePick':
        return <VotePick game={game} />;
      case 'guardCheck':
        return <GuardCheck game={game} />;
      case 'elimination':
        return <EliminationReveal game={game} />;
      case 'blackGuess':
        return <BlackGuess game={game} />;
      case 'blackGuessResult':
        return <BlackGuessResult game={game} />;
      case 'vengeance':
        return <Vengeance game={game} />;
      case 'chainDeath':
        return <ChainDeath game={game} />;
      case 'over':
        return <GameOver game={game} />;
    }
  })();

  return (
    <>
      {game.phase !== 'over' && (
        <div className="topbar">
          <span className="label" style={{ flex: 1 }}>
            🕵️ Imposteur
          </span>
          <button className="iconbtn" aria-label="Quitter" onClick={() => setConfirmQuit(true)}>
            ✕
          </button>
        </div>
      )}
      {body}
    </>
  );
}
