import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import { Product } from './product.js';

export class ProductVariant extends Model {}

ProductVariant.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    size: { type: DataTypes.STRING(20), allowNull: false }, // S/M/L/40/41 etc.
    color_hex: { type: DataTypes.STRING(7), allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    price: { type: DataTypes.INTEGER, allowNull: false }, // centavos (int)
  },
  { sequelize, tableName: 'product_variants', timestamps: true }
);

Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
