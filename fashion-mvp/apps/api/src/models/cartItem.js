import { DataTypes } from 'sequelize';

export default function defineCartItem(sequelize) {
  const CartItem = sequelize.define('CartItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
  }, { tableName: 'cart_items', timestamps: true });

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.Cart, { foreignKey: { name: 'cartId', allowNull: false }, as: 'cart', onDelete: 'CASCADE' });
    CartItem.belongsTo(models.ProductVariant, { foreignKey: { name: 'variantId', allowNull: false }, as: 'variant' });
  };

  return CartItem;
}
