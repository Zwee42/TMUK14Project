// pages/api/directMessages.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import { DirectMessageModel } from '@/models/DirectMessage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    const { userId, partnerId } = req.query;

    if (!userId || !partnerId) {
      return res.status(400).json({ error: 'Missing userId or partnerId' });
    }

    const messages = await DirectMessageModel.find({ // hitta i hela databasen med nedstående kriterier
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean(); // Converts to plain JavaScript objects

    return res.status(200).json(messages);
  }

  return res.status(405).end();
}
