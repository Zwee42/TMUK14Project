import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/AUser';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();

  const token = req.headers.authorization?.split(' ')[1];
  const user = getUserFromToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { avatarUrl } = req.body;
  if (!avatarUrl) return res.status(400).json({ message: 'No avatar URL provided' });

  await User.findByIdAndUpdate(user.userId, { avatar: avatarUrl });

  res.status(200).json({ message: 'Avatar updated' });
}
