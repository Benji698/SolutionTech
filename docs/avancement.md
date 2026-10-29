# Avancement du contenu — SOS Admin

> Mis à jour le 29/10/2026 (Phase 3 : domaine Active Directory traité). Le nombre de fiches par domaine est aussi calculé à chaque build (`generated/index.json`).

## Phase 2 : fiches exemples (format)

| Fiche | Domaine | Statut |
|---|---|---|
| Utilisateur verrouillé dans l'Active Directory | Active Directory, GPO, DNS, DHCP | À relire |
| Imprimante réseau ne s'installe plus sur la session utilisateur | Matériel et périphériques | À relire |
| Poste lent au démarrage | Windows | À relire |

## Phase 3 : domaines

| Domaine | Fiches | État |
|---|---:|---|
| Active Directory, GPO, DNS, DHCP | 13 | ✅ Première passe terminée |
| Gestion des comptes : arrivées et départs | 0 | À traiter |
| Linux | 0 | À traiter |
| Logiciels métier et applicatifs | 0 | À traiter |
| macOS | 0 | À traiter |
| Matériel et périphériques | 1 | À traiter |
| Messagerie | 0 | À traiter |
| Microsoft 365 | 0 | À traiter |
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

## Fiches déjà référencées mais pas encore rédigées

Ces fiches sont citées par les fiches existantes (liens « fiches liées » ou conclusions) :

- `securite-attaque-force-brute`, `securite-compte-compromis`
- `reseau-pas-d-adresse-ip`
- `imprimante-hors-connexion`, `spouleur-impression-plante`
- `windows-ouverture-session-lente`, `windows-disque-100-pourcent`
- Outils : `rsat-ad`, `observateur-evenements`, `gestion-impression`, `gpmc`, `gestionnaire-taches`, `autoruns`
