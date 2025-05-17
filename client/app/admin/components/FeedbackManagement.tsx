import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Feedback {
  _id: string;
  user: User;
  category: string;
  content: string;
  response?: string;
  status: 'pending' | 'inProgress' | 'resolved';
  createdAt: string;
}

const FeedbackManagement: React.FC = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/feedback/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch feedback');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleStatusUpdate = async (feedbackId: string, newStatus: 'pending' | 'inProgress' | 'resolved') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/feedback/${feedbackId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFeedback(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update feedback status');
    }
  };

  const handleResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/feedback/${selectedFeedback._id}/respond`,
        { response: responseText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDialogOpen(false);
      setResponseText('');
      setSelectedFeedback(null);
      fetchFeedback(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send response');
    }
  };

  const openResponseDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || '');
    setDialogOpen(true);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Feedback Management</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Response</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedback.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.user.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.content}</TableCell>
                <TableCell>{item.response || 'No response yet'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded ${
                    item.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    item.status === 'inProgress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => openResponseDialog(item)}
                    className="mr-2"
                  >
                    {item.response ? 'Edit Response' : 'Respond'}
                  </Button>
                  {item.status !== 'resolved' && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleStatusUpdate(item._id, 'resolved')}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Respond to Feedback
        </DialogTitle>
        <DialogContent>
          <div className="mt-4">
            <TextField
              label="Your Response"
              multiline
              rows={4}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResponse} variant="contained" color="primary">
            Send Response
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FeedbackManagement; 