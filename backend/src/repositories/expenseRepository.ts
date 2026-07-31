import { dbAll, dbGet, dbRun } from '../db/database';

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

export class SqliteExpenseRepository implements IExpenseRepository {
  async create(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
    const res = await dbRun(
      'INSERT INTO expenses (remarks, amount, date) VALUES (?, ?, ?)',
      [expense.remarks, expense.amount, expense.date]
    );
    const id = res.lastID;
    const created = await this.findById(id);
    if (!created) throw new Error('Failed to retrieve created expense');
    return created;
  }

  async update(id: number, expense: Partial<Expense>): Promise<boolean> {
    const fields: string[] = [];
    const params: any[] = [];

    if (expense.remarks !== undefined) {
      fields.push('remarks = ?');
      params.push(expense.remarks);
    }
    if (expense.amount !== undefined) {
      fields.push('amount = ?');
      params.push(expense.amount);
    }
    if (expense.date !== undefined) {
      fields.push('date = ?');
      params.push(expense.date);
    }

    if (fields.length === 0) return false;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const res = await dbRun(
      `UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return res.changes > 0;
  }

  async delete(id: number): Promise<boolean> {
    const res = await dbRun('DELETE FROM expenses WHERE id = ?', [id]);
    return res.changes > 0;
  }

  async findById(id: number): Promise<Expense | null> {
    const row = await dbGet<Expense>('SELECT * FROM expenses WHERE id = ?', [id]);
    return row || null;
  }

  async findAll(filters: { search?: string; startDate?: string; endDate?: string }): Promise<Expense[]> {
    let sql = 'SELECT * FROM expenses WHERE 1=1';
    const params: any[] = [];

    if (filters.search) {
      sql += ' AND (remarks LIKE ? OR CAST(amount AS TEXT) LIKE ?)';
      const term = `%${filters.search}%`;
      params.push(term, term);
    }

    if (filters.startDate) {
      sql += ' AND date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ' AND date <= ?';
      params.push(filters.endDate);
    }

    sql += ' ORDER BY date DESC, id DESC';

    return await dbAll<Expense>(sql, params);
  }

  async getTodayTotal(dateStr: string): Promise<number> {
    const row = await dbGet<{ total: number | null }>('SELECT SUM(amount) as total FROM expenses WHERE date = ?', [dateStr]);
    return row && row.total ? row.total : 0;
  }

  async getDateRangeSummary(startDate: string, endDate: string): Promise<{ totalAmount: number; count: number }> {
    const row = await dbGet<{ total: number | null; count: number }>(
      'SELECT SUM(amount) as total, COUNT(*) as count FROM expenses WHERE date >= ? AND date <= ?',
      [startDate, endDate]
    );
    return {
      totalAmount: row && row.total ? row.total : 0,
      count: row && row.count ? row.count : 0
    };
  }
}
