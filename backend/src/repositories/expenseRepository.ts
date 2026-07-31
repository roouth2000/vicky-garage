import { Expense as ExpenseModel } from '../models';
import { Op } from 'sequelize';

export interface Expense {
  id?: number;
  remarks: string;
  amount: number;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface IExpenseRepository {
  create(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense>;
  update(id: number, expense: Partial<Expense>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  findById(id: number): Promise<Expense | null>;
  findAll(filters: { search?: string; startDate?: string; endDate?: string }): Promise<Expense[]>;
  getTodayTotal(dateStr: string): Promise<number>;
  getDateRangeSummary(startDate: string, endDate: string): Promise<{ totalAmount: number; count: number }>;
}

export class SequelizeExpenseRepository implements IExpenseRepository {
  async create(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
    const created = await ExpenseModel.create({
      remarks: expense.remarks,
      amount: expense.amount,
      date: expense.date,
    });
    return created.toJSON() as Expense;
  }

  async update(id: number, expense: Partial<Expense>): Promise<boolean> {
    const [affectedCount] = await ExpenseModel.update(expense, { where: { id } });
    return affectedCount > 0;
  }

  async delete(id: number): Promise<boolean> {
    const deletedCount = await ExpenseModel.destroy({ where: { id } });
    return deletedCount > 0;
  }

  async findById(id: number): Promise<Expense | null> {
    const expense = await ExpenseModel.findByPk(id);
    return expense ? (expense.toJSON() as Expense) : null;
  }

  async findAll(filters: { search?: string; startDate?: string; endDate?: string }): Promise<Expense[]> {
    let whereClause: any = {};
    
    if (filters.search) {
      whereClause[Op.or] = [
        { remarks: { [Op.like]: `%${filters.search}%` } },
        { amount: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    if (filters.startDate) {
      whereClause.date = { ...whereClause.date, [Op.gte]: filters.startDate };
    }
    if (filters.endDate) {
      whereClause.date = { ...whereClause.date, [Op.lte]: filters.endDate };
    }

    const expenses = await ExpenseModel.findAll({
      where: whereClause,
      order: [['date', 'DESC'], ['id', 'DESC']],
    });
    
    return expenses.map(e => e.toJSON() as Expense);
  }

  async getTodayTotal(dateStr: string): Promise<number> {
    const total = await ExpenseModel.sum('amount', { where: { date: dateStr } });
    return total || 0;
  }

  async getDateRangeSummary(startDate: string, endDate: string): Promise<{ totalAmount: number; count: number }> {
    const expenses = await ExpenseModel.findAll({
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      }
    });
    
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      totalAmount,
      count: expenses.length,
    };
  }
}
