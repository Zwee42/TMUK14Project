'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

interface VoiceSignalData {
  type?: string;
  candidate?: RTCIceCandidateInit['candidate'];
}

interface VoiceSignalPayload {
  from: string;
  data: VoiceSignalData | RTCSessionDescriptionInit;
}

function isRTCSessionDescription(data: any): data is RTCSessionDescriptionInit {
  return (
    data &&
    ['offer', 'answer', 'pranswer', 'rollback'].includes(data.type)
  );
}

// Simple random username generator (can customize or extend)
function generateRandomUsername() {
  const adjectives = ['Cool', 'Smart', 'Happy', 'Swift', 'Bright'];
  const animals = ['Tiger', 'Eagle', 'Shark', 'Wolf', 'Panther'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adj}${animal}${number}`;
}


export default function VoiceChat({ roomId }: { roomId: string }) {



  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  // Map client ID to username
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  // Your own username
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    setMyUsername(generateRandomUsername());
  }, []);

  useEffect(() => {
    if (!myUsername) return; // wait until username is set

    const socket = io('', { path: '/api/socketio' });
    // setSocket(socket);

    // if(!socket) return;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setStatus('Microphone access granted');
        console.log('[VoiceChat] Microphone access granted');

        socket.on('connect', () => {
          console.log('[VoiceChat] Socket connected, joining room', roomId);
          // Tell server your username on join
          socket.emit('join-voice', { roomId, username: myUsername });
        });

        // When a new user joins
        socket.on('voice-user-joined', ({ clientId, username }: { clientId: string; username: string }) => {
          console.log('[VoiceChat] User joined:', clientId, username);
          if (clientId === socket.id || peersRef.current.has(clientId)) return;

          setConnectedUsers(prev => {
            const updated = [...new Set([...prev, clientId])];
            console.log('[VoiceChat] Connected users updated:', updated);
            return updated;
          });

          setUsernames(prev => ({ ...prev, [clientId]: username }));

          const peer = createPeer(clientId, true);
          peersRef.current.set(clientId, peer);
        });

        // When a user leaves
        socket.on('voice-user-left', (clientId: string) => {
          console.log('[VoiceChat] User left:', clientId);
          setConnectedUsers(prev => {
            const updated = prev.filter(id => id !== clientId);
            console.log('[VoiceChat] Connected users updated:', updated);
            return updated;
          });

          setUsernames(prev => {
            const updated = { ...prev };
            delete updated[clientId];
            return updated;
          });

          peersRef.current.get(clientId)?.close();
          peersRef.current.delete(clientId);

          setRemoteStreams(prev => {
            const updated = { ...prev };
            delete updated[clientId];
            return updated;
          });
        });

        // Initial user list with usernames
        socket.on('voice-user-list', (users: { clientId: string; username: string }[]) => {
          console.log('[VoiceChat] Received user list:', users);
          setConnectedUsers(prev => {
            const ids = users.map(u => u.clientId);
            const updated = [...new Set([...prev, ...ids])];
            console.log('[VoiceChat] Connected users updated:', updated);
            return updated;
          });

          setUsernames(prev => {
            const map = { ...prev };
            users.forEach(({ clientId, username }) => {
              map[clientId] = username;
            });
            return map;
          });
        });

        socket.on('voice-signal', async ({ from, data }: VoiceSignalPayload) => {
          if (from === socket.id) return;

          console.log('[VoiceChat] Received signal from', from, 'data:', data);

          let peer = peersRef.current.get(from);
          if (!peer) {
            console.log('[VoiceChat] Creating peer from signal for:', from);
            peer = createPeer(from, false);
            peersRef.current.set(from, peer);
            setConnectedUsers(prev => [...new Set([...prev, from])]);
          }

          console.log('[VoiceChat] Received signal from', from, 'data:', data);

          if (data.type === 'offer' && isRTCSessionDescription(data)) {
            console.log('[VoiceChat] Received offer, setting remote description');
            await peer.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await peer.createAnswer();
            console.log('[VoiceChat] Created answer:', answer);
            await peer.setLocalDescription(answer);
            socket.emit('voice-signal', {
              roomId,
              to: from,
              from: socket.id,
              data: answer,
            });
            console.log('[VoiceChat] Sent answer to', from);
          } else if (data.type === 'answer' && isRTCSessionDescription(data)) {
            console.log('[VoiceChat] Received answer, setting remote description');
            await peer.setRemoteDescription(new RTCSessionDescription(data));
          } else if ('candidate' in data && data.candidate) {
            console.log('[VoiceChat] Received ICE candidate from', from);
            await peer.addIceCandidate(new RTCIceCandidate(data));
          }
        });

        setStatus('Voice chat ready.');
        console.log('[VoiceChat] Voice chat ready');
      } catch (err) {
        console.error('[VoiceChat] Error initializing:', err);
        setStatus('Microphone access failed');
      }
    };

    const createPeer = (peerId: string, initiator: boolean): RTCPeerConnection => {
      console.log('[VoiceChat] Creating peer', peerId, 'initiator:', initiator);
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      localStreamRef.current?.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current!);
      });

      peer.onicecandidate = ({ candidate }) => {
        if (candidate) {
          console.log('[VoiceChat] Sending ICE candidate to', peerId);
          socket.emit('voice-signal', {
            roomId,
            to: peerId,
            from: socket.id,
            data: candidate,
          });
        }
      };

      peer.ontrack = ({ streams }) => {
        console.log('[VoiceChat] Received remote stream from', peerId);
        if (streams[0]) {
          setRemoteStreams(prev => ({ ...prev, [peerId]: streams[0] }));
        }
      };

      if (initiator) {
        peer
          .createOffer()
          .then(offer => {
            console.log('[VoiceChat] Created offer for', peerId, offer);
            return peer.setLocalDescription(offer);
          })
          .then(() => {
            console.log('[VoiceChat] Sending offer to', peerId);
            socket.emit('voice-signal', {
              roomId,
              to: peerId,
              from: socket.id,
              data: peer.localDescription!,
            });
          });
      }

      return peer;
    };

    start();

    return () => {
      peersRef.current.forEach(peer => peer.close());
      peersRef.current.clear();
      socket.emit('leave-voice', roomId);
      setConnectedUsers([]);
      setUsernames({});
      setStatus('Disconnected');
      console.log('[VoiceChat] Cleanup complete');
    };
  }, [roomId, myUsername]);

  return (
    <div className="p-4 bg-[#001d3d] border border-[#00bfff] rounded-lg text-[#00bfff] mt-4">
      <p className="mb-2">Voice Chat: {status}</p>
      <p className="mb-2">
        You are: <strong>{myUsername}</strong>
      </p>
      <p className="mb-2">Connected users: {connectedUsers.length}</p>
      <ul className="mb-2 list-disc pl-5">
        {connectedUsers.map(id => (
          <li key={id} className="text-sm break-all">
            {usernames[id] || id} 
            {/* {id === socket.id ? '(You)' : ''} */}
          </li>
        ))}
      </ul>
      {Object.entries(remoteStreams).map(([id, stream]) => (
        <audio
          key={id}
          autoPlay
          ref={el => {
            if (el) el.srcObject = stream;
          }}
        />
      ))}
    </div>
  );
}
