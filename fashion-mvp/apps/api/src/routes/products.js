import { Router } from 'express';
import { models } from '../models/registry.js';
import { z } from 'zod';
import { Op } from 'sequelize';
import {
  ProductCreateSchema,
  ProductUpdateSchema,
  ProductQuerySchema,
  IdParamSchema
} from '../schemas/productSchemas.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

export const productsRouter = Router();

/** POST /api/products */
productsRouter.post(
  '/',
  requireAuth,
  requireRole('seller', 'admin'),
  async (req, res, next) => {
    try {
      const data = ProductCreateSchema.parse(req.body);

      const product = await models.Product.create(
        {
          ...data,
          // no anides el array: debe ser [] o [obj,...], NO [ [] ]
          variants: Array.isArray(data.variants) ? data.variants : [],
        },
        { include: [{ model: models.ProductVariant, as: 'variants' }] }
      );

      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'ValidationError', issues: err.issues });
      }
      next(err);
    }
  }
);

/** GET /api/products */
productsRouter.get('/', async (req, res, next) => {
  try {
    const { page, limit, category, style, season, q } =
      ProductQuerySchema.parse(req.query);
    const where = { is_active: true };

    if (category) where.category = category;
    if (style) where.style = style;
    if (season) where.season = season;
    if (q) where.name = { [Op.iLike]: `%${q}%` };

    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const offset = (page - 1) * safeLimit;

    const { rows, count } = await models.Product.findAndCountAll({
      where,
      include: [{ model: models.ProductVariant, as: 'variants' }],
      offset,
      limit: safeLimit,
      order: [['createdAt', 'DESC']],
    });

    res.json({ items: rows, total: count, page, limit: safeLimit });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    }
    next(err);
  }
});

/** GET /api/products/:id */
productsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = IdParamSchema.parse(req.params);

    const product = await models.Product.findByPk(id, {
      include: [{ model: models.ProductVariant, as: 'variants' }],
    });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    }
    next(err);
  }
});

/** PUT /api/products/:id */
productsRouter.put(
  '/:id',
  requireAuth,
  requireRole('seller', 'admin'),
  async (req, res, next) => {
    const t = await models.Product.sequelize.transaction();
    try {
      const { id } = IdParamSchema.parse(req.params);
      const data = ProductUpdateSchema.parse(req.body);

      const product = await models.Product.findByPk(id, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(404).json({ error: 'Not found' });
      }

      const { variants, ...fields } = data;
      await product.update(fields, { transaction: t });

      if (Array.isArray(variants)) {
        await models.ProductVariant.destroy({ where: { product_id: product.id }, transaction: t });
        for (const v of variants) {
          const vv = z.object({
            size: z.string().min(1),
            color_hex: z.string().regex(/^#([0-9a-fA-F]{6})$/).optional(),
            stock: z.number().int().min(0).default(0),
            price: z.number().int().min(0), // si migrás a DECIMAL, cambiá schema/modelo
          }).parse(v);
          await models.ProductVariant.create({ ...vv, product_id: product.id }, { transaction: t });
        }
      }

      await t.commit();
      const fresh = await models.Product.findByPk(product.id, {
        include: [{ model: models.ProductVariant, as: 'variants' }],
      });
      res.json(fresh);
    } catch (err) {
      await t.rollback();
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'ValidationError', issues: err.issues });
      }
      next(err);
    }
  }
);

/** DELETE /api/products/:id */
productsRouter.delete(
  '/:id',
  requireAuth,
  requireRole('seller', 'admin'),
  async (req, res, next) => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const product = await models.Product.findByPk(id);
      if (!product) return res.status(404).json({ error: 'Not found' });

      await product.update({ is_active: false });
      res.status(204).send();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'ValidationError', issues: err.issues });
      }
      next(err);
    }
  }
);
