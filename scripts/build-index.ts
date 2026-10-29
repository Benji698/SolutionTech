// Construit l'index de SOS Admin à partir de content/.
//
//   npm run validate      → vérifie tout, n'écrit rien (utilisé par la GitHub Action)
//   npm run build:index   → vérifie puis écrit generated/index.json et generated/search.json
//
// Deux niveaux de problèmes :
//   - ERREUR  : le build échoue (champ manquant, lien interne cassé, variable non déclarée…)
//   - ALERTE  : le build passe mais on le signale (fiche liée pas encore rédigée, outil sans fiche…)
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import type { z } from "zod";
import { Fiche, type Etape } from "../schema/fiche.js";
import { Environnements, Outil, Synonymes, Taxonomie } from "../schema/referentiels.js";

export const SCHEMA_VERSION = 1;
/** Délai avant revérification, en mois (Microsoft 365 change plus vite). */
const DELAI_REVERIFICATION: Record<string, number> = { "microsoft-365": 6 };
const DELAI_PAR_DEFAUT = 12;

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENU = join(RACINE, "content");
const SORTIE = join(RACINE, "generated");

const erreurs: string[] = [];
const alertes: string[] = [];
const rel = (f: string) => relative(RACINE, f);

function lireYaml(fichier: string): unknown {
  try {
    return parse(readFileSync(fichier, "utf8"));
  } catch (e) {
    erreurs.push(`${rel(fichier)} : YAML invalide — ${(e as Error).message}`);
    return undefined;
  }
}

function valider<S extends z.ZodType>(schema: S, donnees: unknown, fichier: string): z.infer<S> | undefined {
  if (donnees === undefined) return undefined;
  const r = schema.safeParse(donnees);
  if (r.success) return r.data;
  for (const issue of r.error.issues) {
    const chemin = issue.path.length ? issue.path.join(".") : "(racine)";
    erreurs.push(`${rel(fichier)} : ${chemin} — ${issue.message}`);
  }
  return undefined;
}

function listerYaml(dossier: string): string[] {
  if (!existsSync(dossier)) return [];
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return listerYaml(chemin);
    return nom.endsWith(".yaml") ? [chemin] : [];
  });
}

const comparerFr = (a: string, b: string) => a.localeCompare(b, "fr", { sensitivity: "base" });

function moisEcoules(dateIso: string, maintenant: Date): number {
  const d = new Date(`${dateIso}T00:00:00Z`);
  return (maintenant.getUTCFullYear() - d.getUTCFullYear()) * 12 + (maintenant.getUTCMonth() - d.getUTCMonth());
}

// ---------------------------------------------------------------------------
// 1. Référentiels
// ---------------------------------------------------------------------------
const fTaxo = join(CONTENU, "taxonomie.yaml");
const fEnv = join(CONTENU, "environnements.yaml");
const fSyn = join(CONTENU, "synonymes.yaml");
const taxonomie = valider(Taxonomie, lireYaml(fTaxo), fTaxo);
const environnements = valider(Environnements, lireYaml(fEnv), fEnv);
const synonymes = valider(Synonymes, lireYaml(fSyn), fSyn);

if (!taxonomie || !environnements || !synonymes) {
  terminer();
}

const idsEnv = new Set(environnements!.environnements.map((e) => e.id));
const idsFamillesEnv = new Set(environnements!.familles.map((f) => f.id));
for (const e of environnements!.environnements) {
  if (!idsFamillesEnv.has(e.famille)) erreurs.push(`${rel(fEnv)} : ${e.id} — famille inconnue « ${e.famille} »`);
}

