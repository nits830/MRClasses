"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullTutorial from '../../components/FullTutorial';

const AdminTutorialPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <FullTutorial />
    </div>
  );
};

export default AdminTutorialPage; 