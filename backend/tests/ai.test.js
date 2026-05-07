const request = require('supertest');

// Mock the @google/generative-ai library
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockImplementation(async () => {
            if (process.env.TEST_GEMINI_ERROR === '429') {
              const error = new Error('You exceeded your current quota');
              error.status = 429;
              throw error;
            }
            if (process.env.TEST_GEMINI_ERROR === '503') {
              const error = new Error('503 Service Unavailable: This model is currently experiencing high demand.');
              error.status = 503;
              throw error;
            }
            return {
              response: {
                text: () => 'This is a mock summary mentioning Test Project Alpha.',
              }
            };
          }),
        }),
      };
    }),
  };
});

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
  const res = await request(app).post('/projects').send({
    name: 'Test Project Alpha',
    description: 'A test project for automated testing purposes',
    category: 'Engineering',
  });
  sampleProjectId = res.body.id;

  process.env.GEMINI_API_KEY = 'fake-key-for-testing';
  delete process.env.TEST_GEMINI_ERROR;
});

afterEach(async () => {
  await Task.destroy({ where: {} });
  await Project.destroy({ where: {} });
});

afterAll(async () => {
  await sequelize.close();
});

describe('AI Summary', () => {
  test('POST /ai/summarize/:id — returns summary with tasks', async () => {
    await request(app)
      .post(`/projects/${sampleProjectId}/tasks`)
      .send({ title: 'Task A', status: 'Done' });
    await request(app)
      .post(`/projects/${sampleProjectId}/tasks`)
      .send({ title: 'Task B', status: 'In Progress' });
    await request(app)
      .post(`/projects/${sampleProjectId}/tasks`)
      .send({ title: 'Task C', status: 'To Do' });

    const res = await request(app).post(
      `/ai/summarize/${sampleProjectId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.project_id).toBe(sampleProjectId);
    expect(res.body.project_name).toBe('Test Project Alpha');
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.length).toBeGreaterThan(0);
  });

  test('POST /ai/summarize/:id — not found returns 404', async () => {
    const res = await request(app).post(
      '/ai/summarize/00000000-0000-0000-0000-000000000000'
    );
    expect(res.status).toBe(404);
  });

  test('POST /ai/summarize/:id — returns 429 when quota exceeded', async () => {
    process.env.TEST_GEMINI_ERROR = '429';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).post(
      `/ai/summarize/${sampleProjectId}`
    );

    expect(res.status).toBe(429);
    expect(res.body.detail).toContain('exhausted or rate limit exceeded');
    
    consoleSpy.mockRestore();
  });

  test('POST /ai/summarize/:id — returns 503 when model has high demand', async () => {
    process.env.TEST_GEMINI_ERROR = '503';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).post(
      `/ai/summarize/${sampleProjectId}`
    );

    expect(res.status).toBe(503);
    expect(res.body.detail).toContain('high demand');
    
    consoleSpy.mockRestore();
  });

  test('POST /ai/summarize/:id — returns 503 when missing API key', async () => {

    delete process.env.GEMINI_API_KEY;

    const res = await request(app).post(
      `/ai/summarize/${sampleProjectId}`
    );

    expect(res.status).toBe(503);
    expect(res.body.detail).toContain('not configured');
  });
});
