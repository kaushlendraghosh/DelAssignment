
const request = require('supertest');

jest.mock('../src/database', () => {
  const { Sequelize } = require('sequelize');
  const seq = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: { underscored: false, freezeTableName: true },
  });
  return seq;
});

const app = require('../src/index');
const sequelize = require('../src/database');
const { Project, Task } = require('../src/models');

let sampleProjectId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  // Create a sample project for task tests
  const res = await request(app).post('/projects').send({
    name: 'Test Project Alpha',
    description: 'A test project for automated testing purposes',
    category: 'Engineering',
  });
  sampleProjectId = res.body.id;
});

afterEach(async () => {
  await Task.destroy({ where: {} });
  await Project.destroy({ where: {} });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Task CRUD', () => {
  test('POST /projects/:id/tasks — create task returns 201', async () => {
    const res = await request(app)
      .post(`/projects/${sampleProjectId}/tasks`)
      .send({
        title: 'Set up CI/CD pipeline',
        assigned_user: 'Alice',
        status: 'To Do',
        due_date: '2026-05-15T00:00:00Z',
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Set up CI/CD pipeline');
    expect(res.body.assigned_user).toBe('Alice');
    expect(res.body.status).toBe('To Do');
    expect(res.body.project_id).toBe(sampleProjectId);
  });

  test('POST /projects/:id/tasks — invalid project returns 404', async () => {
    const res = await request(app)
      .post('/projects/00000000-0000-0000-0000-000000000000/tasks')
      .send({ title: 'Orphan task' });

    expect(res.status).toBe(404);
  });

  test('PUT /tasks/:id — update task status', async () => {
    const created = await request(app)
      .post(`/projects/${sampleProjectId}/tasks`)
      .send({ title: 'Write documentation' });

    const taskId = created.body.id;

    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .send({ status: 'In Progress' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('In Progress');
  });

  test('DELETE /tasks/:id — delete task returns 204', async () => {
    const created = await request(app)
      .post(`/projects/${sampleProjectId}/tasks`)
      .send({ title: 'Temporary task' });

    const taskId = created.body.id;

    const res = await request(app).delete(`/tasks/${taskId}`);
    expect(res.status).toBe(204);
  });
});
