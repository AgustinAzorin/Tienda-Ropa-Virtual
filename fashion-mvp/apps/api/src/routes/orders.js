// apps/api/src/routes/orders.js
const router = require('express').Router();
const { models, sequelize } = require('../db/sequelize');

router.post('/', async (req, res, next) => {
  const { userId, items } = req.body; // items: [{ variantId, quantity, price }]
  const t = await sequelize.transaction();
  try {
    const order = await models.Order.create({ userId, status: 'pending', totalPrice: 0 }, { transaction: t });

    let total = 0;
    for (const it of items) {
      total += Number(it.price) * Number(it.quantity);
      await models.OrderItem.create(
        { orderId: order.id, variantId: it.variantId, quantity: it.quantity, price: it.price },
        { transaction: t }
      );
    }

    await order.update({ totalPrice: total.toFixed(2) }, { transaction: t });
    await t.commit();

    const full = await models.Order.findByPk(order.id, { include: [{ model: models.OrderItem, as: 'items' }] });
    res.json(full);
  } catch (e) {
    await t.rollback();
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await models.Order.findByPk(req.params.id, {
      include: [{ model: models.OrderItem, as: 'items' }],
    });
    if (!order) return res.status(404).json({ error: 'not_found' });
    res.json(order);
  } catch (e) { next(e); }
});

module.exports = router;
