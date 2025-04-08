// src/components/layout/Navigation.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Dynamically import the Google components with ssr: false
const GoogleLogin = dynamic(
  () => import('@react-oauth/google').then(mod => mod.GoogleLogin),
  { ssr: false }
);

export default function Navigation() {
  const { user, login, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Only render Google components after component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;
      
      // Call our API to verify and store the user
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const userData = await response.json();
      
      // Login the user
      await login(userData);
      toast.success(`Welcome, ${userData.name}!`);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Rahoot
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              Home
            </Link>
            
            {user && (
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Dashboard
              </Link>
            )}
            
            {user && isAdmin() && (
              <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Admin
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center space-x-2">
                <img 
                  src={user.picture || 'https://via.placeholder.com/150'} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-gray-700 dark:text-gray-300">{user.name}</span>
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <div>
                {isMounted && (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Login failed')}
                    useOneTap
                    theme="filled_blue"
                    shape="pill"
                  />
                )}
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <Link href="/" className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              Home
            </Link>
            
            {user && (
              <Link href="/dashboard" className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Dashboard
              </Link>
            )}
            
            {user && isAdmin() && (
              <Link href="/admin" className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Admin
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src={user.picture || 'https://via.placeholder.com/150'} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <div className="mt-4">
                {isMounted && (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Login failed')}
                    useOneTap
                    theme="filled_blue"
                    shape="pill"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}