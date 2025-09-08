import { Router } from 'express';
import { upload } from '../middlewares/upload.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { uploadMem } from '../middlewares/upload.js';
import { processAndSaveWebp } from '../utils/imagePipeline.js';
import { z } from 'zod';



export const uploadsRouter = Router();

// POST /api/uploads  (form-data key: image)
// POST /api/uploads/products/:id/images  (form-data: images[])
uploadsRouter.post(
  '/uploads/products/:id/images',
  requireAuth,
  requireRole('seller', 'admin'),
  uploadMem.array('images', 8),
  async (req, res, next) => {
    try {
      const id = z.coerce.number().int().positive().parse(req.params.id);
      const product = await req.app.get('models').Product.findByPk(id); // o import models
      const { models } = await import('../models/registry.js');
      if (!product) return res.status(404).json({ error: 'product_not_found' });
      if (!req.files?.length) return res.status(400).json({ error: 'no_files' });

      const saved = [];
      for (const f of req.files) {
        const meta = await processAndSaveWebp(f.buffer, pathParseBase(f.originalname));
        const row = await models.ProductImage.create({ product_id: id, ...meta });
        saved.push(row);
      }
      res.status(201).json({ items: saved });
    } catch (err) { next(err); }
  }
);

// POST /api/uploads/variants/:id/images  (form-data: images[])
uploadsRouter.post(
  '/uploads/variants/:id/images',
  requireAuth,
  requireRole('seller', 'admin'),
  uploadMem.array('images', 8),
  async (req, res, next) => {
    try {
      const id = z.coerce.number().int().positive().parse(req.params.id);
      const { models } = await import('../models/registry.js');
      const variant = await models.ProductVariant.findByPk(id);
      if (!variant) return res.status(404).json({ error: 'variant_not_found' });
      if (!req.files?.length) return res.status(400).json({ error: 'no_files' });

      const saved = [];
      for (const f of req.files) {
        const meta = await processAndSaveWebp(f.buffer, pathParseBase(f.originalname));
        const row = await models.VariantImage.create({ variant_id: id, ...meta });
        saved.push(row);
      }
      res.status(201).json({ items: saved });
    } catch (err) { next(err); }
  }
);

// DELETE /api/uploads/products/:productId/images/:imageId
uploadsRouter.delete(
  '/uploads/products/:productId/images/:imageId',
  requireAuth,
  requireRole('seller', 'admin'),
  async (req, res, next) => {
    try {
      const { productId, imageId } = {
        productId: z.coerce.number().int().positive().parse(req.params.productId),
        imageId: z.coerce.number().int().positive().parse(req.params.imageId),
      };
      const { models } = await import('../models/registry.js');
      const row = await models.ProductImage.findOne({ where: { id: imageId, product_id: productId } });
      if (!row) return res.status(404).json({ error: 'image_not_found' });

      await safeUnlink(row.key);
      await row.destroy();
      res.status(204).send();
    } catch (err) { next(err); }
  }
);

// DELETE /api/uploads/variants/:variantId/images/:imageId
uploadsRouter.delete(
  '/uploads/variants/:variantId/images/:imageId',
  requireAuth,
  requireRole('seller', 'admin'),
  async (req, res, next) => {
    try {
      const { variantId, imageId } = {
        variantId: z.coerce.number().int().positive().parse(req.params.variantId),
        imageId: z.coerce.number().int().positive().parse(req.params.imageId),
      };
      const { models } = await import('../models/registry.js');
      const row = await models.VariantImage.findOne({ where: { id: imageId, variant_id: variantId } });
      if (!row) return res.status(404).json({ error: 'image_not_found' });

      await safeUnlink(row.key);
      await row.destroy();
      res.status(204).send();
    } catch (err) { next(err); }
  }
);

// util local
import fs from 'fs';
import path from 'path';
function pathParseBase(original) {
  const base = path.parse(original).name.replace(/\s+/g, '-').toLowerCase();
  return base || 'img';
}
async function safeUnlink(key) {
  const abs = path.join(process.cwd(), 'uploads', key);
  fs.existsSync(abs) && fs.unlinkSync(abs);
}
