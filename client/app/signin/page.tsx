"use client"

import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const SignIn: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      // Send the sign-in request to the backend using axios
      const response = await axios.post('https://mrclasses-backend.onrender.com/api/users/signin', {
        email,
        password
      });

      // Handle successful response
      const { token, user } = response.data;

      // Store the token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('userName', user.name);

      // Redirect to user dashboard
      router.push('/dashboard');

    } catch (error: any) {
      if (error.response) {
        // Handle error response from the backend (e.g., invalid email/password)
        setError(error.response.data.error || 'Error signing in');
      } else {
        // Handle network or other unknown errors
        setError('An error occurred during sign-in. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="absolute top-0 left-0 right-0 flex justify-center p-4">
        <Link href="/" className="text-2xl font-bold text-white">
          MR Classes
        </Link>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign In</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <div className="flex items-center border border-gray-300 rounded">
              <FaEnvelope className="ml-2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full p-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <div className="flex items-center border border-gray-300 rounded">
              <FaLock className="ml-2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full p-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account? <a href="/signup" className="text-blue-600">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
