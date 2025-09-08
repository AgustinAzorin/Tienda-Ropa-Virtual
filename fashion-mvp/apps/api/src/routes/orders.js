import { Router } from 'express';
import { z } from 'zod';
import { models } from '../models/registry.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import {
  CreateFromCartSchema,
  OrderIdParamSchema,
  OrderStatusUpdateSchema
} from '../schemas/orderSchemas.js';

const router = Router();

/** POST /api/orders/from-cart */
router.post('/from-cart', requireAuth, async (req, res, next) => {
  const t = await models.Order.sequelize.transaction();
  try {
    const body = CreateFromCartSchema.parse(req.body);

    const cart = await models.Cart.findOne({
      where: { userId: req.user.id },
      include: [{ model: models.CartItem, as: 'items', include: [{ model: models.ProductVariant, as: 'variant' }] }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!cart || !cart.items?.length) {
      await t.rollback();
      return res.status(400).json({ error: 'cart_empty' });
    }

    const total = cart.items.reduce((acc, it) => acc + (it.variant.price * it.quantity), 0);

    const order = await models.Order.create({
      userId: req.user.id,
      status: 'pending',
      total_cents: total,
      shipping_address_json: body.shippingAddress ? JSON.stringify(body.shippingAddress) : null,
      notes: body.notes ?? null,
    }, { transaction: t });

    const rows = cart.items.map(it => ({
      orderId: order.id,
      productId: it.variant.product_id,
      variantId: it.variant.id,
      unit_price: it.variant.price,
      quantity: it.quantity,
      line_total: it.variant.price * it.quantity,
    }));
    await models.OrderItem.bulkCreate(rows, { transaction: t });

    await models.CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    await t.commit();

    const fresh = await models.Order.findByPk(order.id, {
      include: [{ model: models.OrderItem, as: 'items' }],
    });
    res.status(201).json(fresh);
  } catch (err) {
    await t.rollback();
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    }
    next(err);
  }
});

/** GET /api/orders/mine */
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const items = await models.Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: models.OrderItem, as: 'items' }],
    });
    res.json(items);
  } catch (e) { next(e); }
});

/** GET /api/orders/:id */
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = OrderIdParamSchema.parse(req.params);
    const order = await models.Order.findByPk(id, {
      include: [{ model: models.OrderItem, as: 'items' }],
    });
    if (!order) return res.status(404).json({ error: 'not_found' });

    const canView = req.user.role === 'admin' || req.user.role === 'seller' || order.userId === req.user.id;
    if (!canView) return res.status(403).json({ error: 'forbidden' });

    res.json(order);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    next(err);
  }
});

/** PUT /api/orders/:id/status  (admin/seller) */
router.put('/:id/status', requireAuth, requireRole('admin', 'seller'), async (req, res, next) => {
  try {
    const { id } = OrderIdParamSchema.parse(req.params);
    const { status } = OrderStatusUpdateSchema.parse(req.body);

    const order = await models.Order.findByPk(id);
    if (!order) return res.status(404).json({ error: 'not_found' });

    await order.update({ status });
    res.json(order);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    next(err);
  }
});

export default router;
