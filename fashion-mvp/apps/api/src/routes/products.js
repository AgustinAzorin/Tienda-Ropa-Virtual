import { Router } from 'express';
import { models } from '../models/registry.js';
import { z } from 'zod';
import {
  ProductCreateSchema,
  ProductUpdateSchema,
  ProductQuerySchema,
  IdParamSchema
} from '../schemas/productSchemas.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { Op, fn, col, literal } from 'sequelize';


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
// GET /api/products
productsRouter.get('/', async (req, res, next) => {
  try {
    const {
      page, limit, category, style, season, q,
      minPrice, maxPrice, sort
    } = ProductQuerySchema.parse(req.query);

    const where = { is_active: true };
    if (category) where.category = category;
    if (style) where.style = style;
    if (season) where.season = season;
    if (q) where.name = { [Op.iLike]: `%${q}%` };

    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const offset = (page - 1) * safeLimit;

    // include base
    const include = [
      { model: models.ProductImage, as: 'images' }
    ];

    // filtros/orden por precio requieren join con variants
    const variantWhere = {};
    let needJoin = false;
    if (minPrice != null) { variantWhere.price = { ...(variantWhere.price||{}), [Op.gte]: minPrice }; needJoin = true; }
    if (maxPrice != null) { variantWhere.price = { ...(variantWhere.price||{}), [Op.lte]: maxPrice }; needJoin = true; }

    if (needJoin || (sort && sort !== 'newest')) {
      include.push({
        model: models.ProductVariant,
        as: 'variants',
        attributes: [],
        required: true,
        where: Object.keys(variantWhere).length ? variantWhere : undefined
      });
    } else {
      include.push({ model: models.ProductVariant, as: 'variants' });
    }

    const attributes = { include: [[fn('MIN', col('variants.price')), 'minPrice']] };
    const group = ['Product.id'];

    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc')  order = [literal('"minPrice" ASC NULLS LAST')];
    if (sort === 'price_desc') order = [literal('"minPrice" DESC NULLS LAST')];

    const result = await models.Product.findAndCountAll({
      where,
      include,
      attributes,
      group,
      offset,
      limit: safeLimit,
      order
    });

    const rows = Array.isArray(result.rows) ? result.rows : result;
    const total = Array.isArray(result.count) ? result.count.length : result.count;

    res.json({ items: rows, total, page, limit: safeLimit });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    }
    next(err);
  }
});



/** GET /api/products/:id */
// GET /api/products/:id
productsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = IdParamSchema.parse(req.params);

    const product = await models.Product.findByPk(id, {
      include: [
        { model: models.ProductVariant, as: 'variants', include: [{ model: models.VariantImage, as: 'images' }] },
        { model: models.ProductImage, as: 'images' }
      ],
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
