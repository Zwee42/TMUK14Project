/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VoiceChat from '@/components/VoiceChat';

// Mock för navigator.mediaDevices.getUserMedia
beforeAll(() => {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn(() => Promise.resolve(new MediaStream())),
    },
    configurable: true,
  });

  // Mocka RTCPeerConnection som klass med statisk generateCertificate-metod
  class MockRTCPeerConnection {
    addTrack = jest.fn();
    createOffer = jest.fn(() => Promise.resolve({ type: 'offer', sdp: 'fake sdp' }));
    setLocalDescription = jest.fn(() => Promise.resolve());
    setRemoteDescription = jest.fn(() => Promise.resolve());
    createAnswer = jest.fn(() => Promise.resolve({ type: 'answer', sdp: 'fake sdp answer' }));
    addIceCandidate = jest.fn(() => Promise.resolve());
    close = jest.fn();
    localDescription = { type: 'offer', sdp: 'fake sdp' };
    onicecandidate: ((ev: any) => void) | null = null;
    ontrack: ((ev: any) => void) | null = null;
  }
  (MockRTCPeerConnection as any).generateCertificate = jest.fn(() => Promise.resolve({}));

  // Sätt global RTCPeerConnection till mocken
  (global as any).RTCPeerConnection = MockRTCPeerConnection;

  // Mocka audio element srcObject property
  Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
    configurable: true,
    set() {},
  });
});

afterAll(() => {
  jest.resetAllMocks();
});

test('renders VoiceChat component and shows status', async () => {
  render(<VoiceChat roomId="test-room" />);

  // Vänta på att status texten dyker upp
  await waitFor(() => expect(screen.getByText(/Voice Chat:/)).toBeInTheDocument());

  // Kontrollera att "Voice Chat:" och någon status finns
  expect(screen.getByText(/Voice Chat:/)).toBeTruthy();

  // Kontrollera att username visas
  await waitFor(() => expect(screen.getByText(/You are:/)).toBeInTheDocument());

  // Kontrollera att connected users visas (bör vara 0 initialt)
  expect(screen.getByText(/Connected users:/)).toBeTruthy();
});
