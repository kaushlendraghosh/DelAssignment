const express = require('express');
const { Project, Task } = require('../models');
const {
  taskCreateSchema,
  taskUpdateSchema,
  validateBody,
  validateUUID,
} = require('../middleware/validate');

const router = express.Router();
function buildTaskResponse(task) {
  return {
    id: task.id,
    title: task.title,
    assigned_user: task.assigned_user,
    status: task.status,
    due_date: task.due_date,
    project_id: task.project_id,
    created_at: task.created_at,
  };
}

// POST /projects/:project_id/tasks — Create a new task within a project
router.post(
  '/projects/:project_id/tasks',
  validateUUID('project_id'),
  validateBody(taskCreateSchema),
  async (req, res, next) => {
    try {
      const project = await Project.findByPk(req.params.project_id);
      if (!project) {
        return res.status(404).json({ detail: 'Project not found' });
      }

      const task = await Task.create({
        title: req.body.title,
        assigned_user: req.body.assigned_user || 'Unassigned',
        status: req.body.status || 'To Do',
        due_date: req.body.due_date || null,
        project_id: req.params.project_id,
      });

      res.status(201).json(buildTaskResponse(task));
    } catch (err) {
      next(err);
    }
  }
);

// PUT /tasks/:task_id — Update an existing task
router.put(
  '/tasks/:task_id',
  validateUUID('task_id'),
  validateBody(taskUpdateSchema),
  async (req, res, next) => {
    try {
      const task = await Task.findByPk(req.params.task_id);
      if (!task) {
        return res.status(404).json({ detail: 'Task not found' });
      }

      await task.update(req.body);

      res.json(buildTaskResponse(task));
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /tasks/:task_id — Delete a task
router.delete(
  '/tasks/:task_id',
  validateUUID('task_id'),
  async (req, res, next) => {
    try {
      const task = await Task.findByPk(req.params.task_id);
      if (!task) {
        return res.status(404).json({ detail: 'Task not found' });
      }

      await task.destroy();
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
