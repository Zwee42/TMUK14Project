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

  const roomUsers = new Map<string, Map<string, string>>();

  io.on('connection', (socket) => {

    console.log('[Socket] New connection:', socket.id); 

    socket.on('message', async (msg) => {
      const saved = await MessageModel.create(msg);
      io.emit('message', saved);
    });


    socket.on('join-voice', ({ roomId, username }: { roomId: string; username: string }) => {
    socket.join(roomId);

    console.log(`[VoiceChat] User joined room ${roomId}:`, socket.id, username);
      
    if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
    const users = roomUsers.get(roomId)!;


    users.set(socket.id, username);

    // Send current user list with usernames to the newly joined user
    const userList = Array.from(users.entries()).map(([clientId, user]) => ({
      clientId,
      username: user,
    }));

    socket.emit('voice-user-list', userList);

    // Notify others in room
    console.log(`[VoiceChat] Emitting voice-user-joined to room ${roomId}:`, socket.id, username);
    socket.to(roomId).emit('voice-user-joined', { clientId: socket.id, username });
  });

  socket.on('leave-voice', (roomId: string) => {
    socket.leave(roomId);

    const users = roomUsers.get(roomId);
    if (users) {
      users.delete(socket.id);
      socket.to(roomId).emit('voice-user-left', socket.id);
      if (users.size === 0) roomUsers.delete(roomId);
    }
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        const users = roomUsers.get(roomId);
        if (users) {
          users.delete(socket.id);
          socket.to(roomId).emit('voice-user-left', socket.id);
          if (users.size === 0) roomUsers.delete(roomId);
        }
      }
    }
  });


  });

  res.end();
}
