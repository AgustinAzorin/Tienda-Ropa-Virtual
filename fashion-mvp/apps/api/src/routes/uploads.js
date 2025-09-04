import { Router } from 'express';
import { upload } from '../middlewares/upload.js';

export const uploadsRouter = Router();

// POST /api/uploads  (form-data key: image)
uploadsRouter.post('/uploads', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});
