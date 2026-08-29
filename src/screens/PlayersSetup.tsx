import { useState, type CSSProperties } from 'react';
import { civilCount, validateSetup } from '../game/setup';
import { useApp } from '../store/AppStore';
import { Icon } from '../components/Icon';
import { Actions, SectionTitle, Stepper, Topbar } from '../components/ui';

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
            <div className="strong">Combien êtes-vous ?</div>
            <div className="tiny" style={{ marginTop: 4 }}>
              De 3 à {MAX_PLAYERS}, autour du même téléphone.
            </div>
          </div>
          <Stepper value={names.length} min={3} max={MAX_PLAYERS} onChange={setCount} />
        </div>
        <div className="row wrap" style={{ gap: 7, marginTop: 16 }}>
          <span className="badge civil">{civils} civils</span>
          <span className="badge undercover">
            {settings.undercoverCount} imposteur{settings.undercoverCount > 1 ? 's' : ''}
          </span>
          <span className="badge mrblack">{settings.mrBlackCount} Mr Black</span>
        </div>
      </div>

      <SectionTitle>Les noms</SectionTitle>
      <div className="stack stagger" style={{ gap: 9 }}>
        {names.map((n, i) => (
          <div className="namerow" key={i} style={{ '--i': i } as CSSProperties}>
            <span className="idx">{i + 1}</span>
            <input
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
          </div>
        ))}
      </div>

      {(error || configError) && <div className="err">{error ?? configError}</div>}

      <div className="grow" />
      <Actions>
        <button className="btn primary" onClick={play} disabled={!!configError}>
          <Icon name="cards" size={18} /> Distribuer les mots
        </button>
        <button className="btn ghost sm" style={{ width: '100%' }} onClick={() => go('settings')}>
          Réglages de la partie
        </button>
      </Actions>
    </div>
  );
}
