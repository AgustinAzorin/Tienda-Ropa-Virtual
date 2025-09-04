// apps/api/src/routes/categories.js
const router = require('express').Router();
const { models } = require('../db/sequelize');

router.post('/', async (req, res, next) => {
  try { const cat = await models.Category.create(req.body); res.json(cat); }
  catch (e) { next(e); }
});

router.get('/', async (_req, res, next) => {
  try { const list = await models.Category.findAll(); res.json(list); }
  catch (e) { next(e); }
});

module.exports = router;
