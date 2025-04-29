// pages/api/update-profile.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import{User} from '@/models/User';
import { getUserFromRequest } from '@/utils/auth';
import { SessionUser } from '@/models/sessionUser';

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sessionUser: SessionUser | null = await getUserFromRequest(req);
  if (!sessionUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { username, email, bio } = req.body;

  if (!username || username.includes(' ')) {
    return res.status(400).json({ message: 'Ogiltigt användarnamn' });
  }

  try {
    await dbConnect();

    const updatedUser = await User.findOneAndUpdate(
       sessionUser.userId,
     { username, email, bio },
     
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Profile updated' });
  } catch (error) {
    console.error('Fel vid uppdatering:', error);
    return res.status(500).json({ message: 'Failed to save profile' });
  }
}
