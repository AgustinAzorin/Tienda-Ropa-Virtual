import { DataTypes } from 'sequelize';

export default function defineCart(sequelize) {
  const Cart = sequelize.define('Cart', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  }, { tableName: 'carts', timestamps: true });

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false }, as: 'user' });
    Cart.hasMany(models.CartItem, { foreignKey: { name: 'cartId', allowNull: false }, as: 'items', onDelete: 'CASCADE' });
  };

  return Cart;
}
