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
  score?: number;
  feedback?: string;
  questions: {
    question: string;
    answer?: string;
    feedback?: string;
    score?: number;
    maxScore: number;
  }[];
}

const AssignmentDetail = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmitAssignment = async () => {
    if (!assignment) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(
        `http://localhost:5000/api/assignments/${id}/status`,
        { status: 'submitted' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await fetchAssignment();
    } catch (err: any) {
      console.error('Error submitting assignment:', err);
      setError(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(assignment.status)}`}>
              {assignment.status}
            </span>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{assignment.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Due Date</h2>
              <p className="text-gray-600">
                {new Date(assignment.dueDate).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Questions</h2>
              <p className="text-gray-600">{assignment.questions.length} questions</p>
            </div>
          </div>

          {assignment.status === 'graded' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Grading Results</h2>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-700">
                    Score: {assignment.score || 0}
                  </div>
                  {assignment.feedback && (
                    <div className="text-green-700 mt-1">
                      {assignment.feedback}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {assignment.questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">Q{idx + 1}: {q.question}</p>
                    <p className="mt-2 text-sm text-gray-600">Answer: {q.answer || 'No answer submitted'}</p>
                    {q.feedback && (
                      <p className="mt-2 text-sm text-green-700">Feedback: {q.feedback}</p>
                    )}
                    {q.score !== undefined && (
                      <p className="mt-2 text-sm text-blue-700">Score: {q.score}/{q.maxScore}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Assignment Files</h2>
            {assignment?.status === 'pending' && (
              <button
                onClick={handleSubmitAssignment}
                disabled={submitting}
                className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            )}
          </div>
          <AssignmentFileUpload
            key={assignment?._id}
            assignmentId={assignment?._id || ''}
            userId={assignment?.assignedTo || ''}
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