import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.JWT_SECRET as string;  

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | { error: string }>
) {

  const loginUser = async () => {
    try {

      if (req.method !== 'POST') return res.status(405).end();

      await dbConnect();
      const { username, email, password } = req.body;
    
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
      // Create a JWT with user data
      const token = jwt.sign({
        userId: user._id.toString(),
        username: username,
        email: email,
      }, SECRET_KEY, { expiresIn: '1h' });

      // Set the JWT as a cookie
      res.setHeader('Set-Cookie', serialize('auth_token', token, {
        httpOnly: true, // Prevent client-side JavaScript from accessing it
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'strict', // Prevent CSRF attacks
        path: '/', // Available across the entire site
        maxAge: 3600, // 1 hour in seconds
      }));

      res.status(200).json({ message: 'Logged in successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  };

  // Call the fetchToken function and wait for it to finish
  await loginUser();



}
