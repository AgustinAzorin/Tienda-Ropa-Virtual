import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export class User extends Model {}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('buyer', 'seller', 'admin'),
      allowNull: false,
      defaultValue: 'buyer'
    },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  },
  { sequelize, tableName: 'users', timestamps: true }
);
