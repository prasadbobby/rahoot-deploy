import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';
import { 
  FaSignOutAlt, FaHome, FaTachometerAlt, FaCog, FaPlus,
  FaGamepad, FaTrophy, FaUser, FaPlay, FaFireAlt, FaEye,
  FaSearch, FaBell, FaChevronDown, FaSun, FaMoon
} from 'react-icons/fa';
import dynamic from 'next/dynamic';
import Image from 'next/image';

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
  const [notifications, setNotifications] = useState([]);

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

  useEffect(() => {
    setNotifications([
      { id: 1, text: 'New quiz available: JavaScript Basics', unread: true },
      { id: 2, text: 'Your result: HTML Quiz - 85%', unread: false }
    ]);
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
          background: darkMode ? '#252836' : '#fff',
          color: darkMode ? '#fff' : '#1A1B25',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      });
      
      router.push('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(path);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'} ${darkMode ? 'bg-brand-dark-card/90' : 'bg-white/90'} backdrop-blur-md border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative h-10 w-10 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-brand-red via-brand-orange to-brand-yellow rounded-full transform group-hover:scale-110 transition-transform duration-300"></div>
  <div className="absolute inset-0 flex items-center justify-center">
    <FaFireAlt className="text-white h-6 w-6" />
  </div>
