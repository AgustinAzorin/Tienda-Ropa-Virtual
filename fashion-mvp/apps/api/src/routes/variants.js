import { Router } from 'express';
import { z } from 'zod';
import { Product } from '../models/product.js';
import { ProductVariant } from '../models/productVariant.js';
import {
  VariantCreateSchema, VariantUpdateSchema, IdParamSchema, ProductIdParamSchema
} from '../schemas/variantSchemas.js';

export const variantsRouter = Router();

// Crear variant para un producto
variantsRouter.post('/products/:productId/variants', async (req, res, next) => {
  try {
    const { productId } = ProductIdParamSchema.parse(req.params);
    const body = VariantCreateSchema.parse(req.body);

    const product = await Product.findByPk(productId);
    if (!product || !product.is_active) return res.status(404).json({ error: 'Product not found' });

    const created = await ProductVariant.create({ ...body, product_id: productId });
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    next(err);
  }
});

// Listar variants de un producto
variantsRouter.get('/products/:productId/variants', async (req, res, next) => {
  try {
    const { productId } = ProductIdParamSchema.parse(req.params);
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const items = await ProductVariant.findAll({ where: { product_id: productId } });
    res.json({ items });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    next(err);
  }
});

// Obtener un variant por id
variantsRouter.get('/variants/:id', async (req, res, next) => {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const variant = await ProductVariant.findByPk(id);
    if (!variant) return res.status(404).json({ error: 'Not found' });
    res.json(variant);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    next(err);
  }
});

// Actualizar un variant
variantsRouter.put('/variants/:id', async (req, res, next) => {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const data = VariantUpdateSchema.parse(req.body);

    const variant = await ProductVariant.findByPk(id);
    if (!variant) return res.status(404).json({ error: 'Not found' });

    await variant.update(data);
    res.json(variant);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    next(err);
  }
});

// Eliminar un variant (físico)
variantsRouter.delete('/variants/:id', async (req, res, next) => {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const variant = await ProductVariant.findByPk(id);
    if (!variant) return res.status(404).json({ error: 'Not found' });

    await variant.destroy();
    res.status(204).send();
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    next(err);
  }
});
