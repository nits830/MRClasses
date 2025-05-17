"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import AssignmentFileUpload from '@/app/components/AssignmentFileUpload';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  assignedTo: string;
}

const AssignmentDetail = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching assignment:', id);
      const response = await axios.get(
        `http://localhost:5000/api/assignments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('Assignment data:', response.data);
      setAssignment(response.data);
    } catch (err: any) {
      console.error('Error fetching assignment:', err);
      setError(err.response?.data?.message || 'Failed to fetch assignment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const handleAssignmentStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/assignments/${id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchAssignment();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update assignment status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Assignment not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{assignment.title}</h1>
          <div className="prose max-w-none mb-6">
            <p className="text-gray-600">{assignment.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={`font-medium ${
                assignment.status === 'submitted' ? 'text-green-600' :
                assignment.status === 'pending' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Assignment Files</h2>
          <AssignmentFileUpload
            key={assignment._id}
            assignmentId={assignment._id}
            userId={assignment.assignedTo}
            isAdmin={false}
            onFileUploaded={fetchAssignment}
            onAssignmentStatusChange={handleAssignmentStatusChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail; 