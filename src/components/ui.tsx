import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
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
        <span style={{ width: 40, flex: '0 0 40px' }} />
      )}
      <h2>{title}</h2>
      {right ?? <span style={{ width: 40, flex: '0 0 40px' }} />}
    </div>
  );
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
    <div className="pgrid">
      {players.map((p) => {
        const off = disabledIds.includes(p.id);
        return (
          <button
            key={p.id}
            className="ptile"
            data-sel={selectedId === p.id}
            data-dead={off}
            disabled={off}
            onClick={() => onPick(p.id)}
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
