import { ok } from "assert";
import { useState } from "react";
import bcrypt from 'bcryptjs';

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const testUsername = "diexiy";
  const testPassword = "lösenord";



  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();

    console.log(username);
    console.log(password);


    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        emailOrUsername: username,
        password: password,
      }),
    });

    const data = await res.json();

    if (res.ok) {

      console.log("User info:", data.user);
      window.location.href = "/home";


    } else {
      alert("fel: " + data.message);
      console.error(data.error || data.message);
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt("Enter your email address:");
    if (!email) return;

    const res = await fetch('/api/forgotPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Password reset link has been sent to your email.");
    } else {
      alert("Error: " + data.error);
    }
  };

  const reg_button = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "/signup";
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#001a33] via-[#003366] to-[#004d7a] text-gray-200 p-8 font-sans">
      <h2 className="text-3xl mb-6 font-semibold text-[#00bfff] drop-shadow-[0_0_12px_rgba(0,191,255,0.9)]">
        Logga in
      </h2>

      <form className="flex flex-col gap-6">
        <div>
          <label htmlFor="username" className="block text-lg text-gray-300">
            Username or E-mail:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2 p-3 bg-[#000814] border-2 border-[#00bfff] text-white rounded-xl w-72 focus:outline-none focus:ring-2 focus:ring-[#00bfff]"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-lg text-gray-300">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 p-3 bg-[#000814] border-2 border-[#00bfff] text-white rounded-xl w-72 focus:outline-none focus:ring-2 focus:ring-[#00bfff]"
          />
        </div>


        <button
          onClick={handleLogin}
          className="px-10 py-3 mt-6 text-lg bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.4)] transition-all duration-300 hover:bg-[#001a33]"
        >
          Logga in
        </button>

        <div className="mt-6 text-center text-gray-400">
          <label className="text-lg">Forgot your password?</label>
          <button
            onClick={handleForgotPassword}
            className="text-lg text-[#00bfff] hover:underline"
          >
            Reset it!
          </button>
        </div>

        <div className="mt-2 text-center text-gray-400">
          <label className="text-lg">Don't have an account? </label>
          <button
            onClick={reg_button}
            className="text-lg text-[#00bfff] hover:underline"
          >
            Create one!
          </button>
        </div>
      </form>
    </div>
  );
}
