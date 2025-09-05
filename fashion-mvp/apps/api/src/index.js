import dotenv from 'dotenv';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import healthRouter from './routes/health.js';
import { productsRouter } from './routes/products.js';
import { variantsRouter } from './routes/variants.js';
import { uploadsRouter } from './routes/uploads.js';
import { authRouter } from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import authRefreshRouter from './routes/auth.refresh.js';
import passwordRouter from './routes/password.reset.js';
import { syncDB } from './startup/sync.js';

dotenv.config({ path: '../../.env' }); // carga .env desde la raíz

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/health', healthRouter);
app.use('/api/products', productsRouter);
app.use('/api', variantsRouter);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api', uploadsRouter);
app.use('/api', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRefreshRouter);
app.use('/api/password', passwordRouter);

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
