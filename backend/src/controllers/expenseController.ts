import { Request, Response } from 'express';
import { SqliteExpenseRepository } from '../repositories/expenseRepository';
import { ExpenseService } from '../services/expenseService';

const expenseRepo = new SqliteExpenseRepository();
export const expenseService = new ExpenseService(expenseRepo);

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const startDate = (req.query.startDate as string) || '';
    const endDate = (req.query.endDate as string) || '';

    const expenses = await expenseService.getExpenses({ search, startDate, endDate });
    res.json({ success: true, data: expenses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const expense = await expenseService.getExpenseById(Number(id));
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, data: expense });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { remarks, amount, date } = req.body;
    if (amount === undefined || !date) {
      return res.status(400).json({ success: false, message: 'Amount and date are required' });
    }

    const created = await expenseService.addExpense(remarks, amount, date);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { remarks, amount, date } = req.body;

    const success = await expenseService.editExpense(Number(id), remarks, amount, date);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Expense not found or no changes made' });
    }

    const updated = await expenseService.getExpenseById(Number(id));
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await expenseService.deleteExpense(Number(id));
    if (!success) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpenseSummary = async (req: Request, res: Response) => {
  try {
    const startDate = (req.query.startDate as string) || '';
    const endDate = (req.query.endDate as string) || '';

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }

    const summary = await expenseService.getReportSummary(startDate, endDate);
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
