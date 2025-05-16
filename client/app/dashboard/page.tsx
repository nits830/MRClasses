"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import UserAssignmentList from '../components/UserAssignmentList';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Question {
  question: string;
  maxScore: number;
  answer?: string;
  feedback?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  questions: Question[];
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/signin');
          return;
        }

        const [userResponse, assignmentsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/assignments/my-assignments', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const userData = userResponse.data;
        setUser(userData);
        setAssignments(assignmentsResponse.data);

        // Redirect admin users to admin dashboard
        if (userData.role === 'admin') {
          router.push('/admin');
          return;
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          router.push('/signin');
        } else {
          setError('Failed to load user data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleAssignmentUpdated = (updatedAssignment: Assignment) => {
    setAssignments(prevAssignments =>
      prevAssignments.map(assignment =>
        assignment._id === updatedAssignment._id ? updatedAssignment : assignment
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome, {user?.name}!
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">Quick Actions</h2>
                <div className="space-y-2">
                  <a
                    href="/tutorials"
                    className="block text-blue-700 hover:text-blue-900"
                  >
                    View Tutorials
                  </a>
                  <a
                    href="/profile"
                    className="block text-blue-700 hover:text-blue-900"
                  >
                    Update Profile
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Assignments Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Assignments</h2>
            <UserAssignmentList 
              assignments={assignments} 
              onAssignmentUpdated={handleAssignmentUpdated}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 