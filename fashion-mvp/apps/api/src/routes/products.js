import { Router } from 'express';
import { Product } from '../models/product.js';
import { ProductVariant } from '../models/productVariant.js';
import { Op } from 'sequelize';


export const productsRouter = Router();

/**
 * POST /api/products
 * Crea un producto con (opcional) variants
 */
productsRouter.post('/', async (req, res, next) => {
  try {
    const { name, description, base_color_hex, style, occasion, season, category, material, variants } = req.body;

    const product = await Product.create(
      {
        name, description, base_color_hex, style, occasion, season, category, material,
        variants: Array.isArray(variants) ? variants : []
      },
      { include: [{ model: ProductVariant, as: 'variants' }] }
    );

    res.status(201).json(product);
  } catch (err) { next(err); }
});

/**
 * GET /api/products
 * Lista con filtros simples + paginación
 */
productsRouter.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, style, season, q } = req.query;
    const where = { is_active: true };

    if (category) where.category = category;
    if (style) where.style = style;
    if (season) where.season = season;
    if (q) where.name = { [Op.iLike]: `%${q}%` };


    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [{ model: ProductVariant, as: 'variants' }],
      offset,
      limit: Number(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({ items: rows, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
});

/**
 * GET /api/products/:id
 */
productsRouter.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: ProductVariant, as: 'variants' }]
    });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) { next(err); }
});

/**
 * PUT /api/products/:id
 * Actualiza campos del producto y (opcional) reemplaza sus variants
 */
productsRouter.put('/:id', async (req, res, next) => {
  const t = await Product.sequelize.transaction();
  try {
    const { name, description, base_color_hex, style, occasion, season, category, material, variants } = req.body;

    const product = await Product.findByPk(req.params.id, { transaction: t });
    if (!product) { await t.rollback(); return res.status(404).json({ error: 'Not found' }); }

    await product.update({ name, description, base_color_hex, style, occasion, season, category, material }, { transaction: t });

    if (Array.isArray(variants)) {
      // estrategia simple: borrar y volver a crear (para MVP)
      await ProductVariant.destroy({ where: { product_id: product.id }, transaction: t });
      for (const v of variants) {
        await ProductVariant.create({ ...v, product_id: product.id }, { transaction: t });
      }
    }

    await t.commit();
    const fresh = await Product.findByPk(product.id, { include: [{ model: ProductVariant, as: 'variants' }] });
    res.json(fresh);
  } catch (err) { await t.rollback(); next(err); }
});

/**
 * DELETE /api/products/:id
 * Borrado lógico (is_active = false) para no perder historial
 */
productsRouter.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });

    await product.update({ is_active: false });
    res.status(204).send();
  } catch (err) { next(err); }
});
