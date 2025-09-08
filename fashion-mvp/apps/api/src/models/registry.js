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
import defineProductTag from './productTag.js';
import defineRefreshToken from './refreshToken.js';
import definePasswordResetToken from './passwordResetToken.js';
import defineCart from './cart.js';
import defineCartItem from './cartItem.js';
import defineFavorite from './favorite.js';

// Nuevos modelos de imágenes (ESM)
import { ProductImage } from './productImage.js';
import { VariantImage } from './variantImage.js';

// Inicialización de factories
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

// Registro exportable
const models = {
  User,
  Product,
  ProductVariant,
  Category,
  Order,
  OrderItem,
  Tag,
  ProductTag,
  RefreshToken,
  PasswordResetToken,
  Cart,
  CartItem,
  Favorite,
  // nuevos
  ProductImage,
  VariantImage,
};

// Asociaciones declaradas dentro de cada modelo (si existen)
Object.values(models).forEach(m => typeof m.associate === 'function' && m.associate(models));

// Asociaciones para imágenes (estos modelos no definen associate propio)
Product.hasMany(ProductImage, {
  foreignKey: { name: 'product_id', allowNull: false },
  as: 'images',
  onDelete: 'CASCADE',
});
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

ProductVariant.hasMany(VariantImage, {
  foreignKey: { name: 'variant_id', allowNull: false },
  as: 'images',
  onDelete: 'CASCADE',
});
VariantImage.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

export { sequelize, models };
