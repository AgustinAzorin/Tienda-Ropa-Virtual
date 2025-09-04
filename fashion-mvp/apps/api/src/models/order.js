// apps/api/src/models/order.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    status: {
      type: DataTypes.ENUM('pending','paid','shipped','cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    totalPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0.00 },
  }, { tableName: 'orders' });

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: { name: 'userId', allowNull: false },
      as: 'user',
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    Order.hasMany(models.OrderItem, {
      foreignKey: { name: 'orderId', allowNull: false },
      as: 'items',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Order;
};
