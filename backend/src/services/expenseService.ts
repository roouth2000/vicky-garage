import { Expense, IExpenseRepository } from '../repositories/expenseRepository';

export class ExpenseService {
  constructor(private expenseRepo: IExpenseRepository) {}

  async addExpense(remarks: string, amount: number, date: string): Promise<Expense> {
    const cleanRemarks = (remarks || '').trim();
    const cleanAmount = Number(amount) || 0;
    if (cleanAmount < 0) {
      throw new Error('Expense amount cannot be negative');
    }
    if (!date) {
      throw new Error('Expense date is required');
    }
    return this.expenseRepo.create({ remarks: cleanRemarks, amount: cleanAmount, date });
  }

  async editExpense(id: number, remarks?: string, amount?: number, date?: string): Promise<boolean> {
    const updatePayload: Partial<Expense> = {};
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

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenseRepo.delete(id);
  }

  async getExpenseById(id: number): Promise<Expense | null> {
    return this.expenseRepo.findById(id);
  }

  async getExpenses(filters: { search?: string; startDate?: string; endDate?: string }): Promise<Expense[]> {
    return this.expenseRepo.findAll(filters);
  }

  async getTodayExpenses(dateStr: string): Promise<number> {
    return this.expenseRepo.getTodayTotal(dateStr);
  }

  async getReportSummary(startDate: string, endDate: string): Promise<{ totalAmount: number; count: number }> {
    return this.expenseRepo.getDateRangeSummary(startDate, endDate);
  }
}
