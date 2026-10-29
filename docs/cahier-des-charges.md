# Cahier des charges — SOS Admin

> Version 1.2 — 29/10/2026 — **Validé par Benji** (1.2 : favoris sur un écran dédié)
> Auteur : Benji (BTS SIO SISR, alternance) · Dépôt GitHub : `SolutionTech`

---

## 1. Présentation

**SOS Admin** — *Le guide de dépannage des techniciens IT.*

Base de connaissances gratuite et publique qui répertorie les problèmes rencontrés sur le terrain par les techniciens support et administrateurs systèmes et réseaux, avec pour chacun : symptômes, causes, diagnostic, résolution, vérification et prévention.

**Vision :** devenir une référence pour les techniciens, et aussi être utile aux particuliers qui cherchent à résoudre un problème chez eux. Un assistant de terrain utilisable partout : sur le PC de la personne dépannée, sur son propre téléphone, en salle serveur.

**Livraison, dans l'ordre :**
1. **Site web public** (GitHub → Cloudflare Pages), accessible depuis tous les appareils, installable et utilisable hors ligne (PWA). **C'est la priorité.**
2. **App iOS SwiftUI**, développée après validation du site en conditions réelles.
3. **Android** : couvert par la PWA, puis éventuellement par une app native.

Une seule source de contenu alimente toutes les versions, sans duplication manuelle.

---

## 2. Public et principes de rédaction

| Sujet | Décision |
|---|---|
| Lecteur principal | Technicien N1/N2 (Benji en premier), puis tout technicien, quel que soit son niveau |
| Particuliers | Ce n'est pas la cible, mais le texte reste lisible par eux (les étapes N1 en interface graphique leur sont accessibles) |
| Niveau des fiches | Opérationnel avant tout. Encadré « Comprendre » optionnel (3 à 5 lignes) quand un mécanisme explique le problème |
| Niveaux | Badge global N1/N2/N3 par fiche, et étapes progressives marquées N1/N2/N3. **Pas** de section « Quand escalader » |
| Langue | Français. Noms d'interface en **français et en anglais**. Commandes, messages d'erreur et codes laissés tels quels |
| Ton | Impersonnel, à l'infinitif (« Ouvrir… », « Vérifier… ») |
| Environnement de référence | PME/ETI : Windows 10/11, Windows Server 2019/2022/2025, AD on-premise + Entra Connect, Microsoft 365, Cisco IOS/IOS-XE. macOS, Linux et autres constructeurs traités en second |
| Prérequis | Chaque fiche indique les droits, les outils et les accès nécessaires |
| Interface graphique d'abord | **On privilégie toujours la méthode graphique.** La ligne de commande n'est mise en avant que s'il n'existe pas d'équivalent graphique. Sinon, elle est proposée dans un bloc repliable « Alternative en ligne de commande » |
| Données d'exemple | Aucune donnée réelle d'entreprise. Exemples génériques : `contoso.local`, `SRV-DC01`, `192.168.10.0/24` |

---

## 3. Périmètre

### 3.1 Domaines (affichés par ordre alphabétique)

La taxonomie détaillée (sous-domaines et thèmes) sera établie en Phase 2. Chaque domaine affiche un sous-titre qui précise son périmètre. On n'utilise pas le terme « postes de travail » comme nom de section : il est trop vague. « Windows » et « Linux » désignent les PC, par opposition à « Windows Server » et « Serveurs Linux ».

- Active Directory, GPO, DNS, DHCP
- Gestion des comptes : arrivées / départs (AD + M365)
- Linux — Ubuntu, Debian… sur PC
- Logiciels métier et applicatifs
- macOS — Mac
- Matériel et périphériques (imprimantes et scanners, écrans, docks, composants…)
- Messagerie (clients, protocoles, SPF/DKIM/DMARC)
- Microsoft 365 / Entra ID / Exchange Online / Teams / OneDrive / SharePoint
- Mobiles et MDM
- Réseau (connectivité de base, switching, routage, VLAN, Cisco IOS, Wi-Fi, VPN, pare-feu)
- Sauvegarde et restauration
- Sécurité et incidents (malware, phishing, comptes compromis)
- Serveurs Linux — bases : SSH, systemd, disques, logs, réseau
- Stockage et NAS (partages SMB, droits NTFS, quotas, Synology/QNAP)
- Support utilisateur et procédures
- Téléphonie / VoIP
- Virtualisation
- Windows — Windows 10 / 11 sur PC fixes et portables
- Windows Server — 2019 / 2022 / 2025 et ses rôles
- **Boîte à outils** : section à part, une fiche par logiciel du technicien

