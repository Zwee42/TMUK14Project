'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

interface VoiceSignalData {
    type?: string;
    candidate?: RTCIceCandidateInit['candidate'];
}

const socket = io('', { path: '/api/socketio' });

export default function VoiceChat({ roomId }: { roomId: string }) {
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const [status, setStatus] = useState('Initializing...');

    useEffect(() => {
        const start = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;

            const peer = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
            });

            stream.getTracks().forEach((track) => peer.addTrack(track, stream));

            peer.ontrack = (event) => {
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = event.streams[0];
                }
            };

            peer.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('voice-signal', { roomId, data: event.candidate });
                }
            };

            socket.emit('join-voice', roomId);

            socket.on('voice-user-joined', async () => {
                socket.on('voice-signal', async ({ data }: { data: VoiceSignalData | RTCSessionDescriptionInit }) => {
                    if (data.type === 'offer') {
                        await peer.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit));
                        const answer = await peer.createAnswer();
                        await peer.setLocalDescription(answer);
                        socket.emit('voice-signal', { roomId, data: answer });
                    } else if (data.type === 'answer') {
                        await peer.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit));
                    } else if ('candidate' in data) {
                        await peer.addIceCandidate(new RTCIceCandidate(data as RTCIceCandidateInit));
                    }
                });
            });

            peerRef.current = peer;
            setStatus('Voice chat ready.');
        };

        start();

        return () => {
            peerRef.current?.close();
            socket.emit('leave-voice', roomId);
            setStatus('Disconnected');
        };
    }, [roomId]);

    return (
        <div className="p-4 bg-[#001d3d] border border-[#00bfff] rounded-lg text-[#00bfff] mt-4">
            <p className="mb-2">Voice Chat: {status}</p>
            <audio ref={remoteAudioRef} autoPlay />
        </div>
    );
}
