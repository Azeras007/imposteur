import type { ReactNode } from 'react';

/**
 * Jeu d'icônes maison : traits d'un pixel, `currentColor`, aucune dépendance.
 * L'interface n'utilise pas d'emoji — ils sont réservés au contenu explicatif.
 */
export type IconName =
  | 'back'
  | 'close'
  | 'play'
  | 'pause'
  | 'reset'
  | 'pencil'
  | 'gear'
  | 'book'
  | 'users'
  | 'eye'
  | 'cards'
  | 'ballot'
  | 'check'
  | 'userMinus'
  | 'skull'
  | 'phone'
  | 'shield'
  | 'sword'
  | 'crown'
  | 'sparkle'
  | 'orb'
  | 'heart'
  | 'trash'
  | 'download'
  | 'plus'
  | 'arrow';

const PATHS: Record<IconName, ReactNode> = {
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  play: <path d="M7 4.5v15l13-7.5z" />,
  pause: <path d="M9 5v14M15 5v14" />,
  reset: <path d="M20 12a8 8 0 1 1-2.4-5.7M20 3.5V9h-5.5" />,
  pencil: <path d="M4 20.5h4L20.5 8 16.5 4 4 16.5v4zM14.5 6l4 4" />,
  /* Curseurs de réglage : plus lisible qu'un engrenage à cette taille. */
  gear: (
    <>
      <path d="M3.5 7.5h17M3.5 16.5h17" />
      <circle cx="9" cy="7.5" r="2.6" />
      <circle cx="15" cy="16.5" r="2.6" />
    </>
  ),
  book: (
    <>
      <path d="M4.5 5A2 2 0 0 1 6.5 3H19.5v15.5H6.5a2 2 0 0 0-2 2V5z" />
      <path d="M8.5 7.5h7M8.5 11h5" />
    </>
  ),
  users: (
    <>
      <circle cx="9.5" cy="8" r="3.2" />
      <path d="M3.5 20a6 6 0 0 1 12 0M16.5 5.2a3.2 3.2 0 0 1 0 5.9M17.5 14.5a6 6 0 0 1 3 5.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 6.2 12 6.2 21.5 12 21.5 12 18 17.8 12 17.8 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  cards: (
    <>
      <rect x="3" y="7" width="12" height="14" rx="2.5" />
      <path d="M8 4.2A2 2 0 0 1 10 3h7a2 2 0 0 1 2 2v11" />
    </>
  ),
  ballot: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
      <path d="M8 12.2l2.6 2.6L16 9.4" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5 10-11" />,
  userMinus: (
    <>
      <circle cx="10" cy="8" r="3.4" />
      <path d="M3.5 20.5a6.5 6.5 0 0 1 13 0M17 12.5h5" />
    </>
  ),
  skull: (
    <>
      <path d="M5 11.5a7 7 0 1 1 14 0v2.2l-1.6 1.6v3.2H6.6v-3.2L5 13.7v-2.2z" />
      <path d="M9.3 11.6h.01M14.7 11.6h.01" strokeWidth="2.6" />
    </>
  ),
  phone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  shield: <path d="M12 2.8l7.5 3v6.4c0 4.3-3.1 7.5-7.5 9-4.4-1.5-7.5-4.7-7.5-9V5.8z" />,
  sword: <path d="M14.5 3.5H20v5.5L10 19l-1.7-1.7L4.6 21 3 19.4l3.7-3.7L5 14z" />,
  crown: <path d="M3.5 8l4 4.5L12 4.5l4.5 8L20.5 8v11.5h-17z" />,
  sparkle: <path d="M12 3l2 5.9 5.9 2-5.9 2-2 5.9-2-5.9-5.9-2 5.9-2z" />,
  orb: (
    <>
      <circle cx="12" cy="10" r="6.5" />
      <path d="M5.5 20.5h13" />
    </>
  ),
  heart: <path d="M12 20.5S4 15.7 4 10.4A4.4 4.4 0 0 1 12 8a4.4 4.4 0 0 1 8 2.4c0 5.3-8 10.1-8 10.1z" />,
  trash: <path d="M4 6.5h16M9.5 6.5V4h5v2.5M6.5 6.5l1 14h9l1-14" />,
  download: <path d="M12 3.5v12M7 11l5 5 5-5M4 20.5h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

const FILLED: IconName[] = ['play', 'sparkle', 'shield', 'crown', 'sword', 'heart'];

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const filled = FILLED.includes(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 1 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      style={{ flex: '0 0 auto' }}
    >
      {PATHS[name]}
    </svg>
  );
}
