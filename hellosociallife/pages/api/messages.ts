// pages/api/messages.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import { MessageModel } from '@/models/Message';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    const messages = await MessageModel.find().sort({ createdAt: -1 }).limit(1000);
    return res.status(200).json(messages.reverse());
  }

  return res.status(405).end();
}
