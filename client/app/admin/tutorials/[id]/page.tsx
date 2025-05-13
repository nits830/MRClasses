"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Tutorial {
  _id: string;
  title: string;
  description: string;
  subject: string;
  subjectId: {
    _id: number;
    subject: string;
  };
  createdAt: string;
}

export default function TutorialPage({ params }: { params: { id: string } }) {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/tutorials/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTutorial(response.data);
      } catch (error: any) {
        console.error('Error fetching tutorial:', error);
        setError(error.response?.data?.message || 'Failed to fetch tutorial');
        
        if (error.response?.status === 401) {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTutorial();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        Error: {error}
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="text-center p-4">
        Tutorial not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{tutorial.title}</h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <span className="mr-4">
              Subject: {tutorial.subjectId.subject}
            </span>
            <span>
              Created: {new Date(tutorial.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700">{tutorial.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 