### 3.2 Constructeurs réseau

Cisco en priorité, avec les commandes exactes. Pare-feu : Fortinet, Stormshield, pfSense/OPNsense. Wi-Fi traité de façon générique, avec des exemples UniFi et Meraki. Autres constructeurs : à la demande, ou via la recherche assistée.

### 3.3 Couverture et sources

- **Pas de quota de fiches.** Répertorier autant de problèmes que possible, avec les réponses les plus pertinentes pour chacun.
- **Ordre de priorité des sources :**
  1. documentation officielle de l'éditeur (Microsoft Learn, Cisco, Apple…) ;
  2. à défaut, solutions de techniciens publiées sur des forums et blogs reconnus (r/sysadmin, Spiceworks, Microsoft Q&A, Super User…), **recoupées entre plusieurs sources**.
- Fiches rédigées dans nos propres mots, sans copier-coller, avec les sources citées.
- Mention **« Critique »** optionnelle pour les problèmes graves. Elle s'accompagne d'un bloc « Premiers réflexes ».

---

## 4. Organisation et navigation

- Hiérarchie **Domaine → Sous-domaine → Thème (optionnel) → Fiche** : 3 niveaux de profondeur au maximum, et autant de sous-sections que nécessaire en largeur.
- Chaque domaine doit regrouper **l'essentiel de ce qui le concerne**. Par exemple, *Windows* contient Démarrage et performances, Mises à jour, Comptes et sessions, Profils, Réseau, Impression, Stockage, BSOD, Applications, Sécurité/Defender, Activation…
- **Emplacement principal + renvois.** Une fiche n'existe qu'une fois, à l'endroit où se trouve le plus souvent la cause (ex. *Matériel et périphériques → Imprimantes*). Elle apparaît aussi, par renvoi, dans les autres sections concernées (ex. *Windows → Impression*, *Active Directory → GPO*). Une correction est donc visible partout.

---

## 5. Structure d'une fiche

### 5.1 Blocs, dans l'ordre d'affichage

1. **En-tête** : titre, résumé en une phrase, badges (niveau, temps estimé, environnements, « Critique »), sélecteur de version
2. **Symptômes** : mots de l'utilisateur et messages d'erreur exacts
3. **Prérequis** : droits, outils, accès
4. **Mes valeurs** : formulaire de données temporaires (si la fiche contient des variables)
5. **Causes probables** : de la plus fréquente à la plus rare
6. **Diagnostic pas à pas** : chaque étape se termine par une conclusion (« Si… → Cause 1 → Résolution 1 », « Sinon → étape suivante »)
7. **Résolution** : une par cause
8. **Vérification** que le problème est résolu
9. **Prévention**
10. **Comprendre** (optionnel)
11. **Outils liés** et **fiches liées**
12. **Sources** (titre, URL, type Officiel / Forum / Blog, date de consultation ; les sources officielles en premier) et **date de dernière vérification**

### 5.2 Règles de contenu

- **Versions :** chaque étape est rattachée aux versions auxquelles elle s'applique. En choisissant une version (Windows 10, Windows 11, Server 2022…), on n'affiche que les étapes et chemins de menus correspondants.
- **Chemins de menus précis** pour la méthode graphique (ex. *Paramètres > Système > Stockage*). **Pas de captures d'écran en v1.**
- **Avertissements :**
  - 🔴 **« Action destructive »** : ce que fait l'action, ce qui est irréversible, ce qu'il faut sauvegarder avant, comment revenir en arrière ;
  - 🟠 **« Attention »** : l'action coupe un service (redémarrage, `shutdown` d'interface…).
- **« À vérifier »** : encadré placé là où une information est incertaine, datée ou ne vient que d'un forum.
- Toute commande est vérifiée (syntaxe PowerShell, CMD, Bash, Cisco IOS) avant d'être publiée.

