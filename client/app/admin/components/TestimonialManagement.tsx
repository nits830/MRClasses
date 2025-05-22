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
  CircularProgress,
  Alert,
} from '@mui/material';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Testimonial {
  _id: string;
  user: User | string;
  content: string;
  isApproved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const TestimonialManagement: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://mrclasses-backend.onrender.com/api/testimonials/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestimonials(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch testimonials');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleStatusUpdate = async (testimonialId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://mrclasses-backend.onrender.com/api/testimonials/${testimonialId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTestimonials(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update testimonial status');
    }
  };

  const handleDelete = async (testimonialId: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://mrclasses-backend.onrender.com/api/testimonials/${testimonialId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTestimonials(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete testimonial');
    }
  };

  const getUserName = (user: User | string): string => {
    if (typeof user === 'string') {
      return 'Unknown User';
    }
    return user.name || 'Unknown User';
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Testimonial Management</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testimonials.map((testimonial) => (
              <TableRow key={testimonial._id}>
                <TableCell>{getUserName(testimonial.user)}</TableCell>
                <TableCell>{testimonial.content}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded ${
                    testimonial.status === 'approved' ? 'bg-green-100 text-green-800' :
                    testimonial.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {testimonial.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(testimonial.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {testimonial.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleStatusUpdate(testimonial._id, 'approved')}
                        className="mr-2"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleStatusUpdate(testimonial._id, 'rejected')}
                        className="mr-2"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(testimonial._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TestimonialManagement; 