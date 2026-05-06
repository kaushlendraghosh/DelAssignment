require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./database');

// Import routes
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 8000;


// CORS — allow frontend dev server
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


app.use(express.json());


app.get('/', (req, res) => {
  res.json({ status: 'ok', app: 'TeamBoard', version: '1.0.0' });
});

app.use('/projects', projectRoutes);
app.use('/', taskRoutes);
app.use('/ai', aiRoutes);


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ detail: 'Internal server error' });
});


// Only start listening if this file is run directly (not imported for testing)
if (require.main === module) {
  (async () => {
    try {
      // Sync database (creates tables if they don't exist)
      await sequelize.sync();
      console.log(' Database synced successfully');

      app.listen(PORT, () => {
        console.log(` TeamBoard API running at http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error(' Failed to start server:', err);
      process.exit(1);
    }
  })();
}

module.exports = app;
