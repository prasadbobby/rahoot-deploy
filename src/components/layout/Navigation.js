// src/components/layout/Navigation.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';
import { 
  FaSignOutAlt, FaHome, FaTachometerAlt, FaCog, FaPlus,
  FaGamepad, FaTrophy, FaUser, FaPlay, FaFireAlt, FaEye
} from 'react-icons/fa';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import Google components with ssr: false
const GoogleLogin = dynamic(
  () => import('@react-oauth/google').then(mod => mod.GoogleLogin),
  { ssr: false }
);

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;
      
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      
      if (!response.ok) throw new Error('Authentication failed');
      
      const userData = await response.json();
      await login(userData);
      toast.success(`Welcome, ${userData.name}!`, {
        icon: '👋',
        style: {
          borderRadius: '12px',
          background: 'var(--surface-dark)',
          color: 'var(--text-light)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid var(--border-light)',
        }
      });
      
      router.push('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  // Handle active link for bottom navigation
  const isActive = (path) => {
    if (path === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navbar - visible on md and above */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'} ${darkMode ? 'bg-surface-darker/80' : 'bg-surface-dark/90'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative h-10 w-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-flame via-brand-magenta to-brand-purple rounded-full transform group-hover:scale-110 transition-transform duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaFireAlt className="text-white h-6 w-6" />
                </div>
              </div>
              <span className="font-display font-bold text-2xl text-white">
                <span className="text-brand-flame">Ra</span>
                <span className="text-brand-teal">hoot</span>
              </span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className={`font-medium transition-colors relative py-2 ${isActive('/') ? 'text-brand-flame' : 'text-text-light-secondary hover:text-text-light'}`}
              >
                <span className="flex items-center space-x-1">
                  <FaHome className="h-4 w-4" />
                  <span>Home</span>
                </span>
                {isActive('/') && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-brand-flame to-brand-magenta rounded-full"></span>
                )}
              </Link>
              
              {user && (
                <Link 
                  href="/dashboard" 
                  className={`font-medium transition-colors relative py-2 ${isActive('/dashboard') ? 'text-brand-flame' : 'text-text-light-secondary hover:text-text-light'}`}
                >
                  <span className="flex items-center space-x-1">
                    <FaGamepad className="h-4 w-4" />
                    <span>Play</span>
                  </span>
                  {isActive('/dashboard') && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-brand-flame to-brand-magenta rounded-full"></span>
                  )}
                </Link>
              )}
              
              {user && user.isAdmin && (
                <Link 
                  href="/admin" 
                  className={`font-medium transition-colors relative py-2 ${isActive('/admin') ? 'text-brand-flame' : 'text-text-light-secondary hover:text-text-light'}`}
                >
                  <span className="flex items-center space-x-1">
                    <FaCog className="h-4 w-4" />
                    <span>Admin</span>
                  </span>
                  {isActive('/admin') && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-brand-flame to-brand-magenta rounded-full"></span>
                  )}
                </Link>
              )}
              
              {user && user.isAdmin && (
                <Link 
                  href="/admin/create"
                  className="py-2 px-4 bg-gradient-to-r from-brand-flame to-brand-magenta text-white rounded-full font-medium flex items-center space-x-1 transform hover:scale-105 transition-all hover:shadow-glow-flame"
                >
                  <FaPlus className="h-3.5 w-3.5" />
                  <span>Create Quiz</span>
                </Link>
              )}
              
              {/* User Menu */}
              {user ? (
                <div className="relative ml-5">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-magenta focus:ring-offset-2 focus:ring-offset-surface-dark transition-all"
                    id="user-menu-button"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="relative">
                      <img 
                        src={user.picture || '/default-avatar.png'} 
                        alt={user.name} 
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-flame/50"
                      />
                      <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-brand-success border-2 border-surface-dark"></span>
                    </div>
                    <div className="hidden lg:block text-left">
                      <span className="block text-sm font-medium truncate max-w-[150px] text-text-light">{user.name}</span>
                      <span className="block text-xs text-text-light-secondary truncate max-w-[150px]">{user.email}</span>
                    </div>
                    <svg className="h-5 w-5 text-text-light-secondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden shadow-lg bg-surface-dark border border-border-light"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                      tabIndex="-1"
                    >
                      <div className="px-4 py-3 border-b border-border-light">
                        <p className="text-sm font-medium text-text-light">{user.name}</p>
                        <p className="text-xs text-text-light-secondary truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-text-light-secondary hover:bg-surface-darker hover:text-text-light flex items-center"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FaTachometerAlt className="mr-2 h-4 w-4 text-brand-teal" />
                        Dashboard
                      </Link>
                      
                      {user.isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-text-light-secondary hover:bg-surface-darker hover:text-text-light flex items-center"
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FaCog className="mr-2 h-4 w-4 text-brand-teal" />
                          Admin Panel
                        </Link>
                      )}
                      
                      <div className="border-t border-border-light my-1"></div>
                      
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          router.push('/');
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-brand-error hover:bg-surface-darker flex items-center"
                        role="menuitem"
                      >
                        <FaSignOutAlt className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {isMounted && (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Login failed')}
                      useOneTap
                      theme="filled_black"
                      shape="pill"
                      size="large"
                      logo_alignment="center"
                    />
                  )}
                </div>
              )}
            </div>
            
            {/* Mobile Menu Button - only visible on small screens */}
            <div className="md:hidden flex items-center space-x-2">
              {user && (
                <div className="relative">
                  <img 
                    src={user.picture || '/default-avatar.png'} 
                    alt={user.name} 
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-flame/50"
                  />
                </div>
              )}
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-surface-darker text-text-light transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown - MD and below */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-3 px-4 space-y-2 bg-surface-darker animate-slide-down">
            {!user ? (
              <div className="py-4 flex justify-center">
                {isMounted && (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Login failed')}
                    useOneTap
                    theme="filled_black"
                    shape="pill"
                    text="signin_with"
                    size="large"
                  />
                )}
              </div>
            ) : (
              <div className="py-3 flex items-center space-x-3 border-b border-border-light">
                <img 
                  src={user.picture || '/default-avatar.png'} 
                  alt={user.name} 
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-flame/50"
                />
                <div>
                  <p className="font-medium text-text-light">{user.name}</p>
                  <p className="text-sm text-text-light-secondary truncate">{user.email}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                router.push('/');
              }}
              className={`w-full text-left py-3 px-4 rounded-xl flex items-center ${isActive('/') ? 'bg-surface-dark text-brand-flame' : 'text-text-light-secondary hover:bg-surface-dark hover:text-text-light'}`}
            >
              <FaHome className="mr-3 h-5 w-5" />
              Home
            </button>
            
            {user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/dashboard');
                }}
                className={`w-full text-left py-3 px-4 rounded-xl flex items-center ${isActive('/dashboard') ? 'bg-surface-dark text-brand-flame' : 'text-text-light-secondary hover:bg-surface-dark hover:text-text-light'}`}
              >
                <FaGamepad className="mr-3 h-5 w-5" />
                Play
              </button>
            )}
            
            {user && user.isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/admin');
                }}
                className={`w-full text-left py-3 px-4 rounded-xl flex items-center ${isActive('/admin') ? 'bg-surface-dark text-brand-flame' : 'text-text-light-secondary hover:bg-surface-dark hover:text-text-light'}`}
              >
                <FaCog className="mr-3 h-5 w-5" />
                Admin Panel
              </button>
            )}
            
            {user && (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  router.push('/');
                }}
                className="w-full text-left py-3 px-4 rounded-xl flex items-center text-brand-error hover:bg-surface-dark"
              >
                <FaSignOutAlt className="mr-3 h-5 w-5" />
                Sign out
              </button>
            )}
          </div>
        )}
      </nav>
      
      {/* Bottom Navigation Bar - Mobile Only */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-dark md:hidden border-t border-border-light">
          <div className="flex justify-around items-center h-16">
            <Link
              href="/"
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive('/') 
                  ? 'text-brand-flame' 
                  : 'text-text-light-secondary'
              }`}
            >
              <FaHome className={`h-5 w-5 ${isActive('/') ? 'animate-bounce-short' : ''}`} />
              <span className="text-xs mt-1">Home</span>
              {isActive('/') && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-lg bg-gradient-to-r from-brand-flame to-brand-magenta"></span>
              )}
            </Link>
            
            <Link
              href="/dashboard"
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive('/dashboard') 
                  ? 'text-brand-flame' 
                  : 'text-text-light-secondary'
              }`}
            >
              <FaPlay className={`h-5 w-5 ${isActive('/dashboard') ? 'animate-bounce-short' : ''}`} />
              <span className="text-xs mt-1">Play</span>
              {isActive('/dashboard') && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-lg bg-gradient-to-r from-brand-flame to-brand-magenta"></span>
              )}
            </Link>
            
            {user.isAdmin && (
              <Link
                href="/admin/create"
                className="relative flex flex-col items-center justify-center w-full h-full"
              >
                <div className="absolute -top-6 w-14 h-14 rounded-full bg-gradient-to-r from-brand-flame to-brand-magenta flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <FaPlus className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs mt-8 text-text-light-secondary">Create</span>
              </Link>
            )}
            
            <Link
              href={user.isAdmin ? "/admin" : "/dashboard"}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive('/admin') 
                  ? 'text-brand-flame' 
                  : 'text-text-light-secondary'
              }`}
            >
              <FaEye className={`h-5 w-5 ${isActive('/admin') ? 'animate-bounce-short' : ''}`} />
              <span className="text-xs mt-1">Results</span>
              {isActive('/admin') && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-lg bg-gradient-to-r from-brand-flame to-brand-magenta"></span>
              )}
            </Link>
            
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
              }}
              className={`flex flex-col items-center justify-center w-full h-full ${
                userMenuOpen 
                  ? 'text-brand-flame' 
                  : 'text-text-light-secondary'
              }`}
            >
              <div className="relative">
                <FaUser className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-success"></span>
              </div>
              <span className="text-xs mt-1">Profile</span>
              {userMenuOpen && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-lg bg-gradient-to-r from-brand-flame to-brand-magenta"></span>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile Profile Menu - appears from bottom when profile is clicked */}
      {userMenuOpen && user && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50 animate-fade-in" onClick={() => setUserMenuOpen(false)}>
          <div className="bg-surface-dark rounded-t-2xl p-4 pt-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-text-light-secondary/20 rounded-full"></div>
            
            <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-border-light">
              <img 
                src={user.picture || '/default-avatar.png'} 
                alt={user.name} 
                className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-flame/50"
              />
              <div>
                <p className="font-bold text-text-light">{user.name}</p>
                <p className="text-sm text-text-light-secondary">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <Link
                href="/dashboard"
                className="flex items-center py-3 px-4 rounded-xl text-text-light-secondary hover:bg-surface-darker hover:text-text-light"
                onClick={() => setUserMenuOpen(false)}
              >
                <FaTachometerAlt className="mr-3 h-5 w-5 text-brand-teal" />
                Dashboard
              </Link>
              
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center py-3 px-4 rounded-xl text-text-light-secondary hover:bg-surface-darker hover:text-text-light"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <FaCog className="mr-3 h-5 w-5 text-brand-teal" />
                  Admin Panel
                </Link>
              )}
              
              <Link
                href="/admin/create"
                className="flex items-center py-3 px-4 rounded-xl text-text-light-secondary hover:bg-surface-darker hover:text-text-light"
                onClick={() => setUserMenuOpen(false)}
              >
                <FaPlus className="mr-3 h-5 w-5 text-brand-magenta" />
                Create Quiz
              </Link>
              
              <button
                onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                  router.push('/');
                }}
                className="w-full flex items-center py-3 px-4 rounded-xl text-brand-error hover:bg-surface-darker"
              >
                <FaSignOutAlt className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
            
            <button
              onClick={() => setUserMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-flame to-brand-magenta text-white font-medium hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}