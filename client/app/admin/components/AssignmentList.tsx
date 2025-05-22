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

interface AssignmentListProps {
  assignments: Assignment[];
  onAssignmentUpdated: (assignment: Assignment) => void;
}

const AssignmentList: React.FC<AssignmentListProps> = ({ assignments, onAssignmentUpdated }) => {
  const [gradingAssignment, setGradingAssignment] = useState<Assignment | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleGradeClick = (assignment: Assignment) => {
    setGradingAssignment(assignment);
    setScores(assignment.questions.map(q => 0));
    setFeedback(assignment.questions.map(q => q.feedback || ''));
    setGeneralFeedback(assignment.feedback || '');
  };

  const handleScoreChange = (index: number, value: string) => {
    const newScores = [...scores];
    newScores[index] = parseInt(value) || 0;
    setScores(newScores);
  };

  const handleFeedbackChange = (index: number, value: string) => {
    const newFeedback = [...feedback];
    newFeedback[index] = value;
    setFeedback(newFeedback);
  };

  const handleSubmitGrade = async () => {
    if (!gradingAssignment) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      
      console.log('Submitting grades:', {
        feedback,
        scores,
        totalScore,
        generalFeedback
      });

      const response = await axios.put(
        `https://mrclasses-backend.onrender.com/api/assignments/${gradingAssignment._id}/grade`,
        {
          feedback: feedback,
          scores: scores,
          totalScore,
          generalFeedback
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Grade submission response:', response.data);
      onAssignmentUpdated(response.data);
      setGradingAssignment(null);
    } catch (err: any) {
      console.error('Grade submission error:', err);
      setError(err.response?.data?.error || 'Failed to submit grade');
    } finally {
      setSubmitting(false);
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
            {assignment.status === 'graded' && (
              <div className="mb-3">
                <div className="text-blue-700 font-medium">
                  Score: {assignment.score}
                </div>
                {assignment.feedback && (
                  <div className="text-green-700 text-sm mt-1">
                    Feedback: {assignment.feedback}
                  </div>
                )}
              </div>
            )}
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
            </div>

            {assignment.status === 'submitted' && !gradingAssignment && (
              <button
                onClick={() => handleGradeClick(assignment)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Grade Assignment
              </button>
            )}

            {gradingAssignment?._id === assignment._id && (
              <div className="mt-4 space-y-4">
                {assignment.questions.map((q, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">Q{idx + 1}: {q.question}</p>
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">Student's Answer:</p>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{q.answer || 'No answer submitted'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Score (max: {q.maxScore})
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={q.maxScore}
                          value={scores[idx]}
                          onChange={(e) => handleScoreChange(idx, e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Feedback
                        </label>
                        <textarea
                          value={feedback[idx]}
                          onChange={(e) => handleFeedbackChange(idx, e.target.value)}
                          rows={2}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    General Feedback
                  </label>
                  <textarea
                    value={generalFeedback}
                    onChange={(e) => setGeneralFeedback(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setGradingAssignment(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitGrade}
                    disabled={submitting}
                    className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 ${
                      submitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {submitting ? 'Submitting...' : 'Submit Grade'}
                  </button>
                </div>
              </div>
            )}

            {assignment.status === 'graded' && (
              <div className="mt-4 space-y-3">
                {assignment.questions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Q{idx + 1}: {q.question}</p>
                    <p className="mt-1 text-sm text-gray-600">Answer: {q.answer || 'No answer submitted'}</p>
                    {q.feedback && (
                      <p className="mt-1 text-sm text-green-700">Feedback: {q.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AssignmentList; 