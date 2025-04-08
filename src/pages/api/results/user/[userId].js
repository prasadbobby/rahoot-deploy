// src/pages/api/results/user/[userId].js
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  // Read data file
  let data;
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    data = JSON.parse(fileContents);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read data file' });
  }

  // Filter results for the specified user
  const userResults = data.results.filter(result => result.userId === userId);
  
  // Enrich with quiz titles
  const enrichedResults = userResults.map(result => {
    const quiz = data.quizzes.find(q => q.id === result.quizId);
    return {
      ...result,
      quizTitle: quiz ? quiz.title : 'Unknown Quiz',
      quizSubject: quiz ? quiz.subject : '',
    };
  });
  
  return res.status(200).json(enrichedResults);
}