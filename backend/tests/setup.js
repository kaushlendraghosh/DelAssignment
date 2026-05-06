
const { Sequelize } = require('sequelize');

//  in-memory SQLite instance for testing
const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
  define: {
    underscored: false,
    freezeTableName: true,
  },
});

function setupTestDB() {
  
  const { DataTypes } = require('sequelize');

  const Project = testSequelize.define(
    'Project',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'General',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    { tableName: 'projects', timestamps: false }
  );

  const Task = testSequelize.define(
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
    { tableName: 'tasks', timestamps: false }
  );

  Project.hasMany(Task, {
    foreignKey: 'project_id',
    as: 'tasks',
    onDelete: 'CASCADE',
    hooks: true,
  });

  Task.belongsTo(Project, {
    foreignKey: 'project_id',
    as: 'project',
  });

  return { sequelize: testSequelize, Project, Task };
}

module.exports = { setupTestDB, testSequelize };
