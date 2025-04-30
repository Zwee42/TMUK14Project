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

  if (req.method === 'POST') {
    const { userId, username, content } = req.body;
    console.log('Received message:', { userId, username, content });

    if (!userId || !username || !content) return res.status(400).json({ error: 'Missing fields' });

    const msg = await MessageModel.create({ userId, username, content });
    return res.status(201).json(msg);
  }

  return res.status(405).end();
}
