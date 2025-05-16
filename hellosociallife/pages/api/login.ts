import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret'; // fallback for tests

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

    const user = await UserModel.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    }).select('+password'); // Viktigt!

    if (!user) {
      return res.status(401).json({ error: 'Fel e-post eller användarnamn' });
    }
    console.log(user);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid ddcredentials' });
    }

    const token = jwt.sign({
      userId: user.id,
      username: user.username,
      email: user.email,
      avatar: user.image,
      bio: user.bio
    }, SECRET_KEY, { expiresIn: '1h' });

    res.setHeader('Set-Cookie', serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600,
    }));

    return res.status(200).json({ message: 'Logged in successfully' });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to log in' });
  }
}
