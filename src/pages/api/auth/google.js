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

  const { tokenId, userData } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    // Ensure the token's user information matches what was sent
    if (payload.sub !== userData.id || payload.email !== userData.email) {
      return res.status(401).json({ error: 'Token validation failed' });
    }
    
    // Read data file
    let data;
    try {
      const fileContents = fs.readFileSync(dataFilePath, 'utf8');
      data = JSON.parse(fileContents);
    } catch (error) {
      data = { quizzes: [], users: [], results: [] };
    }
    
    // Check if user already exists
    const existingUserIndex = data.users.findIndex(user => user.id === userData.id);
    
    if (existingUserIndex >= 0) {
      // Update existing user
      data.users[existingUserIndex] = {
        ...data.users[existingUserIndex],
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
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
    
    fs.writeFileSync(dataFilePath, JSON.stringify(data), 'utf8');
    
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}