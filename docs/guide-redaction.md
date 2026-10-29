# Guide de rédaction des fiches — SOS Admin

Ce guide explique **comment écrire une fiche**. La définition technique du format, qui fait foi, est dans `schema/fiche.ts` ; la commande `npm run validate` vérifie qu'une fiche la respecte.

Exemples complets à copier : `content/fiches/active-directory/ad-compte-verrouille.yaml`, `content/fiches/materiel-peripheriques/imprimante-reseau-session.yaml`, `content/fiches/windows/poste-lent-demarrage.yaml`.

## 1. Où ranger la fiche

- Fichier : `content/fiches/<domaine>/<id>.yaml`. Le dossier = `domaine`, le nom du fichier = `id`.
- `domaine`, `sous_domaine` et `theme` (optionnel) viennent de `content/taxonomie.yaml`.
- La fiche est rangée **là où se trouve le plus souvent la cause**. Pour la faire apparaître ailleurs, ajouter l'emplacement dans `apparait_aussi_dans` (ex. `windows/impression`). On ne copie jamais une fiche.
- `id` : minuscules, chiffres et tirets, sans accents. Il sert dans l'adresse `/fiches/<id>/` : **ne plus le changer** une fois publié.

## 2. Les blocs d'une fiche

| Champ | Contenu | Règles |
|---|---|---|
| `titre` | Le problème, tel qu'on le chercherait | Court, sans jargon inutile |
| `resume` | 1 ou 2 phrases : le problème et la démarche | |
| `statut` | `brouillon`, `a-relire` ou `verifiee` | `brouillon` = non publiée. Seul Benji (ou un technicien qui a testé) passe une fiche en `verifiee` |
| `niveau` | `N1`, `N2` ou `N3` | Niveau global : celui des premières étapes |
| `temps_estime` | `{ min: 5, max: 30 }` en minutes | |
| `critique` | `true` si grave | Oblige à remplir `premiers_reflexes` |
| `environnements` | Ids de `content/environnements.yaml` | Le premier de la liste est la version affichée par défaut : mettre la plus récente en premier |
| `droits` | `aucun`, `admin-local`, `delegation-ad`, `admin-domaine`, `admin-m365`, `admin-reseau`, `root` | Les droits nécessaires pour aller **au bout** de la fiche |
| `outils` | Ids de `content/outils/` | Une alerte rappelle les fiches outils à rédiger |
| `acces` | Liste de phrases | Où il faut être connecté, quel accès |
| `symptomes` | Phrases **avec les mots de l'utilisateur**, entre « » | Au moins une |
| `messages_erreur` | `texte`, `code` (optionnel), `ou` (optionnel) | Texte exact, non traduit. Mettre les codes entre guillemets : `code: "0x0000011b"` |
| `variables` | `nom` (PascalCase), `libelle`, `exemple` | Toute variable `<Nom>` d'une commande doit être déclarée ici |
| `causes` | `id` (c1, c2…), `titre`, `frequence`, `detail` | Classées **de la plus fréquente à la plus rare** |
| `diagnostic` | Étapes (voir § 3) | Chaque étape se termine par des `conclusions` |
| `resolutions` | `id` (r1…), `causes` traitées, `titre`, `etapes` | Chaque cause doit avoir une résolution, ou un renvoi vers une autre fiche |
| `verification` | Étapes | Comment être sûr que c'est réglé |
| `prevention` | Liste de phrases | |
| `comprendre` | 3 à 5 lignes, optionnel | Le mécanisme, utile pour progresser |
| `fiches_liees` | Ids de fiches | Une alerte signale celles qui restent à rédiger |
| `tags` | Mots-clés pour la recherche | Synonymes, codes, termes anglais. Mettre les nombres entre guillemets : `"4740"` |
| `sources` | `titre`, `url`, `type` (`officiel` / `forum` / `blog`), `langue`, `consulte_le` | Sources officielles en premier |
| `derniere_verification` | `AAAA-MM-JJ` | Date du dernier contrôle complet de la fiche |

## 2 bis. Fiche complète ou fiche express ?

Deux formats existent, choisis avec le champ `format` (par défaut `complete`) :

| | **Fiche complète** (`format: complete`) | **Fiche express** (`format: express`) |
|---|---|---|
| Pour | Problèmes fréquents ou critiques, avec plusieurs causes possibles | Problème ciblé ou rare, souvent lié à un **message ou un code d'erreur précis** |
| Diagnostic | Obligatoire (au moins une étape) | Facultatif |
| Résolutions | Autant que de causes | 1 à 3 au maximum |
| Vérification, prévention | Obligatoires | Facultatives (la vérification reste conseillée) |
| Messages d'erreur | Si possible | Fortement conseillé : c'est par lui que le technicien trouvera la fiche |

