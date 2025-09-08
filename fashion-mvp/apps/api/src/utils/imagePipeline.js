import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads'); // ya existe por tu setup

export async function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

// Procesa un buffer → webp optimizado. Devuelve { key, url, width, height, size, mime }
export async function processAndSaveWebp(buffer, baseNameNoExt) {
  await ensureDir(UPLOAD_ROOT);
  const filename = `${baseNameNoExt}-${Date.now()}.webp`;
  const abs = path.join(UPLOAD_ROOT, filename);

  const pipeline = sharp(buffer).rotate().webp({ quality: 82 });
  const { width, height, size } = await pipeline.toFile(abs);

  return {
    key: filename,
    url: `/uploads/${filename}`,
    width, height, size,
    mime: 'image/webp',
  };
}
