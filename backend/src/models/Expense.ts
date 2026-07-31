import { Model, DataTypes, Sequelize } from 'sequelize';

export class Expense extends Model {
  public id!: number;
  public remarks!: string;
  public amount!: number;
  public date!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export const initExpense = (sequelize: Sequelize) => {
  Expense.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      remarks: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'expenses',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};
