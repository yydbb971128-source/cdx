import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesRoot = path.resolve(__dirname, '..', '..', 'images');

const JPEG_QUALITY = 76;
const PNG_PALETTE_QUALITY = 72;

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full);
    else if (/\.(jpe?g)$/i.test(e.name)) await compressJpeg(full);
    else if (/\.png$/i.test(e.name)) await compressPng(full);
  }
}

async function replaceIfSmaller(srcPath, tmpPath) {
  const oldSz = (await fs.promises.stat(srcPath)).size;
  const newSz = (await fs.promises.stat(tmpPath)).size;
  if (newSz < oldSz) {
    await fs.promises.rename(tmpPath, srcPath);
    const pct = (((oldSz - newSz) / oldSz) * 100).toFixed(1);
    console.log(`OK ${path.relative(imagesRoot, srcPath)}  ${oldSz} → ${newSz} (-${pct}%)`);
  } else {
    await fs.promises.unlink(tmpPath);
    console.log(`SKIP ${path.relative(imagesRoot, srcPath)} (compressed not smaller)`);
  }
}

async function compressJpeg(filePath) {
  const tmp = filePath + '.~tmp';
  try {
    await sharp(filePath, { failOn: 'none' })
      .rotate()
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(tmp);
    await replaceIfSmaller(filePath, tmp);
  } catch (err) {
    try {
      await fs.promises.unlink(tmp);
    } catch {}
    console.error(`ERR ${filePath}:`, err.message);
  }
}

async function compressPng(filePath) {
  const tmp = filePath + '.~tmp';
  const input = sharp(filePath, { failOn: 'none' }).rotate();
  try {
    await input
      .clone()
      .png({ compressionLevel: 9, palette: true, quality: PNG_PALETTE_QUALITY, effort: 10 })
      .toFile(tmp);
  } catch {
    try {
      await fs.promises.unlink(tmp).catch(() => {});
    } catch {}
    try {
      await sharp(filePath, { failOn: 'none' })
        .rotate()
        .png({ compressionLevel: 9, effort: 10 })
        .toFile(tmp);
    } catch (err) {
      console.error(`ERR ${filePath}:`, err.message);
      return;
    }
  }
  await replaceIfSmaller(filePath, tmp);
}

console.log('Compressing images under:', imagesRoot);
await walk(imagesRoot);
console.log('Done.');
