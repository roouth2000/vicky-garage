import { Model, DataTypes, Sequelize } from 'sequelize';
import { Bill } from './Bill';

export class BillItem extends Model {
  public id!: number;
  public bill_id!: number;
  public s_no!: number;
  public product_name!: string;
  public qty!: number;
  public amount!: number;
}

export const initBillItem = (sequelize: Sequelize) => {
  BillItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      bill_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'bills',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      s_no: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      qty: {
        type: DataTypes.FLOAT,
        defaultValue: 1,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'bill_items',
      timestamps: false,
    }
  );
};
