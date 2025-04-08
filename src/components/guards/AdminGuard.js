// src/components/guards/AdminGuard.js
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AdminGuard({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error('You must be logged in to access this page');
        router.replace('/');
      } else if (!user.isAdmin) {
        toast.error('You do not have permission to access this page');
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="pt-28 flex justify-center items-center h-60">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-brand-blue animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-brand-red animate-spin animate-delay-150"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user || !user.isAdmin) {
    return null;
  }
  
  return children;
}