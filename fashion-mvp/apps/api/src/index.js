import dotenv from 'dotenv';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import healthRouter from './routes/health.js';
import { productsRouter } from './routes/products.js';
import { syncDB } from './startup/sync.js';
dotenv.config({ path: '../../.env' }); // carga el .env de la raíz

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/products', productsRouter);


const port = process.env.PORT || 3000;

syncDB()
  .then(() => {
    app.listen(port, () => console.log(`API listening on ${port}`));
  })
  .catch((err) => {
    console.error('DB init error:', err);
    process.exit(1);
  });
