"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface Tutorial {
  _id: string;
  title: string;
  description: string;
  subject: string;
  subjectId: string;
  createdAt: string;
}

const FullTutorial: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorial = async () => {
      if (!id) {
        setError("Tutorial ID is missing");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push('/admin/login');
          return;
        }

        console.log('Fetching tutorial with ID:', id);
        const response = await axios.get(`https://mrclasses-backend.onrender.com/api/tutorials/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('API Response:', response.data);

        if (!response.data) {
          setError("Tutorial not found");
          return;
        }

        const tutorialData = {
          ...response.data,
          subject: response.data.subject || response.data.subjectId?.subject || 'Unknown Subject'
        };

        console.log('Processed tutorial data:', tutorialData);
        setTutorial(tutorialData);
      } catch (err: any) {
        console.error("Error fetching tutorial:", {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        });

        const errorMessage = err.response?.data?.message || err.response?.data?.details || err.message;
        setError(`Error: ${errorMessage}`);
        
        if (err.response?.status === 401) {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTutorial();
  }, [id, router]);

  const handleBackClick = () => {
    router.push('/admin/dashboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <p className="font-medium">Error Details:</p>
          <p className="mt-2">{error}</p>
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handleBackClick}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <p className="font-medium">Tutorial not found</p>
          <button
            onClick={handleBackClick}
            className="mt-4 bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold mb-6">{tutorial.title}</h2>
      <div
        className="prose prose-lg max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: tutorial.description }}
      />
      <div className="mt-6 border-t pt-4">
        <p className="text-gray-600">Subject: {tutorial.subject}</p>
        <p className="text-gray-600">Created: {new Date(tutorial.createdAt).toLocaleDateString()}</p>
      </div>
      <button 
        onClick={handleBackClick} 
        className="mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default FullTutorial;
