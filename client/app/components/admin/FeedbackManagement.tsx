"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import axios from 'axios';

interface Feedback {
  _id: string;
  content: string;
  category: string;
  status: 'pending' | 'reviewed' | 'addressed';
  adminResponse?: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [status, setStatus] = useState<'pending' | 'reviewed' | 'addressed'>('pending');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://mrclasses-backend.onrender.com/api/feedback/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setFeedback(response.data);
    } catch (err: any) {
      setError('Failed to fetch feedback');
    }
  };

  const handleUpdateFeedback = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://mrclasses-backend.onrender.com/api/feedback/${id}`, 
        {
          status,
          adminResponse
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setSelectedFeedback(null);
      setAdminResponse('');
      setStatus('pending');
      fetchFeedback();
    } catch (err: any) {
      setError('Failed to update feedback');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://mrclasses-backend.onrender.com/api/feedback/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchFeedback();
    } catch (err: any) {
      setError('Failed to delete feedback');
    }
  };

  return (
    <Box className="p-4">
      <Typography variant="h5" className="mb-4">
        Feedback Management
      </Typography>

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Admin Response</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedback.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.user.name}<br/>{item.user.email}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.content}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.adminResponse || '-'}</TableCell>
                <TableCell>
                  {selectedFeedback === item._id ? (
                    <Box className="space-y-2">
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={status}
                          label="Status"
                          onChange={(e) => setStatus(e.target.value as 'pending' | 'reviewed' | 'addressed')}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="reviewed">Reviewed</MenuItem>
                          <MenuItem value="addressed">Addressed</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Admin response..."
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdateFeedback(item._id)}
                        className="mr-2"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setSelectedFeedback(null)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setSelectedFeedback(item._id);
                          setStatus(item.status);
                          setAdminResponse(item.adminResponse || '');
                        }}
                        className="mr-2"
                      >
                        Respond
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteFeedback(item._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FeedbackManagement; 