"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed';
}

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  dueDate: string;
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: ''
  });
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    dueDate: '',
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }]
  });

  useEffect(() => {
    fetchUserData();
  }, [params.id]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [userRes, assignmentsRes, quizzesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/users/${params.id}/assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/users/${params.id}/quizzes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUser(userRes.data);
      setAssignments(assignmentsRes.data);
      setQuizzes(quizzesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/users/${params.id}/assignments`,
        newAssignment,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignments([...assignments, response.data]);
      setShowAssignmentForm(false);
      setNewAssignment({ title: '', description: '', dueDate: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add assignment');
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/users/${params.id}/quizzes`,
        newQuiz,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizzes([...quizzes, response.data]);
      setShowQuizForm(false);
      setNewQuiz({
        title: '',
        description: '',
        dueDate: '',
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }]
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add quiz');
    }
  };

  const addQuizQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }]
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 text-red-600 bg-red-50 rounded-lg">
      {error}
    </div>
  );

  if (!user) return (
    <div className="p-4 text-gray-600">
      User not found
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Back to Users
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Assignments Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
            <button
              onClick={() => setShowAssignmentForm(!showAssignmentForm)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Assignment
            </button>
          </div>

          {showAssignmentForm && (
            <form onSubmit={handleAssignmentSubmit} className="mb-6 p-4 border rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg">{assignment.title}</h3>
                <p className="text-gray-600 mt-1">{assignment.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    assignment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assignment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quizzes Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quizzes</h2>
            <button
              onClick={() => setShowQuizForm(!showQuizForm)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Quiz
            </button>
          </div>

          {showQuizForm && (
            <form onSubmit={handleQuizSubmit} className="mb-6 p-4 border rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quiz Title</label>
                  <input
                    type="text"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newQuiz.description}
                    onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={newQuiz.dueDate}
                    onChange={(e) => setNewQuiz({...newQuiz, dueDate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                    <button
                      type="button"
                      onClick={addQuizQuestion}
                      className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                    >
                      Add Question
                    </button>
                  </div>
                  
                  {newQuiz.questions.map((_, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Question {index + 1}</label>
                        <input
                          type="text"
                          value={newQuiz.questions[index].question}
                          onChange={(e) => {
                            const questions = [...newQuiz.questions];
                            questions[index].question = e.target.value;
                            setNewQuiz({...newQuiz, questions});
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        {newQuiz.questions[index].options.map((_, optionIndex) => (
                          <div key={optionIndex}>
                            <label className="block text-sm font-medium text-gray-700">
                              Option {optionIndex + 1}
                            </label>
                            <input
                              type="text"
                              value={newQuiz.questions[index].options[optionIndex]}
                              onChange={(e) => {
                                const questions = [...newQuiz.questions];
                                questions[index].options[optionIndex] = e.target.value;
                                setNewQuiz({...newQuiz, questions});
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                        <select
                          value={newQuiz.questions[index].correctAnswer}
                          onChange={(e) => {
                            const questions = [...newQuiz.questions];
                            questions[index].correctAnswer = e.target.value;
                            setNewQuiz({...newQuiz, questions});
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select correct answer</option>
                          {newQuiz.questions[index].options.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>
                              {option || `Option ${optionIndex + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Save Quiz
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg">{quiz.title}</h3>
                <p className="text-gray-600 mt-1">{quiz.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    Due: {new Date(quiz.dueDate).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {quiz.questions.length} questions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 