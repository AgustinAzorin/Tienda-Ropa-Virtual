const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Tag = sequelize.define('Tag', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  }, { tableName: 'tags' });

  Tag.associate = (models) => {
    Tag.belongsToMany(models.Product, {
      through: models.ProductTag, foreignKey: 'tagId', otherKey: 'productId', as: 'products'
    });
  };
  return Tag;
};
