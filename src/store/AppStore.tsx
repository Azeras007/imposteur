import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { BUILTIN_PACKS } from '../data/wordPacks';
import { createGame, recommendedCounts } from '../game/setup';
import type { Game, Settings, WordPack, WordPair } from '../types';
import { DEFAULT_STATE, load, save, type Persisted } from './persist';

export type Screen = 'home' | 'players' | 'settings' | 'words' | 'rules' | 'game';

interface Store extends Persisted {
  screen: Screen;
  go: (s: Screen) => void;
  game: Game | null;
  allPacks: WordPack[];
  setSettings: (patch: Partial<Settings>) => void;
  setNames: (names: string[]) => void;
  startGame: () => string | null;
  updateGame: (g: Game) => void;
  quitGame: () => void;
  replay: () => void;
  // Packs personnalisés
  createPack: (name: string, emoji: string) => string;
  renamePack: (id: string, name: string, emoji: string) => void;
  deletePack: (id: string) => void;
  addPair: (packId: string, a: string, b: string) => void;
  updatePair: (packId: string, pairId: string, a: string, b: string) => void;
  deletePair: (packId: string, pairId: string) => void;
  importPack: (json: string) => string | null;
}

const Ctx = createContext<Store | null>(null);

export function AppStore({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() =>
    typeof window === 'undefined' ? DEFAULT_STATE : load(),
  );
  const [screen, setScreen] = useState<Screen>('home');
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => save(state), [state]);

  const allPacks = useMemo(
    () => [...BUILTIN_PACKS, ...state.customPacks],
    [state.customPacks],
  );

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const setNames = useCallback((names: string[]) => {
    setState((s) => {
      // L'équilibrage auto suit le nombre de joueurs.
      if (!s.settings.autoBalance) return { ...s, names };
      const r = recommendedCounts(names.length);
      return {
        ...s,
        names,
        settings: { ...s.settings, undercoverCount: r.undercover, mrBlackCount: r.mrBlack },
      };
    });
  }, []);

  const launch = useCallback(
    (st: Persisted): string | null => {
      try {
        const packs = [...BUILTIN_PACKS, ...st.customPacks];
        const g = createGame({
          names: st.names,
          settings: st.settings,
          packs,
          recentPairIds: st.recentPairIds,
        });
        setGame(g);
        setScreen('game');
        setState((s) => ({
          ...s,
          recentPairIds: [g.pairId, ...s.recentPairIds].slice(0, 40),
        }));
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : 'Impossible de lancer la partie.';
      }
    },
    [],
  );

  const startGame = useCallback(() => launch(state), [launch, state]);
  const replay = useCallback(() => launch(state), [launch, state]);

  const value: Store = {
    ...state,
    screen,
    go: setScreen,
    game,
    allPacks,
    setSettings,
    setNames,
    startGame,
    replay,
    updateGame: setGame,
    quitGame: () => {
      setGame(null);
      setScreen('home');
    },
    createPack: (name, emoji) => {
      const id = `custom-${Date.now().toString(36)}`;
      setState((s) => ({
        ...s,
        customPacks: [...s.customPacks, { id, name, emoji, builtin: false, pairs: [] }],
        settings: { ...s.settings, activePackIds: [...s.settings.activePackIds, id] },
      }));
      return id;
    },
    renamePack: (id, name, emoji) =>
      setState((s) => ({
        ...s,
        customPacks: s.customPacks.map((p) => (p.id === id ? { ...p, name, emoji } : p)),
      })),
    deletePack: (id) =>
      setState((s) => ({
        ...s,
        customPacks: s.customPacks.filter((p) => p.id !== id),
        settings: {
          ...s.settings,
          activePackIds: s.settings.activePackIds.filter((x) => x !== id),
        },
      })),
    addPair: (packId, a, b) =>
      setState((s) => ({
        ...s,
        customPacks: s.customPacks.map((p) =>
          p.id === packId
            ? {
                ...p,
                pairs: [
                  ...p.pairs,
                  { id: `${packId}-${Date.now().toString(36)}`, a: a.trim(), b: b.trim() },
                ],
              }
            : p,
        ),
      })),
    updatePair: (packId, pairId, a, b) =>
      setState((s) => ({
        ...s,
        customPacks: s.customPacks.map((p) =>
          p.id === packId
            ? {
                ...p,
                pairs: p.pairs.map((q) =>
                  q.id === pairId ? { ...q, a: a.trim(), b: b.trim() } : q,
                ),
              }
            : p,
        ),
      })),
    deletePair: (packId, pairId) =>
      setState((s) => ({
        ...s,
        customPacks: s.customPacks.map((p) =>
          p.id === packId ? { ...p, pairs: p.pairs.filter((q) => q.id !== pairId) } : p,
        ),
      })),
    importPack: (json) => {
      try {
        const raw = JSON.parse(json) as { name?: string; emoji?: string; pairs?: unknown };
        if (!Array.isArray(raw.pairs)) return 'Le JSON doit contenir un tableau « pairs ».';
        const id = `custom-${Date.now().toString(36)}`;
        const pairs: WordPair[] = raw.pairs
          .map((x, i) => {
            const o = x as { a?: unknown; b?: unknown };
            return { id: `${id}-${i}`, a: String(o.a ?? ''), b: String(o.b ?? '') };
          })
          .filter((p) => p.a && p.b);
        if (pairs.length === 0) return 'Aucune paire valide trouvée.';
        setState((s) => ({
          ...s,
          customPacks: [
            ...s.customPacks,
            {
              id,
              name: String(raw.name ?? 'Pack importé'),
              emoji: String(raw.emoji ?? '📦'),
              builtin: false,
              pairs,
            },
          ],
          settings: { ...s.settings, activePackIds: [...s.settings.activePackIds, id] },
        }));
        return null;
      } catch {
        return 'JSON invalide.';
      }
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp doit être utilisé dans <AppStore>');
  return v;
}
