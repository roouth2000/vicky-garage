"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initProduct = exports.Product = void 0;
var _sequelize = require("sequelize");
class Product extends _sequelize.Model {
  id;
  name;
  stock_qty;
  selling_price;
  created_at;
  updated_at;
}
exports.Product = Product;
const initProduct = sequelize => {
  Product.init({
    id: {
      type: _sequelize.DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: _sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    stock_qty: {
      type: _sequelize.DataTypes.INTEGER,
      defaultValue: 0
    },
    selling_price: {
      type: _sequelize.DataTypes.FLOAT,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'products',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
exports.initProduct = initProduct;