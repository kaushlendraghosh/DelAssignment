
const Project = require('./Project');
const Task = require('./Task');

// One Project has many Tasks (cascade delete)
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

module.exports = { Project, Task };
