// src/pages/api/auth/google.js
import fs from 'fs';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';

const dataFilePath = path.join(process.cwd(), 'data.json');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { credential } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    // Create user data
    const userData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      firstName: payload.given_name,
      lastName: payload.family_name,
    };
    
    // Add or update user in data.json
    try {
      let data;
      try {
        const fileContents = fs.readFileSync(dataFilePath, 'utf8');
        data = JSON.parse(fileContents);
      } catch (error) {
        data = { users: [], quizzes: [], results: [] };
      }
      
      // Check if user already exists
      const existingUserIndex = data.users.findIndex(user => user.id === userData.id);
      
      if (existingUserIndex !== -1) {
        // Update existing user
        data.users[existingUserIndex] = {
          ...data.users[existingUserIndex],
          ...userData,
          lastLogin: new Date().toISOString(),
        };
      } else {
        // Add new user
        data.users.push({
          ...userData,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
      }
      
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
    
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}