### 5.3 Fiches « Boîte à outils » (format court)

- à quoi sert l'outil ;
- éditeur et lien officiel ;
- licence ;
- plateformes ;
- cas d'usage et manipulations clés ;
- pièges et précautions de sécurité ;
- fiches problèmes qui l'utilisent.

L'utilité de cette section sera réévaluée après les premières fiches.

---

## 6. Fonctionnalités v1

| Fonction | Description |
|---|---|
| **Recherche** | Hors ligne, au fil de la frappe. Tolère les fautes de frappe, comprend les synonymes de terrain (« rame » = « lent »). Cherche dans le titre, les symptômes, les codes et messages d'erreur, les tags. **Comprend la version** : « imprimante windows 10 » filtre et ouvre les fiches sur la bonne version |
| **Filtres** | Domaine, niveau, environnement/version, « Critique », temps estimé, **droits requis**. Filtres **contextuels** selon la section (constructeur en Réseau, service en M365) |
| **Favoris** | Écran dédié **Favoris**, accessible depuis l'en-tête (bouton ★ Favoris) : il liste uniquement les fiches mises en favori, avec leur domaine et leur niveau ; une étoile permet de retirer une fiche. Écran vide expliqué (« Aucun favori pour l'instant »). Stockés uniquement sur l'appareil. Les favoris n'apparaissent **pas** sur l'accueil (demande de Benji, 29/10/2026) |
| **Récemment consultées** | Bloc sur l'accueil (5 à 10 dernières fiches), sans page dédiée. Ne garde jamais les valeurs saisies. Bouton pour vider. *Fonction gardée à l'essai* |
| **Sélecteur de version** | Dans chaque fiche, réglé par défaut sur la version la plus récente. Pas de réglage global « Mon environnement » |
| **Mes valeurs (données temporaires)** | Formulaire qui remplace les variables (`<NomUtilisateur>`, `<IP_Imprimante>`…) dans les commandes. Valeurs **en mémoire vive uniquement** : jamais envoyées, jamais stockées, effacées en quittant la fiche ou avec le bouton « Effacer » |
| **Assistant de diagnostic** | Questions Oui / Non / Je ne sais pas, **générées à partir de la fiche elle-même**. Chaque conclusion explique pourquoi et comment confirmer. « Je ne sais pas » renvoie à la fiche complète. **Activé uniquement sur les fiches « Vérifiée »** |
| **Copie des commandes** | Tout le texte est sélectionnable. Une petite icône de copie apparaît **uniquement sur les blocs de commande**, avec les valeurs déjà remplacées. Chaque bloc indique son langage (PowerShell / CMD / Bash / Cisco IOS) et porte le badge « Admin requis » si besoin |
| **Résumé pour le ticket** | Génère un texte (symptômes, cause, actions, vérification) copié dans le presse-papiers, à coller dans GLPI ou dans un autre outil. *À l'essai* |
| **Recherche assistée** | Pour un constructeur ou un problème non couvert : génère des liens de recherche vers la documentation officielle et les forums reconnus. Nécessite Internet, et l'utilisateur est prévenu que sa recherche est envoyée au moteur choisi |
| **Signaler une erreur** | Lien vers une issue GitHub pré-remplie avec l'identifiant de la fiche |
| **Affichage** | **Thème clair uniquement** en v1 (couleurs organisées pour ajouter un mode sombre plus tard). Taille de texte réglable. Conçu **mobile d'abord**, utilisable d'une main, confortable sur PC. Accessibilité : contrastes, clavier, VoiceOver |

**Exclu :** checklist de progression, mode « Mon environnement », mode sombre (v1).

---

## 7. Design

