# Architecture — SOS Admin

> Phase 1 — 29/10/2026 — **Validée**

## 1. L'idée en une phrase

On écrit les fiches **une seule fois** (fichiers YAML dans `content/`). Un script les **vérifie** puis les **assemble** en un fichier JSON. Le site web et l'app iOS lisent **ce même fichier**.

```
          ┌──────────────────────┐
          │  content/  (YAML)    │   ← on n'écrit QUE ici
          │  fiches, taxonomie,  │
          │  outils, synonymes   │
          └──────────┬───────────┘
                     │  npm run build:index
                     ▼
          ┌──────────────────────┐
          │ scripts/build-index  │   1. lit tous les YAML
          │  + schema/ (Zod)     │   2. valide chaque fiche (champ manquant → erreur)
          │                      │   3. vérifie les liens (cause, outil, fiche liée…)
          └──────────┬───────────┘   4. calcule renvois, compteurs, « à revérifier »
                     ▼
     ┌───────────────┴────────────────┐
     ▼                                ▼
generated/index.json           generated/search.json
(tout le contenu)              (version allégée pour la recherche)
     │            │                   │
     │            ▼                   ▼
     │     site/ (Astro)  ──►  pages HTML statiques + recherche MiniSearch
     │            │                   │
     │            ▼                   ▼
     │     Cloudflare Pages (à chaque push sur main)  →  sos-admin.pages.dev  (+ PWA hors ligne)
     ▼
scripts/sync-ios.sh  →  ios/SOSAdmin/Resources/index.json  →  app SwiftUI (100 % hors ligne)
```

## 2. Arborescence complète

```
SolutionTech/
├── CLAUDE.md                     Contexte pour les sessions Claude
├── README.md                     Présentation publique du projet
├── LICENSE                       MIT (code)
├── package.json                  Scripts npm de tout le projet (workspace « site »)
├── tsconfig.json
│
├── content/                      ★ SOURCE UNIQUE DU CONTENU
│   ├── LICENSE                   CC BY-SA 4.0 (contenu)
│   ├── taxonomie.yaml            Domaines, sous-domaines, thèmes (+ icône, sous-titre)
│   ├── environnements.yaml       Versions : win10, win11, ws2019, ws2022, ws2025, macos-26, ios-xe-17…
│   ├── synonymes.yaml            « rame, lent, freeze » ; « imprimante, imprimente »…
│   ├── fiches/
│   │   ├── active-directory/
│   │   │   ├── ad-compte-verrouille.yaml
│   │   │   └── …
│   │   ├── materiel-peripheriques/
│   │   ├── windows/
│   │   └── …                     Un dossier par domaine (emplacement principal)
│   └── outils/
│       ├── process-explorer.yaml
│       └── …
│
├── schema/
│   ├── fiche.ts                  Schéma Zod d'une fiche (règles de validation)
│   ├── outil.ts
│   ├── taxonomie.ts
│   └── index.ts                  Types partagés par le build et le site
│
├── scripts/
│   ├── build-index.ts            content/ → generated/index.json + search.json
│   ├── check-links.ts            Vérifie les liens internes (ids, ancres)
│   ├── a-reverifier.ts           Génère docs/a-reverifier.md (fiches > 12 / 6 mois)
│   └── sync-ios.sh               Copie l'index dans le projet Xcode
│
├── generated/                    Sorties du build (ignoré par Git)
│   ├── index.json
│   └── search.json
│
├── site/                         Projet Astro
│   ├── astro.config.mjs
│   ├── package.json
│   ├── public/                   favicon, logo, manifest PWA, robots.txt
│   └── src/
│       ├── layouts/              Gabarit de page (en-tête, navigation)
│       ├── components/           FicheEntete, Etape, BlocCommande, MesValeurs,
│       │                         SelecteurVersion, Assistant, ResumeTicket, Avertissement…
│       ├── lib/                  recherche.ts (MiniSearch), variables.ts (mémoire seule),
│       │                         favoris.ts / recents.ts (localStorage), versions.ts
│       ├── styles/               Jetons de couleurs/typo (style assistance Apple, thème clair)
│       └── pages/                Routes (voir § 3)
│
├── ios/                          (Phase 5)
│   └── SOSAdmin/
│       ├── SOSAdmin.xcodeproj
│       ├── Resources/index.json  ← copié par sync-ios.sh (versionné pour compiler sans Node)
│       ├── Models/               Structures Codable = miroir de l'index JSON
│       ├── Views/                Accueil, Domaine, Fiche, Recherche, Favoris, Réglages
│       └── Services/             Chargement de l'index, recherche, favoris
│
├── docs/
│   ├── cahier-des-charges.md
│   ├── architecture.md           (ce fichier)
│   ├── avancement.md             Catégories traitées / restantes, nombre de fiches
│   └── a-reverifier.md           (généré)
│
└── .github/
    ├── workflows/validate.yml    À chaque push : npm run validate + build
    └── ISSUE_TEMPLATE/
        └── signaler-erreur.yml   Formulaire « Signaler une erreur » (id de fiche pré-rempli)
```

