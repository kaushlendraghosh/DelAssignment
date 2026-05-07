const { GoogleGenerativeAI } = require('@google/generative-ai');


async function generateProjectSummary(project, tasks) {
  const apiKey = process.env.GEMINI_API_KEY || '';

  // Build task descriptions
  const taskLines = [];
  let overdueCount = 0;
  const now = new Date();

  for (const task of tasks) {
    let dueStr = 'No due date';
    let isOverdue = false;

    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      dueStr = `Due: ${dueDate.toISOString().split('T')[0]}`;
      if (dueDate < now && task.status !== 'Done') {
        isOverdue = true;
        overdueCount++;
      }
    }

    const overdueMarker = isOverdue ? '  OVERDUE' : '';
    taskLines.push(
      `  - ${task.title} (Status: ${task.status}, Assigned: ${task.assigned_user || 'Unassigned'}, ${dueStr})${overdueMarker}`
    );
  }

  const tasksText =
    taskLines.length > 0 ? taskLines.join('\n') : '  No tasks yet.';

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'Done').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const todo = tasks.filter((t) => t.status === 'To Do').length;

  const prompt = `You are a project management assistant. Analyze the following project and provide a concise progress summary.

Project: ${project.name}
Description: ${project.description}
Category: ${project.category}

Tasks (${total} total — ${done} done, ${inProgress} in progress, ${todo} to do, ${overdueCount} overdue):
${tasksText}

Provide a brief, actionable progress summary (3-5 sentences). Mention:
1. Overall completion percentage and status
2. Any overdue or at-risk tasks
3. Key recommendations for the team`;

  // If no API key, throw an error
  if (!apiKey || apiKey === 'sk-your-key-here' || apiKey === 'your-gemini-api-key') {
    const error = new Error('Gemini API key not configured.');
    error.status = 503;
    throw error;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: 'You are a helpful project management assistant.',
    });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });
    return result.response.text().trim();
  } catch (err) {
    console.error(`Gemini API Error: ${err.message}`);
    if (err.status === 429 || err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('rate limit')) {
      const error = new Error('Gemini API free credit exhausted or rate limit exceeded.');
      error.status = 429;
      throw error;
    }
    if (err.status === 503 || err.message.toLowerCase().includes('high demand') || err.message.toLowerCase().includes('503 service unavailable')) {
      const error = new Error('This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.');
      error.status = 503;
      throw error;
    }
    const error = new Error('Failed to generate summary from Gemini.');
    error.status = 500;
    throw error;
  }
}


module.exports = { generateProjectSummary };
