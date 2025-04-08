import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { FaGoogle, FaSignOutAlt, FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // Use named import
import toast from 'react-hot-toast';

export default function Navigation() {
  const { user, login, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      let userData;
      try {
        // Try the import as a default
        const jwtDecodeDefault = require('jwt-decode');
        const decoded = jwtDecodeDefault(credentialResponse.credential);
        userData = {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
        };
      } catch (decodeError) {
        console.error('JWT decode error with default import:', decodeError);
        
        try {
          // Try the named import approach
          const { jwtDecode } = require('jwt-decode');
          const decoded = jwtDecode(credentialResponse.credential);
          userData = {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
          };
        } catch (namedDecodeError) {
          console.error('JWT decode error with named import:', namedDecodeError);
          throw new Error('Unable to decode JWT token');
        }
      }
      
      // Continue with API call once we have userData
      const result = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: credentialResponse.credential,
          userData: userData
        }),
      });
      
      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.error || 'Authentication failed');
      }
      
      const verifiedUserData = await result.json();
      
      await login(verifiedUserData);
      toast.success(`Welcome, ${verifiedUserData.name}!`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in was unsuccessful. Please try again.');
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
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            
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
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  <FaGoogle className="text-gray-600 dark:text-gray-400" />
                </div>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
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
            
            <div className="flex items-center justify-between">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              
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
                <div className="flex items-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}