**Pourquoi un dossier par domaine, et pas des sous-dossiers par sous-domaine ?** Un seul niveau de dossier reste facile à parcourir sur GitHub. Si on déplace une fiche de sous-domaine, il suffit de changer une ligne du YAML, sans déplacer le fichier. Le sous-domaine est écrit **dans** la fiche.

## 3. Pages du site (routes)

| Adresse | Contenu |
|---|---|
| `/` | Accueil : recherche, favoris, récents, grille des domaines |
| `/recherche/?q=…` | Résultats + filtres |
| `/<domaine>/` | Sous-domaines et fiches du domaine (y compris les renvois) |
| `/<domaine>/<sous-domaine>/` | Thèmes et fiches |
| `/fiches/<id>/` | **La fiche**. L'adresse est stable même si la fiche change de section, ce qui est important pour Google et pour les liens partagés |
| `/outils/` et `/outils/<id>/` | Boîte à outils |
| `/favoris/` | Favoris (lus depuis le stockage local) |
| `/recherche-assistee/` | Liens de recherche vers les sources externes |
| `/a-propos/`, `/mentions-legales/` | Avertissement, licences, mentions légales |

Chaque fiche est une **page HTML générée à l'avance** : elle s'affiche instantanément et Google peut la lire. Le JavaScript n'est chargé que pour les parties interactives (« îlots » Astro) : recherche, Mes valeurs, sélecteur de version, assistant, copie, résumé ticket.

## 4. Les deux fichiers JSON générés

**`index.json`** (complet, pour le site au build et pour l'app iOS) :

```json
{
  "schema_version": 1,
  "genere_le": "2026-10-29T10:00:00Z",
  "nb_fiches": 3,
  "taxonomie": [ { "id": "active-directory", "titre": "…", "sous_domaines": [ … ] } ],
  "environnements": [ { "id": "win11", "libelle": "Windows 11", "famille": "windows" } ],
  "synonymes": [ ["lent", "rame", "freeze"] ],
  "fiches": [ { "id": "ad-compte-verrouille", "…": "…" } ],
  "outils": [ { "id": "process-explorer", "utilise_par": ["poste-lent-demarrage"] } ]
}
```

**`search.json`** (léger, chargé par la recherche du site) : pour chaque fiche, seulement `id`, titre, résumé, symptômes, codes d'erreur, tags, domaine, niveau, environnements, droits. Il reste petit même avec des centaines de fiches.

`schema_version` permet à l'app iOS de détecter un index d'un format qu'elle ne connaît pas encore, et donc d'éviter un plantage.

## 5. Choix techniques expliqués

| Choix | Explication simple |
|---|---|
| **YAML** | Ressemble à une liste à puces, se lit et s'écrit facilement, mais reste structuré comme du JSON. On peut y écrire du Markdown |
| **Zod** (dans `schema/`) | Une bibliothèque qui décrit « à quoi doit ressembler une fiche ». Si un champ manque ou est mal écrit, le build s'arrête avec un message clair (« fiche X : champ `niveau` manquant ») |
| **TypeScript** | Du JavaScript avec des types : l'éditeur signale les erreurs avant l'exécution |
| **Astro** | Génère des pages HTML à l'avance (rapide, bien référencé) et n'ajoute du JavaScript que là où c'est utile |
| **MiniSearch** | Moteur de recherche qui tourne dans le navigateur : pas de serveur, fonctionne hors ligne, tolère les fautes de frappe |
| **npm workspaces** | Un seul `npm install` à la racine installe tout, y compris le site |
| **Cloudflare Pages** | Surveille le dépôt GitHub : à chaque push sur `main`, il lance `npm run build` et publie `site/dist` |
| **GitHub Action** | Robot qui revalide les fiches à chaque push, y compris sur les branches de travail, avant la fusion |
| **PWA** (fin de Phase 4) | Un *service worker* garde une copie du site dans le téléphone pour le hors ligne, avec un `manifest` pour l'installation sur l'écran d'accueil |
| **SwiftUI sans dépendance** | `JSONDecoder` lit `index.json` et le transforme en objets Swift. Favoris dans `UserDefaults`. Rien n'est envoyé |

## 6. Configuration Cloudflare Pages (prévue)

| Paramètre | Valeur |
|---|---|
| Branche de production | `main` |
| Commande de build | `npm run build` |
| Dossier de sortie | `site/dist` |
| Version de Node | 22 (variable `NODE_VERSION=22` ou fichier `.nvmrc`) |
| Aperçus | Chaque branche obtient une URL d'aperçu (pratique pour valider avant fusion) |

## 7. Ce qui sera fait à chaque phase

| Phase | Livrables |
|---|---|
| 1 (celle-ci) | `CLAUDE.md`, ce document, validation de l'arborescence |
| 2 | `taxonomie.yaml` complet, `environnements.yaml`, schéma Zod final, 3 fiches exemples, script de build minimal |
| 3 | Fiches par catégorie, `docs/avancement.md` |
| 4 | Site Astro, workflow GitHub, Cloudflare Pages, PWA |
| 5 | Projet Xcode, `sync-ios.sh`, installation sur l'iPhone |
