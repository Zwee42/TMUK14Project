import { GetServerSideProps } from 'next';

import { requireAuth } from '@/utils/auth';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await requireAuth(ctx) || { redirect: { destination: '/', permanent: false } };
};

const handleLogout = async () => {
  try {
    const res = await fetch('/api/logout', {
      method: 'POST',
    });

    if (res.ok) {
      window.location.href = '/login';
    }
  } catch (err) {
    console.error('Logout failed:', err);
  }
};
const handleAccount = () => {
  window.location.href = "/account";
};

export default function Home({ user }: any) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#000814] via-[#000d1a] to-[#001a33] text-gray-200 p-8 relative">

      {/* Watermark */}
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

      {/* Main content */}
      <div className="text-center">
        <p className="text-4xl font-bold text-white mb-8 drop-shadow-[0_0_18px_rgba(0,191,255,0.9)]">
          Welcome back {user.username}!
        </p>

        <div className="space-y-4 w-full max-w-md">
          <button
            className="w-full py-3 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] hover:bg-[#001d3d] transition-all duration-300"
          >
            <span>Call</span>
          </button>
        </div>


        <div className="space-y-4 w-full max-w-md">
          <button
            onClick={() => window.location.href = "/chat"}
            className="w-full py-3 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] hover:bg-[#001d3d] transition-all duration-300"
          >
            <span>Chat</span>
          </button>
        </div>


        <div className="space-y-4 w-full max-w-md">
          <button
            onClick = {handleAccount}
            className="w-full py-3 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] hover:bg-[#001d3d] transition-all duration-300"
          >
            
            <span>Account</span>
          </button>
        </div>

        <div className="space-y-4 w-full max-w-md">
          <button
            onClick={handleLogout}
            className="w-full py-3 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] hover:bg-[#001d3d] transition-all duration-300"
          >
            <span>Sign out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
