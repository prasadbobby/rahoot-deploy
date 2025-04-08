// src/pages/api/results/index.js
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
    fs.writeFileSync(dataFilePath, JSON.stringify(data), 'utf8');
  }

  if (req.method === 'POST') {
    const { quizId, userId, username, answers, score, maxScore } = req.body;

    // Validate required fields
    if (!quizId || !userId || !username || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a new result
    const newResult = {
      id: uuidv4(),
      quizId,
      userId,
      username,
      answers,
      score,
      maxScore,
      completedAt: new Date().toISOString(),
    };

    // Add to data and save
    data.results.push(newResult);
    fs.writeFileSync(dataFilePath, JSON.stringify(data), 'utf8');

    return res.status(201).json(newResult);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}