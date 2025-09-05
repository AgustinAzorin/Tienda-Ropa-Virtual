// apps/api/src/models/passwordResetToken.js
import { DataTypes } from 'sequelize';

export default function definePasswordResetToken(sequelize) {
  const PasswordResetToken = sequelize.define(
    'PasswordResetToken',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      tokenHash: { type: DataTypes.STRING, allowNull: false, unique: true },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      usedAt: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: 'password_reset_tokens', timestamps: true }
  );

  PasswordResetToken.associate = (models) => {
    PasswordResetToken.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return PasswordResetToken;
}