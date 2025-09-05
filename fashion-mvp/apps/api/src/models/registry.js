// apps/api/src/models/registry.js
import { sequelize } from '../db/sequelize.js';

// Modelos ESM ya inicializados con sequelize dentro del archivo
import { User } from './user.js';
import { Product } from './product.js';
import { ProductVariant } from './productVariant.js';

// Modelos tipo "factory" (CommonJS) que requieren init
import defineCategory from './category.js';
import defineOrder from './order.js';
import defineOrderItem from './orderItem.js';
import defineTag from './tag.js';
// Si tenés ProductTag, descomenta:
import defineProductTag from './productTag.js';
import defineRefreshToken from './refreshToken.js';
import definePasswordResetToken from './passwordResetToken.js';
import defineCart from './cart.js';
import defineCartItem from './cartItem.js';
import defineFavorite from './favorite.js';

const Category = defineCategory(sequelize);
const Order = defineOrder(sequelize);
const OrderItem = defineOrderItem(sequelize);
const Tag = defineTag(sequelize);
const ProductTag = defineProductTag(sequelize);
const RefreshToken = defineRefreshToken(sequelize);
const PasswordResetToken = definePasswordResetToken(sequelize);
const Cart = defineCart(sequelize);
const CartItem = defineCartItem(sequelize);
const Favorite = defineFavorite(sequelize);

const models = {
  User, Product, ProductVariant,
  Category, Order, OrderItem, Tag,
  ProductTag,
  RefreshToken, PasswordResetToken,
  Cart, CartItem, Favorite,
};

// Asociaciones definidas en cada modelo (si existen)
Object.values(models).forEach(m => typeof m.associate === 'function' && m.associate(models));

export { sequelize, models };
