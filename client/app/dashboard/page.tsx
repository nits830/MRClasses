"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import UserAssignmentList from '../components/UserAssignmentList';
import TestimonialForm from '../components/TestimonialForm';
import FeedbackForm from '../components/FeedbackForm';
import FileUpload from '../components/FileUpload';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaBook, FaUserCircle, FaSignOutAlt, FaGraduationCap, FaChalkboardTeacher, FaClipboardList, FaFileUpload, FaFileAlt, FaTrophy, FaUser } from 'react-icons/fa';

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
  files?: Array<{
    _id: string;
    originalName: string;
    isResponse: boolean;
  }>;
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    router.push('/signin');
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
            onClick={handleLogout}
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
    { id: 'files', label: 'My Files', icon: <FaFileUpload className="w-5 h-5" /> },
    { id: 'testimonial', label: 'Share Experience', icon: <FaGraduationCap className="w-5 h-5" /> },
    { id: 'feedback', label: 'Submit Feedback', icon: <FaChalkboardTeacher className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Pending Assignments</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {assignments.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Completed</h3>
                <p className="text-3xl font-bold text-green-600">
                  {assignments.filter(a => a.status === 'submitted').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Total Assignments</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {assignments.length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Assignments</h2>
                <div className="space-y-4">
                  {assignments.slice(0, 5).map((assignment) => (
                    <div
                      key={assignment._id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/dashboard/assignments/${assignment._id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          assignment.status === 'submitted' ? 'bg-green-100 text-green-800' :
                          assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                      </div>
                      {assignment.files && assignment.files.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {assignment.files.length} file{assignment.files.length !== 1 ? 's' : ''} attached
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'assignments':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">All Assignments</h2>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/dashboard/assignments/${assignment._id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        assignment.status === 'submitted' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </div>
                    {assignment.files && assignment.files.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {assignment.files.length} file{assignment.files.length !== 1 ? 's' : ''} attached
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'files':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Files</h2>
            <FileUpload userId={user?._id || ''} />
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
                onClick={handleLogout}
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