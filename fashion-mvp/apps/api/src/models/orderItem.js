// apps/api/src/models/orderItem.js
import { DataTypes } from 'sequelize';

export default function defineOrderItem(sequelize) {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
      price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    },
    { tableName: 'order_items', timestamps: true }
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, {
      foreignKey: { name: 'orderId', allowNull: false },
      as: 'order',
      onDelete: 'CASCADE',
    });
    OrderItem.belongsTo(models.ProductVariant, {
      foreignKey: { name: 'variantId', allowNull: false },
      as: 'variant',
    });
  };

  return OrderItem;
}