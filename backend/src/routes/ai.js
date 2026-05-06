

const express = require('express');
const { Project, Task } = require('../models');
const { validateUUID } = require('../middleware/validate');
const { generateProjectSummary } = require('../services/aiService');

const router = express.Router();

// POST /ai/summarize/:project_id — Generate AI-powered project summary
router.post(
  '/summarize/:project_id',
  validateUUID('project_id'),
  async (req, res, next) => {
    try {
      const project = await Project.findByPk(req.params.project_id, {
        include: [{ model: Task, as: 'tasks' }],
      });

      if (!project) {
        return res.status(404).json({ detail: 'Project not found' });
      }

      const summary = await generateProjectSummary(project, project.tasks || []);

      res.json({
        project_id: project.id,
        project_name: project.name,
        summary,
      });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ detail: err.message });
      }
      next(err);
    }
  }
);

module.exports = router;
