"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExpenseService = void 0;
var _expenseRepository = require("../repositories/expenseRepository");
class ExpenseService {
  constructor(expenseRepo) {
    this.expenseRepo = expenseRepo;
  }
  async addExpense(remarks, amount, date) {
    const cleanRemarks = (remarks || '').trim();
    const cleanAmount = Number(amount) || 0;
    if (cleanAmount < 0) {
      throw new Error('Expense amount cannot be negative');
    }
    if (!date) {
      throw new Error('Expense date is required');
    }
    return this.expenseRepo.create({
      remarks: cleanRemarks,
      amount: cleanAmount,
      date
    });
  }
  async editExpense(id, remarks, amount, date) {
    const updatePayload = {};
    if (remarks !== undefined) updatePayload.remarks = remarks.trim();
    if (amount !== undefined) {
      const cleanAmount = Number(amount) || 0;
      if (cleanAmount < 0) {
        throw new Error('Expense amount cannot be negative');
      }
      updatePayload.amount = cleanAmount;
    }
    if (date !== undefined) {
      if (!date) throw new Error('Expense date is required');
      updatePayload.date = date;
    }
    return this.expenseRepo.update(id, updatePayload);
  }
  async deleteExpense(id) {
    return this.expenseRepo.delete(id);
  }
  async getExpenseById(id) {
    return this.expenseRepo.findById(id);
  }
  async getExpenses(filters) {
    return this.expenseRepo.findAll(filters);
  }
  async getTodayExpenses(dateStr) {
    return this.expenseRepo.getTodayTotal(dateStr);
  }
  async getReportSummary(startDate, endDate) {
    return this.expenseRepo.getDateRangeSummary(startDate, endDate);
  }
}
exports.ExpenseService = ExpenseService;