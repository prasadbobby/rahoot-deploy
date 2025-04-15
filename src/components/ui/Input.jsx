export function Input({ className, ...props }) {
    const { darkMode } = useTheme();
    
    return (
      <input
        className={`rounded-lg border px-4 py-2 w-full ${
          darkMode 
            ? 'bg-gray-800 border-gray-700 text-white focus:border-brand-blue focus:ring-brand-blue' 
            : 'bg-white border-gray-300 text-gray-900 focus:border-brand-blue focus:ring-brand-blue'
        } ${className}`}
        {...props}
      />
    );
  }
  