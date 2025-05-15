"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import UserList from "./components/UserList";
import SubjectForm from "./components/SubjectForm";
import TutorialForm from "./components/TutorialForm";
import Tutorials from "./components/Tutorials";

// Interfaces
interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

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

interface DashboardCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  onClick: () => void;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [adminName, setAdminName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedAdminName = localStorage.getItem('adminName');

      console.log('Auth check - Token exists:', !!token);
      console.log('Auth check - Admin name exists:', !!storedAdminName);

      if (!token || !storedAdminName) {
        console.log('No token or admin name found, redirecting to login');
        router.replace('/admin/login');
        return;
      }

      // Create axios instance with default headers
      const api = axios.create({
        baseURL: 'http://localhost:5000',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      try {
        setIsLoading(true);
        setError("");

        console.log('Making API requests with token:', token.substring(0, 10) + '...');

        // Get users
        const usersRes = await api.get("/api/users/all");
        setUsers(usersRes.data);

        // Get tutorials (from /api/tutorials)
        const tutorialsRes = await api.get("/api/tutorials");
        setTutorials(tutorialsRes.data);  

        console.log('API responses received successfully');
        setAdminName(storedAdminName);

      } catch (error: any) {
        console.error("Error fetching data:", error);
        console.log('Error status:', error.response?.status);
        console.log('Error message:', error.response?.data?.message);
        
        // Clear auth data and redirect to login for any auth-related errors
        if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
          console.log('Auth error detected, clearing storage and redirecting');
          localStorage.removeItem('token');
          localStorage.removeItem('adminName');
          router.replace('/admin/login');
          return;
        }
        
        setError(error.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const dashboardCards: DashboardCard[] = [
    {
      title: "Total Users",
      value: users.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bgColor: "bg-blue-500",
      onClick: () => setActiveTab("users")
    },
    {
      title: "Total Subjects",
      value: subjects.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      bgColor: "bg-green-500",
      onClick: () => setActiveTab("subjects")
    },
    {
      title: "Total Tutorials",
      value: tutorials.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: "bg-purple-500",
      onClick: () => setActiveTab("viewTutorials")
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            onClick={card.onClick}
            className={`${card.bgColor} p-6 rounded-lg shadow-lg text-white cursor-pointer transform transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <div className="text-white">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar adminName={adminName} />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-screen fixed left-0 top-16 shadow-lg">
          <div className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  activeTab === "dashboard" ? "bg-blue-100 text-blue-900" : "hover:bg-gray-100"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  activeTab === "users" ? "bg-blue-100 text-blue-900" : "hover:bg-gray-100"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Users
              </button>
              <button
                onClick={() => setActiveTab("subjects")}
                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  activeTab === "subjects" ? "bg-blue-100 text-blue-900" : "hover:bg-gray-100"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Subjects
              </button>
              <button
                onClick={() => setActiveTab("tutorials")}
                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  activeTab === "tutorials" ? "bg-blue-100 text-blue-900" : "hover:bg-gray-100"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Add Tutorial
              </button>
              <button
                onClick={() => setActiveTab("viewTutorials")}
                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  activeTab === "viewTutorials" ? "bg-blue-100 text-blue-900" : "hover:bg-gray-100"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                View Tutorials
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8 mt-16">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "users" && <UserList users={users} />}
          {activeTab === "subjects" && <SubjectForm setSubjects={setSubjects} />}
          {activeTab === "tutorials" && <TutorialForm subjects={subjects} setTutorials={setTutorials} />}
          {activeTab === "viewTutorials" && <Tutorials />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
