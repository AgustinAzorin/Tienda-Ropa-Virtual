// apps/api/src/models/refreshToken.js
import { DataTypes } from 'sequelize';

export default function defineRefreshToken(sequelize) {
  const RefreshToken = sequelize.define(
    'RefreshToken',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      tokenHash: { type: DataTypes.STRING, allowNull: false, unique: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      userAgent: { type: DataTypes.STRING },
      ip: { type: DataTypes.STRING },
      revokedAt: { type: DataTypes.DATE, allowNull: true },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
    },
    { tableName: 'refresh_tokens', timestamps: true }
  );

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return RefreshToken;
}