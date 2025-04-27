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

export default function Home({ user }: any) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#000814] via-[#000d1a] to-[#001a33] text-gray-200 p-8 relative">

      {/* Watermark */}
      <h1 className="absolute top-6 left-6 text-6xl font-bold text-[#00bfff] opacity-20 transform -rotate-12 pointer-events-none select-none drop-shadow-[0_0_20px_rgba(0,191,255,0.4)]">
        HSL - HELLO SOCIAL LIFE
      </h1>

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
            className="w-full py-3 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] hover:bg-[#001d3d] transition-all duration-300"
          >
            <span>Text</span>
          </button>
        </div>


        <div className="space-y-4 w-full max-w-md">
          <button
            onClick={handleLogout}
            className="w-full py-3 text-base bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.6)] hover:bg-[#001d3d] transition-all duration-300"
          >
            <span>Change Bio</span>
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
