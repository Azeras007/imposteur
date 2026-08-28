import { useApp } from '../store/AppStore';

export function Home() {
  const { go, names, settings } = useApp();
  const roleCount = settings.enabledRoles.length + (settings.cupidon ? 1 : 0);
  const civils = names.length - settings.undercoverCount - settings.mrBlackCount;

  return (
    <div className="screen">
      <div className="hero">
        <div className="mask">🕵️</div>
        <h1>Imposteur</h1>
        <p>Un mot pour tous. Presque.</p>
      </div>

      <div className="grow" />

      <div className="deck" aria-hidden>
        <div className="deckcard a">poêle</div>
        <div className="deckcard b">casserole</div>
        <div className="deckcard c">?</div>
      </div>

      <div className="grow" />

      <div className="homegrid">
        <button className="btn primary wide" onClick={() => go('players')}>
          ▶︎ Nouvelle partie
        </button>
        <button className="btn" onClick={() => go('words')}>
          ✏️ Mes mots
        </button>
        <button className="btn" onClick={() => go('settings')}>
          ⚙️ Réglages
        </button>
        <button className="btn ghost wide" onClick={() => go('rules')}>
          📖 Comment on joue
        </button>
      </div>

      <div className="summary">
        <span className="chip static">👥 {names.length} joueurs</span>
        <span className="badge civil">🙂 {civils}</span>
        <span className="badge undercover">🕵️ {settings.undercoverCount}</span>
        <span className="badge mrblack">🖤 {settings.mrBlackCount}</span>
        {roleCount > 0 && <span className="badge role">✨ {roleCount}</span>}
      </div>
      <div className="tiny center">
        {settings.endRule === 'dernierCivil' ? 'Partie longue' : 'Règle classique'}
        {' · '}
        {settings.revealEliminated ? 'identités révélées' : 'identités secrètes'}
        {' · '}
        {settings.voteMode === 'secret' ? 'vote à bulletin secret' : 'vote à main levée'}
      </div>
    </div>
  );
}
