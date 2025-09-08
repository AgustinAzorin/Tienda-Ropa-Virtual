import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export class ProductImage extends Model {}

ProductImage.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    key: { type: DataTypes.STRING, allowNull: false },        // ruta/archivo
    url: { type: DataTypes.STRING, allowNull: false },        // /uploads/...
    width: { type: DataTypes.INTEGER, allowNull: true },
    height: { type: DataTypes.INTEGER, allowNull: true },
    size: { type: DataTypes.INTEGER, allowNull: true },       // bytes
    mime: { type: DataTypes.STRING, allowNull: true },
    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, tableName: 'product_images', timestamps: true }
);
