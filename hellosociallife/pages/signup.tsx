'use client';

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isPasswordValid = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  ///console.log(formData.password)
   if (!isPasswordValid(formData.password)) {
      setError(
        "The password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one special character."
      );
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      }),
    });
  
    const data = await res.json();
  
    if (res.ok) {
      console.log("User info:", data.user);
      localStorage.setItem('userEmail', formData.email);
      window.location.href = "/"
    setIsRegistered(true);
    setError("");
      // Navigera till en annan sida om du vill
    } else {
      alert("Fel: " + data.message);
      console.error(data.error || data.message);
    }
  };


  if (isRegistered) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-[#000814] rounded-xl shadow-md text-center text-white">
        <h2 className="text-3xl font-bold text-[#00bfff] drop-shadow-[0_0_12px_rgba(0,191,255,0.9)]">
          Welcome, {formData.username}!
        </h2>
        <p className="mt-4 text-gray-300">Your account has been created successfully, {formData.username}.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#001a33] via-[#003366] to-[#004d7a] text-gray-200 p-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#00bfff] drop-shadow-[0_0_12px_rgba(0,191,255,0.9)]">
        Sign Up
      </h2>

      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-[#000814] rounded-xl shadow-md space-y-6">
        <input
          className="w-full p-3 bg-[#000814] border-2 border-[#00bfff] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00bfff]"
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-3 bg-[#000814] border-2 border-[#00bfff] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00bfff]"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-3 bg-[#000814] border-2 border-[#00bfff] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00bfff]"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-3 bg-[#000814] border-2 border-[#00bfff] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00bfff]"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {error && <p className="text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 mt-6 text-lg bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.4)] hover:bg-[#001a33] transition-all duration-300"
        >
          Sign Up
        </button>
        <div className="mt-4 text-center">
  <button
    onClick={(e) => {
      e.preventDefault();
      window.location.href = "/login";
    }}
    className="text-[#00bfff] hover:underline"
  >
    Logga in
  </button>
</div>

      </form>
    </div>
  );
}
