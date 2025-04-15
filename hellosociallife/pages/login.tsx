import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const testUsername = "diexiy";
  const testPassword = "lösenord";

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();

    if (username === testUsername && password === testPassword) {
      window.location.href = "/";
    } else {
      alert("Fel användarnamn eller lösenord!!!");
    }
  };

  const reg_button = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "/register";
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#001a33] via-[#003366] to-[#004d7a] text-gray-200 p-8 font-sans">
      <h2 className="text-3xl mb-6 font-semibold text-[#00bfff] drop-shadow-[0_0_12px_rgba(0,191,255,0.9)]">
        Logga in
      </h2>

      <form className="flex flex-col gap-6">
        <div>
          <label htmlFor="username" className="block text-lg text-gray-300">
            Användarnamn eller emailaddress:
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
            Lösenord:
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
