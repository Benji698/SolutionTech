// Schémas des fichiers de référence : taxonomie, environnements, synonymes, outils.
import { z } from "zod";
import { DateISO, Id } from "./fiche.js";

const Element = z.strictObject({ id: Id, titre: z.string().min(1) });

export const Taxonomie = z.strictObject({
  domaines: z
    .array(
      z.strictObject({
        id: Id,
        titre: z.string().min(1),
        sous_titre: z.string().min(1),
        icone: z.string().min(1),
        sous_domaines: z
          .array(Element.extend({ themes: z.array(Element).optional() }).strict())
          .min(1),
      }),
    )
    .min(1),
  familles_outils: z.array(Element).min(1),
});

export const Environnements = z.strictObject({
  familles: z.array(Element).min(1),
  environnements: z
    .array(
      z.strictObject({
        id: Id,
        libelle: z.string().min(1),
        famille: Id,
        /** Date de fin de support de l'éditeur, si connue. */
        fin_support: DateISO.optional(),
        note: z.string().optional(),
      }),
    )
    .min(1),
});

/** Chaque groupe contient des mots considérés comme équivalents par la recherche. */
export const Synonymes = z.strictObject({ groupes: z.array(z.array(z.string().min(1)).min(2)) });

export const Outil = z.strictObject({
  id: Id,
  nom: z.string().min(1),
  famille: Id,
  description: z.string().min(1),
  editeur: z.string().min(1),
  url_officielle: z.url(),
  licence: z.enum(["gratuit", "payant", "freemium", "inclus-windows", "open-source"]),
  plateformes: z.array(z.enum(["windows", "macos", "linux", "ios", "android", "web"])).min(1),
  usages: z.array(z.string().min(1)).min(1),
  pieges: z.array(z.string().min(1)).default([]),
  derniere_verification: DateISO,
});

export type Taxonomie = z.infer<typeof Taxonomie>;
export type Environnements = z.infer<typeof Environnements>;
export type Outil = z.infer<typeof Outil>;
