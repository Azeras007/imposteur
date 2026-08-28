import { GAG_ROLES, MECHANIC_ROLES } from '../data/roles';
import { useApp } from '../store/AppStore';
import { Topbar } from '../components/ui';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="label" style={{ marginBottom: 8 }}>{title}</div>
      <div className="muted" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

export function RulesScreen() {
  const { go } = useApp();
  return (
    <div className="screen">
      <Topbar title="Règles du jeu" onBack={() => go('home')} />

      <Section title="Le principe">
        <p style={{ margin: 0 }}>
          Tout le monde reçoit un mot en secret, sauf que <b>tout le monde n'a pas le même</b>.
        </p>
        <p style={{ margin: 0 }}>
          🙂 <b>Les Civils</b> — la majorité — partagent le même mot.<br />
          🕵️ <b>Les Imposteurs</b> reçoivent un mot différent, volontairement <i>proche</i> :
          poêle contre casserole. Ils ne savent pas qu'ils sont les intrus.<br />
          🖤 <b>Mr Black</b> n'a <b>aucun mot</b>. Il doit bluffer à partir de ce qu'il entend.
        </p>
      </Section>

      <Section title="Un tour de jeu">
        <p style={{ margin: 0 }}>
          1. Le téléphone tourne : chacun découvre son mot puis le cache.<br />
          2. Dans l'ordre affiché, chacun donne <b>un seul indice</b> sur son mot. Interdit de
          prononcer le mot lui-même, ou un mot de la même famille.<br />
          3. On discute, on se soupçonne.<br />
          4. On vote : le joueur désigné est éliminé et son identité est révélée.<br />
          5. Nouveau tour, nouvel ordre de parole.
        </p>
      </Section>

      <Section title="🖤 Mr Black éliminé">
        <p style={{ margin: 0 }}>
          Quand Mr Black se fait éliminer, il a droit à une dernière chance : il annonce le mot
          qu'il pense être celui des civils. <b>S'il tombe juste, il gagne seul et la partie
          s'arrête immédiatement.</b> Sinon il meurt pour de bon et la partie continue.
        </p>
      </Section>

      <Section title="Qui gagne">
        <p style={{ margin: 0 }}>
          🙂 <b>Les Civils</b> gagnent dès que tous les imposteurs (Imposteurs + Mr Black) sont
          éliminés.<br />
          🕵️ <b>Les Imposteurs</b> gagnent dès qu'ils sont aussi nombreux que les civils : à ce
          moment-là, ils contrôlent tous les votes.<br />
          🖤 <b>Mr Black</b> gagne en devinant le mot des civils au moment de son élimination.
        </p>
      </Section>

      <Section title="💘 Cupidon">
        <p style={{ margin: 0 }}>
          En option, deux joueurs au hasard sont <b>amoureux</b> et connaissent l'identité de
          l'autre. Si l'un meurt, l'autre <b>meurt de chagrin</b> dans la foulée.
        </p>
        <p style={{ margin: 0 }}>
          S'ils sont du même camp, ils gagnent normalement avec lui. S'ils sont de <b>camps
          opposés</b>, ils forment un troisième camp : ils gagnent à deux s'ils sont les
          <b> deux derniers survivants</b>.
        </p>
      </Section>

      <Section title="Rôles qui changent les règles">
        {MECHANIC_ROLES.map((r) => (
          <p key={r.id} style={{ margin: 0 }}>
            {r.emoji} <b>{r.name}</b> — {r.short}
          </p>
        ))}
      </Section>

      <Section title="Rôles gags (contraintes de langage)">
        <p style={{ margin: 0, fontStyle: 'italic' }}>
          L'app prévient le porteur en privé. Personne d'autre ne sait qui l'a — mais tout le
          monde sait que le rôle est en jeu.
        </p>
        {GAG_ROLES.map((r) => (
          <p key={r.id} style={{ margin: 0 }}>
            {r.emoji} <b>{r.name}</b> — {r.short}
          </p>
        ))}
      </Section>

      <Section title="Conseils">
        <p style={{ margin: 0 }}>
          Un indice trop précis grille les civils face à Mr Black. Un indice trop vague vous fait
          passer pour un imposteur. Le bon niveau, c'est celui que seuls les gens ayant
          <i> exactement</i> votre mot comprennent.
        </p>
      </Section>
      <div style={{ height: 8 }} />
    </div>
  );
}
