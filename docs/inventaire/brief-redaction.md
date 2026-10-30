# Brief des rédacteurs (agents) — SOS Admin

Brief court donné à chaque agent qui rédige des fiches à partir d'un lot (`.cache/lots/<lot>.txt`). Il remplace la lecture de tous les documents du projet : **ne lire que ce fichier, le lot, les entrées de l'inventaire concernées et les extraits utiles de la documentation.**

## 1. Ce que tu fais

Pour chaque id du lot :
1. Lire l'entrée dans l'inventaire indiqué en tête du lot (`titre`, `symptome`, `erreurs`, `format`, `sources`).
2. Chercher les faits dans la documentation officielle locale (§ 4), en lisant **seulement les passages utiles** (`grep -n`, puis `Read` avec `offset`/`limit`), pas des articles entiers.
3. Écrire `content/fiches/<domaine>/<id>.yaml`. Enregistrer chaque fiche dès qu'elle est finie.
4. Toutes les 3 à 5 fiches, valider (§ 6).

Interdits : modifier autre chose que tes fiches (ni inventaire, ni schéma, ni taxonomie, ni fiches des autres) ; faire un commit.

## 2. Modèle de fiche express (le plus courant)

```yaml
id: exchange-ndr-550-5-7-520-transfert-externe-bloque   # = nom du fichier, kebab-case sans accents
format: express                     # ou complete
titre: "Transfert automatique vers l'extérieur bloqué (550 5.7.520)"
resume: "1 ou 2 phrases : le problème et la démarche."
statut: a-relire                    # toujours
domaine: microsoft-365
sous_domaine: exchange-online       # ceux de l'inventaire
apparait_aussi_dans: []             # optionnel, emplacements « domaine/sous-domaine » existants dans content/taxonomie.yaml
niveau: N2                          # N1 | N2 | N3
temps_estime: { min: 10, max: 20 }
critique: false                     # true => premiers_reflexes obligatoires
environnements: [m365]              # ids de content/environnements.yaml
droits: admin-m365                  # aucun | admin-local | delegation-ad | admin-domaine | admin-m365 | admin-reseau | root
outils: []
acces:
  - "Rôle **Administrateur Exchange** sur le centre d'administration Exchange."
symptomes:
  - « Phrase avec les mots de l'utilisateur. »
messages_erreur:
  - texte: "550 5.7.520 Access denied, Your organization does not allow external forwarding."
    code: "5.7.520"
    ou: Message de non-remise reçu par l'utilisateur
variables:
  - { nom: UPN, libelle: "Adresse de l'utilisateur", exemple: jean.dupont@contoso.fr }
causes:
  - id: c1
    titre: La stratégie anti-spam sortante bloque le transfert externe
    frequence: tres-frequente        # tres-frequente | frequente | occasionnelle | rare
    detail: "Explication courte."
resolutions:                         # express : 1 à 3 ; chaque cause a une résolution
  - id: r1
    causes: [c1]
    titre: Autoriser le transfert pour ce seul utilisateur
    etapes:
      - id: r1-e1
        titre: Créer une stratégie sortante dédiée
        niveau: N2
        graphique: |
          1. Portail **Microsoft Defender** › **E-mail et collaboration** › **Stratégies et règles** (*Policies & rules*)…
        commande:                    # repliée car l'étape a un graphique
          langage: powershell        # powershell | cmd | bash | zsh | cisco-ios | fortios | registre | texte
          ou: Exchange Online PowerShell
          admin: false
          code: |
            New-HostedOutboundSpamFilterRule -Name 'Transfert' -HostedOutboundSpamFilterPolicy 'Transfert' -From '<UPN>'
        avertissement:
          type: attention            # destructif (irréversible) | attention (coupure, baisse de sécurité)
          texte: "Ne jamais l'activer pour tout le monde."
        conclusions:
          - { si: "Le transfert n'a pas été créé par l'utilisateur", aller_a: "fiche:securite-compte-compromis" }
verification:                        # conseillée en express
  - id: v1
    titre: Le transfert fonctionne
    niveau: N1
    graphique: "Envoyer un message de test…"
fiches_liees: []                     # ids de fiches existantes ou de l'inventaire
tags: [transfert, forwarding, "5.7.520", ndr]
sources:
  - titre: "Titre de la page — Microsoft Learn"
    url: https://learn.microsoft.com/en-us/...
    type: officiel                   # officiel | forum | blog
    consulte_le: AAAA-MM-JJ
derniere_verification: AAAA-MM-JJ
```

