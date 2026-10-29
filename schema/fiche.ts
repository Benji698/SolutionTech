// Schéma d'une fiche problème (content/fiches/<domaine>/<id>.yaml).
// Toute fiche est validée contre ce schéma au build : un champ manquant ou mal écrit
// arrête le build avec un message clair. Les contrôles « croisés » (une conclusion qui
// pointe vers une étape inexistante, une variable non déclarée…) sont dans scripts/build-index.ts.
import { z } from "zod";

/** Identifiant stable : minuscules, chiffres et tirets, sans accents (sert dans les URL). */
export const Id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "identifiant kebab-case attendu (ex. ad-compte-verrouille)");
/** Identifiant court d'élément interne à la fiche : c1, d2, r1-e1… */
export const IdLocal = z.string().regex(/^[a-z][a-z0-9-]*$/, "identifiant local attendu (ex. c1, d2, r1)");
/** Date au format AAAA-MM-JJ. */
export const DateISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date AAAA-MM-JJ attendue");
/** Texte Markdown non vide. */
const Md = z.string().trim().min(1);

export const Niveau = z.enum(["N1", "N2", "N3"]);
export const Statut = z.enum(["brouillon", "a-relire", "verifiee"]);
export const Frequence = z.enum(["tres-frequente", "frequente", "occasionnelle", "rare"]);
export const Droits = z.enum([
  "aucun",          // n'importe quel utilisateur
  "admin-local",    // administrateur du poste
  "delegation-ad",  // droits délégués sur une OU (ex. déverrouiller, réinitialiser)
  "admin-domaine",  // admin du domaine / modification de GPO
  "admin-m365",     // rôle d'administration Microsoft 365 / Entra ID
  "admin-reseau",   // accès privilégié aux équipements réseau (enable)
  "root",           // super-utilisateur Linux / macOS
]);
export const Langage = z.enum(["powershell", "cmd", "bash", "zsh", "cisco-ios", "fortios", "registre", "texte"]);

/** Bloc de commande. Mis en avant seulement si l'étape n'a pas de méthode graphique. */
export const Commande = z.strictObject({
  langage: Langage,
  code: Md,
  /** Console élevée (Windows) / sudo (Linux, macOS) / mode enable (Cisco). */
  admin: z.boolean().default(false),
  /** Où lancer la commande, si ce n'est pas évident (ex. « Sur le contrôleur de domaine »). */
  ou: z.string().optional(),
});

export const Avertissement = z.strictObject({
  /** destructif = irréversible / perte de données ; attention = coupe un service ou baisse la sécurité. */
  type: z.enum(["destructif", "attention"]),
  texte: Md,
});

/** Méthode graphique : un texte unique, ou des variantes selon la version choisie. */
export const Graphique = z.union([
  Md,
  z.array(z.strictObject({ versions: z.array(z.string()).min(1), texte: Md })).min(2),
]);

export const Conclusion = z
  .strictObject({
    /** Ce que le technicien constate (« Le compte est verrouillé »). */
    si: Md,
    /** Cause confirmée par ce constat (id de causes[]). */
    cause: IdLocal.optional(),
    /** Étape ou résolution suivante (id local), ou fiche liée (« fiche:<id> »). */
    aller_a: z.string().optional(),
  })
  .refine((c) => c.cause || c.aller_a, "une conclusion doit indiquer une cause et/ou une suite (aller_a)");

export const Etape = z
  .strictObject({
    id: IdLocal,
    titre: Md,
    niveau: Niveau,
    /** Versions concernées ; absent = toutes les versions de la fiche. */
    versions: z.array(z.string()).optional(),
    graphique: Graphique.optional(),
    commande: Commande.optional(),
    avertissement: Avertissement.optional(),
    astuce: Md.optional(),
    conclusions: z.array(Conclusion).optional(),
  })
  .refine((e) => e.graphique || e.commande, "une étape doit avoir une méthode graphique et/ou une commande");

export const Fiche = z
  .strictObject({
    id: Id,
    /** complete = fiche détaillée (diagnostic, vérification, prévention obligatoires) ;
     *  express = problème ciblé ou rare : message/cause/solution, sans diagnostic détaillé. */
    format: z.enum(["complete", "express"]).default("complete"),
    titre: Md,
    resume: Md,
    statut: Statut,
    domaine: Id,
    sous_domaine: Id,
    theme: Id.optional(),
    /** Renvois « domaine/sous-domaine » : la fiche y apparaît aussi, sans être copiée. */
    apparait_aussi_dans: z.array(z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+$/)).default([]),
    niveau: Niveau,
    temps_estime: z.strictObject({ min: z.number().int().positive(), max: z.number().int().positive() }),
    critique: z.boolean().default(false),
    environnements: z.array(z.string()).min(1),
    /** Droits nécessaires pour aller au bout de la fiche (les étapes N1 peuvent en demander moins). */
    droits: Droits,
    outils: z.array(Id).default([]),
    acces: z.array(Md).default([]),
    symptomes: z.array(Md).min(1),
    messages_erreur: z
      .array(z.strictObject({ texte: Md, code: z.string().optional(), ou: z.string().optional() }))
      .default([]),
    /** Champs du formulaire « Mes valeurs » (en mémoire seulement, jamais stockés). */
    variables: z
      .array(
        z.strictObject({
          nom: z.string().regex(/^[A-Z][A-Za-z0-9]*$/, "variable en PascalCase (ex. NomUtilisateur)"),
          libelle: Md,
          exemple: z.string().min(1),
        }),
      )
      .default([]),
    premiers_reflexes: z.array(Md).default([]),
    causes: z
      .array(z.strictObject({ id: IdLocal, titre: Md, frequence: Frequence, detail: Md.optional() }))
      .min(1),
    diagnostic: z.array(Etape).default([]),
    resolutions: z
      .array(
        z.strictObject({
          id: IdLocal,
          causes: z.array(IdLocal).min(1),
          titre: Md,
          etapes: z.array(Etape).min(1),
        }),
      )
      .min(1),
    verification: z.array(Etape).default([]),
    prevention: z.array(Md).default([]),
    comprendre: Md.optional(),
    fiches_liees: z.array(Id).default([]),
    tags: z.array(z.string().min(1)).default([]),
    sources: z
      .array(
        z.strictObject({
          titre: Md,
          url: z.url(),
          type: z.enum(["officiel", "forum", "blog"]),
          langue: z.enum(["fr", "en"]).default("en"),
          consulte_le: DateISO,
        }),
      )
      .min(1),
    derniere_verification: DateISO,
  })
  .refine((f) => f.temps_estime.min <= f.temps_estime.max, "temps_estime : min doit être ≤ max")
  .refine((f) => !f.critique || f.premiers_reflexes.length > 0, "une fiche critique doit avoir des premiers_reflexes")
  .refine((f) => f.format === "express" || f.diagnostic.length > 0, "fiche complète : au moins une étape de diagnostic")
  .refine((f) => f.format === "express" || f.verification.length > 0, "fiche complète : au moins une étape de vérification")
  .refine((f) => f.format === "express" || f.prevention.length > 0, "fiche complète : au moins un conseil de prévention")
  .refine((f) => f.format === "complete" || f.messages_erreur.length > 0 || f.symptomes.length > 0, "fiche express : un symptôme ou un message d'erreur précis")
  .refine((f) => f.format === "complete" || f.resolutions.length <= 3, "fiche express : 3 résolutions au maximum (sinon, faire une fiche complète)");

export type Fiche = z.infer<typeof Fiche>;
export type Etape = z.infer<typeof Etape>;
