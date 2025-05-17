"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import UserAssignmentList from '../components/UserAssignmentList';
import TestimonialForm from '../components/TestimonialForm';
import FeedbackForm from '../components/FeedbackForm';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaBook, FaUserCircle, FaSignOutAlt, FaGraduationCap, FaChalkboardTeacher, FaClipboardList } from 'react-icons/fa';

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
  const [activeSection, setActiveSection] = useState('overview');

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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: <FaUserCircle className="w-5 h-5" /> },
    { id: 'assignments', label: 'Assignments', icon: <FaClipboardList className="w-5 h-5" /> },
    { id: 'tutorials', label: 'Tutorials', icon: <FaBook className="w-5 h-5" /> },
    { id: 'testimonial', label: 'Share Experience', icon: <FaGraduationCap className="w-5 h-5" /> },
    { id: 'feedback', label: 'Submit Feedback', icon: <FaChalkboardTeacher className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
                <div className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {assignments.length}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-gray-900">
                    {assignments.filter(a => a.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-gray-900">
                    {assignments.filter(a => a.status === 'pending').length}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/tutorials"
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View Latest Tutorials
                </Link>
                <Link
                  href="/profile"
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Update Profile
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm text-gray-600">
                {assignments.slice(0, 3).map(assignment => (
                  <div key={assignment._id} className="flex justify-between items-center">
                    <span className="truncate">{assignment.title}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        );
      case 'assignments':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Assignments</h2>
            <UserAssignmentList 
              assignments={assignments} 
              onAssignmentUpdated={handleAssignmentUpdated}
            />
          </motion.div>
        );
      case 'testimonial':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Share Your Experience</h2>
            <TestimonialForm />
          </motion.div>
        );
      case 'feedback':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Feedback</h2>
            <FeedbackForm />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                MR Classes
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('userName');
                  window.location.href = '/signin';
                }}
                className="flex items-center text-red-600 hover:text-red-800 transition-colors"
              >
                <FaSignOutAlt className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="bg-white rounded-xl shadow-lg p-4 mb-8">
          <div className="flex flex-wrap gap-4">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
} 