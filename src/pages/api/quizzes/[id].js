// src/pages/api/quizzes/[id].js
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export default async function handler(req, res) {
  const { id } = req.query;

  // Read data file
  let data;
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    data = JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read data file:', error);
    return res.status(500).json({ error: 'Failed to read data file' });
  }

  // Find the quiz
  const quizIndex = data.quizzes.findIndex(q => q.id === id);
  
  if (quizIndex === -1) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(data.quizzes[quizIndex]);
  }

  if (req.method === 'PUT') {
    const { title, subject, questions } = req.body;
    
    // Update quiz
    data.quizzes[quizIndex] = {
      ...data.quizzes[quizIndex],
      title: title || data.quizzes[quizIndex].title,
      subject: subject || data.quizzes[quizIndex].subject,
      questions: questions || data.quizzes[quizIndex].questions,
      updatedAt: new Date().toISOString(),
    };
    
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
      return res.status(200).json(data.quizzes[quizIndex]);
    } catch (error) {
      console.error('Failed to update quiz:', error);
      return res.status(500).json({ error: 'Failed to update quiz' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Remove the quiz
      data.quizzes.splice(quizIndex, 1);
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      return res.status(500).json({ error: 'Failed to delete quiz' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}