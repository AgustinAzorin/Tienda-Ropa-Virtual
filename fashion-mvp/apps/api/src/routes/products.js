import { Router } from 'express';
import { Product } from '../models/product.js';
import { ProductVariant } from '../models/productVariant.js';
import { z } from 'zod';
import { Op } from 'sequelize';
import {
  ProductCreateSchema,
  ProductUpdateSchema,
  ProductQuerySchema,
  IdParamSchema
} from '../schemas/productSchemas.js';

export const productsRouter = Router();

/**
 * POST /api/products
 */
productsRouter.post('/', async (req, res, next) => {
  try {
    const data = ProductCreateSchema.parse(req.body);

    const product = await Product.create(
      {
        ...data,
        variants: Array.isArray(data.variants) ? data.variants : [],
      },
      { include: [{ model: ProductVariant, as: 'variants' }] }
    );

    res.status(201).json(product);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    }
    next(err);
  }
});

/**
 * GET /api/products
 */
productsRouter.get('/', async (req, res, next) => {
  try {
    const { page, limit, category, style, season, q } = ProductQuerySchema.parse(req.query);
    const where = { is_active: true };

    if (category) where.category = category;
    if (style) where.style = style;
    if (season) where.season = season;
    if (q) where.name = { [Op.iLike]: `%${q}%` }; // <-- fix a Op.iLike

    const offset = (page - 1) * limit;
    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [{ model: ProductVariant, as: 'variants' }],
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({ items: rows, total: count, page, limit });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    }
    next(err);
  }
});

/**
 * GET /api/products/:id
 */
productsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = IdParamSchema.parse(req.params);

    const product = await Product.findByPk(id, {
      include: [{ model: ProductVariant, as: 'variants' }]
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

/**
 * PUT /api/products/:id
 */
productsRouter.put('/:id', async (req, res, next) => {
  const t = await Product.sequelize.transaction();
  try {
    const { id } = IdParamSchema.parse(req.params);
    const data = ProductUpdateSchema.parse(req.body);

    const product = await Product.findByPk(id, { transaction: t });
    if (!product) { await t.rollback(); return res.status(404).json({ error: 'Not found' }); }

    const { variants, ...fields } = data;
    await product.update(fields, { transaction: t });

    if (Array.isArray(variants)) {
      await ProductVariant.destroy({ where: { product_id: product.id }, transaction: t });
      for (const v of variants) {
        // revalida por si llegó algo raro suelto
        const vv = z.object({
          size: z.string().min(1),
          color_hex: z.string().regex(/^#([0-9a-fA-F]{6})$/).optional(),
          stock: z.number().int().min(0).default(0),
          price: z.number().int().min(0),
        }).parse(v);
        await ProductVariant.create({ ...vv, product_id: product.id }, { transaction: t });
      }
    }

    await t.commit();
    const fresh = await Product.findByPk(product.id, { include: [{ model: ProductVariant, as: 'variants' }] });
    res.json(fresh);
  } catch (err) {
    await t.rollback();
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    }
    next(err);
  }
});

/**
 * DELETE /api/products/:id
 */
productsRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: 'Not found' });

    await product.update({ is_active: false });
    res.status(204).send();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    }
    next(err);
  }
});
