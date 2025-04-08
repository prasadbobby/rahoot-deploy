// src/pages/api/results/[quizId].js
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { quizId } = req.query;

  // Read data file
  let data;
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    data = JSON.parse(fileContents);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read data file' });
  }

  // Filter results for the specified quiz
  const quizResults = data.results.filter(result => result.quizId === quizId);
  
  return res.status(200).json(quizResults);
}