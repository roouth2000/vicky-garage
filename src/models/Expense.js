"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initExpense = exports.Expense = void 0;
var _sequelize = require("sequelize");
class Expense extends _sequelize.Model {
}
exports.Expense = Expense;
const initExpense = sequelize => {
  Expense.init({
    id: {
      type: _sequelize.DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    remarks: {
      type: _sequelize.DataTypes.STRING,
      allowNull: true
    },
    amount: {
      type: _sequelize.DataTypes.FLOAT,
      allowNull: false
    },
    date: {
      type: _sequelize.DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'expenses',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
exports.initExpense = initExpense;