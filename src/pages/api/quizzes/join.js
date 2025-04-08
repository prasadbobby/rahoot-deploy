// src/pages/api/quizzes/join.js
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Quiz code is required' });
  }

  console.log(`Attempting to join quiz with code: ${code}`);

  // Read data file
  let data;
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    data = JSON.parse(fileContents);
    console.log(`Found ${data.quizzes.length} quizzes in data file`);
  } catch (error) {
    console.error('Error reading data file:', error);
    return res.status(500).json({ error: 'Failed to read data file' });
  }

  // Find quiz by code
  const quiz = data.quizzes.find(q => q.code === code);
  
  console.log(`Quiz found: ${quiz ? 'Yes' : 'No'}`);
  
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found with that code' });
  }

  // Return quiz information
  return res.status(200).json({
    id: quiz.id,
    title: quiz.title,
    subject: quiz.subject,
    code: quiz.code
  });
}