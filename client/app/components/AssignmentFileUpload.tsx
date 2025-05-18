"use client";

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaUpload, FaDownload, FaTrash } from 'react-icons/fa';

interface File {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
  assignmentId: string;
  isResponse: boolean;
  description?: string;
}

interface AssignmentFileUploadProps {
  assignmentId: string;
  userId: string;
  isAdmin?: boolean;
  onFileUploaded?: () => void;
  onAssignmentStatusChange?: (status: string) => void;
}

const AssignmentFileUpload: React.FC<AssignmentFileUploadProps> = ({ 
  assignmentId, 
  userId, 
  isAdmin = false, 
  onFileUploaded,
  onAssignmentStatusChange 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching files for assignment:', assignmentId);
      
      // First verify the assignment exists
      try {
        const assignmentResponse = await axios.get(
          `http://localhost:5000/api/assignments/${assignmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('Assignment data:', assignmentResponse.data);
      } catch (err: any) {
        console.error('Error fetching assignment:', err);
        if (err.response?.status === 404) {
          setError('Assignment not found. Please check the assignment ID.');
          return;
        }
        throw err;
      }

      // Then fetch the files
      const response = await axios.get(
        `http://localhost:5000/api/files/assignment/${assignmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('Files data:', response.data);

      // Sort files to show responses first, then assignment files
      const sortedFiles = response.data.sort((a: File, b: File) => {
        if (a.isResponse === b.isResponse) {
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        }
        return a.isResponse ? -1 : 1;
      });
      setFiles(sortedFiles);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      if (err.response?.status === 404) {
        setError('Assignment or files not found. Please check the assignment ID.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view these files.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch files');
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignmentId', assignmentId);
    formData.append('isResponse', (!isAdmin).toString());
    formData.append('description', description);

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Uploading file for assignment:', assignmentId);
      const response = await axios.post(
        'http://localhost:5000/api/files/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log('Upload response:', response.data);
      
      await fetchFiles();
      setDescription('');
      
      // If this is a response file, update assignment status
      if (!isAdmin) {
        try {
          await axios.put(
            `http://localhost:5000/api/assignments/${assignmentId}/status`,
            { status: 'submitted' },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          if (onAssignmentStatusChange) {
            onAssignmentStatusChange('submitted');
          }
        } catch (err) {
          console.error('Error updating assignment status:', err);
        }
      }
      
      if (onFileUploaded) {
        onFileUploaded();
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      console.log('Downloading file:', fileId);
      
      // Fetch the file with proper headers
      const response = await fetch(
        `http://localhost:5000/api/files/download/${fileId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'downloaded-file';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Deleting file:', fileId);
      await axios.delete(
        `http://localhost:5000/api/files/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchFiles();
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  // Fetch files on component mount and when assignmentId changes
  useEffect(() => {
    console.log('AssignmentFileUpload mounted/updated for assignment:', assignmentId);
    fetchFiles();
    const interval = setInterval(fetchFiles, 30000);
    return () => clearInterval(interval);
  }, [assignmentId]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={isAdmin ? "Add instructions for the assignment..." : "Add a note with your submission..."}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
        <div className="flex items-center space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FaUpload className="mr-2" />
            {loading ? 'Uploading...' : isAdmin ? 'Upload Assignment' : 'Submit Response'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {files.map((file) => (
            <div key={file._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900">{file.originalName}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    file.isResponse 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {file.isResponse ? 'Response' : 'Assignment'}
                  </span>
                </div>
                {file.description && (
                  <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  Uploaded by {file.uploadedBy.name} on {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleDownload(file._id)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Download file"
                >
                  <FaDownload className="w-5 h-5" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(file._id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete file"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No files uploaded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentFileUpload; 