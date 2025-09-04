const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const ProductTag = sequelize.define('ProductTag', {
    productId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    tagId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  }, { tableName: 'product_tags', timestamps: false });

  ProductTag.associate = (models) => {
    ProductTag.belongsTo(models.Product, { foreignKey: 'productId' });
    ProductTag.belongsTo(models.Tag, { foreignKey: 'tagId' });
  };
  return ProductTag;
};
