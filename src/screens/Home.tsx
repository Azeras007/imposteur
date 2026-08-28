import { useApp } from '../store/AppStore';

export function Home() {
  const { go, names, settings } = useApp();
  const roleCount = settings.enabledRoles.length + (settings.cupidon ? 1 : 0);

  return (
    <div className="screen">
      <div className="hero">
        <div className="mask">🕵️</div>
        <h1>Imposteur</h1>
        <p>Un mot pour tous. Presque.</p>
      </div>

      <div className="stack grow" style={{ justifyContent: 'center' }}>
        <button className="btn primary" onClick={() => go('players')}>
          ▶︎ Nouvelle partie
        </button>
        <button className="btn" onClick={() => go('words')}>
          ✏️ Mes mots
        </button>
        <button className="btn" onClick={() => go('settings')}>
          ⚙️ Paramètres
        </button>
        <button className="btn ghost" onClick={() => go('rules')}>
          📖 Règles du jeu
        </button>
      </div>

      <div className="card tight center">
        <div className="tiny">
          {names.length} joueurs · {settings.undercoverCount} imposteur
          {settings.undercoverCount > 1 ? 's' : ''} · {settings.mrBlackCount} Mr Black ·{' '}
          {roleCount > 0 ? `${roleCount} rôle${roleCount > 1 ? 's' : ''} spécial${roleCount > 1 ? 'aux' : ''}` : 'aucun rôle spécial'}
        </div>
      </div>
    </div>
  );
}
