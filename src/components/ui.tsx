import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Player } from '../types';

/**
 * Barre d'actions ancrée en bas de l'écran.
 * Elle est en position fixe (elle ne bouge pas au scroll) et réserve dans le flux
 * un espace de sa propre hauteur, pour ne jamais recouvrir le contenu.
 */
export function Actions({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div aria-hidden style={{ height, flex: '0 0 auto' }} />
      <div className="actionbar" ref={ref}>
        {children}
      </div>
    </>
  );
}

export function Topbar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="topbar">
      {onBack ? (
        <button className="iconbtn" onClick={onBack} aria-label="Retour">
          ←
        </button>
      ) : (
        <span style={{ width: 42, flex: '0 0 42px' }} />
      )}
      <h2>{title}</h2>
      {right ?? <span style={{ width: 42, flex: '0 0 42px' }} />}
    </div>
  );
}

/** Petit titre de section, souligné d'un filet dégradé. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="sectitle">{children}</div>;
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className="toggle"
      data-on={on}
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
    />
  );
}

export function OptionRow({
  title,
  desc,
  on,
  onChange,
  disabled,
}: {
  title: string;
  desc?: string;
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="optrow" style={disabled ? { opacity: 0.45 } : undefined}>
      <div className="txt">
        <strong>{title}</strong>
        {desc && <div className="tiny">{desc}</div>}
      </div>
      <Toggle on={on} onChange={disabled ? () => {} : onChange} />
    </div>
  );
}

/** Choix exclusif entre deux ou trois options, façon segmented control iOS. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          data-on={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="stepper">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label="Moins"
      >
        −
      </button>
      <span className="val">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label="Plus"
      >
        +
      </button>
    </div>
  );
}

export function CampBadge({ player }: { player: Player }) {
  const label =
    player.camp === 'civil' ? 'Civil' : player.camp === 'undercover' ? 'Imposteur' : 'Mr Black';
  const emoji = player.camp === 'civil' ? '🙂' : player.camp === 'undercover' ? '🕵️' : '🖤';
  return (
    <span className={`badge ${player.camp}`}>
      {emoji} {label}
    </span>
  );
}

/**
 * Teinte stable dérivée du nom : chacun garde sa couleur d'une partie à l'autre.
 * FNV-1a suivi d'un brassage final, sans quoi « Joueur 1 » et « Joueur 2 »
 * tomberaient sur deux teintes voisines.
 */
function hue(name: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  h ^= h >>> 15;
  h = Math.imul(h, 0x2545f491) >>> 0;
  h ^= h >>> 13;
  return (h >>> 0) % 360;
}

export function Avatar({ name, large }: { name: string; large?: boolean }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span
      className={`avatar${large ? ' lg' : ''}`}
      style={{ '--h': hue(name) } as CSSProperties}
      aria-hidden
    >
      {initials || '?'}
    </span>
  );
}

export function PlayerGrid({
  players,
  onPick,
  selectedId,
  disabledIds = [],
}: {
  players: Player[];
  onPick: (id: string) => void;
  selectedId?: string | null;
  disabledIds?: string[];
}) {
  return (
    <div className="pgrid stagger">
      {players.map((p, i) => {
        const off = disabledIds.includes(p.id);
        return (
          <button
            key={p.id}
            className="ptile"
            style={{ '--i': i } as CSSProperties}
            data-sel={selectedId === p.id}
            data-dead={off}
            disabled={off}
            onClick={() => onPick(p.id)}
          >
            <Avatar name={p.name} />
            {p.name}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Carte « passe le téléphone à X » : le même dos de carte pour tout le monde,
 * quel que soit ce qu'il y a derrière. On tape pour retourner.
 */
export function HandoffCard({
  name,
  emoji,
  hint,
  cta,
  onOpen,
  variant,
  extra,
}: {
  name: string;
  emoji: string;
  hint: string;
  cta: string;
  onOpen: () => void;
  variant?: 'private';
  extra?: ReactNode;
}) {
  return (
    <div
      className={`secret hidden-card pop${variant === 'private' ? ' private' : ''}`}
      onClick={onOpen}
    >
      <div className="who">Passe le téléphone à</div>
      <Avatar name={name} large />
      <div className="name">{name}</div>
      <div className="emoji">{emoji}</div>
      <div className="hint">{hint}</div>
      {extra}
      <div className="fakebtn">{cta}</div>
    </div>
  );
}
