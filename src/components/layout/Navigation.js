import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';
import { 
  FaSignOutAlt, FaMoon, FaSun, FaUserCircle, FaChevronDown,
  FaBars, FaTimes, FaHome, FaTachometerAlt, FaCog
} from 'react-icons/fa';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import Google components with ssr: false
const GoogleLogin = dynamic(
  () => import('@react-oauth/google').then(mod => mod.GoogleLogin),
  { ssr: false }
);

export default function Navbar() {
  const { user, login, logout, isAdmin } = useAuth();
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
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
      
      router.push('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'py-2' : 'py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-10 w-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-red to-brand-blue rounded-lg"></div>
                <div className="absolute inset-1 bg-white dark:bg-brand-dark rounded-md flex items-center justify-center text-brand-red font-bold text-xl">R</div>
              </div>
              <span className="font-display font-bold text-2xl">
                <span className="text-brand-red">Ra</span>
                <span className="text-brand-blue">hoot</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`font-medium ${router.pathname === "/" ? "text-brand-red" : "text-gray-700 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-blue"}`}>
              Home
            </Link>
            
            {user && (
              <Link href="/dashboard" className={`font-medium ${router.pathname.startsWith("/dashboard") ? "text-brand-red" : "text-gray-700 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-blue"}`}>
                Dashboard
              </Link>
            )}
            
            {user && isAdmin && (
              <Link href="/admin" className={`font-medium ${router.pathname.startsWith("/admin") ? "text-brand-red" : "text-gray-700 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-blue"}`}>
                Admin
              </Link>
            )}
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FaSun className="h-5 w-5 text-brand-yellow" /> : <FaMoon className="h-5 w-5" />}
            </button>
            
            {/* User Menu */}
            {user ? (
              <div className="relative ml-3">
                <div>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
                    id="user-menu-button"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <img 
                      src={user.picture || '/default-avatar.png'} 
                      alt={user.name} 
                      className="h-9 w-9 rounded-full object-cover border-2 border-brand-blue"
                    />
                    <div className="hidden lg:block text-left">
                      <span className="block text-sm font-medium truncate max-w-[150px]">{user.name}</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{user.email}</span>
                    </div>
                    <FaChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                
                {userMenuOpen && (
                  <div
                    className="dropdown-menu"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex="-1"
                  >
                    <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:hidden">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      role="menuitem"
                    >
                      <FaTachometerAlt className="mr-2 h-4 w-4 text-gray-500" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        router.push('/');
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
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
                    theme={darkMode ? 'filled_black' : 'filled_blue'}
                    shape="pill"
                    size="large"
                    logo_alignment="center"
                  />
                )}
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleDarkMode}
              className="p-2 mr-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FaSun className="h-5 w-5 text-brand-yellow" /> : <FaMoon className="h-5 w-5" />}
            </button>
            {user && (
              <img 
                src={user.picture || '/default-avatar.png'} 
                alt={user.name} 
                className="h-9 w-9 rounded-full object-cover border-2 border-brand-blue mr-2"
              />
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-3 space-y-1 fade-in-down">
            <Link 
              href="/" 
              className={`block py-2 px-3 rounded-xl ${router.pathname === "/" ? "bg-brand-red/10 text-brand-red" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} flex items-center`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaHome className="mr-2" />
              Home
            </Link>
            
            {user && (
              <Link 
                href="/dashboard" 
                className={`block py-2 px-3 rounded-xl ${router.pathname.startsWith("/dashboard") ? "bg-brand-red/10 text-brand-red" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} flex items-center`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaTachometerAlt className="mr-2" />
                Dashboard
              </Link>
            )}
            
            {user && isAdmin && (
              <Link 
                href="/admin" 
                className={`block py-2 px-3 rounded-xl ${router.pathname.startsWith("/admin") ? "bg-brand-red/10 text-brand-red" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} flex items-center`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaCog className="mr-2" />
                Admin
              </Link>
            )}
            
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  router.push('/');
                }}
                className="w-full text-left block py-2 px-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
              >
                <FaSignOutAlt className="mr-2" />
                Sign out
              </button>
            ) : (
              <div className="p-3">
                {isMounted && (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Login failed')}
                    useOneTap
                    theme={darkMode ? 'filled_black' : 'filled_blue'}
                    shape="pill"
                    text="signin_with"
                    size="large"
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