| Sujet | Décision |
|---|---|
| Nom | **SOS Admin** (le dépôt reste `SolutionTech`). Adresse visée : `sos-admin.pages.dev`. Disponibilité du nom à vérifier avant la mise en ligne |
| Style | Inspiré de **l'assistance Apple** : sobre, aéré, fond blanc / gris très clair |
| Couleurs | Principale : bleu. Niveaux : N1 vert, N2 bleu, N3 violet. Rouge réservé aux actions destructives, orange aux « Attention » |
| Logo | Moderne, simple, compréhensible par tous. Piste : bouée de sauvetage stylisée, en formes plates. 2 ou 3 variantes proposées en Phase 4 |
| Accueil | Grande barre de recherche → Récemment consultées (masqué si vide) → grille des domaines par ordre alphabétique (icône + nombre de fiches). Les favoris ont leur propre écran |
| Police | Police du système, chasse fixe pour les commandes. Aucune police externe |
| Navigation | Mobile : recherche toujours accessible + menu des sections. PC : sections à gauche, fiche au centre, sommaire à droite. iOS : barre d'onglets en bas (Accueil · Recherche · Favoris · Réglages) |

---

## 8. Stack technique

| Élément | Choix | Pourquoi |
|---|---|---|
| Format des fiches | **Un fichier YAML par fiche** dans `content/`, avec du Markdown dans les champs de texte | Structuré **et** lisible. Validé par un schéma : une fiche incomplète fait échouer le build |
| Script de build | Node.js 22 LTS + TypeScript | Génère l'index JSON unique consommé par le site et par l'app |
| Site | **Astro** (pages statiques + îlots interactifs) | Validation des contenus intégrée, composants, très bon référencement, supporté par Cloudflare |
| Recherche web | **MiniSearch** (dans le navigateur) | Gère les fautes de frappe et les préfixes, pondère les champs, lit directement notre index |
| Hors ligne web / Android | **PWA**, en fin de Phase 4 | Installable sur l'écran d'accueil, fonctionne sans réseau |
| Hébergement | **Cloudflare Pages**, redéploiement automatique à chaque push sur `main` | Gratuit, rapide |
| Contrôle qualité | **GitHub Action** : validation des fiches et des liens internes à chaque push | Les erreurs sont détectées avant la mise en ligne |
| App iOS | **SwiftUI**, iOS 17 minimum, index JSON embarqué, **aucune bibliothèque externe** | Hors ligne complet, rien qui envoie des données |
| Android natif | Plus tard, si justifié (Kotlin / Jetpack Compose), sur le même index JSON | Pas de réécriture multiplateforme maintenant |
| Statistiques | **Aucune** | Cohérent avec « aucune collecte » |

Matériel de développement : MacBook Air M4 (macOS et Xcode à jour), iPhone 17 Pro (iOS à jour).

---

## 9. Web et iOS : ce qui diffère

