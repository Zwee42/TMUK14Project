// pages/api/protected.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const SECRET_KEY = process.env.SECRET_KEY as string; // Same key as in login

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || ''); // Parse cookies
  const token = cookies.auth_token; // Get JWT token

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Verify token
    return res.status(200).json({ message: 'Access granted', user: decoded });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
