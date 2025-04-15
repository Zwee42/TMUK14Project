export default function Home() {
  const handleSignUp = () => {
    window.location.href = "/signup";
  };

  const handleSignIn = () => {
    window.location.href = "/login";
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#000814] via-[#000d1a] to-[#001a33] text-gray-200 p-8 font-sans">
      
      {/* "Logo" recreated with styled text */}
      <div className="flex items-center gap-4 mb-6">
        {/* Globe + cursor icon using Unicode and styling */}
        <span className="text-[4rem] md:text-[5rem] font-light">
          🌐<span className="ml-[-1.2rem]"></span>
        </span>

        {/* HSL Letters with custom styling */}
        <div className="flex gap-2 text-[5rem] md:text-[6rem] font-extralight tracking-widest text-[#00bfff] drop-shadow-[0_0_25px_rgba(0,191,255,0.8)]">
          <span className="border-l-4 border-[#00bfff] pl-3">H</span>
          <span className="font-[cursive]">S</span>
          <span className="border-b-4 border-[#00bfff] pb-2">L</span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-lg text-gray-400 mb-8">
        Welcome to your new favourite social platform!
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-4">
        <button
          onClick={handleSignIn}
          className="px-10 py-3 text-lg bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] transition-all duration-300 hover:bg-[#001d3d]"
        >
          Sign In
        </button>

        <button
          onClick={handleSignUp}
          className="px-10 py-3 text-lg bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] transition-all duration-300 hover:bg-[#001d3d]"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
