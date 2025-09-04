// apps/api/src/models/category.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  }, { tableName: 'categories' });

  Category.associate = (models) => {
    Category.hasMany(models.Product, {
      foreignKey: { name: 'categoryId', allowNull: true },
      as: 'products',
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  };

  return Category;
};
