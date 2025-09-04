import { sequelize } from '../db/sequelize.js';
import '../models/product.js';
import '../models/productVariant.js';
import '../models/user.js'; 


export async function syncDB() {
  await sequelize.authenticate();
  // ⚠️ Solo en desarrollo: crea tablas si no existen
  await sequelize.sync({ alter: true });
}
