// Gera public/images/fuji-cutout.webp a partir da hero-photo:
// remove o céu (tudo acima da linha da crista) e mantém a montanha/cidade
// opacas, para a camada de oclusão do hero (ARTX atrás do Fuji).
//
// Uso: node scripts/make-fuji-cutout.js

const sharp = require('sharp');
const path = require('path');

const SRC = path.join(__dirname, '..', 'public', 'images', 'hero-photo.webp');
const OUT = path.join(__dirname, '..', 'public', 'images', 'fuji-cutout.webp');
const DEBUG = process.env.DEBUG_MASK
  ? path.join(__dirname, '..', 'debug-mask.png')
  : null;

async function main() {
  const { data, info } = await sharp(SRC)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  const px = (x, y) => {
    const i = (y * W + x) * C;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const dist = (a, b) =>
    Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

  // Por coluna: desce do topo acompanhando o gradiente do céu (média móvel);
  // a crista é o primeiro desvio forte que persiste nas linhas seguintes.
  const maxY = Math.floor(H * 0.78); // abaixo disso é primeiro plano garantido
  const ridge = new Int32Array(W);

  for (let x = 0; x < W; x++) {
    let sky = px(x, 0).map(Number);
    for (let y = 1; y < 24; y++) {
      const p = px(x, y);
      sky = sky.map((v, k) => v * 0.9 + p[k] * 0.1);
    }

    let found = maxY;
    for (let y = 24; y < maxY; y++) {
      const p = px(x, y);
      const d = dist(p, sky);
      if (d > 55) {
        let hits = 0;
        for (let dy = 1; dy <= 12 && y + dy < H; dy++) {
          if (dist(px(x, y + dy), sky) > 45) hits++;
        }
        if (hits >= 9) {
          found = y;
          break;
        }
      } else if (d < 18) {
        sky = sky.map((v, k) => v * 0.94 + p[k] * 0.06);
      }
    }
    ridge[x] = found;
  }

  // Mediana de 5 colunas: tira ruído sem comer as árvores do horizonte.
  const smooth = new Int32Array(W);
  for (let x = 0; x < W; x++) {
    const win = [];
    for (let dx = -2; dx <= 2; dx++) {
      win.push(ridge[Math.min(W - 1, Math.max(0, x + dx))]);
    }
    win.sort((a, b) => a - b);
    smooth[x] = win[2];
  }

  // Canal alfa: transparente acima da crista, rampa curta de 4px, opaco abaixo.
  const out = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const si = (y * W + x) * C;
      const di = (y * W + x) * 4;
      out[di] = data[si];
      out[di + 1] = data[si + 1];
      out[di + 2] = data[si + 2];
      const rel = y - smooth[x];
      out[di + 3] = rel < 0 ? 0 : rel >= 4 ? 255 : Math.round(((rel + 1) / 5) * 255);
    }
  }

  await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .webp({ quality: 88, alphaQuality: 90, effort: 5 })
    .toFile(OUT);
  console.log(`ok: ${OUT} (${W}x${H})`);

  if (DEBUG) {
    await sharp(out, { raw: { width: W, height: H, channels: 4 } })
      .resize(1200)
      .png()
      .toFile(DEBUG);
    console.log(`debug: ${DEBUG}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
