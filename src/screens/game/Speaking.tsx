import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ROLES_BY_ID } from '../../data/roles';
import { alivePlayers, byId, startVote, applySeerPower, visibleLog } from '../../game/engine';
import { useApp } from '../../store/AppStore';
import { Icon } from '../../components/Icon';
import { Actions, Avatar, HandoffCard, PlayerGrid, SectionTitle } from '../../components/ui';
import type { Game, Player } from '../../types';

export function Speaking({ game }: { game: Game }) {
  const { updateGame, settings } = useApp();
  const [seerOpen, setSeerOpen] = useState(false);
  const [peekId, setPeekId] = useState<string | null>(null);
  const order = game.speakingOrder.map((id) => byId(game, id)).filter((p) => p.alive);
  const alive = alivePlayers(game);
  const dead = game.players.length - alive.length;
  const rolesInPlay = settings.enabledRoles.filter(
    (id) => ROLES_BY_ID[id].minPlayers <= game.players.length,
  );
  const seerEnabled = settings.enabledRoles.includes('voyant');
  const log = visibleLog(game);

  if (seerOpen) return <SeerModal game={game} onClose={() => setSeerOpen(false)} />;
  if (peekId) return <PeekWord game={game} playerId={peekId} onClose={() => setPeekId(null)} />;

  return (
    <div className="screen">
      <div className="between">
        <h2 style={{ fontSize: 30 }}>Tour {game.round}</h2>
        <span className="row" style={{ gap: 6 }}>
          <span className="badge neutral">{alive.length} en vie</span>
          {dead > 0 && <span className="badge neutral">{dead} sortis</span>}
        </span>
      </div>

      <div className="card">
        <div className="between" style={{ marginBottom: 4 }}>
          <div className="label">Ordre de parole</div>
          <div className="tiny row" style={{ gap: 6 }}>
            <Icon name="eye" size={14} /> revoir son mot
          </div>
        </div>
        <div className="order stagger">
          {order.map((p, i) => (
            <div
              className="orderrow"
              key={p.id}
              data-first={i === 0}
              style={{ '--i': i } as CSSProperties}
            >
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <Avatar name={p.name} />
              <span className="nm">{p.name}</span>
              {p.role === 'maire' && <Icon name="crown" size={16} />}
              <button
                className="iconbtn tiny-btn"
                aria-label={`Revoir le mot de ${p.name}`}
                onClick={() => setPeekId(p.id)}
              >
                <Icon name="eye" size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="tiny">
        Un seul indice chacun. Interdit de dire son mot, ou un mot de la même famille.
      </div>

      {settings.timerSeconds > 0 && <Timer seconds={settings.timerSeconds} />}

      {rolesInPlay.length > 0 && (
        <>
          <SectionTitle>Rôles en jeu</SectionTitle>
          <div className="row wrap" style={{ gap: 6 }}>
            {settings.cupidon && <span className="chip static">Cupidon</span>}
            {rolesInPlay.map((id) => (
              <span key={id} className="chip static">
                {ROLES_BY_ID[id].name}
              </span>
            ))}
          </div>
          <div className="tiny">
            Personne ne sait qui les porte — seulement qu'ils sont dans la partie.
          </div>
        </>
      )}

      {log.length > 0 && (
        <details className="card tight">
          <summary className="label">Ce qui s'est passé</summary>
          <div style={{ marginTop: 10 }}>
            {log.map((l, i) => (
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
        {seerEnabled && (
          <button
            className="btn ghost sm"
            style={{ width: '100%' }}
            onClick={() => setSeerOpen(true)}
          >
            <Icon name="orb" size={16} /> Pouvoir secret
          </button>
        )}
        <button className="btn primary" onClick={() => updateGame(startVote(game, settings))}>
          <Icon name="ballot" size={18} /> Passer au vote
        </button>
      </Actions>
    </div>
  );
}

/** « J'ai oublié mon mot » : on repasse le téléphone, en privé. */
function PeekWord({
  game,
  playerId,
  onClose,
}: {
  game: Game;
  playerId: string;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(false);
  const p = byId(game, playerId);
  const role = p.role ? ROLES_BY_ID[p.role] : null;
  const lover = p.loverOf ? byId(game, p.loverOf) : null;

  if (!shown) {
    return (
      <div className="screen">
        <HandoffCard
          name={p.name}
          hint="Rappel discret. Les autres regardent ailleurs."
          cta="Revoir mon mot"
          onOpen={() => setShown(true)}
          variant="private"
        />
        <Actions>
          <button className="btn ghost" onClick={onClose}>
            Annuler
          </button>
        </Actions>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="secret private pop" style={{ cursor: 'default' }}>
        <Avatar name={p.name} large />
        <div className="who">{p.word ? `${p.name} — ton mot` : p.name}</div>
        {p.word ? (
          <div className="word">{p.word}</div>
        ) : (
          <>
            <div className="noword">Tu es Mr Black</div>
            <div className="hint">Toujours aucun mot. Continue de bluffer.</div>
          </>
        )}
        {role && (
          <>
            <div className="sep" />
            <div className="rolecard">
              <div className="rname">
                {role.emoji} {role.name}
              </div>
              <div className="rdesc">{role.detail}</div>
            </div>
          </>
        )}
        {lover && (
          <div className="lovecard">
            Tu es lié à <b>{lover.name}</b>.
          </div>
        )}
      </div>
      <Actions>
        <button className="btn primary" onClick={onClose}>
          J'ai vu — masquer
        </button>
      </Actions>
    </div>
  );
}

/** Chrono circulaire pour cadencer les prises de parole. */
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

  const r = 27;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="card tight timerwrap">
      <div className="dial" data-done={left === 0}>
        <svg viewBox="0 0 62 62" width="62" height="62">
          <circle className="track" cx="31" cy="31" r={r} fill="none" strokeWidth="2" />
          <circle
            className="run"
            cx="31"
            cy="31"
            r={r}
            fill="none"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - left / seconds)}
          />
        </svg>
        <span className="val">{left}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div className="strong">Chrono</div>
        <div className="tiny" style={{ marginTop: 2 }}>
          {left === 0 ? 'Temps écoulé.' : `${seconds} s par indice.`}
        </div>
      </div>
      <div className="row" style={{ gap: 6 }}>
        <button
          className="iconbtn"
          aria-label={running ? 'Pause' : 'Démarrer'}
          onClick={() => setRunning((v) => !v)}
        >
          <Icon name={running ? 'pause' : 'play'} size={16} />
        </button>
        <button
          className="iconbtn"
          aria-label="Remettre à zéro"
          onClick={() => {
            setRunning(false);
            setLeft(seconds);
          }}
        >
          <Icon name="reset" size={16} />
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
          <div className="strong">Pouvoir secret</div>
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
        <Actions>
          <button className="btn ghost" onClick={onClose}>
            Annuler
          </button>
        </Actions>
      </div>
    );
  }

  if (step.kind === 'nope') {
    return (
      <div className="screen">
        <div className="grow" />
        <div className="card center pop">
          <div className="strong" style={{ fontSize: 19 }}>
            Aucun pouvoir disponible
          </div>
          <div className="tiny" style={{ marginTop: 8 }}>
            Soit ce n'est pas ton rôle, soit tu l'as déjà utilisé. Rends le téléphone l'air de
            rien.
          </div>
        </div>
        <div className="grow" />
        <Actions>
          <button className="btn primary" onClick={onClose}>
            Fermer
          </button>
        </Actions>
      </div>
    );
  }

  if (step.kind === 'target') {
    return (
      <div className="screen">
        <div className="card center">
          <div className="strong">Sur qui enquêtes-tu ?</div>
          <div className="tiny" style={{ marginTop: 6 }}>
            Une seule fois par partie.
          </div>
        </div>
        <PlayerGrid
          players={alive.filter((p: Player) => p.id !== step.seerId)}
          onPick={(targetId) => {
            const { game: next, isImposteur } = applySeerPower(game, step.seerId, targetId);
            updateGame(next);
            setStep({ kind: 'result', targetId, isImposteur });
          }}
        />
        <div className="grow" />
        <Actions>
          <button className="btn ghost" onClick={onClose}>
            Annuler
          </button>
        </Actions>
      </div>
    );
  }

  const target = byId(game, step.targetId);
  return (
    <div className="screen">
      <div className="grow" />
      <div className="secret private pop" style={{ cursor: 'default' }}>
        <Avatar name={target.name} large />
        <div className="name">{target.name}</div>
        <div
          className="word"
          style={{ fontSize: 30, color: step.isImposteur ? 'var(--accent)' : 'var(--ink)' }}
        >
          {step.isImposteur ? 'Imposteur' : 'Civil'}
        </div>
        <div className="hint">
          Ta vision peut être trompée par certains rôles. Garde ça pour toi… ou pas.
        </div>
      </div>
      <div className="grow" />
      <Actions>
        <button className="btn primary" onClick={onClose}>
          J'ai vu — masquer
        </button>
      </Actions>
    </div>
  );
}
