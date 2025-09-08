import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export class VariantImage extends Model {}

VariantImage.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    variant_id: { type: DataTypes.INTEGER, allowNull: false },
    key: { type: DataTypes.STRING, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false },
    width: { type: DataTypes.INTEGER, allowNull: true },
    height: { type: DataTypes.INTEGER, allowNull: true },
    size: { type: DataTypes.INTEGER, allowNull: true },
    mime: { type: DataTypes.STRING, allowNull: true },
    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, tableName: 'variant_images', timestamps: true }
);
