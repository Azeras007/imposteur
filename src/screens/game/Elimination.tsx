import { useState } from 'react';
import { ROLES_BY_ID } from '../../data/roles';
import {
  alivePlayers,
  applyVengeance,
  byId,
  campLabel,
  confirmElimination,
  continueAfterDeath,
  guardSave,
  skipGuard,
} from '../../game/engine';
import { useApp } from '../../store/AppStore';
import { Actions, CampBadge, PlayerGrid } from '../../components/ui';
import type { Game, Player } from '../../types';

/** Dernière fenêtre pour que le garde du corps s'interpose, avant toute révélation. */
export function GuardCheck({ game }: { game: Game }) {
  const { updateGame, settings } = useApp();
  const target = byId(game, game.pendingId!);

  return (
    <div className="screen">
      <div className="grow" />
      <div className="card center pop">
        <div style={{ fontSize: 44 }}>🛡️</div>
        <div style={{ fontSize: 20, fontWeight: 800, margin: '10px 0 6px' }}>
          {target.name} va être éliminé
        </div>
        <div className="muted">
          Le Garde du corps peut encore s'interposer. Il devra se dévoiler devant tout le monde,
          et ne pourra plus le refaire de la partie.
        </div>
      </div>
      <div className="grow" />
      <Actions>
        <button className="btn gold" onClick={() => updateGame(guardSave(game, settings))}>
          🛡️ Je sauve {target.name}
        </button>
        <button className="btn primary" onClick={() => updateGame(skipGuard(game))}>
          Personne n'intervient — révéler
        </button>
      </Actions>
    </div>
  );
}

/** Révélation du joueur éliminé au vote. */
export function EliminationReveal({ game }: { game: Game }) {
  const { updateGame, settings } = useApp();
  const p = byId(game, game.pendingId!);
  const [shown, setShown] = useState(false);
  const votes = game.voteTally[p.id];

  if (!shown) {
    return (
      <div className="screen">
        <div className="grow" />
        <div className="secret" onClick={() => setShown(true)}>
          <div className="who">Le groupe a tranché</div>
          <div className="name">{p.name}</div>
          {votes !== undefined && <div className="tiny">{votes} voix contre lui</div>}
          <div style={{ fontSize: 44 }}>⚖️</div>
          <div className="btn primary" style={{ maxWidth: 260 }}>
            Révéler son identité
          </div>
        </div>
        <div className="grow" />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="grow" />
      <Identity player={p} />
      <div className="grow" />
      <Actions>
        <button className="btn primary" onClick={() => updateGame(confirmElimination(game, settings))}>
          Continuer
        </button>
      </Actions>
    </div>
  );
}

/** Mort en chaîne : chagrin (Cupidon) ou vengeance. */
export function ChainDeath({ game }: { game: Game }) {
  const { updateGame, settings } = useApp();
  const p = byId(game, game.chainDeathId!);
  const heading =
    p.deathCause === 'chagrin'
      ? { em: '💔', title: `${p.name} meurt de chagrin`, sub: 'Son amoureux vient d\'être éliminé.' }
      : { em: '⚔️', title: `${p.name} est emporté`, sub: 'Le Vengeur ne part jamais seul.' };

  return (
    <div className="screen">
      <div className="grow" />
      <div className="card center pop">
        <div style={{ fontSize: 50 }}>{heading.em}</div>
        <div style={{ fontSize: 21, fontWeight: 800, margin: '10px 0 4px' }}>{heading.title}</div>
        <div className="tiny">{heading.sub}</div>
      </div>
      <Identity player={p} />
      <div className="grow" />
      <Actions>
        <button className="btn primary" onClick={() => updateGame(continueAfterDeath(game, settings))}>
          Continuer
        </button>
      </Actions>
    </div>
  );
}

/** Le Vengeur désigne qui il emporte dans la tombe. */
export function Vengeance({ game }: { game: Game }) {
  const { updateGame, settings } = useApp();
  const [sel, setSel] = useState<string | null>(null);
  const avenger = byId(game, game.pendingId!);

  return (
    <div className="screen">
      <div className="card center">
        <div style={{ fontSize: 40 }}>⚔️</div>
        <div style={{ fontSize: 19, fontWeight: 800, margin: '8px 0 4px' }}>
          {avenger.name} était le Vengeur
        </div>
        <div className="tiny">Il emporte un joueur avec lui. À lui de choisir.</div>
      </div>
      <PlayerGrid players={alivePlayers(game)} selectedId={sel} onPick={setSel} />
      <div className="grow" />
      <Actions>
        <button
          className="btn danger"
          disabled={!sel}
          onClick={() => sel && updateGame(applyVengeance(game, sel, settings))}
        >
          ⚔️ Emporter {sel ? byId(game, sel).name : ''}
        </button>
      </Actions>
    </div>
  );
}

export function Identity({ player }: { player: Player }) {
  const role = player.role ? ROLES_BY_ID[player.role] : null;
  return (
    <div className="reveal-big pop">
      <div className="nm">{player.name}</div>
      <CampBadge player={player} />
      {role && (
        <div style={{ marginTop: 8 }}>
          <span className="badge role">
            {role.emoji} {role.name}
          </span>
        </div>
      )}
      <div className="wordline">
        {player.word ? (
          <>
            Son mot était <b>{player.word}</b>
          </>
        ) : (
          <span className="muted">Il n'avait aucun mot — c'était {campLabel(player)}.</span>
        )}
      </div>
      {player.role === 'fantome' && (
        <div className="lovecard" style={{ marginTop: 12 }}>
          👻 <b>Le Fantôme</b> a droit à un dernier indice avant de partir. Laissez-le parler.
        </div>
      )}
    </div>
  );
}
