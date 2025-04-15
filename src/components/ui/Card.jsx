// src/components/ui/Card.jsx
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

export function Card({ children, className, ...props }) {
  const { darkMode } = useTheme();
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-xl shadow-md p-6 ${
        darkMode 
          ? 'bg-gray-900/90 border border-gray-800/50' 
          : 'bg-white border border-gray-100'
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}