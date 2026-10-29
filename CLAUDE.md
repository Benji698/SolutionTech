# CLAUDE.md — SOS Admin

Contexte à relire au début de chaque session.

## Le projet

**SOS Admin** (dépôt GitHub : `SolutionTech`) : base de connaissances gratuite et publique de dépannage pour techniciens IT (support, systèmes, réseaux). Chaque fiche décrit un problème de terrain : symptômes → causes → diagnostic → résolution → vérification → prévention.

- Porteur : Benji, BTS SIO SISR (1re année, alternance). **Expliquer simplement les choix techniques.**
- Spécifications complètes et validées : `docs/cahier-des-charges.md`. **Il fait foi** en cas de doute.
- Architecture détaillée : `docs/architecture.md`. Avancement du contenu : `docs/avancement.md`.
- Ordre de livraison : **site web d'abord** (Cloudflare Pages + PWA), app iOS SwiftUI ensuite, Android via la PWA.
- Méthode : on travaille phase par phase et on **attend la validation de Benji** à la fin de chaque phase.

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

## Schéma d'une fiche (PROVISOIRE, finalisé en Phase 2)

```yaml
id: ad-compte-verrouille
titre: Utilisateur verrouillé dans l'Active Directory
resume: Le compte AD est bloqué après trop d'échecs de mot de passe ; trouver la source puis déverrouiller.
statut: a-relire                 # brouillon | a-relire | verifiee
domaine: active-directory        # id issu de taxonomie.yaml (emplacement principal)
sous_domaine: comptes-utilisateurs
theme: verrouillage              # optionnel
apparait_aussi_dans: [microsoft-365/entra-id]   # renvois (pas de copie)
niveau: N1                       # N1 | N2 | N3
temps_estime: { min: 5, max: 20 }  # minutes
critique: false
environnements: [ws2019, ws2022, ws2025]        # ids issus de environnements.yaml
droits: admin-domaine            # aucun | admin-local | admin-domaine | admin-m365 | …
outils: [rsat-ad]                # ids de content/outils/
acces: [Poste avec RSAT ou session sur un contrôleur de domaine]
symptomes:
  - « Il me dit que mon compte est verrouillé »
messages_erreur:
  - { texte: "Le compte référencé est actuellement verrouillé…", code: "0xC0000234" }
variables:                       # alimentent le formulaire « Mes valeurs » (en mémoire seulement)
  - { nom: NomUtilisateur, libelle: Identifiant (sAMAccountName), exemple: jdupont }
premiers_reflexes: []            # si critique: true
causes:
  - { id: c1, titre: Mot de passe mal saisi à répétition, frequence: tres-frequente }
  - { id: c2, titre: Ancien mot de passe enregistré sur un appareil (smartphone, lecteur réseau), frequence: frequente }
diagnostic:
  - id: d1
    titre: Vérifier si le compte est verrouillé
    niveau: N1
    versions: []                 # vide = toutes les versions de la fiche
    graphique: |                 # Markdown ; peut aussi être une liste de variantes { versions, texte }
      *Utilisateurs et ordinateurs Active Directory* (*Active Directory Users and Computers*) > …
    commande:
      langage: powershell        # powershell | cmd | bash | cisco-ios | …
      admin: false
      mise_en_avant: false       # true seulement si pas d'équivalent graphique
      code: Get-ADUser -Identity <NomUtilisateur> -Properties LockedOut
    avertissement: null          # { type: destructif | attention, texte: … }
    conclusions:
      - { si: Le compte est verrouillé, cause: c1, aller_a: d2 }
      - { sinon: true, aller_a: d3 }
resolutions:
  - { id: r1, cause: c1, titre: …, etapes: [ …même format que diagnostic… ] }
verification: [ …étapes… ]
prevention: [ … ]
comprendre: …                    # optionnel, 3 à 5 lignes
fiches_liees: [ … ]
tags: [verrouillage, lockout, 4740]
sources:
  - { titre: …, url: https://learn.microsoft.com/…, type: officiel, consulte_le: 2026-10-29 }   # officiel | forum | blog
derniere_verification: 2026-10-29
```

Fiche outil (`content/outils/<id>.yaml`) : `id, nom, description, editeur, url_officielle, licence, plateformes, usages, pieges, derniere_verification`. La liste des fiches qui l'utilisent est calculée au build.

## Commandes (une fois le projet initialisé)

```bash
npm install            # dépendances
npm run validate       # valide toutes les fiches (schéma + liens internes)
npm run build:index    # génère generated/index.json et generated/search.json
npm run dev            # site en local (http://localhost:4321)
npm run build          # index + site complet → site/dist (ce que fait Cloudflare)
npm run sync:ios       # copie l'index dans ios/SOSAdmin/Resources/
```

## État actuel

- ✅ Phase 0 : cahier des charges validé.
- 🔄 Phase 1 : architecture proposée, en attente de validation.
- Phases suivantes : 2 taxonomie et schéma + 3 fiches exemples → 3 contenu par catégorie → 4 site → 5 iOS.
