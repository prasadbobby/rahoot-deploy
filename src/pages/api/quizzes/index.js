// src/pages/api/quizzes/index.js - Update quiz creation to use more reliable code
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dataFilePath = path.join(process.cwd(), 'data.json');

export default async function handler(req, res) {
  // Read data file
  let data;
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    data = JSON.parse(fileContents);
  } catch (error) {
    data = { quizzes: [], users: [], results: [] };
  }

  if (req.method === 'GET') {
    // Return all quizzes (public fields only)
    const publicQuizzes = data.quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      questionCount: quiz.questions.length,
      createdBy: quiz.createdBy,
      createdAt: quiz.createdAt,
      code: quiz.code
    }));
    return res.status(200).json(publicQuizzes);
  }

  if (req.method === 'POST') {
    const { title, subject, questions, createdBy } = req.body;

    // Validate required fields
    if (!title || !subject || !questions || !createdBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate a 6-digit code that's not already in use
    let code;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (data.quizzes.some(q => q.code === code));

    // Create a new quiz
    const newQuiz = {
      id: uuidv4(),
      code,
      title,
      subject,
      questions,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    console.log(`Creating new quiz with code: ${code}`);

    // Add to data and save
    data.quizzes.push(newQuiz);
    fs.writeFileSync(dataFilePath, JSON.stringify(data), 'utf8');

    return res.status(201).json(newQuiz);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}