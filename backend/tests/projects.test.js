
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

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterEach(async () => {
  await Task.destroy({ where: {} });
  await Project.destroy({ where: {} });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Project CRUD', () => {
  test('POST /projects — create project returns 201', async () => {
    const res = await request(app).post('/projects').send({
      name: 'Website Redesign',
      description: 'Redesign the company website with modern UI/UX',
      category: 'Design',
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Website Redesign');
    expect(res.body.description).toBe(
      'Redesign the company website with modern UI/UX'
    );
    expect(res.body.category).toBe('Design');
    expect(res.body.total_tasks).toBe(0);
    expect(res.body.completed_tasks).toBe(0);
    expect(res.body.id).toBeDefined();
  });

  test('POST /projects — validation error returns 422', async () => {
    const res = await request(app).post('/projects').send({
      name: 'Ab', // too short (min 3)
      description: 'Short', // too short (min 10)
    });

    expect(res.status).toBe(422);
  });

  test('GET /projects — list projects', async () => {
    await request(app).post('/projects').send({
      name: 'Test Project Alpha',
      description: 'A test project for automated testing purposes',
      category: 'Engineering',
    });

    const res = await request(app).get('/projects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].name).toBe('Test Project Alpha');
  });

  test('GET /projects/:id — get single project', async () => {
    const created = await request(app).post('/projects').send({
      name: 'Test Project Alpha',
      description: 'A test project for automated testing purposes',
      category: 'Engineering',
    });

    const projectId = created.body.id;
    const res = await request(app).get(`/projects/${projectId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(projectId);
    expect(res.body.name).toBe('Test Project Alpha');
  });

  test('GET /projects/:id — not found returns 404', async () => {
    const res = await request(app).get(
      '/projects/00000000-0000-0000-0000-000000000000'
    );
    expect(res.status).toBe(404);
  });

  test('PUT /projects/:id — update project', async () => {
    const created = await request(app).post('/projects').send({
      name: 'Test Project Alpha',
      description: 'A test project for automated testing purposes',
      category: 'Engineering',
    });

    const projectId = created.body.id;
    const res = await request(app)
      .put(`/projects/${projectId}`)
      .send({ name: 'Updated Project Name' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Project Name');
  });

  test('DELETE /projects/:id — delete project returns 204', async () => {
    const created = await request(app).post('/projects').send({
      name: 'Test Project Alpha',
      description: 'A test project for automated testing purposes',
      category: 'Engineering',
    });

    const projectId = created.body.id;
    const del = await request(app).delete(`/projects/${projectId}`);
    expect(del.status).toBe(204);

    const get = await request(app).get(`/projects/${projectId}`);
    expect(get.status).toBe(404);
  });
});
