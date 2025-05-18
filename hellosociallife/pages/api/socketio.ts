// pages/api/socket.ts
import { Server } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiResponseServerIO } from '@/types/next'; // We'll define this below
import dbConnect from '@/lib/mongodb';
import { MessageModel } from '@/models/Message';
import { DirectMessageModel } from '@/models/DirectMessage';
import { dir } from 'console';

const userSockets:  Record<string, string> = {}; // userId -> socket.id


export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    return res.end();
  } 

  const io = new Server(res.socket.server as any, {
    path: '/api/socketio',
  });

  res.socket.server.io = io;

  await dbConnect();
<<<<<<< HEAD

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


=======
  io.on('connection', (socket) => {
    socket.on('message', async (msg) => { // anropar socker med nyckeln message
      const saved = await MessageModel.create(msg);
      io.emit('message', saved);
    });    


    
    socket.on('directmessage', async ({to, directmessage}) => {
      console.log("received message", directmessage);
      const saved = await DirectMessageModel.create(directmessage); // messagemodel, fel. ska använda DirectMessage för models
      console.log("Usercoekrts :", userSockets)
      console.log("to: ", to);

      const targetSocketId = userSockets[to.trim().toLowerCase()];


  if (targetSocketId) {
    io.to(targetSocketId).emit('new-directmessage', directmessage);
  }


    })

    socket.on('register', (userId: any) => {
      const id: string = userId.userId ;
const normalizedKey = id.trim().toLowerCase();

userSockets[normalizedKey] = socket.id;
  });

  socket.on('disconnect', () => {
    delete userSockets[socket.data.userId]
>>>>>>> a177bdd7c5c6958bae922e423ee6fbe26ff2190d
  });

  //   socket.on('directmessage', ({ to, message }) => {
  //   // Find socket by user ID
  //   const targetSocket = [...io.sockets.sockets.values()].find(s => s.data.userId === to);
  //   if (targetSocket) {
  //     targetSocket.emit('directmessage', {
  //       from: socket.data.userId,
  //       message,
  //     });
  //   }
  // });

  });


  res.end();
}
