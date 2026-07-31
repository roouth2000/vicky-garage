import { Model, DataTypes, Sequelize } from 'sequelize';
import { Customer } from './Customer';

export class Bill extends Model {
  public id!: number;
  public bill_no!: number;
  public customer_id!: number | null;
  public vehicle_number!: string;
  public vehicle_model!: string;
  public customer_name!: string;
  public mobile_number!: string;
  public km_driven!: number;
  public bill_date!: string;
  public total_amount!: number;
  public advance_amount!: number;
  public balance_amount!: number;
  public complaint!: string;
  public readonly created_at!: Date;
}

export const initBill = (sequelize: Sequelize) => {
  Bill.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      bill_no: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id',
        },
      },
      vehicle_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vehicle_model: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customer_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      km_driven: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      bill_date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      advance_amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      balance_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      complaint: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'bills',
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
};
