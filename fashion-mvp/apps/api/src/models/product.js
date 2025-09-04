import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export class Product extends Model {}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    base_color_hex: { type: DataTypes.STRING(7), allowNull: true }, // "#RRGGBB"
    style: { type: DataTypes.STRING(50), allowNull: true },   // street, formal, etc.
    occasion: { type: DataTypes.STRING(50), allowNull: true },// office, gym...
    season: { type: DataTypes.STRING(20), allowNull: true },  // ss/fw/etc
    category: { type: DataTypes.STRING(50), allowNull: false }, // top/bottom/shoes/accessory
    material: { type: DataTypes.STRING(80), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, tableName: 'products', timestamps: true }
);
