"use client";

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';

interface TestimonialFormProps {
  onSuccess?: () => void;
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({ onSuccess }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/testimonials', 
        { content },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setContent('');
      setSuccess('Testimonial submitted successfully! It will be visible after approval.');
      setError('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit testimonial');
      setSuccess('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="mt-4">
      <Typography variant="h6" className="mb-4">
        Share Your Experience
      </Typography>
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}
      {success && <Alert severity="success" className="mb-4">{success}</Alert>}
      <TextField
        fullWidth
        multiline
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your experience with our classes..."
        required
        className="mb-4"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!content.trim()}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Submit Testimonial
      </Button>
    </Box>
  );
};

export default TestimonialForm; 