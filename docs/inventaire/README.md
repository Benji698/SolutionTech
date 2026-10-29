# Inventaire des problèmes — SOS Admin

Objectif (demande de Benji) : recenser **le plus grand nombre possible de problèmes reconnus à ce jour**, fréquents comme rares, pour chaque section, afin qu'un technicien trouve précisément son problème.

Un fichier par sous-domaine : `docs/inventaire/<domaine>/<sous-domaine>.yaml`. Il liste des **problèmes à documenter** (pas les fiches elles-mêmes). Les fiches sont ensuite rédigées dans `content/fiches/<domaine>/`.

## Format

```yaml
domaine: microsoft-365
sous_domaine: exchange-online
recense_le: 2026-10-29
problemes:
  - id: exchange-ndr-550-5-7-520-transfert-externe-bloque   # id proposé pour la future fiche (kebab-case, sans accents)
    titre: "Transfert automatique vers l'extérieur bloqué (550 5.7.520)"
    symptome: "Les messages transférés vers une adresse externe reviennent en erreur."
    erreurs: ["550 5.7.520 Access denied, Your organization does not allow external forwarding"]
    priorite: frequent        # frequent | critique | rare
    format: express           # complete (plusieurs causes, diagnostic) | express (message/cause/solution ciblés)
    sources:                  # au moins une, officielle de préférence
      - https://learn.microsoft.com/en-us/defender-office-365/outbound-spam-policies-external-email-forwarding
    etat: redigee             # a-rediger | redigee
```

## Règles

- Un problème = une situation que le technicien peut reconnaître (symptôme, message ou code d'erreur). Pas de « tutoriels » de configuration sans panne.
- Pas de doublon avec les fiches existantes (`content/fiches/`) : les marquer `etat: redigee` avec leur `id`.
- Toujours au moins une source réelle (URL consultée ou trouvée en recherche), officielle de préférence.
- Titres en français, messages d'erreur tels quels (souvent en anglais).
