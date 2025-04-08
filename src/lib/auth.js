// src/lib/auth.js
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("rahoot_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  
  const login = (userData) => {
    localStorage.setItem("rahoot_user", JSON.stringify(userData));
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem("rahoot_user");
    setUser(null);
  };
  
  const isAdmin = () => {
    if (!user) return false;
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',');
    return adminEmails.includes(user.email);
  };
  
  return { user, loading, login, logout, isAdmin };
}