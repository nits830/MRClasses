"use client";
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import axios from 'axios';

const CATEGORIES = ['General', 'Course Content', 'Technical', 'Instructor', 'Other'] as const;
type FeedbackCategory = typeof CATEGORIES[number];

interface FeedbackFormProps {
  onSuccess?: () => void;
}

interface FeedbackFormData {
  content: string;
  category: FeedbackCategory;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    content: '',
    category: 'General'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://mrclasses-backend.onrender.com/api/feedback', 
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setFormData({ content: '', category: 'General' });
      setSuccess('Feedback submitted successfully!');
      setError('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
      setSuccess('');
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({ ...prev, category: e.target.value as FeedbackCategory }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, content: e.target.value }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="mt-4">
      <Typography variant="h6" className="mb-4">
        Submit Feedback
      </Typography>
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}
      {success && <Alert severity="success" className="mb-4">{success}</Alert>}
      <FormControl fullWidth className="mb-4">
        <InputLabel>Category</InputLabel>
        <Select
          name="category"
          value={formData.category}
          onChange={handleSelectChange}
          label="Category"
        >
          {CATEGORIES.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        multiline
        rows={4}
        name="content"
        value={formData.content}
        onChange={handleTextChange}
        placeholder="Share your feedback..."
        required
        className="mb-4"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!formData.content.trim()}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Submit Feedback
      </Button>
    </Box>
  );
};

export default FeedbackForm; 