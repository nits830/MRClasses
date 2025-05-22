"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import AssignmentForm from '../../../admin/components/AssignmentForm';
import AssignmentList from '../../../admin/components/AssignmentList';
import AssignmentFileUpload from '@/app/components/AssignmentFileUpload';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  questions: Array<{
    question: string;
    maxScore: number;
    answer?: string;
    feedback?: string;
  }>;
}

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndAssignments = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? 'Present' : 'Missing');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('Fetching data for user ID:', userId);
        
        const [userResponse, assignmentsResponse] = await Promise.all([
          axios.get(`https://mrclasses-backend.onrender.com/api/users/${userId}`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          axios.get(`https://mrclasses-backend.onrender.com/api/assignments/user/${userId}`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        console.log('User response:', userResponse.data);
        console.log('Assignments response:', assignmentsResponse.data);

        setUser(userResponse.data);
        setAssignments(assignmentsResponse.data);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        console.error('Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserAndAssignments();
    }
  }, [userId]);

  const handleAssignmentCreated = (newAssignment: Assignment) => {
    setAssignments([newAssignment, ...assignments]);
    setShowAssignmentForm(false);
  };

  const handleAssignmentUpdated = (updatedAssignment: Assignment) => {
    setAssignments(assignments.map(assignment => 
      assignment._id === updatedAssignment._id ? updatedAssignment : assignment
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-400">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
        <p className="text-yellow-700">User not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{user.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Role:</span> {user.role}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
          <button
            onClick={() => setShowAssignmentForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Assignment
          </button>
        </div>

        {showAssignmentForm ? (
          <AssignmentForm
            userId={userId}
            onAssignmentCreated={handleAssignmentCreated}
            onCancel={() => setShowAssignmentForm(false)}
          />
        ) : (
          <AssignmentList
            assignments={assignments}
            onAssignmentUpdated={handleAssignmentUpdated}
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Assignment Files</h2>
        {assignments.length > 0 ? (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">{assignment.title}</h3>
                <AssignmentFileUpload
                  assignmentId={assignment._id}
                  userId={userId}
                  isAdmin={true}
                  onFileUploaded={() => {
                    // Refresh assignments or show success message
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No assignments created yet</p>
        )}
      </div>
    </div>
  );
}
