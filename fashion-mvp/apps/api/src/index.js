import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { router as healthRouter } from './routes/health.js';
import { scoreRouter } from './routes/score.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api', scoreRouter);   // <-- aquí

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on ${port}`));
