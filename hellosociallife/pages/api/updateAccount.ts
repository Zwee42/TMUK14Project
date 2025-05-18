import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import {UserModel,  User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { getUserFromRequest, signCookie } from '@/utils/auth';
import { SessionUser } from '@/models/sessionUser';
import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';

type Data = {
  message: string;
  user?: {
    _id: string;
    username: string;
    email: string;
    bio: string | null;
    image: string | null;
  };
};

const secret_code = process.env.JWT_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sessionUser: SessionUser | null = await getUserFromRequest(req);
  if (!sessionUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { username, bio, image } = req.body;

  if (!username || username.includes(' ')) {
    return res.status(400).json({ message: 'Invalid username' });
  }

  try {
    await dbConnect();

    const existingUser = await User.findByIdWithPassword(sessionUser.userId);

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
   

    // Uppdatera användaren
    const updatedUser = await User.findOneAndUpdate(
      sessionUser.userId,
      { username, bio, image },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    signCookie (updatedUser, res);
    

    return res.status(200).json({
      message: 'Profile updated',
   
    });
  } catch (error) {
    console.error('Profile failed to update:', error);
    return res.status(500).json({ message: 'Failed to save profile' });
  }
}

