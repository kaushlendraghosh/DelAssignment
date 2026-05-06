
const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Task = sequelize.define(
  'Task',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    assigned_user: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'Unassigned',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'To Do',
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'tasks',
    timestamps: false,
  }
);

module.exports = Task;
