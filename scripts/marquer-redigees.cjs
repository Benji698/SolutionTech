// Passe à « etat: redigee » les entrées d'inventaire dont la fiche existe dans content/fiches/,
// puis affiche le bilan par inventaire. Modifie les fichiers ligne par ligne (les commentaires sont gardés).
// Usage : node scripts/marquer-redigees.cjs
const fs = require("fs"), path = require("path");
const racine = path.join(__dirname, "..");
const existe = new Set();
for (const d of fs.readdirSync(path.join(racine, "content/fiches")))
  for (const f of fs.readdirSync(path.join(racine, "content/fiches", d))) existe.add(f.replace(".yaml", ""));
const inv = path.join(racine, "docs/inventaire");
let total = 0, faites = 0;
for (const dom of fs.readdirSync(inv)) {
  const dd = path.join(inv, dom);
  if (!fs.statSync(dd).isDirectory()) continue;
  for (const f of fs.readdirSync(dd).filter((x) => x.endsWith(".yaml"))) {
    const p = path.join(dd, f);
    let id = null, nb = 0, red = 0, maj = 0;
    const lignes = fs.readFileSync(p, "utf8").split("\n").map((l) => {
      const m = l.match(/^\s*- id: ["']?([a-z0-9-]+)["']?\s*$/);
      if (m) { id = m[1]; nb++; }
      if (/^\s+etat: /.test(l) && id) {
        if (existe.has(id) && /a-rediger/.test(l)) { l = l.replace("a-rediger", "redigee"); maj++; }
        if (/redigee/.test(l)) red++;
      }
      return l;
    });
    if (maj) fs.writeFileSync(p, lignes.join("\n"));
    console.log(`${dom}/${f} : ${red}/${nb} rédigés${maj ? ` (+${maj})` : ""}`);
    total += nb; faites += red;
  }
}
console.log(`Total : ${faites}/${total} problèmes rédigés`);
