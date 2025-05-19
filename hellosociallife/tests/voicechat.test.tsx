/**
 * @file __tests__/VoiceChat.test.tsx
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceChat from '@/components/VoiceChat'; // justera sökvägen om nödvändigt
import { EventEmitter } from 'events';

// ───────────────────────────────────────────────────────────
// Mock: socket.io-client  → returnerar en egen EventEmitter
// ───────────────────────────────────────────────────────────
jest.mock('socket.io-client', () => {
  const { EventEmitter } = require('events');   // ⬅️ måste ligga inne i fabriken
  const emitter = new EventEmitter();
  (emitter as any).id = 'socket-123';           // fejkad socket.id
  // Lägg till no-op på -off för säkerhet
  if (!(emitter as any).off) (emitter as any).off = emitter.removeListener;

  return () => emitter;                         // default-exporten är en fabrik
});

// ───────────────────────────────────────────────────────────
// Mock: getUserMedia  → ger oss en fejkad MediaStream
// ───────────────────────────────────────────────────────────
beforeAll(() => {
  // Enkel stub för MediaStream
  // @ts-ignore – vi skapar bara ett minimalt objekt
  global.MediaStream = class {
    private tracks: MediaStreamTrack[] = [];
    getTracks() {
      return this.tracks;
    }
    addTrack(track: MediaStreamTrack) {
      this.tracks.push(track);
    }
  };

  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: jest.fn().mockResolvedValue(new MediaStream()),
    },
  });
});

afterAll(() => {
  jest.resetAllMocks();
});

// ───────────────────────────────────────────────────────────
// Testar att komponenten renderar och initierar
// ───────────────────────────────────────────────────────────
describe('<VoiceChat />', () => {
  it('initialiseras och visar grund-UI', async () => {
    render(<VoiceChat roomId="test-room" />);

    // Status börjar som "Initializing..."
    expect(
      screen.getByText(/Voice Chat: Initializing/i)
    ).toBeInTheDocument();

    // Vänta tills status uppdateras efter getUserMedia-löftet
    await waitFor(() =>
      expect(
        screen.getByText(/Voice Chat: Voice chat ready\./i)
      ).toBeInTheDocument()
    );

    // Kontrollera att vårt användarnamn syns (slumpat, men ska finnas text "You are:")
    expect(screen.getByText(/You are:/i)).toBeInTheDocument();

    // Inga connected users ännu
    expect(screen.getByText(/Connected users: 0/i)).toBeInTheDocument();
  });
});
