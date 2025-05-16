"use client";

import React, { useState } from 'react';
import axios from 'axios';

interface Question {
  question: string;
  maxScore: number;
}

interface AssignmentFormProps {
  userId: string;
  onAssignmentCreated: (assignment: any) => void;
  onCancel: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ userId, onAssignmentCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<Question[]>([{ question: '', maxScore: 0 }]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/assignments/${userId}`,
        {
          title,
          description,
          dueDate,
          questions
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      onAssignmentCreated(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', maxScore: 0 }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Questions</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            Add Question
          </button>
        </div>

        {questions.map((q, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Question {index + 1}
              </label>
              <input
                type="text"
                value={q.question}
                onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum Score
              </label>
              <input
                type="number"
                min="0"
                value={q.maxScore}
                onChange={(e) => updateQuestion(index, 'maxScore', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Create Assignment
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm; 