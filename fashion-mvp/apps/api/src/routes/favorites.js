import { Router } from 'express';
import { models } from '../models/registry.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Listar favoritos del usuario
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const user = await models.User.findByPk(req.user.id);
    const list = await user.getFavorites({ include: [{ model: models.ProductVariant, as: 'variants' }] });
    res.json(list);
  } catch (e) { next(e); }
});

// Agregar
router.post('/mine/:productId', requireAuth, async (req, res, next) => {
  try {
    await models.Favorite.findOrCreate({ where: { userId: req.user.id, productId: req.params.productId } });
    res.status(204).send();
  } catch (e) { next(e); }
});

// Quitar
router.delete('/mine/:productId', requireAuth, async (req, res, next) => {
  try {
    await models.Favorite.destroy({ where: { userId: req.user.id, productId: req.params.productId } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
