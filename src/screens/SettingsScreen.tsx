import { GAG_ROLES, MECHANIC_ROLES } from '../data/roles';
import { civilCount, recommendedCounts, validateSetup } from '../game/setup';
import { useApp } from '../store/AppStore';
import { Icon } from '../components/Icon';
import { Actions, OptionRow, SectionTitle, Segmented, Stepper, Topbar } from '../components/ui';
import type { EndRule, RoleId, VoteMode } from '../types';

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
      <Topbar title="Réglages" onBack={() => go('home')} />

      {/* ---- Répartition ---- */}
      <SectionTitle>Répartition des camps</SectionTitle>
      <div className="card">
        <OptionRow
          title="Équilibrage automatique"
          desc="L'app choisit le nombre d'imposteurs selon le nombre de joueurs (~30 %)."
          on={settings.autoBalance}
          onChange={(v) => {
            if (v) {
              const r = recommendedCounts(n);
              setSettings({
                autoBalance: true,
                undercoverCount: r.undercover,
                mrBlackCount: r.mrBlack,
              });
            } else setSettings({ autoBalance: false });
          }}
        />
        <div className="optrow">
          <div className="txt">
            <strong>Imposteurs</strong>
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
            <strong>Mr Black</strong>
            <div className="tiny">
              Aucun mot du tout. S'il est éliminé, il peut tenter de deviner celui des civils.
            </div>
          </div>
          <Stepper
            value={settings.mrBlackCount}
            min={0}
            max={maxImposteurs}
            onChange={(v) => setSettings({ mrBlackCount: v, autoBalance: false })}
          />
        </div>
        <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
          <span className="badge civil">{civilCount(n, settings)} civils</span>
          <span className="badge undercover">
            {settings.undercoverCount} imposteur{settings.undercoverCount > 1 ? 's' : ''}
          </span>
          <span className="badge mrblack">{settings.mrBlackCount} Mr Black</span>
          <span className="tiny">sur {n} joueurs</span>
        </div>
        {err && <div className="err" style={{ marginTop: 12 }}>{err}</div>}
      </div>

      {/* ---- Déroulé ---- */}
      <SectionTitle>Déroulé de la partie</SectionTitle>
      <div className="card">
        <div className="stack" style={{ paddingBottom: 14, borderBottom: '1px solid var(--line)' }}>
          <div>
            <strong style={{ fontSize: 15.5 }}>Identité des éliminés</strong>
            <div className="tiny" style={{ marginTop: 3 }}>
              {settings.revealEliminated
                ? "Le camp et le mot de l'éliminé sont annoncés à toute la table."
                : "Rien n'est révélé : on ne sait jamais si on vient de sortir un civil ou un imposteur. Mr Black tente son mot en privé, l'air de rien. Tout se dévoile à la fin."}
            </div>
          </div>
          <Segmented
            value={settings.revealEliminated ? 'oui' : 'non'}
            onChange={(v) => setSettings({ revealEliminated: v === 'oui' })}
            options={[
              { value: 'non', label: 'Secrète' },
              { value: 'oui', label: 'Révélée' },
            ]}
          />
        </div>

        <div
          className="stack"
          style={{ padding: '14px 0', borderBottom: '1px solid var(--line)' }}
        >
          <div>
            <strong style={{ fontSize: 15.5 }}>Fin de partie</strong>
            <div className="tiny" style={{ marginTop: 3 }}>
              {settings.endRule === 'dernierCivil'
                ? "Un civil éliminé ne clôt pas la partie : on enchaîne les tours sans lui. Les imposteurs gagnent quand il ne reste plus un seul civil, ou au duel final à deux survivants."
                : 'Classique : les imposteurs gagnent dès qu’ils sont aussi nombreux que les civils. Ça peut se terminer dès la première erreur de vote.'}
            </div>
          </div>
          <Segmented<EndRule>
            value={settings.endRule}
            onChange={(v) => setSettings({ endRule: v })}
            options={[
              { value: 'dernierCivil', label: 'Jusqu’au bout' },
              { value: 'egalite', label: 'Classique' },
            ]}
          />
        </div>

        <div className="stack" style={{ padding: '14px 0 0' }}>
          <div>
            <strong style={{ fontSize: 15.5 }}>Mode de vote</strong>
            <div className="tiny" style={{ marginTop: 3 }}>
              {settings.voteMode === 'rapide'
                ? 'À main levée : vous votez de vive voix, puis vous désignez l’éliminé sur le téléphone.'
                : 'À bulletin secret : le téléphone tourne, chacun vote. Le Maire compte double.'}
            </div>
          </div>
          <Segmented<VoteMode>
            value={settings.voteMode}
            onChange={(v) => setSettings({ voteMode: v })}
            options={[
              { value: 'rapide', label: 'Main levée' },
              { value: 'secret', label: 'Bulletin secret' },
            ]}
          />
        </div>
      </div>

      <div className="card">
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
            <strong>Chrono par joueur</strong>
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

      {/* ---- Rôles ---- */}
      <SectionTitle>Rôles qui changent les règles</SectionTitle>
      <div className="card">
        <div className="tiny" style={{ marginBottom: 4 }}>
          L'app applique vraiment ces pouvoirs. Un rôle actif est donné à un joueur au hasard (au
          maximum un rôle par joueur).
        </div>
        <OptionRow
          title="Cupidon"
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

      <SectionTitle>Rôles gags</SectionTitle>
      <div className="card">
        <div className="tiny" style={{ marginBottom: 4 }}>
          Des contraintes de langage. L'app les souffle en privé au porteur ; c'est au groupe de
          les faire respecter.
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
      <SectionTitle>Packs de mots</SectionTitle>
      <div className="card">
        <div className="between" style={{ marginBottom: 12 }}>
          <div className="tiny">{activePairs} paires disponibles</div>
          <button className="btn sm ghost" onClick={() => go('words')}>
            Gérer mes packs
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
        {activePairs === 0 && (
          <div className="err" style={{ marginTop: 12 }}>
            Active au moins un pack pour pouvoir jouer.
          </div>
        )}
      </div>

      <div className="grow" />
      <Actions>
        <button className="btn primary" onClick={() => go('players')}>
          <Icon name="check" size={18} /> Terminé
        </button>
      </Actions>
    </div>
  );
}