/** « domaine/sous-domaine » → thèmes de ce sous-domaine. */
const emplacements = new Map<string, Set<string>>();
const idsDomaines = new Set<string>();
for (const d of taxonomie!.domaines) {
  if (idsDomaines.has(d.id)) erreurs.push(`${rel(fTaxo)} : domaine en double « ${d.id} »`);
  idsDomaines.add(d.id);
  for (const s of d.sous_domaines) {
    const cle = `${d.id}/${s.id}`;
    if (emplacements.has(cle)) erreurs.push(`${rel(fTaxo)} : sous-domaine en double « ${cle} »`);
    emplacements.set(cle, new Set((s.themes ?? []).map((t) => t.id)));
  }
}
const idsFamillesOutils = new Set(taxonomie!.familles_outils.map((f) => f.id));

// ---------------------------------------------------------------------------
// 2. Outils
// ---------------------------------------------------------------------------
const outils = new Map<string, z.infer<typeof Outil>>();
for (const fichier of listerYaml(join(CONTENU, "outils"))) {
  const o = valider(Outil, lireYaml(fichier), fichier);
  if (!o) continue;
  if (basename(fichier, ".yaml") !== o.id) erreurs.push(`${rel(fichier)} : le nom du fichier doit être « ${o.id}.yaml »`);
  if (!idsFamillesOutils.has(o.famille)) erreurs.push(`${rel(fichier)} : famille d'outils inconnue « ${o.famille} »`);
  if (outils.has(o.id)) erreurs.push(`${rel(fichier)} : outil en double « ${o.id} »`);
  outils.set(o.id, o);
}

// ---------------------------------------------------------------------------
// 3. Fiches
// ---------------------------------------------------------------------------
const fiches = new Map<string, { fiche: Fiche; fichier: string }>();
for (const fichier of listerYaml(join(CONTENU, "fiches"))) {
  const f = valider(Fiche, lireYaml(fichier), fichier);
  if (!f) continue;
  if (fiches.has(f.id)) erreurs.push(`${rel(fichier)} : identifiant déjà utilisé par ${rel(fiches.get(f.id)!.fichier)}`);
  fiches.set(f.id, { fiche: f, fichier });
}

const RE_VARIABLE = /<([A-Z][A-Za-z0-9]*)>/g;

