import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSignOutAlt, FaHome, FaTachometerAlt, FaCog, FaPlus,
  FaGamepad, FaTrophy, FaUsers, FaPlay, FaFireAlt, 
  FaSearch, FaChevronDown, FaSun, FaMoon, FaArrowLeft
} from 'react-icons/fa';
import dynamic from 'next/dynamic';

const GoogleLogin = dynamic(
  () => import('@react-oauth/google').then(mod => mod.GoogleLogin),
  { ssr: false }
);


export default function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, login, logout } = useAuth();
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
          background: darkMode ? '#252836' : '#fff',
          color: darkMode ? '#fff' : '#1A1B25',
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
      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-1' : 'py-2'
      } ${darkMode 
        ? 'bg-gradient-to-r from-[#1A0029]/90 to-[#2A0E3D]/90 border-b border-gray-800/30' 
        : 'bg-white/95 border-b border-gray-200'
      } backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative h-9 w-9 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-red via-brand-orange to-brand-yellow rounded-full transform group-hover:scale-110 transition-transform duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaFireAlt className="text-white h-4 w-4" />
                </div>
              </div>
              <span className="font-display font-bold text-xl">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-orange">Ra</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-cyan">hoot</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-1 bg-gray-800/20 dark:bg-gray-800/30 rounded-full p-1">
                <Link 
                  href="/" 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'bg-white dark:bg-gray-800 text-brand-red shadow-sm' 
                      : 'text-gray-200 hover:text-brand-red'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <FaHome className="h-4 w-4 mr-1" />
                    Home
                  </span>
                </Link>
                
                {user && (
                  <Link 
                    href="/dashboard" 
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isActive('/dashboard') 
                        ? 'bg-white dark:bg-gray-800 text-brand-blue shadow-sm' 
                        : 'text-gray-200 hover:text-brand-blue'
                    }`}
                  >
                    <span className="flex items-center space-x-1">
                      <FaGamepad className="h-4 w-4 mr-1" />
                      Play
                    </span>
                  </Link>
                )}
                
                {user && user.isAdmin && (
                  <Link 
                    href="/admin" 
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isActive('/admin') 
                        ? 'bg-white dark:bg-gray-800 text-brand-purple shadow-sm' 
                        : 'text-gray-200 hover:text-brand-purple'
                    }`}
                  >
                    <span className="flex items-center space-x-1">
                      <FaCog className="h-4 w-4 mr-1" />
                      Admin
                    </span>
                  </Link>
                )}
              </div>
              
              {user && user.isAdmin && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href="/admin/create"
                    className="py-2 px-4 bg-gradient-to-r from-brand-red to-brand-orange text-white rounded-full text-sm font-medium shadow-md hover:shadow-glow-red transition-all"
                  >
                    <FaPlus className="inline-block mr-1 h-3 w-3" />
                    Create Quiz
                  </Link>
                </motion.div>
              )}
              
              <motion.button 
    whileHover={{ rotate: 15, scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={toggleDarkMode} 
    className={`p-2 rounded-full ${
      darkMode 
        ? 'bg-gray-800/30 text-gray-200 hover:text-yellow-400' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    } transition-colors`}
    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {darkMode ? (
      <FaSun className="h-4 w-4" />
    ) : (
      <FaMoon className="h-4 w-4" />
    )}
  </motion.button>

              
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 rounded-full py-1 px-2 focus:outline-none bg-gray-800/20 dark:bg-gray-800/30 backdrop-blur-md"
                    id="user-menu-button"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="relative">
                      <img 
                        src={user.picture || '/default-avatar.png'} 
                        alt={user.name} 
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-red/50"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-brand-green border-2 border-[#2A0E3D]"></span>
                    </div>
                    <div className="hidden lg:block text-left">
                      <span className="block text-sm font-medium truncate max-w-[120px] text-white">{user.name}</span>
                    </div>
                    <FaChevronDown className="h-3 w-3 text-gray-300" />
                  </motion.button>
                  
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-gray-900/90 backdrop-blur-md border border-brand-purple/30 focus:outline-none z-50"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                      >
                        <div className="px-4 py-2 border-b border-gray-800/50">
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/70"
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FaTachometerAlt className="inline-block mr-2 h-4 w-4 text-brand-blue" />
                          Dashboard
                        </Link>
                        
                        {user.isAdmin && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/70"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <FaCog className="inline-block mr-2 h-4 w-4 text-brand-purple" />
                            Admin Panel
                          </Link>
                        )}
                        
                        <div className="border-t border-gray-800/50 my-1"></div>
                        
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                            router.push('/');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-brand-red hover:bg-brand-red/10"
                          role="menuitem"
                        >
                          <FaSignOutAlt className="inline-block mr-2 h-4 w-4" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div>
                  {isMounted && (
                    <div className="shadow-lg overflow-hidden rounded-full">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error('Login failed')}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                        size="medium"
                        logo_alignment="center"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full bg-gray-800/20 dark:bg-gray-800/30 text-gray-200"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <FaSun className="h-4 w-4 text-yellow-400" />
                ) : (
                  <FaMoon className="h-4 w-4" />
                )}
              </button>
              
              {user && (
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="relative">
                  <img 
                    src={user.picture || '/default-avatar.png'} 
                    alt={user.name} 
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-red/50"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-brand-green border-2 border-[#2A0E3D]"></span>
                </button>
              )}
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full bg-gray-800/20 dark:bg-gray-800/30 text-gray-200"
              >
                {mobileMenuOpen ? (
                  <FaArrowLeft className="h-4 w-4" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-gray-900/90 backdrop-blur-md border-t border-gray-800/30"
            >
              <div className="px-4 py-3 space-y-1">
                <Link 
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/') 
                      ? 'bg-brand-red/10 text-brand-red' 
                      : 'text-gray-300 hover:bg-gray-800/70'
                  }`}
                >
                  <FaHome className="inline-block mr-2 h-4 w-4" />
                  Home
                </Link>
                
                {user && (
                  <Link 
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/dashboard') 
                        ? 'bg-brand-blue/10 text-brand-blue' 
                        : 'text-gray-300 hover:bg-gray-800/70'
                    }`}
                  >
                    <FaGamepad className="inline-block mr-2 h-4 w-4" />
                    Play
                  </Link>
                )}
                
                {user && user.isAdmin && (
                  <>
                    <Link 
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/admin') 
                          ? 'bg-brand-purple/10 text-brand-purple' 
                          : 'text-gray-300 hover:bg-gray-800/70'
                      }`}
                    >
                      <FaCog className="inline-block mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                    
                    <Link 
                      href="/admin/create"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-brand-red to-brand-orange text-white"
                    >
                      <FaPlus className="inline-block mr-2 h-4 w-4" />
                      Create Quiz
                    </Link>
                  </>
                )}
                
                {user ? (
                  <div className="border-t border-gray-800/50 pt-3 mt-3">
                    <div className="flex items-center px-3 py-2">
                      <img 
                        src={user.picture || '/default-avatar.png'} 
                        alt={user.name} 
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-red/50 mr-3"
                      />
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                        router.push('/');
                      }}
                      className="block w-full text-left px-3 py-2 mt-1 rounded-md text-base font-medium text-brand-red hover:bg-brand-red/10"
                    >
                      <FaSignOutAlt className="inline-block mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-800/50 pt-4 mt-3 flex justify-center">
                    {isMounted && (
                      <GoogleLogin
                        onSuccess={(credentialResponse) => {
                          handleGoogleSuccess(credentialResponse);
                          setMobileMenuOpen(false);
                        }}
                        onError={() => toast.error('Login failed')}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                        text="signin_with"
                        size="large"
                      />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Bottom Navigation for Mobile */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <div className="bg-gray-900/95 backdrop-blur-lg shadow-lg border-t border-gray-800/30">
            <div className="grid grid-cols-5 h-16">
              <Link
                href="/"
                className="flex flex-col items-center justify-center text-xs"
              >
                <div className={`p-1.5 rounded-full ${router.pathname === '/' ? 'bg-brand-red/20 text-brand-red' : 'text-gray-500'}`}>
                  <FaHome className="h-5 w-5" />
                </div>
                <span className={`mt-1 font-medium ${router.pathname === '/' ? 'text-brand-red' : 'text-gray-500'}`}>Home</span>
              </Link>
              
              <Link
                href="/dashboard"
                className="flex flex-col items-center justify-center text-xs"
              >
                <div className={`p-1.5 rounded-full ${router.pathname === '/dashboard' ? 'bg-brand-blue/20 text-brand-blue' : 'text-gray-500'}`}>
                  <FaGamepad className="h-5 w-5" />
                </div>
                <span className={`mt-1 font-medium ${router.pathname === '/dashboard' ? 'text-brand-blue' : 'text-gray-500'}`}>Play</span>
              </Link>
              
              <Link
                href="/join"
                className="flex flex-col items-center justify-center"
              >
                <div className="relative -top-5 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-red to-brand-orange rounded-full opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-brand-red to-brand-orange w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
                    <FaPlay className="h-6 w-6 text-white" />
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500 -mt-3">Join</span>
              </Link>
              
              <Link
                href="/leaderboard"
                className="flex flex-col items-center justify-center text-xs"
              >
                <div className={`p-1.5 rounded-full ${router.pathname === '/leaderboard' ? 'bg-brand-yellow/20 text-brand-yellow' : 'text-gray-500'}`}>
                  <FaTrophy className="h-5 w-5" />
                </div>
                <span className={`mt-1 font-medium ${router.pathname === '/leaderboard' ? 'text-brand-yellow' : 'text-gray-500'}`}>Ranks</span>
              </Link>
              
              <Link
                href="/profile"
                className="flex flex-col items-center justify-center text-xs"
              >
                <div className={`p-1.5 rounded-full ${router.pathname === '/profile' ? 'bg-brand-green/20 text-brand-green' : 'text-gray-500'}`}>
                  <FaUsers className="h-5 w-5" />
                </div>
                <span className={`mt-1 font-medium ${router.pathname === '/profile' ? 'text-brand-green' : 'text-gray-500'}`}>Profile</span>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* User Menu Modal for Mobile */}
      <AnimatePresence>
        {userMenuOpen && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/70 backdrop-blur-sm"
            onClick={() => setUserMenuOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-gray-900 rounded-t-2xl p-4 pt-6 border border-brand-purple/30"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-700 rounded-full"></div>
              
              <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-800/50">
                <img 
                  src={user.picture || '/default-avatar.png'} 
                  alt={user.name} 
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-red/50"
                />
                <div>
                  <p className="font-bold text-white">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <Link
                  href="/dashboard"
                  className="flex items-center py-3 px-4 rounded-lg text-gray-300 hover:bg-gray-800/70"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <FaTachometerAlt className="mr-3 h-5 w-5 text-brand-blue" />
                  Dashboard
                </Link>
                
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center py-3 px-4 rounded-lg text-gray-300 hover:bg-gray-800/70"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <FaCog className="mr-3 h-5 w-5 text-brand-purple" />
                    Admin Panel
                  </Link>
                )}
                
                <Link
                  href="/admin/create"
                  className="flex items-center py-3 px-4 rounded-lg text-gray-300 hover:bg-gray-800/70"
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
                  className="w-full flex items-center py-3 px-4 rounded-lg text-brand-red hover:bg-brand-red/10"
                >
                  <FaSignOutAlt className="mr-3 h-5 w-5" />
                  Sign out
                </button>
              </div>
              
              <button
                onClick={() => setUserMenuOpen(false)}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-brand-red to-brand-orange text-white font-medium"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}