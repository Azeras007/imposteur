import { useEffect, useRef, useState } from 'react';
import { ROLES_BY_ID } from '../../data/roles';
import { alivePlayers, byId, startVote, applySeerPower } from '../../game/engine';
import { useApp } from '../../store/AppStore';
import { Actions, PlayerGrid } from '../../components/ui';
import type { Game } from '../../types';

export function Speaking({ game }: { game: Game }) {
  const { updateGame, settings } = useApp();
  const [seerOpen, setSeerOpen] = useState(false);
  const order = game.speakingOrder.map((id) => byId(game, id)).filter((p) => p.alive);
  const alive = alivePlayers(game);
  const rolesInPlay = settings.enabledRoles.filter(
    (id) => ROLES_BY_ID[id].minPlayers <= game.players.length,
  );
  const seerEnabled = settings.enabledRoles.includes('voyant');

  if (seerOpen) return <SeerModal game={game} onClose={() => setSeerOpen(false)} />;

  return (
    <div className="screen">
      <div className="between">
        <span className="label">Tour {game.round}</span>
        <span className="tiny">
          {alive.length} en vie · {game.players.length - alive.length} éliminés
        </span>
      </div>

      <div className="card">
        <div className="label" style={{ marginBottom: 8 }}>Ordre de parole</div>
        <div className="order">
          {order.map((p, i) => (
            <div className="orderrow" key={p.id} data-first={i === 0}>
              <span className="num">{i + 1}</span>
              <span className="nm">{p.name}</span>
              {p.role === 'maire' && <span className="badge role">👑 Maire</span>}
            </div>
          ))}
        </div>
        <div className="tiny" style={{ marginTop: 10 }}>
          Un seul indice chacun. Interdit de dire son mot, ou un mot de la même famille.
        </div>
      </div>

      {settings.timerSeconds > 0 && <Timer seconds={settings.timerSeconds} />}

      {rolesInPlay.length > 0 && (
        <div className="card tight">
          <div className="label" style={{ marginBottom: 8 }}>Rôles en jeu ce soir</div>
          <div className="row wrap" style={{ gap: 7 }}>
            {settings.cupidon && <span className="chip">💘 Cupidon</span>}
            {rolesInPlay.map((id) => (
              <span key={id} className="chip">
                {ROLES_BY_ID[id].emoji} {ROLES_BY_ID[id].name}
              </span>
            ))}
          </div>
          <div className="tiny" style={{ marginTop: 8 }}>
            Personne ne sait qui les porte — seulement qu'ils sont dans la partie.
          </div>
        </div>
      )}

      {game.log.length > 0 && (
        <details className="card tight">
          <summary className="label" style={{ cursor: 'pointer' }}>Ce qui s'est passé</summary>
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
        {seerEnabled && (
          <button className="btn ghost sm" style={{ width: '100%' }} onClick={() => setSeerOpen(true)}>
            🔮 Pouvoir secret
          </button>
        )}
        <button className="btn primary" onClick={() => updateGame(startVote(game, settings))}>
          🗳️ Passer au vote
        </button>
      </Actions>
    </div>
  );
}

function Timer({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          setRunning(false);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [running]);

  return (
    <div className="card between">
      <div>
        <div className="label">Chrono</div>
        <div className="timer" style={left === 0 ? { color: 'var(--danger)' } : undefined}>
          {left}s
        </div>
      </div>
      <div className="row">
        <button className="btn sm" onClick={() => setRunning((r) => !r)}>
          {running ? '⏸' : '▶︎'}
        </button>
        <button
          className="btn sm ghost"
          onClick={() => {
            setRunning(false);
            setLeft(seconds);
          }}
        >
          ↺
        </button>
      </div>
    </div>
  );
}

type SeerStep =
  | { kind: 'who' }
  | { kind: 'nope' }
  | { kind: 'target'; seerId: string }
  | { kind: 'result'; targetId: string; isImposteur: boolean };

function SeerModal({ game, onClose }: { game: Game; onClose: () => void }) {
  const { updateGame } = useApp();
  const [step, setStep] = useState<SeerStep>({ kind: 'who' });
  const alive = alivePlayers(game);

  if (step.kind === 'who') {
    return (
      <div className="screen">
        <div className="card center">
          <div style={{ fontSize: 40 }}>🔮</div>
          <div className="label" style={{ marginTop: 8 }}>Pouvoir secret</div>
          <div className="tiny" style={{ marginTop: 6 }}>
            Les autres détournent le regard. Qui es-tu ?
          </div>
        </div>
        <PlayerGrid
          players={alive}
          onPick={(id) => {
            const p = byId(game, id);
            if (p.role === 'voyant' && !p.usedPower) setStep({ kind: 'target', seerId: id });
            else setStep({ kind: 'nope' });
          }}
        />
        <div className="grow" />
        <button className="btn ghost" onClick={onClose}>
          Annuler
        </button>
      </div>
    );
  }

  if (step.kind === 'nope') {
    return (
      <div className="screen">
        <div className="grow" />
        <div className="card center pop">
          <div style={{ fontSize: 46 }}>🤷</div>
          <div style={{ fontSize: 19, fontWeight: 700, margin: '10px 0 6px' }}>
            Aucun pouvoir disponible
          </div>
          <div className="tiny">
            Soit ce n'est pas ton rôle, soit tu l'as déjà utilisé. Rends le téléphone l'air de rien.
          </div>
        </div>
        <div className="grow" />
        <button className="btn primary" onClick={onClose}>
          Fermer
        </button>
      </div>
    );
  }

  if (step.kind === 'target') {
    return (
      <div className="screen">
        <div className="card center">
          <div className="label">🔮 Sur qui enquêtes-tu ?</div>
          <div className="tiny" style={{ marginTop: 6 }}>Une seule fois par partie.</div>
        </div>
        <PlayerGrid
          players={alive.filter((p) => p.id !== step.seerId)}
          onPick={(targetId) => {
            const { game: next, isImposteur } = applySeerPower(game, step.seerId, targetId);
            updateGame(next);
            setStep({ kind: 'result', targetId, isImposteur });
          }}
        />
        <div className="grow" />
        <button className="btn ghost" onClick={onClose}>
          Annuler
        </button>
      </div>
    );
  }

  const target = byId(game, step.targetId);
  return (
    <div className="screen">
      <div className="grow" />
      <div className="card center pop">
        <div style={{ fontSize: 50 }}>{step.isImposteur ? '🕵️' : '🙂'}</div>
        <div style={{ fontSize: 22, fontWeight: 800, margin: '10px 0 4px' }}>{target.name}</div>
        <div style={{ fontSize: 18, color: step.isImposteur ? 'var(--undercover)' : 'var(--civil)', fontWeight: 700 }}>
          {step.isImposteur ? 'est un imposteur' : 'est un civil'}
        </div>
        <div className="tiny" style={{ marginTop: 12 }}>
          Ta vision peut être trompée par certains rôles. Garde ça pour toi… ou pas.
        </div>
      </div>
      <div className="grow" />
      <button className="btn primary" onClick={onClose}>
        J'ai vu — masquer
      </button>
    </div>
  );
}
