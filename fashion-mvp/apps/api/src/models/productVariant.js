import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export class ProductVariant extends Model {}

ProductVariant.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    size: { type: DataTypes.STRING(20), allowNull: false }, // S/M/L/40/41 etc.
    color_hex: { type: DataTypes.STRING(7), allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    price: { type: DataTypes.INTEGER, allowNull: false }, // centavos (int)
    image_url: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, tableName: 'product_variants', timestamps: true }
);

// (Removed direct Product.hasMany / ProductVariant.belongsTo to avoid duplicate alias)
