import { Icon } from '../components/Icon';
import { useApp } from '../store/AppStore';

export function Home() {
  const { go, names, settings } = useApp();
  const roleCount = settings.enabledRoles.length + (settings.cupidon ? 1 : 0);
  const civils = names.length - settings.undercoverCount - settings.mrBlackCount;

  return (
    <div className="screen">
      <div className="hero">
        <div className="kicker">Jeu de soirée · un seul téléphone</div>
        <h1>
          Imposteur<span className="dot">.</span>
        </h1>
        <p>Tout le monde reçoit un mot. Tout le monde n'a pas le même.</p>
      </div>

      <div className="grow" />

      <div className="deck" aria-hidden>
        <div className="deckcard a">poêle</div>
        <div className="deckcard b">casserole</div>
        <div className="deckcard c">?</div>
      </div>

      <div className="grow" />

      <div className="homelist">
        <button className="btn primary" onClick={() => go('players')}>
          <Icon name="play" size={18} /> Nouvelle partie
        </button>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn" onClick={() => go('words')}>
            <Icon name="pencil" size={18} /> Mes mots
          </button>
          <button className="btn" onClick={() => go('settings')}>
            <Icon name="gear" size={18} /> Réglages
          </button>
        </div>
        <button className="btn ghost" onClick={() => go('rules')}>
          <Icon name="book" size={18} /> Comment on joue
        </button>
      </div>

      <div className="summary" style={{ marginTop: 4 }}>
        <span className="badge civil">{civils} civils</span>
        <span className="badge undercover">
          {settings.undercoverCount} imposteur{settings.undercoverCount > 1 ? 's' : ''}
        </span>
        <span className="badge mrblack">{settings.mrBlackCount} Mr Black</span>
        {roleCount > 0 && (
          <span className="badge role">
            {roleCount} rôle{roleCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="tiny">
        {names.length} joueurs
        {' · '}
        {settings.endRule === 'dernierCivil' ? 'partie longue' : 'règle classique'}
        {' · '}
        {settings.revealEliminated ? 'identités révélées' : 'identités secrètes'}
        {' · '}
        {settings.voteMode === 'secret' ? 'vote à bulletin secret' : 'vote à main levée'}
      </div>
    </div>
  );
}
