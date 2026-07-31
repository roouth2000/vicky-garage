import { Model, DataTypes, Sequelize } from 'sequelize';

export class Product extends Model {
  public id!: number;
  public name!: string;
  public stock_qty!: number;
  public selling_price!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export const initProduct = (sequelize: Sequelize) => {
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      stock_qty: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      selling_price: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: 'products',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};
