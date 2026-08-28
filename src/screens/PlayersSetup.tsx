import { useState } from 'react';
import { civilCount, validateSetup } from '../game/setup';
import { useApp } from '../store/AppStore';
import { Actions, Stepper, Topbar } from '../components/ui';

const MAX_PLAYERS = 20;

export function PlayersSetup() {
  const { go, names, setNames, settings, startGame } = useApp();
  const [error, setError] = useState<string | null>(null);

  const setCount = (n: number) => {
    const next = names.slice(0, n);
    while (next.length < n) next.push('');
    setNames(next);
  };

  const configError = validateSetup(names.length, settings);
  const civils = civilCount(names.length, settings);

  const play = () => {
    if (configError) return setError(configError);
    setError(startGame());
  };

  return (
    <div className="screen">
      <Topbar title="Les joueurs" onBack={() => go('home')} />

      <div className="card">
        <div className="between">
          <div>
            <div className="label">Nombre de joueurs</div>
            <div className="tiny" style={{ marginTop: 4 }}>
              3 à {MAX_PLAYERS} · tout le monde joue sur ce téléphone
            </div>
          </div>
          <Stepper value={names.length} min={3} max={MAX_PLAYERS} onChange={setCount} />
        </div>
      </div>

      <div className="card tight">
        <div className="row wrap" style={{ gap: 8 }}>
          <span className="badge civil">🙂 {civils} civils</span>
          <span className="badge undercover">🕵️ {settings.undercoverCount} imposteurs</span>
          <span className="badge mrblack">🖤 {settings.mrBlackCount} Mr Black</span>
        </div>
        <div className="tiny" style={{ marginTop: 10 }}>
          Modifiable dans <b>Paramètres → Répartition</b>.
        </div>
      </div>

      <div className="stack">
        {names.map((n, i) => (
          <input
            key={i}
            type="text"
            value={n}
            maxLength={18}
            placeholder={`Joueur ${i + 1}`}
            autoCapitalize="words"
            autoComplete="off"
            onChange={(e) => {
              const next = names.slice();
              next[i] = e.target.value;
              setNames(next);
            }}
          />
        ))}
      </div>

      {(error || configError) && <div className="err">{error ?? configError}</div>}

      <div className="grow" />
      <Actions>
        <button className="btn primary" onClick={play} disabled={!!configError}>
          🎲 Distribuer les mots
        </button>
        <button className="btn ghost sm" style={{ width: '100%' }} onClick={() => go('settings')}>
          ⚙️ Paramètres de la partie
        </button>
      </Actions>
    </div>
  );
}
