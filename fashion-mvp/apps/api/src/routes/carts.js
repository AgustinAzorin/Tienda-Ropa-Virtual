import { Router } from 'express';
import { models, sequelize } from '../models/registry.js';
import { requireAuth } from '../middlewares/auth.js';
import { z } from 'zod';
import { CartItemUpsertSchema, VariantIdParamSchema } from '../schemas/cartSchemas.js';


const router = Router();

// Crea o devuelve carrito del usuario
router.post('/mine', requireAuth, async (req, res, next) => {
  try {
    let cart = await models.Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) cart = await models.Cart.create({ userId: req.user.id });
    const full = await models.Cart.findByPk(cart.id, { include: [{ model: models.CartItem, as: 'items', include: [{ model: models.ProductVariant, as: 'variant' }] }] });
    res.json(full);
  } catch (e) { next(e); }
});

// Agregar ítem
// POST /api/carts/mine/items  { variantId, quantity }
router.post('/mine/items', requireAuth, async (req, res, next) => {
  try {
    const { variantId, quantity } = CartItemUpsertSchema.parse(req.body);

    let cart = await models.Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) cart = await models.Cart.create({ userId: req.user.id });

    const [item, created] = await models.CartItem.findOrCreate({
      where: { cartId: cart.id, variantId },
      defaults: { quantity },
    });

    if (!created) await item.update({ quantity: item.quantity + quantity });

    const full = await models.Cart.findByPk(cart.id, {
      include: [{ model: models.CartItem, as: 'items', include: [{ model: models.ProductVariant, as: 'variant' }] }],
    });

    res.status(created ? 201 : 200).json(full);
  } catch (err) {
    next(err);
  }
});


// Eliminar ítem
router.delete('/mine/items/:itemId', requireAuth, async (req, res, next) => {
  try {
    const item = await models.CartItem.findByPk(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'not_found' });
    const cart = await models.Cart.findByPk(item.cartId);
    if (cart.userId !== req.user.id) return res.status(403).json({ error: 'forbidden' });
    await item.destroy();
    res.status(204).send();
  } catch (e) { next(e); }
});

// Vaciar carrito
router.delete('/mine', requireAuth, async (req, res, next) => {
  try {
    const cart = await models.Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(204).send();
    await models.CartItem.destroy({ where: { cartId: cart.id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
