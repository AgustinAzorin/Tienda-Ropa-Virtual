import { sequelize } from '../db/sequelize.js';

// modelos base
import '../models/product.js';
import '../models/productVariant.js';
import '../models/user.js';
import '../models/category.js';
import '../models/order.js';
import '../models/orderItem.js';
import '../models/tag.js';
import '../models/productTag.js';
import '../models/refreshToken.js';
import '../models/passwordResetToken.js';

export async function syncDB() {
  await sequelize.authenticate();
  const isDev = process.env.NODE_ENV !== 'production';
  await sequelize.sync({ alter: isDev });
}
