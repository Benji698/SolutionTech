# CLAUDE.md — SOS Admin

Contexte à relire au début de chaque session.

## Le projet

**SOS Admin** (dépôt GitHub : `SolutionTech`) : base de connaissances gratuite et publique de dépannage pour techniciens IT (support, systèmes, réseaux). Chaque fiche décrit un problème de terrain : symptômes → causes → diagnostic → résolution → vérification → prévention.

- Porteur : Benji, BTS SIO SISR (1re année, alternance). **Expliquer simplement les choix techniques.**
- Spécifications complètes et validées : `docs/cahier-des-charges.md`. **Il fait foi** en cas de doute.
- Architecture détaillée : `docs/architecture.md`. Avancement du contenu : `docs/avancement.md`.
- Ordre de livraison : **site web d'abord** (Cloudflare Pages + PWA), app iOS SwiftUI ensuite, Android via la PWA.
- Méthode : on travaille phase par phase et on **attend la validation de Benji** à la fin de chaque phase.

## Objectif de contenu : couverture maximale

Benji veut que SOS Admin devienne **l'outil de référence ultime** : recenser **le plus de problèmes reconnus à ce jour** dans chaque section, fréquents comme rares. Méthode : inventaire d'abord (`docs/inventaire/<domaine>/<sous-domaine>.yaml`, format dans `docs/inventaire/README.md`), puis rédaction par lots, en **fiches complètes** (fréquent/critique) ou **fiches express** (`format: express`, problème ciblé ou code d'erreur). Des agents en parallèle sont autorisés pour ce travail ; tout passe `npm run validate` et reste `a-relire`.

## Principe central : une seule source de vérité

```
content/*.yaml ──► scripts/build-index.ts ──► generated/index.json ─┬─► site/ (Astro, pages statiques)
     (fiches)         (valide + assemble)        generated/search.json ─┘   site/ (recherche MiniSearch)
                                                  generated/index.json ───► ios/ (embarqué via scripts/sync-ios.sh)
```

On ne recopie **jamais** de contenu à la main dans `site/` ou `ios/`. On modifie `content/`, puis on régénère l'index.

## Arborescence

```
content/                  Contenu (source unique)
  taxonomie.yaml          Domaines → sous-domaines → thèmes (3 niveaux max)
  environnements.yaml     Versions sélectionnables (win10, win11, ws2022, ios-xe-17…)
  synonymes.yaml          Synonymes de terrain pour la recherche (« rame » = « lent »)
  fiches/<domaine>/<id>.yaml   Une fiche problème par fichier
  outils/<id>.yaml        Fiches « Boîte à outils »
schema/                   Schéma de validation (Zod, TypeScript), partagé build + site
scripts/                  build-index.ts, check-links.ts, a-reverifier.ts, sync-ios.sh
generated/                Sorties du build (non versionnées, sauf copie iOS)
site/                     Projet Astro (src/pages, src/components, src/lib, public/)
ios/SOSAdmin/             Projet Xcode SwiftUI (Phase 5)
docs/                     Cahier des charges, architecture, avancement, a-reverifier
.github/                  Workflow de validation, modèles d'issues
```

## Conventions

- **Langue :** français partout (contenu, interface, commits). Noms d'interface Microsoft en **FR + EN**. Commandes, codes et messages d'erreur laissés tels quels.
- **Ton des fiches :** impersonnel, à l'infinitif (« Ouvrir… », « Vérifier… »).
- **Interface graphique d'abord.** La ligne de commande n'est mise en avant que s'il n'existe pas d'équivalent graphique. Sinon, elle va dans `commande` avec `mise_en_avant: false` (bloc repliable).
- **Exemples génériques uniquement :** `contoso.local`, `SRV-DC01`, `192.168.10.0/24`. Jamais de données réelles d'entreprise.
- **Rédiger dans nos propres mots**, recouper plusieurs sources, sources officielles d'abord. Les citer dans `sources`.
- **Vérifier chaque commande** (syntaxe PowerShell / CMD / Bash / Cisco IOS). Toute action destructive porte un `avertissement` de type `destructif`.
- **Info incertaine ou datée :** encadré Markdown `> [!a-verifier]` à l'endroit concerné. On ne l'affirme jamais.
- **Identifiants :** `kebab-case`, sans accents, stables (ils servent aux URL `/fiches/<id>/`). Le nom de fichier = `id`.
- **Confidentialité (non négociable) :** pas de cookies de suivi, pas de statistiques, pas de compte. Les « Mes valeurs » (variables) restent en mémoire vive, jamais dans le localStorage ni envoyées sur le réseau. Seuls favoris, récents et préférences d'affichage sont stockés localement.
- **Commits :** en français, avec un préfixe : `contenu(<domaine>): …`, `site: …`, `ios: …`, `build: …`, `docs: …`. Développement sur la branche de travail, fusion dans `main` après validation, ce qui déclenche le déploiement.
- **Licences :** code MIT (`LICENSE`), contenu CC BY-SA 4.0 (`content/LICENSE`).

## Schéma d'une fiche

- **Référence technique (fait foi) :** `schema/fiche.ts` (Zod). Référentiels : `schema/referentiels.ts`.
- **Guide de rédaction (pour humains) :** `docs/guide-redaction.md`, avec les pièges YAML.
- **Exemples complets :** `content/fiches/active-directory/ad-compte-verrouille.yaml`, `content/fiches/materiel-peripheriques/imprimante-reseau-session.yaml`, `content/fiches/windows/poste-lent-demarrage.yaml`.

En bref :
- En-tête : `id, titre, resume, statut, domaine, sous_domaine, theme?, apparait_aussi_dans, niveau, temps_estime{min,max}, critique, environnements, droits, outils, acces, symptomes, messages_erreur, variables, premiers_reflexes`.
- `causes[]` (id c1…, classées par fréquence) → `diagnostic[]` (étapes) → `resolutions[]` (`id`, `causes[]`, `titre`, `etapes[]`) → `verification[]` (étapes) → `prevention[]`, `comprendre?`, `fiches_liees`, `tags`, `sources[]`, `derniere_verification`.
- **Étape** : `id, titre, niveau, versions?, graphique? (texte ou variantes {versions, texte}), commande? {langage, code, admin, ou?}, avertissement? {type: destructif|attention, texte}, astuce?, conclusions? [{si, cause?, aller_a? (id local ou "fiche:<id>")}]`.
- Pas de champ « mise en avant » : la commande est mise en avant **seulement si l'étape n'a pas de `graphique`**.
- Contrôles croisés dans `scripts/build-index.ts` : liens internes, variables déclarées/utilisées, versions, une résolution par cause, emplacement du fichier. ERREUR = build bloqué ; ALERTE = à traiter plus tard.
- Pièges YAML fréquents en français : guillemets si la valeur contient « : » ; guillemets autour des codes et nombres (`"4740"`, `"0x0000011b"`).

## Règles d'interface issues des tests de la maquette (à appliquer au site, Phase 4)

- **En-tête fixe** : toute navigation (fil d'Ariane, liens « Étape n » / « Résolution n », sommaire, retour à l'accueil, résultat de recherche) doit amener le haut de la cible **juste sous l'en-tête**, jamais dessous. Utiliser `scroll-margin-top` égal à la hauteur de l'en-tête (ou un décalage calculé), et le tester sur PC et à la largeur d'un téléphone.
- **Blocs de commande** : une longue commande défile **dans son bloc** (`overflow-x: auto`), elle ne doit jamais élargir l'étape ni la page. Dans les grilles CSS, donner `min-width: 0` / `minmax(0, 1fr)` aux colonnes qui contiennent du code.
- **Mobile** : onglets et menus passent à la ligne au lieu d'être coupés ; aucun défilement horizontal de la page.
- **Favoris** : écran dédié ouvert par le bouton « ★ Favoris » de l'en-tête (liste des seules fiches favorites, retrait par l'étoile, état vide expliqué). Pas de favoris sur l'accueil.
- **Retour arrière** (demande de Benji) : glisser le doigt de gauche à droite sur téléphone, deux doigts vers la droite sur le trackpad du Mac, ⌥/Alt + ← au clavier, et un bouton « ‹ Retour » visible. Sur le site, chaque écran a sa **vraie adresse** : le geste natif du navigateur (historique) fonctionne alors sans code spécial, il ne faut pas le bloquer. Dans l'app iOS, `NavigationStack` fournit le glissement depuis le bord gauche. **L'accueil est la racine** : y revenir (logo, fil d'Ariane) vide l'historique de l'app, et aucun retour n'est possible depuis l'accueil.

## Reprise de la rédaction (méthode économe en tokens)

Benji a demandé de limiter la consommation : les agents en parallèle épuisaient sa limite d'utilisation très vite.

1. Lire `docs/avancement.md` (où on en est) ; ne pas relire tout le dépôt.
2. `bash scripts/docs-microsoft.sh` : télécharge la doc officielle de dépannage Microsoft dans `.cache/msdocs/` (non versionné).
3. `node scripts/marquer-redigees.cjs` : met à jour `etat: redigee` dans les inventaires et affiche le bilan.
4. `FORMAT=express node scripts/faire-lots.cjs microsoft-365 frequent,critique 10 <sous-domaine>` : crée des lots dans `.cache/lots/` (`FORMAT=complete` pour les fiches complètes, à faire en lots plus petits, 5 par exemple).
5. Lancer **2 ou 3 agents au maximum à la fois**, chacun avec : « Lis et applique `docs/inventaire/brief-redaction.md`. Ton lot : `.cache/lots/<lot>.txt`. » Le brief suffit : l'agent ne relit ni CLAUDE.md, ni le guide, ni le schéma.
   - Lots de fiches **express** : modèle **Sonnet** (paramètre `model: "sonnet"`), moins cher.
   - Lots avec des fiches **complètes** ou **critiques** : modèle par défaut.
6. À la fin de chaque agent : `npm run validate`, corriger les erreurs simples (`python3 scripts/guillemets-yaml.py <fichiers>`), relancer l'étape 3, commit `contenu(microsoft-365): …` et push.
7. Ne jamais relancer automatiquement des agents interrompus par la limite d'utilisation : attendre la demande de Benji.

## Commandes

```bash
npm install            # dépendances
npm run validate       # valide toutes les fiches (schéma + liens internes)  ✅ disponible
npm run build:index    # génère generated/index.json et generated/search.json  ✅ disponible
npm run typecheck      # vérifie le TypeScript  ✅ disponible
npm run dev            # site en local (http://localhost:4321)  — Phase 4
npm run build          # index + site complet → site/dist (ce que fait Cloudflare)  — Phase 4
npm run sync:ios       # copie l'index dans ios/SOSAdmin/Resources/  — Phase 5
```

## État actuel

- ✅ Phase 0 : cahier des charges validé.
- ✅ Phase 1 : architecture validée.
- ✅ Phase 2 : taxonomie (19 domaines), schéma final, script de build et 3 fiches exemples validés.
- 🔄 Phase 3 (contenu, suivi dans `docs/avancement.md`) : Active Directory validé (13 fiches). Microsoft 365 : inventaire de 2 250 problèmes fait (Copilot incomplet), 24 fiches rédigées, rédaction en cours.
- Phases suivantes : 4 site → 5 iOS.
- Réseau de la session cloud : `learn.microsoft.com` et `support.microsoft.com` peuvent être bloqués en lecture directe (WebFetch) ; la recherche web fonctionne. Indiquer « à vérifier » quand une page officielle n'a pas pu être relue.
