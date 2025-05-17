"use client";

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaUpload, FaDownload, FaTrash } from 'react-icons/fa';

interface File {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface FileUploadProps {
  userId: string;
  isAdmin?: boolean;
  onFileUploaded?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ userId, isAdmin = false, onFileUploaded }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching files with token:', token ? 'Present' : 'Missing');
      
      const response = await axios.get(
        isAdmin 
          ? `http://localhost:5000/api/files/user/${userId}`
          : 'http://localhost:5000/api/files/my-files',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('Files fetched:', response.data);
      setFiles(response.data);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setError('Failed to fetch files');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    const file = event.target.files[0];
    console.log('Selected file:', file);
    
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Uploading file with token:', token ? 'Present' : 'Missing');
      
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
      if (onFileUploaded) {
        onFileUploaded();
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Downloading file:', fileId);
      
      const response = await axios.get(
        `http://localhost:5000/api/files/download/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Download error:', err);
      setError('Failed to download file');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Deleting file:', fileId);
      
      await axios.delete(
        `http://localhost:5000/api/files/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchFiles();
    } catch (err: any) {
      console.error('Delete error:', err);
      setError('Failed to delete file');
    }
  };

  React.useEffect(() => {
    console.log('FileUpload component mounted/updated');
    console.log('Props:', { userId, isAdmin });
    fetchFiles();
  }, [userId, isAdmin]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

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
          {loading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {files.map((file) => (
            <div key={file._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{file.originalName}</h3>
                <p className="text-sm text-gray-500">
                  Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleDownload(file._id, file.originalName)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaDownload className="w-5 h-5" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(file._id)}
                    className="text-red-600 hover:text-red-800"
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

export default FileUpload; 