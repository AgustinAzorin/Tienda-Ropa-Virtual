import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export class Product extends Model {
  static associate(models) {
    // Variantes 1:N
    Product.hasMany(models.ProductVariant, {
      foreignKey: { name: 'product_id', allowNull: false },
      as: 'variants',
      onDelete: 'CASCADE',
    });

    // Categoría N:1 (opcional)
    Product.belongsTo(models.Category, {
      foreignKey: { name: 'categoryId', allowNull: true },
      as: 'category_data', // renombrado para evitar colisión con el atributo `category`
    });

    // Tags N:M
    Product.belongsToMany(models.Tag, {
      through: models.ProductTag,
      foreignKey: 'productId',
      otherKey: 'tagId',
      as: 'tags',
    });

    // Favoritos N:M (usuarios que lo guardaron)
    Product.belongsToMany(models.User, {
      through: models.Favorite,
      foreignKey: 'productId',
      otherKey: 'userId',
      as: 'wishlistedBy',
    });
  }
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    base_color_hex: { type: DataTypes.STRING(7), allowNull: true }, // "#RRGGBB"
    style: { type: DataTypes.STRING(50), allowNull: true },
    occasion: { type: DataTypes.STRING(50), allowNull: true },
    season: { type: DataTypes.STRING(20), allowNull: true },
    category: { type: DataTypes.STRING(50), allowNull: false }, // si migrás a Category, podés deprecar este string
    material: { type: DataTypes.STRING(80), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    image_url: { type: DataTypes.STRING, allowNull: true },
    // FK opcional a Category
    categoryId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: 'products', timestamps: true }
);
