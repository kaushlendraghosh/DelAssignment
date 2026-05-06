
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/teamboard';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  define: {
    // Use snake_case column names to match existing DB schema
    underscored: false,
    freezeTableName: true,
  },
});

module.exports = sequelize;
