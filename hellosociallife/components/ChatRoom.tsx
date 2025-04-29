// // components/ChatRoom.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';
// import { ObjectId } from 'mongodb';  // If you want to use real ObjectId
// import { GetServerSideProps } from 'next';
// import { requireAuth } from '@/utils/auth';
// import { User } from '@/models/User';



// const socket = io('', { path: '/api/socketio' });

// interface Message {
//   _id: string;
//   username: string;
//   content: string;
//   createdAt: string;
// }

// export const getServerSideProps: GetServerSideProps = async (ctx) => {
//   return await requireAuth(ctx) || { redirect: { destination: '/', permanent: false } };
// };

// export default function ChatRoom({ user }: { user: User }) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');

//   useEffect(() => {
//     fetch('/api/messages')
//       .then((res) => res.json())
//       .then(setMessages);

//     fetch('/api/socket'); // initialize socket

//     socket.on('message', (msg: Message) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     return () => socket.off('message');
//   }, []);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     console.log('Sending message:', user);

//     const newMsg = {
//       userId: user.id,  // Generate an ObjectId or get it from a session
//       username: user.username,
//       content: input,
//     };

//     socket.emit('message', newMsg);
//     await fetch('/api/messages', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(newMsg),
//     });

//     setInput('');
//   };

//   return (
//     <div className="p-4">
//       <div className="h-96 overflow-y-scroll border rounded p-2 mb-2 bg-white">
//         {messages.map((m) => (
//           <div key={m._id}>
//             <strong>{m.username}:</strong> {m.content}
//           </div>
//         ))}
//       </div>
//       <input
//         className="w-full border p-2"
//         placeholder="Type a message"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//       />
//     </div>
//   );
// }