**Fiche complète** (`format: complete`) : mêmes champs, plus obligatoirement `diagnostic` (étapes `d1`, `d2`… dont les `conclusions` pointent vers `r1`, `d2`… avec `cause: c1`), `verification` (≥ 1) et `prevention` (≥ 1 phrase), et `comprendre` (3 à 5 lignes, optionnel). Causes classées de la plus fréquente à la plus rare, une résolution par cause. Une fiche complète doit permettre à un technicien N1 d'aller au bout sans autre recherche.

Exemples réels à imiter si besoin : `content/fiches/microsoft-365/exchange-ndr-550-5-7-520-transfert-externe-bloque.yaml` (express), `content/fiches/microsoft-365/exchange-boite-partagee-acces.yaml` (complète).

## 3. Règles de rédaction (non négociables)

- Français, ton impersonnel à l'infinitif (« Ouvrir… », « Vérifier… »). Menus en **gras**, nom anglais en *italique* : **Paramètres** (*Settings*). Séparateur `›`.
- Messages d'erreur, commandes et codes **tels quels** (non traduits).
- **Interface graphique d'abord** ; la commande va dans `commande`. Une étape sans `graphique` seulement s'il n'existe aucune méthode graphique.
- Commandes : modules actuels (Microsoft Graph PowerShell, Exchange Online PowerShell V3, etc.). Jamais MSOnline ni AzureAD (retirés). Ne jamais inventer un menu, un paramètre, une commande ou un code.
- Tout fait non vérifié, daté ou dépendant de la licence : encadré dans le texte concerné :
  ```
  > [!a-verifier]
  > Ce qu'on ne peut pas affirmer.
  ```
- Action destructive (suppression, réinitialisation, effacement) : `avertissement` `destructif`. Coupure de service ou baisse de sécurité : `attention`. Rappeler la **vérification d'identité** avant toute réinitialisation de mot de passe ou de MFA.
- Exemples génériques uniquement : `contoso.fr`, `contoso.local`, `SRV-DC01`, `192.168.10.0/24`.
- Variables `<NomEnPascalCase>` : chaque variable utilisée est déclarée dans `variables`, chaque variable déclarée est utilisée.
- Sources : URL réellement vues (celles de l'inventaire, de la doc locale, de tes recherches), officielles en premier. Jamais d'URL inventée. Pour un article de la doc locale sans URL Learn connue, citer `https://github.com/MicrosoftDocs/SupportArticles-docs/blob/main/<chemin>`.
- `fiches_liees` et `aller_a: "fiche:<id>"` : uniquement vers des fiches existantes (`ls content/fiches/*/`) ou des ids d'inventaire.
- Sous-domaine ou environnement manquant : prendre le plus proche existant et le signaler dans la réponse finale.

## 4. Où vérifier les faits

1. **Documentation officielle locale** : `.cache/msdocs/` (installée par `bash scripts/docs-microsoft.sh`). Dossiers : Exchange, Microsoft365, Office, Outlook, SharePoint, Teams, support/entra, support/mem (Intune), support/windows-client, support/windows-server. Chercher avec `grep -ril "<code ou mot-clé>" .cache/msdocs/<dossier>`.
2. Dépôts publics MicrosoftDocs via `https://raw.githubusercontent.com/MicrosoftDocs/<dépôt>/main/<chemin>` (entra-docs, memdocs, OfficeDocs-*…).
3. WebSearch avec parcimonie (quota partagé). learn.microsoft.com et support.microsoft.com ne sont pas lisibles directement par WebFetch dans la session cloud.
4. Introuvable : `> [!a-verifier]`.

## 5. Pièges YAML

- Valeur contenant « : » (deux-points + espace) → entre guillemets. Correction automatique : `python3 scripts/guillemets-yaml.py <fichiers>`.
- Dans `{ … }` et `[ … ]`, une valeur avec une virgule → entre guillemets.
- Codes et nombres toujours entre guillemets : `"4740"`, `"0x8004de40"`, `"5.7.520"`.
- Dans une chaîne entre guillemets doubles, doubler les `\` : `"C:\\Pilotes"`. Dans un bloc `|`, les écrire normalement.

## 6. Validation

```bash
npm run -s validate 2>&1 | grep ERREUR | grep -E "<tes ids>"
```

Corriger toutes les ERREURS de tes fichiers. Les ALERTES (« pas encore rédigée ») sont acceptées. Ignorer les erreurs des fichiers des autres agents.

## 7. Réponse finale (courte)

Fiches créées (id + format), fiches non rédigées et pourquoi, points « à vérifier » importants.
