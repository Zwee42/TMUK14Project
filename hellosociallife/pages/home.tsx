export default function Home() {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#001a33] via-[#003366] to-[#004d7a] text-gray-200 p-8 relative">
  
        {/* Watermark */}
        <h1 className="absolute top-6 left-6 text-6xl font-bold text-[#00bfff] opacity-30 transform rotate-45">
          HSB - HELLO SOCIAL LIFE
        </h1>
  
        {/* Main content */}
        <div className="text-center">
          <p className="text-4xl font-bold text-white mb-8 drop-shadow-[0_0_12px_rgba(0,191,255,0.9)]">
            Welcome back diexiy!
          </p>
  
          <div className="space-y-4 w-full max-w-md">
            <button className="w-full py-2 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.4)] hover:bg-[#001a33] transition-all duration-300">
              Call
            </button>
            <button className="w-full py-2 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.4)] hover:bg-[#001a33] transition-all duration-300">
              Text
            </button>
            <button className="w-full py-2 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.4)] hover:bg-[#001a33] transition-all duration-300">
              Change your bio
            </button>
            <button className="w-full py-2 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.4)] hover:bg-[#001a33] transition-all duration-300">
              Sign out
            </button>
          </div>
        </div>
  
      </div>
    );
  }
  