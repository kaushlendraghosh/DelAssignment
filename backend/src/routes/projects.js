const express = require('express');
const { Project, Task } = require('../models');
const {
  projectCreateSchema,
  projectUpdateSchema,
  validateBody,
  validateUUID,
} = require('../middleware/validate');

const router = express.Router();

function buildProjectResponse(project, includeTasks = true) {
  const tasks = project.tasks || [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Done').length;

  const response = {
    id: project.id,
    name: project.name,
    description: project.description,
    category: project.category,
    created_at: project.created_at,
    total_tasks: total,
    completed_tasks: completed,
  };

  if (includeTasks) {
    response.tasks = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      assigned_user: t.assigned_user,
      status: t.status,
      due_date: t.due_date,
      project_id: t.project_id,
      created_at: t.created_at,
    }));
  }

  return response;
}

// GET /projects — List all projects with task counts
router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      include: [{ model: Task, as: 'tasks' }],
      order: [['created_at', 'DESC']],
    });

    const result = projects.map((p) => buildProjectResponse(p, false));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /projects — Create a new project
router.post(
  '/',
  validateBody(projectCreateSchema),
  async (req, res, next) => {
    try {
      const project = await Project.create({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category || 'General',
      });

      // Reload with tasks (empty initially)
      const full = await Project.findByPk(project.id, {
        include: [{ model: Task, as: 'tasks' }],
      });

      res.status(201).json(buildProjectResponse(full));
    } catch (err) {
      next(err);
    }
  }
);

// GET /projects/:project_id — Get a single project with all tasks
router.get(
  '/:project_id',
  validateUUID('project_id'),
  async (req, res, next) => {
    try {
      const project = await Project.findByPk(req.params.project_id, {
        include: [{ model: Task, as: 'tasks' }],
      });

      if (!project) {
        return res.status(404).json({ detail: 'Project not found' });
      }

      res.json(buildProjectResponse(project));
    } catch (err) {
      next(err);
    }
  }
);

// PUT /projects/:project_id — Update an existing project
router.put(
  '/:project_id',
  validateUUID('project_id'),
  validateBody(projectUpdateSchema),
  async (req, res, next) => {
    try {
      const project = await Project.findByPk(req.params.project_id, {
        include: [{ model: Task, as: 'tasks' }],
      });

      if (!project) {
        return res.status(404).json({ detail: 'Project not found' });
      }

      await project.update(req.body);

      res.json(buildProjectResponse(project));
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /projects/:project_id — Delete a project and all its tasks
router.delete(
  '/:project_id',
  validateUUID('project_id'),
  async (req, res, next) => {
    try {
      const project = await Project.findByPk(req.params.project_id);

      if (!project) {
        return res.status(404).json({ detail: 'Project not found' });
      }

      await project.destroy();
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
