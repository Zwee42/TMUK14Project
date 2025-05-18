// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User'; // Adjust this path to where your User model is

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const users = await UserModel.find({}, '_id username'); // Only return _id and username
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
