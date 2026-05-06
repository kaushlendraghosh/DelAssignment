# TeamBoard — Collaborative Task Management with AI Summaries

TeamBoard is a full-stack task management app where teams can create projects, break them into tasks, assign members, track progress, and generate AI-powered project summaries. The backend is built with Node.js and Express, the frontend uses React with Vite, and data lives in PostgreSQL.

---

## How to Install and Run

### What you'll need

- Node.js (v18 or above)
- PostgreSQL (v14 or above)
- An OpenAI API key 

### Step 1 — Clone the repo

```bash
git clone <repo-url>
cd DeloitteAssignment
```

### Step 2 — Set up environment variables

There's a `.env.example` file inside the `backend/` folder. Copy it and create your own `.env`:


Now open `backend/.env` and fill in your actual values:


- **DATABASE_URL** — your PostgreSQL connection string
- **OPENAI_API_KEY** — Your OpenAI API key

### Step 3 — Start the backend

```bash
cd backend
npm install
node src/index.js
```

The backend starts on **http://localhost:8000**. You should see:

```
 Database synced successfully
 TeamBoard API running at http://localhost:8000
```

### Step 4 — Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173**. Open it in your browser and you're good to go.

### Running tests

```bash
cd backend
npm test
```

Tests use an in-memory SQLite database, so you don't need PostgreSQL running for them.

---

## Architecture Overview

The app follows a pretty standard client-server architecture. The React frontend (served by Vite on port 5173) communicates with the Express backend (port 8000) through REST API calls. The backend handles all the business logic — CRUD operations for projects and tasks, input validation with Joi, and the AI summarization feature. Data is persisted in PostgreSQL using Sequelize as the ORM, and the AI summary feature calls the OpenAI API to generate project progress reports based on task data.
---

## Folder Structure

```
DeloitteAssignment/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express app entry point, CORS, route registration
│   │   ├── database.js           # Sequelize instance and PostgreSQL connection
│   │   ├── models/
│   │   │   ├── index.js          # Model associations (Project has many Tasks)
│   │   │   ├── Project.js        # Project model
│   │   │   └── Task.js           # Task model
│   │   ├── routes/
│   │   │   ├── projects.js       # Project CRUD endpoints
│   │   │   ├── tasks.js          # Task CRUD endpoints
│   │   │   └── ai.js             # AI summary endpoint
│   │   ├── services/
│   │   │   └── aiService.js      # OpenAI integration 
│   │   └── middleware/
│   │       └── validate.js       # Joi request validation
│   ├── tests/
│   │   ├── projects.test.js      # Project API tests
│   │   ├── tasks.test.js         # Task API tests
│   │   └── ai.test.js            # AI summary tests
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/index.js          # Axios client for API calls
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Route-level page components
│   │   ├── App.jsx               # Root component with routing
│   │   └── index.css             # Tailwind config and custom styles
│   └── package.json
└── README.md
```

---

## API Endpoints

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects with task counts |
| POST | `/projects` | Create a new project |
| GET | `/projects/:id` | Get a single project with all its tasks |
| PUT | `/projects/:id` | Update project details |
| DELETE | `/projects/:id` | Delete a project and its tasks |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects/:id/tasks` | Add a task to a project |
| PUT | `/tasks/:id` | Update a task (status, assignee, etc.) |
| DELETE | `/tasks/:id` | Remove a task |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/summarize/:project_id` | Generate a project progress summary |

---

## How I Used GenAI Tools During Development

I used AI tools (mainly ChatGPT and GitHub Copilot) as a coding assistant throughout this project, but not as a code generator that I blindly copy-pasted from. Here's how it actually went:

**For boilerplate and setup** — I used AI to speed up the initial setup. Things like setting up the Express server, configuring database models, and writing the basic CRUD route structure. These are patterns I've written before, so using AI here was more about saving time on the repetitive parts rather than learning something new.

**For the AI service integration** — I wrote the core logic for generating the prompt myself, including fetching task data and calculating overdue tasks. I used AI to help with the OpenAI SDK syntax, particularly the chat.completions.create call, to ensure I was using the latest format.

**For validation and error handling** — I set up the Joi schemas by referring to what the frontend was already sending, and used AI to double-check edge cases I might have missed (like regex patterns for user names, proper UUID validation on route params).

**For the frontend** — Most of the Tailwind CSS classes were generated with the help of AI. The overall components and pages were built collaboratively, with me handling the core structure and logic, while AI assisted with styling and repetitive UI patterns.

**For tests** — I wrote the test structure and assertions myself based on what each endpoint should do. AI helped with the Jest + Supertest boilerplate (mocking the database, setting up `beforeAll`/`afterEach` hooks) since I was more familiar with other testing setups.

**For debugging** — when I hit issues (like connection errors or CORS problems), I'd describe the error to AI and get suggestions. Sometimes the fix was exactly what it suggested; other times I had to dig into the docs myself.


