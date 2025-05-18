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
