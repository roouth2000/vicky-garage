"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SequelizeExpenseRepository = void 0;
var _models = require("../models");
var _sequelize = require("sequelize");
class SequelizeExpenseRepository {
  async create(expense) {
    const created = await _models.Expense.create({
      remarks: expense.remarks,
      amount: expense.amount,
      date: expense.date
    });
    return created.toJSON();
  }
  async update(id, expense) {
    const [affectedCount] = await _models.Expense.update(expense, {
      where: {
        id
      }
    });
    return affectedCount > 0;
  }
  async delete(id) {
    const deletedCount = await _models.Expense.destroy({
      where: {
        id
      }
    });
    return deletedCount > 0;
  }
  async findById(id) {
    const expense = await _models.Expense.findByPk(id);
    return expense ? expense.toJSON() : null;
  }
  async findAll(filters) {
    let whereClause = {};
    if (filters.search) {
      whereClause[_sequelize.Op.or] = [{
        remarks: {
          [_sequelize.Op.like]: `%${filters.search}%`
        }
      }, {
        amount: {
          [_sequelize.Op.like]: `%${filters.search}%`
        }
      }];
    }
    if (filters.startDate) {
      whereClause.date = {
        ...whereClause.date,
        [_sequelize.Op.gte]: filters.startDate
      };
    }
    if (filters.endDate) {
      whereClause.date = {
        ...whereClause.date,
        [_sequelize.Op.lte]: filters.endDate
      };
    }
    const expenses = await _models.Expense.findAll({
      where: whereClause,
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
    return expenses.map(e => e.toJSON());
  }
  async getTodayTotal(dateStr) {
    const total = await _models.Expense.sum('amount', {
      where: {
        date: dateStr
      }
    });
    return total || 0;
  }
  async getDateRangeSummary(startDate, endDate) {
    const expenses = await _models.Expense.findAll({
      where: {
        date: {
          [_sequelize.Op.gte]: startDate,
          [_sequelize.Op.lte]: endDate
        }
      }
    });
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      totalAmount,
      count: expenses.length
    };
  }
}
exports.SequelizeExpenseRepository = SequelizeExpenseRepository;