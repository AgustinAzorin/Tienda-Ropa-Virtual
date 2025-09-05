import { DataTypes } from 'sequelize';

export default function defineFavorite(sequelize) {
  const Favorite = sequelize.define('Favorite', {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
    productId: { type: DataTypes.INTEGER, primaryKey: true },
  }, { tableName: 'favorites', timestamps: true });

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, { foreignKey: 'userId' });
    Favorite.belongsTo(models.Product, { foreignKey: 'productId' });
  };

  return Favorite;
}
