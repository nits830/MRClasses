"use client"

import { useState } from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [isSubjectsOpen, setIsSubjectsOpen] = useState<boolean>(false);

  const toggleDropdown = () => setIsSubjectsOpen(prev => !prev);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              MR Classes
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center"
              >
                Subjects
                <span className="ml-1">&#9662;</span>
              </button>
              {isSubjectsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link href="/subjects/physics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Physics
                  </Link>
                  <Link href="/subjects/mathematics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Mathematics
                  </Link>
                </div>
              )}
            </div>
            <Link href="/signin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Sign In
            </Link>
            <Link href="/signup" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-black shadow-md"></div>
    </nav>
  );
};

export default Navbar;
