import { Model, DataTypes, Sequelize } from 'sequelize';

export class Customer extends Model {
  public id!: number;
  public vehicle_number!: string;
  public vehicle_model!: string;
  public km_driven!: number;
  public customer_name!: string;
  public mobile_number!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export const initCustomer = (sequelize: Sequelize) => {
  Customer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      vehicle_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      vehicle_model: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      km_driven: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      customer_name: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      mobile_number: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
    },
    {
      sequelize,
      tableName: 'customers',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};