| Sujet | Site web | App iOS |
|---|---|---|
| Contenu | Identique (même index, mêmes états, mêmes badges) | Identique |
| Hors ligne | En ligne, puis hors ligne une fois installé en PWA | 100 % hors ligne dès l'installation |
| Fonctions en ligne | Recherche assistée, signalement, liens vers les sources (et l'assistant IA en v2) | Les mêmes quand il y a du réseau. **Sans réseau : uniquement le contenu embarqué**, fonctions en ligne grisées (« Nécessite une connexion ») |
| Mise à jour du contenu | Automatique à chaque push | v1 : script de synchronisation + recompilation. v2 : bouton « Rechercher une mise à jour du contenu » (simple téléchargement) |
| Favoris | Dans le navigateur | Sur l'iPhone. Pas de synchronisation (il faudrait un serveur) |
| Liens site → app | — | Non en v1 (nécessite un compte développeur payant) |
| Mise en page | PC + mobile | iPhone + iPad |
| Installation | Adresse publique | Identifiant Apple gratuit (réinstallation tous les 7 jours) ; programme Apple Developer (99 $/an) envisagé plus tard |

**Principe retenu : « hors ligne d'abord », pas « hors ligne seulement ».** Avec du réseau, l'utilisateur a tout, fonctions en ligne comprises. Sans réseau, il garde l'intégralité des fiches.

---

## 10. Gestion du contenu

| Sujet | Décision |
|---|---|
| Rédacteurs | Benji + Claude en v1. Ensuite, contributions via GitHub (issues, pull requests, `CONTRIBUTING.md`) |
| États | **Brouillon** (non publiée) → **À relire** (publiée avec le badge « Pas encore vérifiée en conditions réelles ») → **Vérifiée** |
| Validation | Une fiche passe à « Vérifiée » quand elle a été testée sur le terrain ou en labo (Cisco Packet Tracer, VM UTM Windows 11 / Server ARM, tenant M365 de test) |
| Revérification | Au bout de 12 mois (6 mois pour M365 / Entra ID). Badge « Vérifiée il y a plus de X mois ». Liste générée dans `docs/a-reverifier.md` |
| Commits | En français, avec un préfixe : `contenu(ad): …`, `site: …`, `ios: …`. Travail sur la branche de développement, fusion dans `main` après validation, ce qui déclenche le déploiement |
| Version du contenu | L'index porte sa date de génération et le nombre de fiches. Affiché sous la forme « Contenu du JJ/MM/AAAA · N fiches » |
| Licences | Code : **MIT**. Contenu : **CC BY-SA 4.0** |
| Légal | Page « À propos / Avertissement » (usage à ses risques, sauvegarder, tester d'abord) + mentions légales (hébergeur Cloudflare ; éditeur particulier, qui peut rester anonyme). Aucun bandeau cookies, puisqu'il n'y a aucun traceur |

---

## 11. Confidentialité : les garanties

- Aucun compte, aucun cookie de suivi, aucune statistique.
- « Mes valeurs » : en mémoire vive uniquement, jamais stockées ni transmises.
- Favoris et récents : stockés uniquement sur l'appareil, et effaçables.
- Fonctions en ligne (recherche assistée, IA en v2) : l'utilisateur est **explicitement prévenu** avant tout envoi vers un service externe. Les valeurs de « Mes valeurs » ne sont **jamais** envoyées automatiquement.

---

## 12. Feuille de route et évolutions

**v1 (Phases 1 à 4)** : contenu + site web + PWA.

**v1.x (Phase 5)** : app iOS, lancée après validation du site.

**v2, envisagée :**
- **Assistant IA en ligne, en dernier recours** (voir § 13) ;
- mise à jour du contenu de l'app sans recompiler ;
- Spotlight et widget Favoris sur iOS ;
- assistant général de triage (« Je ne sais pas d'où vient le problème ») ;
- communauté, palier 2 : **GitHub Discussions** (« Discuter de cette fiche »).

**Plus tard :**
- communauté, palier 3 : plateforme dédiée (si le projet décolle) ;
- app Android native ;
- mode sombre ;
- captures d'écran ciblées ;
- export PDF et impression ;
- export/import des favoris ;
- programme Apple Developer, TestFlight, App Store, Universal Links ;
- nom de domaine personnalisé.

---

## 13. Assistant IA (v2) : principes proposés, à confirmer

**Rôle :** aider en dernier recours un technicien que les fiches n'ont pas suffi à dépanner. Il cherche d'abord dans **nos propres fiches**, puis dans des sources web reconnues, trie les pistes et **cite chaque source**.

**Garde-fous :**
- disponible uniquement en ligne ;
- avertissement clair : *« Réponse générée par IA, à vérifier avant d'agir »* ;
- l'IA n'exécute jamais rien ;
- les commandes proposées portent la mention « Non vérifiée » ;
- avant le premier envoi, l'utilisateur est prévenu que sa question part vers un service externe et invité à **ne pas saisir de données réelles** (noms, IP, mots de passe).

**Architecture envisagée :** une petite fonction serveur (Cloudflare Workers) qui interroge un modèle d'IA, avec protection anti-robots, quota par utilisateur et **plafond de budget mensuel**.

**Alternative :** l'utilisateur fournit sa propre clé API, stockée sur son appareil.

**Pourquoi en v2 :** la qualité de l'assistant dépend directement de la richesse de la base de fiches. On la construit donc d'abord. L'index JSON sera conçu dès la v1 pour être réutilisable par l'IA.

**Points à trancher avant la v2 :** qui paie (budget mensuel maximal), quel fournisseur d'IA, et quel quota par utilisateur.

---

## 14. Critères de réussite

- Une fiche permet à un technicien N1 de résoudre le problème sans autre recherche.
- Le même contenu alimente le site et l'app, sans duplication manuelle.
- L'app (et la PWA) fonctionne entièrement hors ligne pour la consultation.
- Le site se redéploie automatiquement à chaque push sur GitHub.
- Aucune donnée utilisateur n'est collectée.
