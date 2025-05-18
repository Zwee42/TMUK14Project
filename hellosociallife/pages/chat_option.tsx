import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#000814] via-[#000d1a] to-[#001a33] text-gray-200 p-8 space-y-6">
      
      <button
        onClick={() => window.location.href = ("/chat")}
        className="w-64 py-3 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] 
        rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] 
        hover:bg-[#001d3d] transition-all duration-300"
      >
        All Chat
      </button>

      <button
        onClick={() => window.location.href =("/directmessage")}
        className="w-64 py-3 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] 
        rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] 
        hover:bg-[#001d3d] transition-all duration-300"
      >
        Direct Message
      </button>

      <button
        onClick={() =>  window.location.href =("/home")}
        className="w-64 py-3 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] 
        rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] 
        hover:bg-[#001d3d] transition-all duration-300"
      >
        Return
      </button>

    </div>
  );
}
