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
import { Actions, Avatar, CampBadge, HandoffCard, PlayerGrid } from '../../components/ui';
import type { Game, Player } from '../../types';

/** Dernière fenêtre pour que le garde du corps s'interpose, avant toute révélation. */
export function GuardCheck({ game }: { game: Game }) {
  const { updateGame, settings } = useApp();
  const target = byId(game, game.pendingId!);

  return (
    <div className="screen">
      <div className="grow" />
      <div className="card center pop">
        <div style={{ fontSize: 46 }}>🛡️</div>
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
          Personne n'intervient
        </button>
      </Actions>
    </div>
  );
}

/**
 * Sortie d'un joueur.
 *
 * Deux mises en scène selon le réglage :
 *  - identités révélées : on retourne la carte devant tout le monde ;
 *  - identités secrètes : le téléphone repart discrètement à l'éliminé, qui
 *    apprend seul son sort — c'est aussi là que Mr Black tente son mot sans
 *    que la table sache qu'il s'agissait de lui.
 */
export function EliminationReveal({ game }: { game: Game }) {
  const { updateGame, settings } = useApp();
  const p = byId(game, game.pendingId!);
  const votes = game.voteTally[p.id];
  const [step, setStep] = useState<'group' | 'handoff' | 'fate'>('group');
  const [shown, setShown] = useState(false);

  // ---- Mode classique : révélation publique ----
  if (game.revealEliminated) {
    if (!shown) {
      return (
        <div className="screen">
          <div className="grow" />
          <div className="secret hidden-card pop" onClick={() => setShown(true)}>
            <div className="who">Le groupe a tranché</div>
            <Avatar name={p.name} large />
            <div className="name">{p.name}</div>
            {votes !== undefined && <div className="hint">{votes} voix contre lui</div>}
            <div className="emoji">⚖️</div>
            <div className="fakebtn">Révéler son identité</div>
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
          <button
            className="btn primary"
            onClick={() => updateGame(confirmElimination(game, settings))}
          >
            Continuer
          </button>
        </Actions>
      </div>
    );
  }

  // ---- Mode secret ----
  if (step === 'group') {
    return (
      <div className="screen">
        <div className="grow" />
        <div className="card center pop">
          <div style={{ fontSize: 46 }}>⚖️</div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
            <Avatar name={p.name} large />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, margin: '12px 0 6px' }}>
            {p.name} est éliminé
          </div>
          {votes !== undefined && <div className="tiny">{votes} voix contre lui</div>}
          <div className="muted" style={{ marginTop: 10 }}>
            Civil ? Imposteur ? Personne ne le saura avant la fin de la partie.
          </div>
        </div>
        <div className="grow" />
        <Actions>
          <button className="btn primary" onClick={() => setStep('handoff')}>
            📱 Passer le téléphone à {p.name}
          </button>
        </Actions>
      </div>
    );
  }

  if (step === 'handoff') {
    return (
      <div className="screen">
        <HandoffCard
          name={p.name}
          emoji="🤫"
          hint="Toi seul regardes l'écran. Les autres, patience."
          cta="Voir mon sort"
          variant="private"
          onOpen={() => {
            // Mr Black enchaîne directement sur sa tentative, en privé : rien
            // ne distingue son écran de celui des autres pour la table.
            if (p.camp === 'mrblack') {
              updateGame(confirmElimination(game, settings));
            } else {
              setStep('fate');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="secret private pop" style={{ cursor: 'default' }}>
        <Avatar name={p.name} large />
        <div className="emoji">💀</div>
        <div className="name" style={{ fontSize: 26 }}>
          Tu es éliminé
        </div>
        <CampBadge player={p} />
        {p.word && (
          <div className="hint">
            Ton mot était <b>{p.word}</b>.
          </div>
        )}
        <div className="hint">
          Personne ne saura ce que tu étais. Rends le téléphone sans rien dire — et surtout, plus
          un mot sur le jeu.
        </div>
      </div>
      <Actions>
        <button
          className="btn primary"
          onClick={() => updateGame(confirmElimination(game, settings))}
        >
          📱 Rendre le téléphone
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
      ? { em: '💔', title: `${p.name} meurt de chagrin`, sub: "Son amoureux vient d'être éliminé." }
      : { em: '⚔️', title: `${p.name} est emporté`, sub: 'Le Vengeur ne part jamais seul.' };

  return (
    <div className="screen">
      <div className="grow" />
      <div className="card center pop">
        <div style={{ fontSize: 50 }}>{heading.em}</div>
        <div style={{ fontSize: 21, fontWeight: 800, margin: '10px 0 4px' }}>{heading.title}</div>
        <div className="tiny">{heading.sub}</div>
      </div>
      {game.revealEliminated ? (
        <Identity player={p} />
      ) : (
        <div className="card center tight">
          <div className="tiny">Son camp reste secret jusqu'à la fin de la partie.</div>
        </div>
      )}
      <div className="grow" />
      <Actions>
        <button
          className="btn primary"
          onClick={() => updateGame(continueAfterDeath(game, settings))}
        >
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
      <div className="row" style={{ justifyContent: 'center', marginBottom: 10 }}>
        <Avatar name={player.name} large />
      </div>
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
