# 🕵️ Imposteur

Jeu de soirée « un seul téléphone », inspiré d'Undercover. Tout le monde reçoit un mot en
secret — sauf que tout le monde n'a pas le même, et que l'un d'eux n'en a aucun.

## Lancer

```bash
npm install
npm run dev
```

Vite affiche une URL réseau (`http://192.168.x.x:5180`). Ouvre-la depuis le téléphone qui
servira de plateau : l'app est pensée mobile d'abord, et « Ajouter à l'écran d'accueil »
la lance en plein écran.

- `npm run build` → build de prod dans `dist/` (hébergeable n'importe où, chemins relatifs)
- `npm test` → simule des milliers de parties aléatoires et vérifie les invariants du moteur

## Les camps

| | Mot | Objectif |
|---|---|---|
| 🙂 **Civils** | le mot commun | éliminer tous les imposteurs |
| 🕵️ **Imposteurs** | un mot *proche* (poêle vs casserole) | survivre jusqu'à prendre la table |
| 🖤 **Mr Black** | aucun | bluffer, et deviner le mot des civils s'il est éliminé |

## Identités secrètes

Par défaut, **on n'apprend jamais ce qu'on vient d'éliminer**. La table voit seulement partir un
joueur ; civil ou imposteur, tout est dévoilé à la fin seulement. L'éliminé reçoit le téléphone
quelques secondes pour découvrir son sort en privé — le même écran pour tout le monde, y compris
quand c'est **Mr Black qui tente son mot** : s'il se trompe, personne ne saura jamais que c'était
lui. Le journal de partie est censuré en conséquence tant que la partie tourne.

L'option *Identité des éliminés → Révélée* rétablit la révélation publique classique.

Pendant les tours de parole, un bouton **👁️** à côté de chaque nom remontre son mot en privé, pour
celui qui l'a oublié.

## Fin de partie

Deux règles au choix dans les paramètres — elle est figée au lancement de la partie :

- **Jusqu'au bout** *(par défaut)* : un civil éliminé ne met pas fin à la partie. On enchaîne
  les tours sans lui tant qu'il reste un civil debout. Les imposteurs gagnent quand il n'en
  reste plus aucun, ou au **duel final** : à deux survivants de camps opposés le vote n'a plus
  de sens, la table revient aux imposteurs.
- **Classique** : les imposteurs gagnent dès qu'ils sont aussi nombreux que les civils. Court,
  parfois très court — à cinq joueurs, une seule erreur de vote peut clore la partie.

Mr Black éliminé annonce le mot qu'il croit être celui des civils. S'il tombe juste il gagne
seul, la partie s'arrête. Sinon il meurt et le jeu continue. La comparaison tolère les
accents, les articles et les fautes de frappe.

## Rôles optionnels

**Qui changent les règles** (l'app applique le pouvoir) : 💘 Cupidon, 🃏 Bouffon,
⚔️ Vengeur, 👑 Maire, 🔮 Voyante, 🛡️ Garde du corps, 🕴️ Parrain.

**Gags** (contraintes de langage soufflées en privé au porteur) : 🤐 Muet, 🎭 Poète,
🤥 Menteur, 🦜 Perroquet, 👻 Fantôme.

Chaque rôle actif est attribué à un joueur au hasard, au plus un rôle par joueur, en
respectant les camps autorisés (le Bouffon est forcément civil, le Parrain forcément
imposteur…). Un rôle sans porteur possible est simplement sauté.

## Mots

~285 paires réparties en 14 packs thématiques, dont un pack 18+ désactivé par défaut.
L'onglet **Mes mots** permet de créer ses propres packs, d'ajouter des paires, et
d'importer / exporter en JSON :

```json
{ "name": "Mon pack", "emoji": "🔥", "pairs": [{ "a": "poêle", "b": "casserole" }] }
```

`a` est le mot des civils, `b` celui des imposteurs. Avec l'option *Inverser les paires au
hasard*, l'app tire lequel des deux revient aux civils, pour qu'on ne puisse pas déduire son
camp d'une partie sur l'autre.

## Interface

Noir, blanc, et un seul rouge. Fond quasi noir, filets d'un pixel, beaucoup de vide, typo
d'affichage (Space Grotesk) pour les mots et les titres, Inter pour le reste. La couleur ne sert
qu'à ce qui compte : l'intrus, l'action qui élimine, le camp gagnant. L'interface n'utilise aucun
emoji — les icônes sont des SVG maison en `currentColor` (`src/components/Icon.tsx`) ; les emojis
restent réservés au contenu qui explique (fiches de rôles, écran des règles).

Chaque joueur reçoit un avatar à ses initiales, dans une valeur de gris dérivée de son nom et
stable d'une partie à l'autre. Tout ce qui est secret passe par la même carte « passe le
téléphone à… », dos de carte hachuré identique pour tout le monde, pour que rien ne se devine à
la forme de l'écran.

## Structure

```
src/
  data/        packs de mots, définitions des rôles
  game/        moteur pur (distribution, votes, morts, victoires) — aucun React
  store/       état global + persistance localStorage
  screens/     écrans hors partie
  screens/game/ écrans de partie, un par phase
sim/           harnais de simulation du moteur
```

Le moteur (`src/game/`) est volontairement sans dépendance à React : chaque transition est
une fonction pure `Game -> Game`, ce qui permet de le tester en le rejouant des milliers de
fois dans `sim/`.