for (const { fiche: f, fichier } of fiches.values()) {
  const err = (m: string) => erreurs.push(`${rel(fichier)} : ${m}`);
  const alerte = (m: string) => alertes.push(`${rel(fichier)} : ${m}`);

  // Emplacement
  if (basename(fichier, ".yaml") !== f.id) err(`le nom du fichier doit être « ${f.id}.yaml »`);
  if (basename(dirname(fichier)) !== f.domaine) err(`la fiche doit être rangée dans content/fiches/${f.domaine}/`);
  if (!idsDomaines.has(f.domaine)) err(`domaine inconnu « ${f.domaine} »`);
  const themes = emplacements.get(`${f.domaine}/${f.sous_domaine}`);
  if (!themes) err(`sous-domaine inconnu « ${f.domaine}/${f.sous_domaine} » (voir taxonomie.yaml)`);
  else if (f.theme && !themes.has(f.theme)) err(`thème inconnu « ${f.theme} » dans ${f.domaine}/${f.sous_domaine}`);
  for (const r of f.apparait_aussi_dans) {
    if (!emplacements.has(r)) err(`apparait_aussi_dans : emplacement inconnu « ${r} »`);
    if (r === `${f.domaine}/${f.sous_domaine}`) err(`apparait_aussi_dans : « ${r} » est déjà l'emplacement principal`);
  }

  // Environnements
  const envFiche = new Set(f.environnements);
  for (const e of f.environnements) if (!idsEnv.has(e)) err(`environnement inconnu « ${e} »`);

  // Identifiants locaux uniques
  const etapes: { etape: Etape; ou: string }[] = [
    ...f.diagnostic.map((e) => ({ etape: e, ou: "diagnostic" })),
    ...f.resolutions.flatMap((r) => r.etapes.map((e) => ({ etape: e, ou: `resolutions.${r.id}` }))),
    ...f.verification.map((e) => ({ etape: e, ou: "verification" })),
  ];
  const idsLocaux = new Map<string, string>();
  const declarer = (id: string, ou: string) => {
    if (idsLocaux.has(id)) err(`identifiant local « ${id} » utilisé deux fois (${idsLocaux.get(id)} et ${ou})`);
    idsLocaux.set(id, ou);
  };
  f.causes.forEach((c) => declarer(c.id, "causes"));
  f.resolutions.forEach((r) => declarer(r.id, "resolutions"));
  etapes.forEach(({ etape, ou }) => declarer(etape.id, ou));
  const idsCauses = new Set(f.causes.map((c) => c.id));
  const cibles = new Set([...f.diagnostic.map((e) => e.id), ...f.resolutions.map((r) => r.id), ...etapes.map((e) => e.etape.id)]);

  // Résolutions ↔ causes
  for (const r of f.resolutions) {
    for (const c of r.causes) if (!idsCauses.has(c)) err(`résolution ${r.id} : cause inconnue « ${c} »`);
  }
  for (const c of f.causes) {
    const traitee = f.resolutions.some((r) => r.causes.includes(c.id));
    const renvoyee = f.diagnostic.some((e) => e.conclusions?.some((k) => k.cause === c.id && k.aller_a?.startsWith("fiche:")));
    if (!traitee && !renvoyee) err(`cause ${c.id} sans résolution (ni renvoi vers une autre fiche)`);
  }

  // Variables
  const declarees = new Set(f.variables.map((v) => v.nom));
  const utilisees = new Set<string>();

  for (const { etape: e, ou } of etapes) {
    const ici = `${ou} › ${e.id}`;
    for (const v of e.versions ?? []) if (!envFiche.has(v)) err(`${ici} : version « ${v} » absente des environnements de la fiche`);
    if (Array.isArray(e.graphique)) {
      const couvertes = new Set<string>();
      for (const variante of e.graphique) {
        for (const v of variante.versions) {
          if (!envFiche.has(v)) err(`${ici} : variante pour « ${v} », absente des environnements de la fiche`);
          if (couvertes.has(v)) err(`${ici} : deux variantes pour la version « ${v} »`);
          couvertes.add(v);
        }
      }
      for (const v of e.versions ?? f.environnements) {
        if (!couvertes.has(v)) err(`${ici} : aucune variante graphique pour « ${v} »`);
      }
    }
    if (e.commande) for (const m of e.commande.code.matchAll(RE_VARIABLE)) utilisees.add(m[1]);
    for (const c of e.conclusions ?? []) {
      if (c.cause && !idsCauses.has(c.cause)) err(`${ici} : conclusion vers une cause inconnue « ${c.cause} »`);
      if (c.aller_a?.startsWith("fiche:")) {
        const cible = c.aller_a.slice(6);
        if (!fiches.has(cible)) alerte(`${ici} : renvoie vers la fiche « ${cible} », pas encore rédigée`);
      } else if (c.aller_a && !cibles.has(c.aller_a)) {
        err(`${ici} : conclusion vers « ${c.aller_a} », qui n'existe pas dans la fiche`);
      }
    }
  }
  for (const v of utilisees) if (!declarees.has(v)) err(`variable <${v}> utilisée dans une commande mais non déclarée dans variables`);
  for (const v of declarees) if (!utilisees.has(v)) alerte(`variable « ${v} » déclarée mais jamais utilisée`);

  // Références externes à la fiche
  for (const o of f.outils) if (!outils.has(o)) alerte(`outil « ${o} » sans fiche dans content/outils/ (à rédiger)`);
  for (const id of f.fiches_liees) if (!fiches.has(id)) alerte(`fiche liée « ${id} » pas encore rédigée`);
  if (!f.sources.some((s) => s.type === "officiel")) alerte("aucune source officielle");
}

// ---------------------------------------------------------------------------
// 4. Assemblage
// ---------------------------------------------------------------------------
const maintenant = new Date();
const publiees = [...fiches.values()].map((x) => x.fiche).filter((f) => f.statut !== "brouillon");

