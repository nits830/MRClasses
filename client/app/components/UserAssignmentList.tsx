"use client";

import React, { useState } from 'react';
import axios from 'axios';

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

interface UserAssignmentListProps {
  assignments: Assignment[];
  onAssignmentUpdated: (assignment: Assignment) => void;
}

const UserAssignmentList: React.FC<UserAssignmentListProps> = ({ assignments, onAssignmentUpdated }) => {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [assignmentId: string]: string[] }>({});

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAnswerChange = (assignmentId: string, index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [assignmentId]: prev[assignmentId]
        ? prev[assignmentId].map((a, i) => (i === index ? value : a))
        : Array(index + 1).fill('').map((a, i2) => (i2 === index ? value : '')),
    }));
  };

  const handleSubmit = async (assignment: Assignment) => {
    setSubmitting(assignment._id);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const userAnswers = answers[assignment._id] || assignment.questions.map(() => '');
      const response = await axios.put(
        `http://localhost:5000/api/assignments/${assignment._id}/submit`,
        {
          answers: userAnswers
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onAssignmentUpdated(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {assignments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No assignments found</p>
      ) : (
        assignments.map((assignment) => (
          <div key={assignment._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                {assignment.status}
              </span>
            </div>
            <p className="text-gray-600 mb-3">{assignment.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Due Date:</span>{' '}
                {new Date(assignment.dueDate).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Questions:</span>{' '}
                {assignment.questions.length}
              </div>
              {assignment.score !== undefined && (
                <div>
                  <span className="font-medium">Score:</span>{' '}
                  {assignment.score}
                </div>
              )}
            </div>
            {assignment.status === 'pending' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(assignment);
                }}
                className="mt-4 space-y-4"
              >
                {assignment.questions.map((q, idx) => (
                  <div key={idx} className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Q{idx + 1}: {q.question}
                    </label>
                    <textarea
                      value={answers[assignment._id]?.[idx] || ''}
                      onChange={(e) => handleAnswerChange(assignment._id, idx, e.target.value)}
                      rows={2}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={submitting === assignment._id}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 ${submitting === assignment._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submitting === assignment._id ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </form>
            )}
            {assignment.status !== 'pending' && (
              <div className="mt-4 space-y-3">
                {assignment.questions.map((q, idx) => (
                  <div key={idx} className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Q{idx + 1}: {q.question}
                    </label>
                    <div className="mt-1 p-2 bg-gray-50 rounded">
                      <span className="block text-gray-800">{q.answer || <em>No answer submitted</em>}</span>
                    </div>
                    {q.feedback && (
                      <div className="mt-1 text-green-700 text-sm">Feedback: {q.feedback}</div>
                    )}
                  </div>
                ))}
                {assignment.feedback && (
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    <span className="text-green-800 font-medium">General Feedback: </span>{assignment.feedback}
                  </div>
                )}
                {assignment.score !== undefined && (
                  <div className="mt-2 text-blue-700 font-medium">Total Score: {assignment.score}</div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default UserAssignmentList; 