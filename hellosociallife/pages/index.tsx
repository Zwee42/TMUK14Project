export default function Home() {
  const handleSignUp = () => {
    window.location.href = "/signup";
  };

  const handleSignIn = () => {
    window.location.href = "/login";
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#001a33] via-[#003366] to-[#004d7a] text-gray-200 p-8 font-sans">
      <h1 className="mb-4 text-[3.5rem] font-bold text-[#00bfff] font-[Segoe_Script] drop-shadow-[0_0_12px_rgba(0,191,255,0.9)]">
        HSL - HELLO SOCIAL LIFE
      </h1>


      <p className="text-lg text-gray-400 mb-8">
        Welcome to your new favourite social platform!
      </p>

      <div className="flex flex-col gap-4">
        <button
          onClick={handleSignIn}
          className="px-10 py-3 text-lg bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.4)] transition-all duration-300 hover:bg-[#001a33]"
        >
          Sign In
        </button>

        <button
          onClick={handleSignUp}
          className="px-10 py-3 text-lg bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.4)] transition-all duration-300 hover:bg-[#001a33]"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
