import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('❌ The passwords do not match');
      return;
    }

    const res = await fetch('/api/resetPassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('✅ Your password has been reset. You can now log in');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setMessage(`❌ ${data.error || 'Something went wrong'}`);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#001a33] via-[#003366] to-[#004d7a] text-gray-200 p-8 font-sans">
      <h2 className="text-3xl mb-6 font-semibold text-[#00bfff] drop-shadow-[0_0_12px_rgba(0,191,255,0.9)]">
        Återställ lösenord
      </h2>

      <form className="flex flex-col gap-6" onSubmit={handleReset}>
        <div>
          <label htmlFor="password" className="block text-lg text-gray-300">
            New Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 p-3 bg-[#000814] border-2 border-[#00bfff] text-white rounded-xl w-72 focus:outline-none focus:ring-2 focus:ring-[#00bfff]"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-lg text-gray-300">
          Confirm password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-2 p-3 bg-[#000814] border-2 border-[#00bfff] text-white rounded-xl w-72 focus:outline-none focus:ring-2 focus:ring-[#00bfff]"
            required
          />
        </div>

        <button
          type="submit"
          className="px-10 py-3 mt-6 text-lg bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.4)] transition-all duration-300 hover:bg-[#001a33]"
        >
          Återställ
        </button>

        {message && (
          <div className="mt-4 text-center text-sm text-gray-300">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
