// Découpe un inventaire en lots de rédaction (une liste d'ids par fichier).
// Usage : node scripts/faire-lots.cjs <domaine> <priorites,> <taille> <sous-domaine>...
// Exemple : node scripts/faire-lots.cjs microsoft-365 frequent,critique 10 outlook intune
// Option : FORMAT=express (ou complete) devant la commande pour ne prendre qu'un format.
// Les lots sont écrits dans .cache/lots/ (non versionné). Les problèmes déjà rédigés
// (etat: redigee ou fiche existante) et ceux déjà présents dans un lot sont ignorés.
const y = require("yaml"), fs = require("fs"), path = require("path");
const racine = path.join(__dirname, "..");
const [domaine, prios, taille, ...sds] = process.argv.slice(2);
if (!domaine || !prios || !taille || !sds.length) {
  console.error("Usage : node scripts/faire-lots.cjs <domaine> <priorites,> <taille> <sous-domaine>...");
  process.exit(1);
}
const P = prios.split(","), N = +taille;
const dir = path.join(racine, "docs/inventaire", domaine);
const out = path.join(racine, ".cache/lots");
fs.mkdirSync(out, { recursive: true });
const existe = new Set();
for (const d of fs.readdirSync(path.join(racine, "content/fiches")))
  for (const f of fs.readdirSync(path.join(racine, "content/fiches", d))) existe.add(f.replace(".yaml", ""));
const deja = new Set();
for (const f of fs.readdirSync(out))
  for (const l of fs.readFileSync(path.join(out, f), "utf8").split("\n")) if (l.startsWith("- ")) deja.add(l.split(" ")[1]);
let n = 0;
for (const sd of sds) {
  const d = y.parse(fs.readFileSync(path.join(dir, sd + ".yaml"), "utf8"));
  const L = d.problemes.filter((p) => P.includes(p.priorite) && (!process.env.FORMAT || p.format === process.env.FORMAT) && p.etat !== "redigee" && !existe.has(p.id) && !deja.has(p.id));
  for (let i = 0; i < L.length; i += N) {
    let k = 1, nom;
    do nom = `${sd}-${String(k++).padStart(2, "0")}.txt`; while (fs.existsSync(path.join(out, nom)));
    fs.writeFileSync(path.join(out, nom),
      `inventaire: docs/inventaire/${domaine}/${sd}.yaml\ndomaine: ${domaine}\nsous_domaine: ${sd}\nids:\n` +
      L.slice(i, i + N).map((p) => `- ${p.id} (${p.format}, ${p.priorite})`).join("\n") + "\n");
    console.log(nom, Math.min(N, L.length - i)); n++;
  }
}
console.log("lots créés :", n);
