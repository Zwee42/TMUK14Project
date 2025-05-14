// pages/api/socket.ts
import { Server } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiResponseServerIO } from '@/types/next'; // We'll define this below
import dbConnect from '@/lib/mongodb';
import { MessageModel } from '@/models/Message';


export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    return res.end();
  }

  const io = new Server(res.socket.server as any, {
    path: '/api/socketio',
  });

  res.socket.server.io = io;

  await dbConnect();

  io.on('connection', (socket) => {
    socket.on('message', async (msg) => {
      const saved = await MessageModel.create(msg);
      io.emit('message', saved);
    });

    socket.on('join-voice', (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit('voice-user-joined');
    });

    socket.on('voice-signal', ({ roomId, data }) => {
      socket.to(roomId).emit('voice-signal', { data });
    });

    socket.on('leave-voice', (roomId) => {
      socket.leave(roomId);
    });

  });

  res.end();
}
