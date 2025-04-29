import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import io from 'socket.io-client';
import { User } from '@/models/User';
import { requireAuth } from '@/utils/auth'; // Assuming this function is in /lib/auth.ts

const socket = io('', { path: '/api/socketio' });

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await requireAuth(ctx) || { redirect: { destination: '/', permanent: false } };
};

export default function ChatPage({ user }: { user: User }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data);
    };
    fetchMessages();

    // Initialize socket and listen for new messages
    socket.on('message', (msg: any) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('message'); // Clean up socket listener on unmount
    };
  }, []);

  // Send message to both the socket and database
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      username: user.username,
      content: input,
      userId: user.userId, // Make sure userId is sent with the message
    };

    // Emit the message via socket
    socket.emit('message', newMessage);

    // Save the message to the database
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage),
    });

    setInput(''); // Clear input after sending
  };

  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages are added
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]); // Dependency on messages to trigger scroll

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ color: '#00bfff', textAlign: 'center', fontSize: '2rem', marginBottom: '1rem' }}>
        💬 Live Chat
      </h1>
  
      <div
        id="chat-container"
        style={{
          height: '650px',  // Minskat höjd på chattrutan
          overflowY: 'auto',
          border: '2px solid #00bfff',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          background: '#001a33',
          color: '#fff',
        }}
      >
        {messages.map((msg) => (
          <div key={msg._id} style={{ margin: '0.5rem 0', padding: '0.5rem', borderRadius: '8px', background: '#003366' }}>
            <strong style={{ color: '#00bfff' }}>{msg.username}:</strong> {msg.content}
          </div>
        ))}
      </div>
  
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '8px',
            border: '2px solid #00bfff',
            background: '#001a33',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '0.75rem 1rem',
            background: '#003366',
            color: '#00bfff',
            border: '2px solid #00bfff',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#001a33'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#003366'}
        >
          Send
        </button>
      </div>
    </div>
  );
  
  
}
