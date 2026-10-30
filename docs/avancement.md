# Avancement du contenu — SOS Admin

> Mis à jour le 30/10/2026 (Phase 3 : Active Directory validé ; Microsoft 365 inventorié, rédaction en cours). Le nombre de fiches par domaine est aussi calculé à chaque build (`generated/index.json`).

## Phase 2 : fiches exemples (format)

| Fiche | Domaine | Statut |
|---|---|---|
| Utilisateur verrouillé dans l'Active Directory | Active Directory, GPO, DNS, DHCP | À relire |
| Imprimante réseau ne s'installe plus sur la session utilisateur | Matériel et périphériques | À relire |
| Poste lent au démarrage | Windows | À relire |

## Phase 3 : domaines

| Domaine | Fiches | État |
|---|---:|---|
| Active Directory, GPO, DNS, DHCP | 13 | ✅ Validé par Benji |
| Gestion des comptes : arrivées et départs | 0 | À traiter |
| Linux | 0 | À traiter |
| Logiciels métier et applicatifs | 0 | À traiter |
| macOS | 0 | À traiter |
| Matériel et périphériques | 1 | À traiter |
| Messagerie | 0 | À traiter |
| Microsoft 365 | 24 | 🔄 Inventaire fait (2 250 problèmes), rédaction en cours |
| Mobiles et MDM | 0 | À traiter |
| Réseau | 0 | À traiter |
| Sauvegarde et restauration | 0 | À traiter |
| Sécurité et incidents | 0 | À traiter |
| Serveurs Linux | 0 | À traiter |
| Stockage et NAS | 0 | À traiter |
| Support utilisateur et procédures | 0 | À traiter |
| Téléphonie / VoIP | 0 | À traiter |
| Virtualisation | 0 | À traiter |
| Windows | 1 | À traiter |
| Windows Server | 0 | À traiter |
| Boîte à outils | 0 | À traiter |

## Phase 3 : Active Directory, GPO, DNS, DHCP (13 fiches)

| Sous-domaine | Fiches |
|---|---|
| Comptes utilisateurs | Compte verrouillé · Compte désactivé · Mot de passe expiré (y compris à distance) · Nouveau mot de passe refusé |
| Comptes ordinateurs | Relation d'approbation rompue · Jonction au domaine impossible |
| Groupes et délégation | Ajout à un groupe non pris en compte |
| Stratégies de groupe | GPO qui ne s'applique pas |
| Authentification et Kerberos | Décalage d'heure (Kerberos) |
| DNS | Noms internes non résolus |
| DHCP | Étendue pleine ou injoignable (169.254) |
| Contrôleurs de domaine | Réplication en échec (**critique**) |
| Synchronisation Entra Connect | Compte non synchronisé vers Microsoft 365 |

Pistes pour une deuxième passe : restrictions d'horaires et de postes de connexion, LAPS, profil temporaire, rôles FSMO indisponibles, SYSVOL/DFSR, DNS (enregistrements obsolètes, redirecteurs), basculement DHCP, Kerberos (SPN en double), certificats des contrôleurs de domaine.

Limite de cette passe : learn.microsoft.com et support.microsoft.com n'ont pas pu être lus directement (réseau de la session) ; les informations viennent de recherches recoupées, et les points incertains sont marqués « À vérifier ».

## Phase 3 : Microsoft 365, première passe (11 fiches)

| Sous-domaine | Fiches |
|---|---|
| MFA et accès conditionnel | Nouveau téléphone ou téléphone perdu (MFA) |
| Entra ID | Connexion refusée : lire le code AADSTS et le journal de connexion |
| Exchange Online | Outlook redemande le mot de passe en boucle · Boîte partagée invisible ou « Envoyer en tant que » refusé · E-mails non reçus (suivi des messages, quarantaine) · Boîte aux lettres pleine |
| Teams | Teams ne démarre plus ou se comporte bizarrement (cache) |
| OneDrive | Synchronisation bloquée (croix rouge) |
| SharePoint | « Vous avez besoin d'une autorisation » (internes et invités) |
| Applications Microsoft 365 | « Produit sans licence » |
| Licences | Nouvel utilisateur sans boîte mail (licence, emplacement d'utilisation) |

Pistes pour une deuxième passe : Teams (micro, caméra, réunions externes), calendrier partagé et salles de réunion, transfert automatique bloqué, règles de flux de messagerie, Intune (inscription d'un appareil), réinitialisation de mot de passe en libre-service, rétention et récupération d'éléments supprimés.

## Microsoft 365 : inventaire et rédaction (couverture maximale)

Méthode : `docs/inventaire/README.md`. Brief des rédacteurs : `docs/inventaire/brief-redaction.md`. Bilan à jour : `node scripts/marquer-redigees.cjs`.

| Inventaire (`docs/inventaire/microsoft-365/`) | Problèmes | Rédigés | Remarque |
|---|---:|---:|---|
| applications-office | 160 | 4 | |
| centre-administration | 54 | 0 | |
| copilot | 56 | 0 | ⚠️ Incomplet : agent interrompu, à compléter |
| defender-office | 85 | 0 | |
| entra-id | 200 | 4 | |
| exchange-online | 265 | 5 | |
| intune | 263 | 0 | |
| licences-facturation | 83 | 2 | |
| mfa-acces-conditionnel | 122 | 3 | |
| onedrive | 144 | 3 | |
| outlook | 321 | 2 | |
| purview-conformite | 121 | 0 | |
| sharepoint | 156 | 3 | |
| teams | 220 | 2 | |
| **Total** | **2 250** | **28** | |

Prochaine étape : rédiger les problèmes `frequent` et `critique` (environ 1 000), sous-domaine par sous-domaine, puis les `rare`. La rédaction du 30/10 a été interrompue (limite d'utilisation) : les fiches rédigées sont poussées, `office-licence-introuvable-application` est peut-être incomplète (à relire).

Limites connues :
- Le quota de recherche web a été épuisé pendant les inventaires : beaucoup d'URL `learn.microsoft.com/en-us/troubleshoot/…` ont été déduites des chemins du dépôt MicrosoftDocs/SupportArticles-docs (chaque article existe dans le dépôt, mais l'URL n'a pas été ouverte en ligne).
- Sous-thèmes peu couverts, à compléter plus tard : Exchange (audit des boîtes, eDiscovery côté Exchange, OAB, assistant hybride HCW) ; Outlook (limites du nouvel Outlook, Outlook mobile hors Intune, codes POP/IMAP rares) ; Defender (Safe Documents, comptes prioritaires, ZAP Teams) ; Purview (Communication Compliance, Insider Risk, DKE).
- Doublons possibles Outlook mobile / Exchange ActiveSync (environ 7 entrées) : à fusionner au moment de la rédaction.

## Fiches déjà référencées mais pas encore rédigées

Ces fiches sont citées par les fiches existantes (liens « fiches liées » ou conclusions) :

- `securite-attaque-force-brute`, `securite-compte-compromis`
- `reseau-pas-d-adresse-ip`
- `imprimante-hors-connexion`, `spouleur-impression-plante`
- `windows-ouverture-session-lente`, `windows-disque-100-pourcent`
- Outils : `rsat-ad`, `observateur-evenements`, `gestion-impression`, `gpmc`, `gestionnaire-taches`, `autoruns`
