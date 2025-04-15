// src/components/layout/AppLayout.jsx
import { useTheme } from '@/contexts/ThemeContext';
import Navigation from '@/components/layout/Navigation';
import { motion } from 'framer-motion';

export default function AppLayout({ children }) {
  const { darkMode } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-b from-[#1A0029] to-[#2A0E3D] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <Navigation />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="pt-20 pb-16"
      >
        {children}
      </motion.main>
    </div>
  );
}