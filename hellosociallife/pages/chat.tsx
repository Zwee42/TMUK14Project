import { useEffect, useState, useRef } from 'react';
import { GetServerSideProps } from 'next';
import io from 'socket.io-client';
import { requireAuth } from '@/utils/auth'; // Antag att denna funktion finns

const socket = io('', { path: '/api/socketio' });

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await requireAuth(ctx) || { redirect: { destination: '/', permanent: false } };
};

export default function ChatPage({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data);
    };
    fetchMessages();

    socket.on('message', (msg: any) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      username: user.username,
      content: input,
      userId: user.userId,
    };

    socket.emit('message', newMessage);

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage),
    });

    setInput('');
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#000814] via-[#000d1a] to-[#001a33] text-gray-200 p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-4">
          <span className="text-[4rem] md:text-[5rem] font-light">🌐</span>
          <div className="flex gap-2 text-[5rem] md:text-[6rem] font-extralight tracking-widest text-[#00bfff] drop-shadow-[0_0_25px_rgba(0,191,255,0.8)]">
            <span className="border-l-4 border-[#00bfff] pl-3">H</span>
            <span className="font-[cursive]">S</span>
            <span className="border-b-4 border-[#00bfff] pb-2">L</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div
        ref={chatRef}
        className="w-full max-w-2xl bg-[#000814] border-2 border-[#00bfff] rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.3)] p-4 mb-4 overflow-y-auto"
        style={{ height: '500px' }}
      >
        {messages.map((msg) => (
          <div key={msg._id} className="mb-3 p-3 rounded-lg bg-[#001d3d]">
            <strong className="text-[#00bfff]">{msg.username}:</strong> {msg.content}
          </div>
        ))}
      </div>

      {/* Input + Send Button */}
      <div className="flex w-full max-w-2xl gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 py-3 px-4 rounded-xl bg-[#000814] text-white border-2 border-[#00bfff] focus:outline-none focus:ring-2 focus:ring-[#00bfff] transition"
        />
        <button
          onClick={sendMessage}
          className="px-6 py-3 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] hover:bg-[#001d3d] transition-all duration-300"
          Send
        </button>
      </div>
    </div>
  );
}
