const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_PATH = path.join(__dirname, 'db.json');

// Helper function to read the database
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    throw error;
  }
}

// Helper function to write to the database
async function writeDB(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
    throw error;
  }
}

// GET all todos
app.get('/todos', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.todos);
  } catch (error) {
    console.error('Error in GET /todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST a new todo
app.post('/todos', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }

    const db = await readDB();
    const newTodo = {
      id: db.todos.length + 1,
      task,
      status: false
    };
    db.todos.push(newTodo);
    await writeDB(db);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error in POST /todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update status of even ID todos
app.put('/todos/update-even', async (req, res) => {
  try {
    const db = await readDB();
    db.todos = db.todos.map(todo => {
      if (todo.id % 2 === 0 && todo.status === false) {
        return { ...todo, status: true };
      }
      return todo;
    });
    await writeDB(db);
    res.json({ message: 'Updated status of even ID todos' });
  } catch (error) {
    console.error('Error in PUT /todos/update-even:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE todos with status true
app.delete('/todos/completed', async (req, res) => {
  try {
    const db = await readDB();
    db.todos = db.todos.filter(todo => !todo.status);
    await writeDB(db);
    res.json({ message: 'Deleted completed todos' });
  } catch (error) {
    console.error('Error in DELETE /todos/completed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (error) => {
  console.error('Error starting server:', error);
});

// Catch any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});