// src/startup/sync.js
import { sequelize } from '../models/registry.js'; // <-- único import que además ejecuta associate()

export async function syncDB() {
  await sequelize.authenticate();
  const isDev = process.env.NODE_ENV !== 'production';
  await sequelize.sync({ alter: isDev });
}
