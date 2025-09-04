const router = require('express').Router();
const { models } = require('../db/sequelize');

router.post('/', async (req, res, next) => {
  try { res.json(await models.Tag.create({ name: req.body.name })); }
  catch (e) { next(e); }
});

router.get('/', async (_req, res, next) => {
  try { res.json(await models.Tag.findAll()); }
  catch (e) { next(e); }
});

router.post('/:productId/attach', async (req, res, next) => {
  try {
    const { tagIds } = req.body; // [1,2,3]
    const p = await models.Product.findByPk(req.params.productId);
    if (!p) return res.status(404).json({ error: 'not_found' });
    await p.setTags(tagIds); // reemplaza; usa addTags si querés acumular
    const full = await models.Product.findByPk(p.id, { include: [{ model: models.Tag, as: 'tags' }] });
    res.json(full);
  } catch (e) { next(e); }
});

module.exports = router;
