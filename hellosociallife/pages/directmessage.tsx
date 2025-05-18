import { useEffect, useState, useRef } from 'react';
import { GetServerSideProps } from 'next';
import io, { Socket } from 'socket.io-client';
import { requireAuth } from '@/utils/auth';

interface User {
  _id: string;
  userId: string;
  username: string;
}

interface Message {
  senderId: string;
  senderUsername: string;
  receiverId: string;
  receiverUsername: string;
  content: string;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return (await requireAuth(ctx)) || {
    redirect: { destination: '/', permanent: false },
  };
};

export default function DirectMessagesPage({ user }: { user: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io('', { path: '/api/socketio' });
    socketRef.current.emit('join', user.userId);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user.userId]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.filter((u: User) => u.userId !== user.userId));
    };
    fetchUsers();
  }, [user.userId]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      const res = await fetch(
        `/api/directmessages?userId=${user.userId}&partnerId=${selectedUser._id}`
      );
      const data = await res.json();

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error('Messages data is not an array:', data);
      }
    };

    fetchMessages();
    const socket = socketRef.current;
    socket?.emit('register', { userId: user.userId });

    socket?.on('new-directmessage', (message: Message) => {
      console.log(message)
      console.log(user)
      if (message.receiverId != user.userId || message.senderId != selectedUser._id) {
        console.log('return')
        return;
      }



      console.log('[DirectMessage] Received new message:', message);

      //if (message.receiverId !== user.userId) {
      const audio = new Audio('/notis.wav');
      audio.play().catch((err) => {
        console.warn('Notification sound failed to play:', err);

      } ) 
   // }

      setMessages((prev) => [...prev, message]);
    });

    

    return () => {
      socket?.off('new-directmessage');
    };

  }, [selectedUser, user.userId]);




  const sendMessage = () => {
    if (!selectedUser || !socketRef.current) return;

    const trimmed = input.trim();
    if (!trimmed) return;

    const newMessage: Message = {
      senderId: user.userId,
      senderUsername: user.username,
      receiverId: selectedUser._id,
      receiverUsername: selectedUser.username,
      content: trimmed,
    };

    socketRef.current.emit('directmessage', { to: selectedUser._id, directmessage: newMessage });
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-screen p-8 text-white bg-black flex flex-row relative">
      {/* Header */}
      <h2 className="text-3xl font-bold text-[#00bfff] absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        Direct Messages
      </h2>

      {/* Return button */}
      <button
        onClick={() => (window.location.href = '/chat_option')}
        className="absolute top-4 right-4 px-6 py-3 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] hover:bg-[#001d3d] transition-all duration-300"
      >
        Return
      </button>

      {/* User list */}
      <ul className="w-64 pr-6 py-6 px-2 space-y-3 border-r border-[#003366] overflow-y-auto max-h-[calc(100vh-72px)] mt-16">
        {users.map((u) => (
          <li
            key={u.userId}
            onClick={() => setSelectedUser(u)}
            className={`cursor-pointer px-4 py-2 rounded-md border ${selectedUser?.userId === u.userId
                ? 'bg-[#002244] border-[#00bfff]'
                : 'bg-[#001722] border-[#002244]'
              } hover:bg-[#003355] transition`}
          >
            {u.username}
          </li>
        ))}
      </ul>

      {/* Chat area */}
      <div className="flex-1 flex flex-col ml-4 mt-16">
        {selectedUser && (
          <>
            <div className="bg-[#001e3c] px-6 py-4 text-xl font-bold text-[#00a3ff] border-b border-[#004080]">
              Chatting with: {selectedUser.username}
            </div>

            <div
              className="flex flex-col p-4 flex-1 overflow-y-auto"
              ref={chatRef}
              style={{ backgroundColor: '#0a1a2a' }}
            >
              {messages.length > 0 ? (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-2 flex ${msg.senderId === user.userId ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    <div
                      className={`rounded-md p-3 max-w-xs break-words ${msg.senderId === user.userId
                          ? 'bg-[#0b233f] text-[#a1c3ff] rounded-tr-none'
                          : 'bg-[#121212] text-[#cbd5e1] rounded-tl-none'
                        }`}
                      style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.7)' }}
                    >
                      <div className="font-semibold text-sm mb-1">{msg.senderUsername}</div>
                      <div>{msg.content}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[#666]">No messages yet.</div>
              )}
            </div>

            {/* Input box */}
            <div className="flex p-4" style={{ backgroundColor: '#121c2d' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="w-full p-2 bg-[#121c2d] border border-[#223355] text-[#d0e0ff] rounded-md"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="ml-2 bg-[#223355] p-2 text-[#d0e0ff] rounded-md hover:bg-[#2c4066] transition"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
