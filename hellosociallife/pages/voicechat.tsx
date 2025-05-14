import VoiceChat from '@/components/VoiceChat';

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Voice Chat Room</h1>
      <VoiceChat roomId="global-room" />
    </div>
  );
}
