// pages/api/user.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/AUser';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const token = req.headers.authorization?.split(' ')[1];
  const user = getUserFromToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const fullUser = await User.findById(user.userId).select('username avatar');
  if (!fullUser) return res.status(404).json({ message: 'User not found' });

  res.status(200).json({ username: fullUser.username, avatar: fullUser.avatar });
}
