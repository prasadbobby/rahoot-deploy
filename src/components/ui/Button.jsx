export function Button({ className, variant = "primary", children, ...props }) {
    const { darkMode } = useTheme();
    
    const variants = {
      primary: `bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-md`,
      secondary: `${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`,
      outline: `border ${darkMode ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-800'} bg-transparent`,
    };
    
    return (
      <button
        className={`px-4 py-2 rounded-lg font-medium transition-all ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  