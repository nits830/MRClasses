"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface Subject {
  _id: string;
  name: string;
  subject: string;
  createdAt: string;
}

interface Tutorial {
  _id: string;
  title: string;
  description: string;
  subject: string;
  subjectId: string;
  createdAt: string;
}

interface TutorialFormProps {
  subjects: Subject[];
  setTutorials: React.Dispatch<React.SetStateAction<Tutorial[]>>;
}

const TutorialForm: React.FC<TutorialFormProps> = ({ subjects, setTutorials }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Tiptap editor with placeholder
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        placeholder: 'Write your tutorial content here...'
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/tutorials',
        {
          title,
          description,
          subjectId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('Tutorial added successfully!');
      setTitle('');
      setDescription('');
      setSubjectId(subjects[0]?._id.toString() || '');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add tutorial');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Add New Tutorial</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <select
            id="subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {success && (
          <div className="text-green-600 text-sm">{success}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Adding...' : 'Add Tutorial'}
        </button>
      </form>
    </div>
  );
};

export default TutorialForm;
