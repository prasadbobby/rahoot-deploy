// src/contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('rahoot_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Add isAdmin property to user object based on email
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
      userData.isAdmin = adminEmails.includes(userData.email);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    // Add isAdmin property to user object
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    userData.isAdmin = adminEmails.includes(userData.email);
    
    localStorage.setItem('rahoot_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('rahoot_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const isAdmin = () => {
    if (!user) return false;
    return user.isAdmin === true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}