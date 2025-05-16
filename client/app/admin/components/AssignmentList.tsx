"use client";

import React from 'react';

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

  return (
    <div className="space-y-4">
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

            {assignment.feedback && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Feedback:</span>{' '}
                  {assignment.feedback}
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AssignmentList; 