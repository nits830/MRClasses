"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, Chip } from '@mui/material';

interface Feedback {
  _id: string;
  content: string;
  category: string;
  status: string;
  adminResponse?: string;
  createdAt: string;
}

const UserFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserFeedback();
  }, []);

  const fetchUserFeedback = async () => {
    try {
      const response = await fetch('/api/feedback/my-feedback');
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      const data = await response.json();
      setFeedback(data);
    } catch (err: any) {
      setError('Failed to fetch your feedback');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'addressed':
        return 'success';
      case 'reviewed':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box className="p-4">
      <Typography variant="h6" className="mb-4">
        My Feedback
      </Typography>

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      {feedback.length === 0 ? (
        <Alert severity="info">You haven't submitted any feedback yet.</Alert>
      ) : (
        <Box className="space-y-4">
          {feedback.map((item) => (
            <Paper key={item._id} className="p-4">
              <Box className="flex justify-between items-start mb-2">
                <Typography variant="subtitle1" className="font-medium">
                  {item.category}
                </Typography>
                <Chip
                  label={item.status}
                  color={getStatusColor(item.status) as any}
                  size="small"
                />
              </Box>
              <Typography className="mb-3">{item.content}</Typography>
              {item.adminResponse && (
                <Box className="bg-gray-50 p-3 rounded">
                  <Typography variant="subtitle2" className="mb-1">
                    Admin Response:
                  </Typography>
                  <Typography>{item.adminResponse}</Typography>
                </Box>
              )}
              <Typography variant="caption" className="text-gray-500 mt-2 block">
                Submitted on {new Date(item.createdAt).toLocaleDateString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UserFeedback; 