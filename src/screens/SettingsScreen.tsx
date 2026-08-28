import { GAG_ROLES, MECHANIC_ROLES } from '../data/roles';
import { civilCount, recommendedCounts, validateSetup } from '../game/setup';
import { useApp } from '../store/AppStore';
import { Actions, OptionRow, Stepper, Topbar } from '../components/ui';
import type { RoleId } from '../types';

export function SettingsScreen() {
  const { go, settings, setSettings, allPacks, names } = useApp();
  const n = names.length;
  const err = validateSetup(n, settings);

  const toggleRole = (id: RoleId) =>
    setSettings({
      enabledRoles: settings.enabledRoles.includes(id)
        ? settings.enabledRoles.filter((r) => r !== id)
        : [...settings.enabledRoles, id],
    });

  const togglePack = (id: string) =>
    setSettings({
      activePackIds: settings.activePackIds.includes(id)
        ? settings.activePackIds.filter((p) => p !== id)
        : [...settings.activePackIds, id],
    });

  const activePairs = allPacks
    .filter((p) => settings.activePackIds.includes(p.id))
    .reduce((sum, p) => sum + p.pairs.length, 0);

  const maxImposteurs = Math.max(1, Math.floor((n - 1) / 2));

  return (
    <div className="screen">
      <Topbar title="Paramètres" onBack={() => go('home')} />

      {/* ---- Répartition ---- */}
      <div className="card">
        <div className="label" style={{ marginBottom: 6 }}>Répartition des rôles</div>
        <OptionRow
          title="Équilibrage automatique"
          desc="L'app choisit le nombre d'imposteurs selon le nombre de joueurs (~30 %)."
          on={settings.autoBalance}
          onChange={(v) => {
            if (v) {
              const r = recommendedCounts(n);
              setSettings({ autoBalance: true, undercoverCount: r.undercover, mrBlackCount: r.mrBlack });
            } else setSettings({ autoBalance: false });
          }}
        />
        <div className="optrow">
          <div className="txt">
            <strong>🕵️ Imposteurs</strong>
            <div className="tiny">Ils ont un mot différent, proche mais pas identique.</div>
          </div>
          <Stepper
            value={settings.undercoverCount}
            min={0}
            max={maxImposteurs}
            onChange={(v) => setSettings({ undercoverCount: v, autoBalance: false })}
          />
        </div>
        <div className="optrow">
          <div className="txt">
            <strong>🖤 Mr Black</strong>
            <div className="tiny">Aucun mot du tout. S'il est éliminé, il peut tenter de deviner.</div>
          </div>
          <Stepper
            value={settings.mrBlackCount}
            min={0}
            max={maxImposteurs}
            onChange={(v) => setSettings({ mrBlackCount: v, autoBalance: false })}
          />
        </div>
        <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
          <span className="badge civil">🙂 {civilCount(n, settings)} civils</span>
          <span className="badge undercover">🕵️ {settings.undercoverCount}</span>
          <span className="badge mrblack">🖤 {settings.mrBlackCount}</span>
          <span className="tiny">sur {n} joueurs</span>
        </div>
        {err && <div className="err" style={{ marginTop: 10 }}>{err}</div>}
      </div>

      {/* ---- Rôles ---- */}
      <div className="card">
        <div className="label">Rôles spéciaux — règles</div>
        <div className="tiny" style={{ margin: '6px 0 4px' }}>
          L'app applique vraiment ces pouvoirs. Un rôle actif est donné à un joueur au hasard
          (au maximum un rôle par joueur).
        </div>
        <OptionRow
          title="💘 Cupidon"
          desc="Deux joueurs au hasard sont amoureux. Si l'un meurt, l'autre meurt de chagrin. S'ils sont les 2 derniers et de camps opposés, ils gagnent à deux."
          on={settings.cupidon}
          onChange={(v) => setSettings({ cupidon: v })}
        />
        {MECHANIC_ROLES.map((r) => (
          <OptionRow
            key={r.id}
            title={`${r.emoji} ${r.name}`}
            desc={`${r.short}${n < r.minPlayers ? ` — nécessite ${r.minPlayers} joueurs` : ''}`}
            on={settings.enabledRoles.includes(r.id)}
            onChange={() => toggleRole(r.id)}
            disabled={n < r.minPlayers}
          />
        ))}
      </div>

      <div className="card">
        <div className="label">Rôles spéciaux — gags</div>
        <div className="tiny" style={{ margin: '6px 0 4px' }}>
          Des contraintes de langage. L'app les souffle en privé au porteur ; c'est au groupe
          de les faire respecter.
        </div>
        {GAG_ROLES.map((r) => (
          <OptionRow
            key={r.id}
            title={`${r.emoji} ${r.name}`}
            desc={r.short}
            on={settings.enabledRoles.includes(r.id)}
            onChange={() => toggleRole(r.id)}
            disabled={n < r.minPlayers}
          />
        ))}
      </div>

      {/* ---- Packs ---- */}
      <div className="card">
        <div className="between" style={{ marginBottom: 10 }}>
          <div className="label">Packs de mots</div>
          <button className="btn sm ghost" onClick={() => go('words')}>
            Gérer
          </button>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          {allPacks.map((p) => (
            <button
              key={p.id}
              className="chip"
              data-on={settings.activePackIds.includes(p.id)}
              onClick={() => togglePack(p.id)}
            >
              {p.emoji} {p.name} <span className="tiny">{p.pairs.length}</span>
            </button>
          ))}
        </div>
        <div className="tiny" style={{ marginTop: 10 }}>
          {activePairs} paires disponibles.
          {activePairs === 0 && ' ⚠️ Active au moins un pack pour jouer.'}
        </div>
      </div>

      {/* ---- Options ---- */}
      <div className="card">
        <div className="label" style={{ marginBottom: 4 }}>Déroulé de la partie</div>
        <div className="optrow">
          <div className="txt">
            <strong>Fin de partie</strong>
            <div className="tiny">
              {settings.endRule === 'dernierCivil'
                ? 'Parties longues : un civil éliminé ne clôt pas la partie, on enchaîne les tours sans lui. Les imposteurs gagnent quand il ne reste plus un seul civil (ou au duel final, à deux survivants).'
                : 'Classique : les imposteurs gagnent dès qu’ils sont aussi nombreux que les civils. La partie peut s’arrêter dès la première erreur de vote.'}
            </div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button
              className="chip"
              data-on={settings.endRule === 'dernierCivil'}
              onClick={() => setSettings({ endRule: 'dernierCivil' })}
            >
              Jusqu'au bout
            </button>
            <button
              className="chip"
              data-on={settings.endRule === 'egalite'}
              onClick={() => setSettings({ endRule: 'egalite' })}
            >
              Classique
            </button>
          </div>
        </div>
        <div className="optrow">
          <div className="txt">
            <strong>Mode de vote</strong>
            <div className="tiny">
              {settings.voteMode === 'rapide'
                ? 'À main levée : vous votez de vive voix, puis vous désignez l’éliminé sur le téléphone.'
                : 'À bulletin secret : le téléphone tourne, chacun vote. Le Maire compte double.'}
            </div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button
              className="chip"
              data-on={settings.voteMode === 'rapide'}
              onClick={() => setSettings({ voteMode: 'rapide' })}
            >
              Rapide
            </button>
            <button
              className="chip"
              data-on={settings.voteMode === 'secret'}
              onClick={() => setSettings({ voteMode: 'secret' })}
            >
              Secret
            </button>
          </div>
        </div>
        <OptionRow
          title="Mr Black ne parle jamais en premier"
          desc="Sinon il doit inventer un indice sans la moindre information."
          on={settings.blackNeverFirst}
          onChange={(v) => setSettings({ blackNeverFirst: v })}
        />
        <OptionRow
          title="Inverser les paires au hasard"
          desc="Le mot des civils est tiré au hasard dans la paire, pour qu'on ne puisse pas déduire son camp d'une partie à l'autre."
          on={settings.swapPair}
          onChange={(v) => setSettings({ swapPair: v })}
        />
        <div className="optrow">
          <div className="txt">
            <strong>⏱️ Chrono par joueur</strong>
            <div className="tiny">
              {settings.timerSeconds === 0
                ? 'Désactivé.'
                : `${settings.timerSeconds} s pour donner son indice.`}
            </div>
          </div>
          <Stepper
            value={settings.timerSeconds}
            min={0}
            max={90}
            step={15}
            onChange={(v) => setSettings({ timerSeconds: v })}
          />
        </div>
      </div>

      <Actions>
        <button className="btn primary" onClick={() => go('players')}>
          ✔︎ Terminé
        </button>
      </Actions>
    </div>
  );
}
