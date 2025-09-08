import dotenv from 'dotenv';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { requestId } from './middlewares/requestId.js';

import healthRouter from './routes/health.js';
import { productsRouter } from './routes/products.js';
import { variantsRouter } from './routes/variants.js';
import { uploadsRouter } from './routes/uploads.js';
import { authRouter } from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import authRefreshRouter from './routes/auth.refresh.js';
import passwordRouter from './routes/password.reset.js';
import { scoreRouter } from './routes/score.js'; // <-- añadir import
import { syncDB } from './startup/sync.js';
import cartsRouter from './routes/carts.js';
import favoritesRouter from './routes/favorites.js';

dotenv.config({ path: '../../.env' }); // carga .env desde la raíz

const app = express();
app.set('version', process.env.APP_VERSION || process.env.npm_package_version || 'dev');
app.set('trust proxy', 1);

// Seguridad base
app.use(helmet());

// CORS con allowlist por env (CSV). Si no hay lista, permitir todo en dev.
const ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ORIGINS.length === 0 || ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error('CORS not allowed'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(requestId);

// Logging estructurado
app.use(
  pinoHttp({
    customProps: (req) => ({ requestId: req.id, userId: req.user?.id || null }),
    serializers: {
      req(req) { return { method: req.method, url: req.url, id: req.id }; },
      res(res) { return { statusCode: res.statusCode }; },
    },
  })
);

// Archivos estáticos locales (dev)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rate limit en rutas sensibles
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const max = Number(process.env.RATE_LIMIT_MAX || 100);
const sensitiveLimiter = rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth', sensitiveLimiter);
app.use('/api/password', sensitiveLimiter);
app.use('/api/uploads', sensitiveLimiter);

// Rutas
app.use('/api/health', healthRouter);
app.use('/api/products', productsRouter);
app.use('/api', variantsRouter);
app.use('/api', uploadsRouter);
app.use('/api', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRefreshRouter);
app.use('/api/password', passwordRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/favorites', favoritesRouter);

app.use('/api', scoreRouter); // <-- montar scoreRouter (colócalo donde prefieras)

const port = process.env.PORT || 3000;

console.log('[DB CFG]', {
  user: process.env.POSTGRES_USER,
  db: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  pw_len: process.env.POSTGRES_PASSWORD?.length
});

syncDB()
  .then(() => app.listen(port, () => console.log(`API listening on ${port}`)))
  .catch((err) => {
    console.error('DB init error:', err);
    process.exit(1);
  });
