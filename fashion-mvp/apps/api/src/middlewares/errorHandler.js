// Manejo centralizado de errores
import { ZodError } from 'zod';

export function errorHandler(err, _req, res, _next) {
  // Validación Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'ValidationError',
      issues: err.issues,
    });
  }

  // Multer / subida
  if (err && err.message === 'Formato no soportado') {
    return res.status(400).json({ error: 'UnsupportedMediaType' });
  }

  // JWT inválido ya responde el middleware, pero por seguridad:
  if (err && err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'InvalidToken' });
  }

  // Sequelize errores comunes
  if (err && err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({ error: 'FKConstraint' });
  }
  if (err && err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'UniqueConstraint', detail: err.errors?.map(e => e.message) });
  }

  // Fallback
  const status = err.status || 500;
  return res.status(status).json({
    error: err.code || 'InternalServerError',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
}
