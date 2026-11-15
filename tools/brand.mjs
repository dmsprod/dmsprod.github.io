/**
 * Prépare les fichiers de la charte à partir de brand/source/ (outillage jetable de la maquette).
 *
 *   node tools/brand.mjs
 *
 * Les logos fournis sont des JPG dont le « fond transparent » est un damier incrusté dans l'image.
 * On le retire par remplissage depuis les bords (pixels clairs et peu saturés), puis on adoucit le contour.
 * À remplacer dès que possible par un vrai PNG transparent ou un SVG fourni par l'auteur du logo.
 *
 * Sorties :
 *   src/assets/brand/logo.png             écusson plein détouré (optimisé ensuite par Astro)
 *   src/assets/brand/banniere-scene.jpg   bannière d'accueil (Astro génère AVIF/WebP aux bonnes tailles)
 *   public/favicon-32.png, public/apple-touch-icon.png, public/og-image.jpg
 */
import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';

const SRC = 'brand/source';
const ASSETS = 'src/assets/brand';
await mkdir(ASSETS, { recursive: true });

/** Fond = damier : pixel clair et quasi gris. */
const isBackground = (r, g, b) => Math.min(r, g, b) > 190 && Math.max(r, g, b) - Math.min(r, g, b) < 28;

async function cutout(file) {
  const { data, info } = await sharp(`${SRC}/${file}`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const bg = new Uint8Array(w * h); // 1 = fond
  const stack = [];
  const push = (x, y) => {
    const p = y * w + x;
    if (bg[p]) return;
    const i = p * 3;
    if (!isBackground(data[i], data[i + 1], data[i + 2])) return;
    bg[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const p = stack.pop(), x = p % w, y = (p / w) | 0;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
  // On ronge 2 px de plus pour supprimer le liseré clair laissé par l'anticrénelage sur le damier.
  let mask = bg;
  for (let pass = 0; pass < 2; pass++) {
    const next = mask.slice();
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      if (!mask[p] && (mask[p - 1] || mask[p + 1] || mask[p - w] || mask[p + w])) next[p] = 1;
    }
    mask = next;
  }
  // RGBA construit à la main ; alpha adouci par une moyenne 3 x 3 (contour anticrénelé).
  const rgba = Buffer.alloc(w * h * 4);
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = y * w + x;
    let sum = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      sum += mask[yy * w + xx] ? 0 : 255; n++;
    }
    const a = Math.round(sum / n);
    rgba[p * 4] = data[p * 3]; rgba[p * 4 + 1] = data[p * 3 + 1]; rgba[p * 4 + 2] = data[p * 3 + 2]; rgba[p * 4 + 3] = a;
    if (a > 0) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  }
  return sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png()
    .toBuffer();
}

const logo = await cutout('logo-ecusson-plein.jpg');
await sharp(logo).resize({ height: 640 }).png({ compressionLevel: 9 }).toFile(`${ASSETS}/logo.png`);

await copyFile(`${SRC}/banniere-scene.jpg`, `${ASSETS}/banniere-scene.jpg`);

// Icônes : écusson centré sur fond noir (lisible dans les onglets clairs comme sombres).
const square = async (size, pad, bg) => {
  const inner = await sharp(logo).resize({ width: size - pad * 2, height: size - pad * 2, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } }).composite([{ input: inner }]).png();
};
await (await square(32, 1, { r: 0, g: 0, b: 0, alpha: 0 })).toFile('public/favicon-32.png');
await (await square(180, 14, { r: 11, g: 10, b: 9, alpha: 1 })).toFile('public/apple-touch-icon.png');

// Image de partage (Open Graph) : 1200 x 630, recadrée au centre de la bannière de scène.
await sharp(`${SRC}/banniere-scene.jpg`).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toFile('public/og-image.jpg');

// Logos des groupes : centrés sur un fond noir commun en 2:1 (1200 x 600), pour des cartes homogènes.
// Distorted Memory : logo découpé en haut de l'affiche. Stoneheart : logo complet.
const groupLogo = async (input, extract, out) => {
  let img = sharp(`${SRC}/groupes/${input}`);
  if (extract) img = img.extract(extract);
  const inner = await img.resize({ width: 1060, height: 480, fit: 'inside' }).toBuffer();
  await sharp({ create: { width: 1200, height: 600, channels: 3, background: '#000' } })
    .composite([{ input: inner, gravity: 'center' }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(`public/uploads/${out}`);
};
await groupLogo('distorted-memory-affiche.jpg', { left: 60, top: 40, width: 903, height: 325 }, 'groupe-distorted-memory.jpg');
await groupLogo('stoneheart-logo.jpg', null, 'groupe-stoneheart.jpg');

console.log('Charte générée.');
