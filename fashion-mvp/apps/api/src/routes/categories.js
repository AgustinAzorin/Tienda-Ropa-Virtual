import { Router } from 'express';
import { models } from '../models/registry.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try { const cat = await models.Category.create(req.body); res.json(cat); }
  catch (e) { next(e); }
});

router.get('/', async (_req, res, next) => {
  try { const list = await models.Category.findAll(); res.json(list); }
  catch (e) { next(e); }
});

export default router;
