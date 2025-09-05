// apps/api/src/db/sequelize.js
// apps/api/src/db/sequelize.js
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'fashion',
  process.env.POSTGRES_USER || 'postgres',
  process.env.POSTGRES_PASSWORD || 'postgres',
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions:
      process.env.PGSSLMODE === 'require'
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
  }
);
