import { Router } from 'express';
import { models, sequelize } from '../models/registry.js';
import { requireAuth } from '../middlewares/auth.js';

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
router.post('/mine/items', requireAuth, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { variantId, quantity } = req.body;
    let cart = await models.Cart.findOne({ where: { userId: req.user.id }, transaction: t, lock: t.LOCK.UPDATE });
    if (!cart) cart = await models.Cart.create({ userId: req.user.id }, { transaction: t });

    const existing = await models.CartItem.findOne({ where: { cartId: cart.id, variantId }, transaction: t, lock: t.LOCK.UPDATE });
    if (existing) await existing.update({ quantity: existing.quantity + Number(quantity || 1) }, { transaction: t });
    else await models.CartItem.create({ cartId: cart.id, variantId, quantity: Number(quantity || 1) }, { transaction: t });

    await t.commit();
    const full = await models.Cart.findByPk(cart.id, { include: [{ model: models.CartItem, as: 'items', include: [{ model: models.ProductVariant, as: 'variant' }] }] });
    res.json(full);
  } catch (e) { await t.rollback(); next(e); }
});

// Actualizar cantidad
router.put('/mine/items/:itemId', requireAuth, async (req, res, next) => {
  try {
    const item = await models.CartItem.findByPk(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'not_found' });
    const cart = await models.Cart.findByPk(item.cartId);
    if (cart.userId !== req.user.id) return res.status(403).json({ error: 'forbidden' });
    await item.update({ quantity: Number(req.body.quantity) });
    res.json(item);
  } catch (e) { next(e); }
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