const fichesIndex = publiees
  .map((f) => {
    const delai = DELAI_REVERIFICATION[f.domaine] ?? DELAI_PAR_DEFAUT;
    return { ...f, a_reverifier: moisEcoules(f.derniere_verification, maintenant) >= delai };
  })
  .sort((a, b) => comparerFr(a.titre, b.titre));

const taxonomieIndex = taxonomie!.domaines
  .map((d) => {
    const sousDomaines = d.sous_domaines
      .map((s) => {
        const ici = `${d.id}/${s.id}`;
        const principales = publiees.filter((f) => `${f.domaine}/${f.sous_domaine}` === ici).map((f) => f.id);
        const renvois = publiees.filter((f) => f.apparait_aussi_dans.includes(ici)).map((f) => f.id);
        return { ...s, fiches: principales, renvois };
      })
      .sort((a, b) => comparerFr(a.titre, b.titre));
    const nb = sousDomaines.reduce((n, s) => n + s.fiches.length, 0);
    return { ...d, nb_fiches: nb, sous_domaines: sousDomaines };
  })
  .sort((a, b) => comparerFr(a.titre, b.titre));

const outilsIndex = [...outils.values()]
  .map((o) => ({ ...o, utilise_par: publiees.filter((f) => f.outils.includes(o.id)).map((f) => f.id) }))
  .sort((a, b) => comparerFr(a.nom, b.nom));

const index = {
  schema_version: SCHEMA_VERSION,
  genere_le: maintenant.toISOString(),
  nb_fiches: fichesIndex.length,
  taxonomie: taxonomieIndex,
  familles_outils: taxonomie!.familles_outils,
  environnements: environnements!,
  synonymes: synonymes!.groupes,
  fiches: fichesIndex,
  outils: outilsIndex,
};

// Index allégé pour la recherche du site : seulement ce qui sert à trouver une fiche.
const recherche = {
  schema_version: SCHEMA_VERSION,
  genere_le: index.genere_le,
  synonymes: index.synonymes,
  documents: fichesIndex.map((f) => ({
    id: f.id,
    titre: f.titre,
    resume: f.resume,
    domaine: f.domaine,
    sous_domaine: f.sous_domaine,
    niveau: f.niveau,
    critique: f.critique,
    droits: f.droits,
    statut: f.statut,
    environnements: f.environnements,
    temps_max: f.temps_estime.max,
    symptomes: f.symptomes.join(" "),
    erreurs: f.messages_erreur.map((m) => [m.texte, m.code].filter(Boolean).join(" ")).join(" "),
    tags: f.tags.join(" "),
  })),
};

terminer();

function terminer(): never {
  const verifSeule = process.argv.includes("--check");
  for (const a of alertes) console.warn(`  ALERTE  ${a}`);
  for (const e of erreurs) console.error(`  ERREUR  ${e}`);
  if (erreurs.length) {
    console.error(`\n✗ ${erreurs.length} erreur(s), ${alertes.length} alerte(s). Corriger les erreurs puis relancer.`);
    process.exit(1);
  }
  if (!verifSeule) {
    mkdirSync(SORTIE, { recursive: true });
    writeFileSync(join(SORTIE, "index.json"), JSON.stringify(index, null, 2) + "\n");
    writeFileSync(join(SORTIE, "search.json"), JSON.stringify(recherche) + "\n");
  }
  const brouillons = fiches.size - publiees.length;
  console.log(
    `\n✓ ${fiches.size} fiche(s) valide(s) dont ${publiees.length} publiée(s)` +
      (brouillons ? ` et ${brouillons} brouillon(s)` : "") +
      `, ${outils.size} outil(s), ${taxonomie!.domaines.length} domaines, ${alertes.length} alerte(s).` +
      (verifSeule ? "" : `\n  → ${rel(join(SORTIE, "index.json"))} et ${rel(join(SORTIE, "search.json"))}`),
  );
  process.exit(0);
}
