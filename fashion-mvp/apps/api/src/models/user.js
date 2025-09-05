import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export class User extends Model {
  static associate(models) {
    // Órdenes
    User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });

    // Tokens
    User.hasMany(models.RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
    User.hasMany(models.PasswordResetToken, { foreignKey: 'userId', as: 'resetTokens' });

    // Carrito 1:1
    User.hasOne(models.Cart, { foreignKey: 'userId', as: 'cart' });

    // Favoritos N:M
    User.belongsToMany(models.Product, {
      through: models.Favorite,
      foreignKey: 'userId',
      otherKey: 'productId',
      as: 'favorites',
    });
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('buyer', 'seller', 'admin'),
      allowNull: false,
      defaultValue: 'buyer',
    },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, tableName: 'users', timestamps: true }
);
