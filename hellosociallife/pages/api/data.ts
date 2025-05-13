
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '@/utils/auth';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const sessionUser = await getUserFromRequest(req); // Laddar från token i httpOnly-cookie

  if (!sessionUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = await User.findById(sessionUser.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({
    _id: user.id,
    username: user.username,
    email: user.email,
    bio: user.bio,
    image: user.image
  });
    
}
