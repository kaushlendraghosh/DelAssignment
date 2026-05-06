
const Joi = require('joi');


const TASK_STATUSES = ['To Do', 'In Progress', 'Done'];
const PROJECT_CATEGORIES = [
  'General',
  'Engineering',
  'Marketing',
  'Design',
  'Research',
  'Operations',
];



const projectCreateSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().min(10).max(2000).required(),
  category: Joi.string()
    .valid(...PROJECT_CATEGORIES)
    .default('General'),
});

const projectUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(255),
  description: Joi.string().min(10).max(2000),
  category: Joi.string().valid(...PROJECT_CATEGORIES),
}).min(1);



const taskCreateSchema = Joi.object({
  title: Joi.string().min(2).max(255).required(),
  assigned_user: Joi.string()
    .max(255)
    .pattern(/^[A-Za-z\s\-']*$/)
    .default('Unassigned')
    .allow('', null),
  status: Joi.string()
    .valid(...TASK_STATUSES)
    .default('To Do'),
  due_date: Joi.date().iso().allow(null),
});

const taskUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(255),
  assigned_user: Joi.string()
    .max(255)
    .pattern(/^[A-Za-z\s\-']*$/)
    .allow('', null),
  status: Joi.string().valid(...TASK_STATUSES),
  due_date: Joi.date().iso().allow(null),
}).min(1);


const uuidSchema = Joi.string().guid();

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(422).json({
        detail: error.details.map((d) => ({
          loc: ['body', ...d.path],
          msg: d.message,
          type: d.type,
        })),
      });
    }
    req.body = value;
    next();
  };
}


function validateUUID(...paramNames) {
  return (req, res, next) => {
    for (const param of paramNames) {
      const { error } = uuidSchema.validate(req.params[param]);
      if (error) {
        return res.status(422).json({
          detail: [
            {
              loc: ['path', param],
              msg: `"${param}" must be a valid UUID`,
              type: 'string.guid',
            },
          ],
        });
      }
    }
    next();
  };
}

module.exports = {
  projectCreateSchema,
  projectUpdateSchema,
  taskCreateSchema,
  taskUpdateSchema,
  validateBody,
  validateUUID,
  TASK_STATUSES,
  PROJECT_CATEGORIES,
};
