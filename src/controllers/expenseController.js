"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateExpense = exports.getExpenses = exports.getExpenseSummary = exports.getExpenseById = exports.expenseService = exports.deleteExpense = exports.createExpense = void 0;
var _express = require("express");
var _expenseRepository = require("../repositories/expenseRepository");
var _expenseService = require("../services/expenseService");
const expenseRepo = new _expenseRepository.SequelizeExpenseRepository();
const expenseService = exports.expenseService = new _expenseService.ExpenseService(expenseRepo);
const getExpenses = async (req, res) => {
  try {
    const search = req.query.search || '';
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';
    const expenses = await expenseService.getExpenses({
      search,
      startDate,
      endDate
    });
    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getExpenses = getExpenses;
const getExpenseById = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const expense = await expenseService.getExpenseById(Number(id));
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getExpenseById = getExpenseById;
const createExpense = async (req, res) => {
  try {
    const {
      remarks,
      amount,
      date
    } = req.body;
    if (amount === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: 'Amount and date are required'
      });
    }
    const created = await expenseService.addExpense(remarks, amount, date);
    res.status(201).json({
      success: true,
      data: created
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
exports.createExpense = createExpense;
const updateExpense = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      remarks,
      amount,
      date
    } = req.body;
    const success = await expenseService.editExpense(Number(id), remarks, amount, date);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or no changes made'
      });
    }
    const updated = await expenseService.getExpenseById(Number(id));
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
exports.updateExpense = updateExpense;
const deleteExpense = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const success = await expenseService.deleteExpense(Number(id));
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.deleteExpense = deleteExpense;
const getExpenseSummary = async (req, res) => {
  try {
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }
    const summary = await expenseService.getReportSummary(startDate, endDate);
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getExpenseSummary = getExpenseSummary;