</div>
              <span className="font-display font-bold text-2xl">
                <span className="text-brand-red">Ra</span>
                <span className="text-brand-blue">hoot</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className={`font-medium transition-colors relative py-2 ${isActive('/') ? 'text-brand-red' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <span className="flex items-center space-x-1">
                  <FaHome className="h-4 w-4" />
                  <span>Home</span>
                </span>
                {isActive('/') && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-brand-red to-brand-blue rounded-full"></span>
                )}
              </Link>
              
              {user && (
                <Link 
                  href="/dashboard" 
                  className={`font-medium transition-colors relative py-2 ${isActive('/dashboard') ? 'text-brand-red' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <span className="flex items-center space-x-1">
                    <FaGamepad className="h-4 w-4" />
                    <span>Play</span>
                  </span>
                  {isActive('/dashboard') && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-brand-red to-brand-blue rounded-full"></span>
                  )}
                </Link>
              )}
              
              {user && user.isAdmin && (
                <Link 
                  href="/admin" 
                  className={`font-medium transition-colors relative py-2 ${isActive('/admin') ? 'text-brand-red' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <span className="flex items-center space-x-1">
                    <FaCog className="h-4 w-4" />
                    <span>Admin</span>
                  </span>
                  {isActive('/admin') && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-brand-red to-brand-blue rounded-full"></span>
                  )}
                </Link>
              )}
              
              {user && user.isAdmin && (
                <Link 
                  href="/admin/create"
                  className="py-2 px-5 bg-gradient-to-r from-brand-red to-brand-blue text-white rounded-full font-medium flex items-center space-x-1 transform hover:shadow-md transition-all"
                >
                  <FaPlus className="h-3.5 w-3.5" />
                  <span>Create Quiz</span>
                </Link>
              )}
              
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <FaSun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <FaMoon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 focus:ring-offset-surface-dark transition-all"
                    id="user-menu-button"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="relative">
                      <img 
                        src={user.picture || '/default-avatar.png'} 
                        alt={user.name} 
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-red/50"
                      />
                      <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-brand-green border-2 border-white dark:border-brand-dark-card"></span>
                    </div>
                    <div className="hidden lg:block text-left">
                      <span className="block text-sm font-medium truncate max-w-[150px]">{user.name}</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{user.email}</span>
                    </div>
                    <FaChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-brand-dark-card border border-gray-100 dark:border-gray-700"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                      tabIndex="-1"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FaTachometerAlt className="mr-2 h-4 w-4 text-brand-blue" />
                        Dashboard
                      </Link>
                      
                      {user.isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center"
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FaCog className="mr-2 h-4 w-4 text-brand-blue" />
                          Admin Panel
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          router.push('/');
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-brand-red hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center"
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
                      theme={darkMode ? "filled_black" : "outline"}
                      shape="pill"
                      size="large"
                      logo_alignment="center"
                    />
                  )}
                </div>
              )}
            </div>
            
            <div className="md:hidden flex items-center space-x-3">
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <FaSun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <FaMoon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              
              {user && (
                <div className="relative">
                  <img 
                    src={user.picture || '/default-avatar.png'} 
                    alt={user.name} 
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-red/50"
                  />
                  <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-brand-green border-2 border-white dark:border-brand-dark-card"></span>
                </div>
              )}
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-3 px-4 space-y-2 bg-white dark:bg-brand-dark-card animate-slide-in-top">
            {!user ? (
              <div className="py-4 flex justify-center">
                {isMounted && (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Login failed')}
                    useOneTap
                    theme={darkMode ? "filled_black" : "outline"}
                    shape="pill"
                    text="signin_with"
                    size="large"
                  />
                )}
              </div>
            ) : (
              <div className="py-3 flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800">
                <img 
                  src={user.picture || '/default-avatar.png'} 
                  alt={user.name} 
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-red/50"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            )}
            
            <Link
              href="/"
              className={`block py-3 px-4 rounded-xl flex items-center ${isActive('/') ? 'bg-gray-100 dark:bg-gray-800 text-brand-red' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaHome className="mr-3 h-5 w-5" />
              Home
            </Link>
            
            {user && (
              <Link
                href="/dashboard"
                className={`block py-3 px-4 rounded-xl flex items-center ${isActive('/dashboard') ? 'bg-gray-100 dark:bg-gray-800 text-brand-red' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaGamepad className="mr-3 h-5 w-5" />
                Play
              </Link>
            )}
            
            {user && user.isAdmin && (
              <Link
                href="/admin"
                className={`block py-3 px-4 rounded-xl flex items-center ${isActive('/admin') ? 'bg-gray-100 dark:bg-gray-800 text-brand-red' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaCog className="mr-3 h-5 w-5" />
                Admin Panel
              </Link>
            )}
            
            {user && user.isAdmin && (
              <Link
                href="/admin/create"
                className="block py-3 px-4 rounded-xl flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaPlus className="mr-3 h-5 w-5 text-brand-red" />
                Create Quiz
              </Link>
            )}
            
            {user && (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  router.push('/');
                }}
                className="w-full text-left py-3 px-4 rounded-xl flex items-center text-brand-red hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <FaSignOutAlt className="mr-3 h-5 w-5" />
                Sign out
              </button>
            )}
          </div>
        )}
      </nav>
      
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-brand-dark-card md:hidden border-t border-gray-200 dark:border-gray-700 shadow-top">
          <div className="flex justify-around items-center h-16">
            <Link
              href="/"
              className={`mobile-nav-item ${
                isActive('/') ? 'active' : ''
              }`}
            >
              <FaHome className="h-5 w-5 mb-1" />
              <span className="text-xs">Home</span>
            </Link>
            
            <Link
              href="/dashboard"
              className={`mobile-nav-item ${
                isActive('/dashboard') ? 'active' : ''
              }`}
            >
              <FaPlay className="h-5 w-5 mb-1" />
              <span className="text-xs">Play</span>
            </Link>
            
            {user.isAdmin && (
              <div className="relative flex justify-center">
                <Link
                  href="/admin/create"
                  className="mobile-fab"
                >
                  <FaPlus className="h-6 w-6 text-white" />
                </Link>
                <span className="text-xs mt-8 text-gray-500 dark:text-gray-400">Create</span>
              </div>
            )}
            
            <Link
              href={user.isAdmin ? "/admin" : "/dashboard"}
              className={`mobile-nav-item ${
                isActive('/admin') ? 'active' : ''
              }`}
            >
              <FaEye className="h-5 w-5 mb-1" />
              <span className="text-xs">Results</span>
            </Link>
            
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
              }}
              className={`mobile-nav-item ${
                userMenuOpen ? 'active' : ''
              }`}
            >
              <div className="relative">
                <FaUser className="h-5 w-5 mb-1" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-green"></span>
              </div>
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </div>
      )}
      
      {userMenuOpen && user && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50 animate-fade-in" onClick={() => setUserMenuOpen(false)}>
          <div className="bg-white dark:bg-brand-dark-card rounded-t-2xl p-4 pt-6 animate-slide-in-bottom" onClick={e => e.stopPropagation()}>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            
            <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <img 
                src={user.picture || '/default-avatar.png'} 
                alt={user.name} 
                className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-red/50"
              />
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <Link
                href="/dashboard"
                className="flex items-center py-3 px-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setUserMenuOpen(false)}
              >
                <FaTachometerAlt className="mr-3 h-5 w-5 text-brand-blue" />
                Dashboard
              </Link>
              
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center py-3 px-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <FaCog className="mr-3 h-5 w-5 text-brand-blue" />
                  Admin Panel
                </Link>
              )}
              
              <Link
                href="/admin/create"
                className="flex items-center py-3 px-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setUserMenuOpen(false)}
              >
                <FaPlus className="mr-3 h-5 w-5 text-brand-red" />
                Create Quiz
              </Link>
              
              <button
                onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                  router.push('/');
                }}
                className="w-full flex items-center py-3 px-4 rounded-xl text-brand-red hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <FaSignOutAlt className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
            
            <button
              onClick={() => setUserMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-red to-brand-blue text-white font-medium hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}