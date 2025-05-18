import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { signCookie } from '@/utils/auth';



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { emailOrUsername, password }: { emailOrUsername: string; password: string } = req.body;

  try {
    await dbConnect();

    // Find user by email or username
    const user = await User.findOne(emailOrUsername);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords (if your user model doesn't have comparePassword, use bcrypt directly)
    const isMatch = await user.comparePassword?.(password) ?? await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // token pointer
    signCookie(user, res);
    

    return res.status(200).json({ message: 'Logged in successfully' });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to log in' });
  }
}
