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
            try {
                console.log('[VoiceChat] Requesting microphone access...');
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log('[VoiceChat] Microphone access granted');

                localStreamRef.current = stream;

                const peer = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                });

                stream.getTracks().forEach((track) => {
                    console.log(`[VoiceChat] Adding track: ${track.kind}`);
                    peer.addTrack(track, stream);
                });

                peer.ontrack = (event) => {
                    console.log('[VoiceChat] Received remote track');
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = event.streams[0];
                        console.log('[VoiceChat] Set remote audio stream');
                    }
                };

                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log('[VoiceChat] Sending ICE candidate');
                        socket.emit('voice-signal', { roomId, data: event.candidate });
                    }
                };

                peerRef.current = peer;

                console.log('[VoiceChat] Joining room:', roomId);
                socket.emit('join-voice', roomId);

                socket.on('voice-user-joined', async () => {
                    console.log('[VoiceChat] A user joined the voice room');

                    socket.on('voice-signal', async ({ data }: { data: VoiceSignalData | RTCSessionDescriptionInit }) => {
                        if (data.type === 'offer') {
                            console.log('[VoiceChat] Received offer');
                            await peer.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit));
                            const answer = await peer.createAnswer();
                            await peer.setLocalDescription(answer);
                            console.log('[VoiceChat] Sending answer');
                            socket.emit('voice-signal', { roomId, data: answer });
                        } else if (data.type === 'answer') {
                            console.log('[VoiceChat] Received answer');
                            await peer.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit));
                        } else if ('candidate' in data) {
                            console.log('[VoiceChat] Received ICE candidate');
                            await peer.addIceCandidate(new RTCIceCandidate(data));
                        }
                    });

                    // Send offer (only if you're the one initiating)
                    const offer = await peer.createOffer();
                    await peer.setLocalDescription(offer);
                    console.log('[VoiceChat] Sending offer');
                    socket.emit('voice-signal', { roomId, data: offer });
                });

                setStatus('Voice chat ready.');
            } catch (err) {
                console.error('[VoiceChat] Error initializing voice chat:', err);
                setStatus('Error accessing microphone');
            }
        };

        start();

        return () => {
            console.log('[VoiceChat] Cleaning up...');
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
