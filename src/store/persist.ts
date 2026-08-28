import { DEFAULT_ACTIVE_PACKS } from '../data/wordPacks';
import type { Settings, WordPack } from '../types';

const KEY = 'imposteur:v1';

export interface Persisted {
  settings: Settings;
  customPacks: WordPack[];
  names: string[];
  recentPairIds: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  undercoverCount: 1,
  mrBlackCount: 1,
  autoBalance: true,
  enabledRoles: [],
  cupidon: false,
  activePackIds: DEFAULT_ACTIVE_PACKS,
  voteMode: 'rapide',
  blackNeverFirst: true,
  timerSeconds: 0,
  swapPair: true,
  endRule: 'dernierCivil',
};

export const DEFAULT_STATE: Persisted = {
  settings: DEFAULT_SETTINGS,
  customPacks: [],
  names: ['', '', '', '', ''],
  recentPairIds: [],
};

export function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      customPacks: parsed.customPacks ?? [],
      names: parsed.names ?? DEFAULT_STATE.names,
      recentPairIds: parsed.recentPairIds ?? [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function save(state: Persisted): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota plein ou mode privé : on continue sans sauvegarder */
  }
}