Exemple de fiche express : `content/fiches/microsoft-365/exchange-ndr-550-5-7-520-transfert-externe-bloque.yaml`.
Une fiche express qui devient fréquente peut être enrichie en fiche complète (même `id`, on passe `format` à `complete`).

## 3. Les étapes

Les étapes du diagnostic, des résolutions et de la vérification ont toutes le même format :

```yaml
- id: d1                      # unique dans la fiche : d1, d2… / r1-e1… / v1…
  titre: Vérifier que le compte est verrouillé
  niveau: N1
  versions: [win11]           # optionnel : étape réservée à certaines versions
  graphique: |                # la méthode par l'interface, toujours en premier
    1. Ouvrir **Utilisateurs et ordinateurs Active Directory** (*Active Directory Users and Computers*).
    2. …
  commande:                   # optionnel
    langage: powershell       # powershell, cmd, bash, zsh, cisco-ios, fortios, registre, texte
    admin: false              # console élevée / sudo / enable
    ou: Sur le contrôleur de domaine     # optionnel
    code: Get-ADUser -Identity <NomUtilisateur> -Properties LockedOut
  avertissement:              # optionnel
    type: destructif          # destructif (irréversible) ou attention (coupure, baisse de sécurité)
    texte: Ce que l'action détruit, ce qu'il faut sauvegarder avant.
  astuce: Une précision utile.  # optionnel
  conclusions:
    - { si: "Le compte est verrouillé", aller_a: d2 }
    - { si: "Plusieurs comptes verrouillés", cause: c4, aller_a: "fiche:securite-attaque-force-brute" }
```

**Interface graphique d'abord.** Si l'étape a un `graphique`, la `commande` s'affiche en « Alternative en ligne de commande » (repliée). Si elle n'a **pas** de `graphique`, la commande est affichée directement.

**Selon la version.** Quand les menus diffèrent, `graphique` devient une liste de variantes, une par version :

```yaml
graphique:
  - versions: [win11]
    texte: Paramètres › Bluetooth et appareils › Imprimantes et scanners
  - versions: [win10]
    texte: Paramètres › Périphériques › Imprimantes et scanners
```

Chaque version de la fiche (ou de l'étape) doit avoir sa variante : la validation le vérifie.

**Conclusions.** `aller_a` pointe vers une étape ou une résolution de la fiche (`d2`, `r1`) ou vers une autre fiche (`fiche:<id>`). `cause` indique la cause confirmée par ce constat.

## 4. Mise en forme du texte (Markdown)

- `**gras**` pour les noms de menus et de boutons, `*italique*` pour leur nom anglais : **Compte** (*Account*).
- `` `code` `` pour une commande courte, un nom de fichier ou une valeur.
- Listes numérotées `1.` pour les manipulations dans l'ordre, listes `-` sinon.
- Séparateur de menus : `›`.
- Information incertaine, datée ou issue d'une seule source :

  ```markdown
  > [!a-verifier]
  > Ce que l'on ne peut pas affirmer avec certitude.
  ```

## 5. Pièges du format YAML

- Une valeur qui contient « **: ** » (deux-points suivi d'une espace) doit être **entre guillemets** : `titre: "Solution rapide : réinstaller"`. Le français en met souvent : en cas de doute, mettre des guillemets.
- Dans `{ … }` et `[ … ]`, une valeur qui contient une **virgule** doit être entre guillemets.
- Les nombres et codes (`4740`, `0x0000011b`) doivent être **entre guillemets**, sinon ils sont lus comme des nombres.
- Dans une chaîne entre guillemets doubles, doubler les barres obliques inverses : `"C:\\Pilotes"`. Dans un bloc `|`, les écrire normalement.

## 6. Avant de valider une fiche

1. `npm run validate` : aucune **ERREUR** (les **ALERTES** listent ce qui reste à rédiger ailleurs).
2. Chaque commande a été vérifiée (syntaxe, paramètres, effets).
3. Chaque action destructive a son `avertissement`.
4. Aucune donnée réelle d'entreprise : uniquement `contoso.local`, `SRV-…`, `192.168.10.0/24`.
5. Au moins une source officielle quand elle existe, toutes les sources consultées à la date indiquée.
