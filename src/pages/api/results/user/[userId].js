// src/pages/api/results/user/[userId].js
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

// In src/pages/api/results/user/[userId].js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Find all results where this user participated
    const userResults = data.results.filter(result => 
      result.players && result.players.some(player => 
        player.userId === userId || player.username === userId
      )
    );
    
    // Enrich with quiz titles and create complete result objects
    const enrichedResults = userResults.map(result => {
      const quiz = data.quizzes.find(q => q.id === result.quizId);
      const playerResult = result.players.find(p => p.userId === userId || p.username === userId);
      
      // Ensure each result has all required fields
      return {
        id: result.id,
        quizId: result.quizId,
        quizTitle: result.quizTitle || (quiz ? quiz.title : 'Unknown Quiz'),
        quizSubject: result.quizSubject || (quiz ? quiz.subject : ''),
        score: playerResult ? playerResult.score : 0,
        maxScore: quiz && quiz.questions ? quiz.questions.length * 1000 : 1000,
        completedAt: result.date,
        date: result.date
      };
    });
    
    // Sort by most recent first
    enrichedResults.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log(`Found ${enrichedResults.length} results for user ${userId}`);
    return res.status(200).json(enrichedResults);
  } catch (error) {
    console.error("Error retrieving user results:", error);
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
}