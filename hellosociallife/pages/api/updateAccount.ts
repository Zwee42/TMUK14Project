import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { getUserFromRequest } from '@/utils/auth';
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

  const { username, email, bio, image, currentpassword } = req.body;

  if (!username || username.includes(' ')) {
    return res.status(400).json({ message: 'Invalid username' });
  }

  try {
    await dbConnect();

    const existingUser = await User.findById(sessionUser.userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(existingUser);
    // Kontrollera om e-posten ändras
    if (email && email !== existingUser.email) {
      if (!currentpassword) {
        return res.status(400).json({ message: 'Current password is required to change email' });
      }

      // Validera lösenord - använd bcrypt.compare mot sparat hash
      const isPasswordValid = await bcrypt.compare(currentpassword, existingUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email address' });
      }

      // Kontrollera om e-posten redan används av någon annan
      const emailTaken = await User.findOne( email );
      if (emailTaken) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }

    // Uppdatera användaren
    const updatedUser = await User.findOneAndUpdate(
      sessionUser.userId,
      { username, email, bio, image },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Skapa ny JWT-token
    const updateToken = jwt.sign(
      {
        userId: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.image,
        bio: updatedUser.bio,
      },
      secret_code,
      { expiresIn: '1h' }
    );

    // Sätt cookie med ny token
    res.setHeader(
      'Set-Cookie',
      serialize('auth_token', updateToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60,
      })
    );

    return res.status(200).json({
      message: 'Profile updated',
   
    });
  } catch (error) {
    console.error('Profile failed to update:', error);
    return res.status(500).json({ message: 'Failed to save profile' });
  }
}

