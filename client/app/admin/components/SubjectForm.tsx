"use client";

import React, { useState, Dispatch, SetStateAction } from 'react';
import axios from 'axios';

interface Subject {
  _id: string;
  name: string;
  subject: string;
  createdAt: string;
}

interface SubjectFormProps {
  setSubjects: Dispatch<SetStateAction<Subject[]>>;
}

const SubjectForm: React.FC<SubjectFormProps> = ({ setSubjects }) => {
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      setError('Subject name cannot be empty');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://mrclasses-backend.onrender.com/api/tutorials/subjects',
        { subject: subject.trim() },
        {
          headers: {
            'Content-Type': 'application/json', // ✅ Required!
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('Subject added successfully!');
      setSubject('');
      setSubjects((prevSubjects) => [...prevSubjects, response.data.subject]);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add subject');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Add New Subject</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject Name
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter subject name"
            required
            minLength={1}
            maxLength={50}
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <button
          type="submit"
          disabled={isLoading || !subject.trim()}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            (isLoading || !subject.trim()) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Adding...' : 'Add Subject'}
        </button>
      </form>
    </div>
  );
};

export default SubjectForm;
