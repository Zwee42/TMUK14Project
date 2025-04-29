import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookie = req.headers.cookie || '';


  const authToken = cookie
    .split(';')
    .find((c) => c.trim().startsWith('auth_token='));

  if (!authToken){

    return res.status(401).json({ isLoggedIn: false });
} 
  const token = authToken.split('=')[1];
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    res.status(200).json({ isLoggedIn: true, user });
  } catch {
    console.error('Error decoding token:');
    res.status(401).json({ isLoggedIn: false });
  }
}
