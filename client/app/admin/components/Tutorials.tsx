"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Tutorial {
  _id: string;
  title: string;
  description: string;
  subjectId: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const Tutorials: React.FC = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/admin/login");
          return;
        }

        const response = await axios.get("https://mrclasses-backend.onrender.com/api/tutorials", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTutorials(response.data);
      } catch (error: any) {
        console.error("Error fetching tutorials:", error);
        setError(error.response?.data?.message || "Failed to fetch tutorials");

        if (error.response?.status === 401) {
          router.push("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, [router]);

  // Get unique subject names
  const subjects = Array.from(
    new Set(tutorials.map((t) => t.subjectId?.name))
  ).filter(Boolean).map((subjectName) => ({
    name: subjectName,
  }));

  // Filter tutorials
  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesSubject =
      selectedSubject === "all" || tutorial.subjectId?.name === selectedSubject;
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Group tutorials by subject name
  const groupedTutorials = filteredTutorials.reduce((acc, tutorial) => {
    const subject = tutorial.subjectId?.name || "Uncategorized";
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(tutorial);
    return acc;
  }, {} as Record<string, Tutorial[]>);

  // Calculate stats
  const stats = {
    total: tutorials.length,
    bySubject: subjects.reduce((acc, subject) => {
      const count = tutorials.filter((t) => t.subjectId?.name === subject.name).length;
      if (count > 0) {
        acc[subject.name] = count;
      }
      return acc;
    }, {} as Record<string, number>),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Tutorial Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-lg font-semibold">Total Tutorials</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          {subjects.map((subject) => (
            <div key={subject.name} className="bg-purple-50 p-4 rounded-lg">
              <p className="text-lg font-semibold">{subject.name}</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.bySubject[subject.name]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tutorials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject.name} value={subject.name}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tutorials */}
      <div className="space-y-6">
        {Object.entries(groupedTutorials).map(([subject, tutorials]) => (
          <div key={subject} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">{subject}</h2>
              <p className="text-white opacity-80">{tutorials.length} tutorials</p>
            </div>
            <div className="divide-y divide-gray-200">
              {tutorials.map((tutorial) => (
                <div key={tutorial._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <Link href={`/admin/tutorials/${tutorial._id}`} className="block">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {tutorial.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Created: {new Date(tutorial.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTutorials.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">
            No tutorials found{" "}
            {selectedSubject !== "all" ? `for ${selectedSubject}` : ""}
            {searchTerm ? ` matching "${searchTerm}"` : ""}.
          </p>
        </div>
      )}
    </div>
  );
};

export default Tutorials;
