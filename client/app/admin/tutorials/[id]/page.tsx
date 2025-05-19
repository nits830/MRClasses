"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditTutorialPage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tutorial, setTutorial] = useState({
    title: '',
    description: '',
    content: '',
    subject: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '',
    level: 'beginner',
    isPublished: false
  });

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const response = await axios.get(`https://mrclasses-backend.onrender.com/api/tutorials/${params.id}`);
        setTutorial(response.data);
      } catch (error) {
        console.error('Error fetching tutorial:', error);
        toast.error('Failed to load tutorial');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTutorial();
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`https://mrclasses-backend.onrender.com/api/tutorials/${params.id}`, tutorial);
      toast.success('Tutorial updated successfully');
      router.push('/admin/tutorials');
    } catch (error) {
      console.error('Error updating tutorial:', error);
      toast.error('Failed to update tutorial');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Tutorial</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={tutorial.title}
                onChange={(e) => setTutorial({ ...tutorial, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={tutorial.description}
                onChange={(e) => setTutorial({ ...tutorial, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={tutorial.content}
                onChange={(e) => setTutorial({ ...tutorial, content: e.target.value })}
                required
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={tutorial.subject}
                onChange={(e) => setTutorial({ ...tutorial, subject: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={tutorial.videoUrl}
                onChange={(e) => setTutorial({ ...tutorial, videoUrl: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                value={tutorial.thumbnailUrl}
                onChange={(e) => setTutorial({ ...tutorial, thumbnailUrl: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (in minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={tutorial.duration}
                onChange={(e) => setTutorial({ ...tutorial, duration: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <select
                id="level"
                value={tutorial.level}
                onChange={(e) => setTutorial({ ...tutorial, level: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={tutorial.isPublished}
                onChange={(e) => setTutorial({ ...tutorial, isPublished: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isPublished">Publish Tutorial</Label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/tutorials')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 