// apps/api/src/models/orderItem.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false }, // snapshot de precio
  }, { tableName: 'order_items' });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, {
      foreignKey: { name: 'orderId', allowNull: false },
      as: 'order',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    OrderItem.belongsTo(models.ProductVariant, {
      foreignKey: { name: 'variantId', allowNull: false },
      as: 'variant',
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  };

  return OrderItem;
};
