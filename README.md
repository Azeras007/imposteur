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
