'use client';

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Home() {
    
      const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "", 
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

      const isPasswordValid = (password : string) : boolean => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
        return regex.test(password);
    };
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

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
    
        console.log("Registreringsdata:", formData);
        setError("");
        setIsRegistered(true);
        //alert("Registration successful!");
      };

      if (isRegistered) {
        return (
          <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md text-center">
            <h2 className="text-3xl font-bold text-blue-600">Welcome, {formData.firstName} {formData.lastName}!</h2>
            <p className="mt-4 text-gray-700">Your account has been created successfully, {formData.firstName} </p>
          </div>
        );
      }
    
      return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">Sign up</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
          <input
          className="w-full p-2 border rounded text-black"
          type="text"
          name="firstName"
          placeholder="Firstname"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 border rounded text-black"
          type="text"
          name="lastName"
          placeholder="Lastname"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
            <input
              className="w-full p-2 border rounded text-black"
              type="email"
              name="email"
              placeholder="E-post"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              className="w-full p-2 border rounded text-black"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              className="w-full p-2 border rounded text-black"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-white-700"
            >
              Sign Up
            </button>
          </form>
        </div>
      );
}

  