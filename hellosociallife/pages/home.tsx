export default function Home() {


  const handleAccount =()  =>{
    window.location.href = "/account"
  };

  return (
  <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#000314] via-[#000d1a] to-[#001a33] text-gray-200 p-8 font-sans">
  {/* "Logo" container - nu med flex layout istället för absolut positionering */}
  <div className="flex items-center gap-4 mb-6">
    {/* Globe icon */}
    <span className=" absolute top-0 left-0 p-4  sm:text-[3rem] font-light">
      🌐
    </span>

    {/* HSL Letters */}
    <div className=" absolute top-0 left-18 p-4 flex gap-2 text-[2rem] sm:text-[3rem] font-extralight tracking-widest text-[#00bfff] drop-shadow-[0_0_18px_rgba(0,191,255,0.8)]">
      <span className="border-l-4 border-[#00bfff] pl-3">H</span>
      <span className="font-[cursive]">S</span>
      <span className="border-b-4 border-[#00bfff] pb-2">L</span>
    </div>
  </div>

      
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
         <button 
         onClick = {handleAccount}
         className ="w-full py-2 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.4)] hover:bg-[#001a33] transition-all duration-300">
            My profile 
          </button>
          <button className="w-full py-2 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.4)] hover:bg-[#001a33] transition-all duration-300">
            show bio
          </button>
         
        </div>
      </div>

    </div>
  );
}