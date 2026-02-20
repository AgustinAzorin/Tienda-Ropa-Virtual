import sharp from 'sharp';
import { supabaseAdmin } from './supabase/admin';

type StorageBucket = 'avatars' | 'products' | 'reviews' | 'posts' | 'models-3d';

/**
 * Uploads a file buffer to Supabase Storage and returns the public URL.
 */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Resizes and compresses an image before uploading (avatar, product, review images).
 * @param file     - ArrayBuffer from the incoming request
 * @param maxWidth - Target width in pixels (default 800)
 * @param quality  - JPEG/WebP quality 1-100 (default 85)
 */
export async function resizeAndUpload(
  file: ArrayBuffer,
  bucket: StorageBucket,
  path: string,
  maxWidth = 800,
  quality = 85,
): Promise<string> {
  const buffer = await sharp(Buffer.from(file))
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  return uploadFile(bucket, path, buffer, 'image/webp');
}

/** Deletes a file from Supabase Storage. */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  await supabaseAdmin.storage.from(bucket).remove([path]);
}
