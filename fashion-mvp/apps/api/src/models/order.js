// apps/api/src/models/order.js
import { DataTypes } from 'sequelize';

export default function defineOrder(sequelize) {
  const Order = sequelize.define(
    'Order',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      status: {
        type: DataTypes.ENUM('pending','paid','shipped','cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      totalPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0.00 },
    },
    { tableName: 'orders', timestamps: true }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: { name: 'userId', allowNull: false },
      as: 'user',
    });

    Order.hasMany(models.OrderItem, {
      foreignKey: { name: 'orderId', allowNull: false },
      as: 'items',
      onDelete: 'CASCADE',
    });
  };

  return Order;
}