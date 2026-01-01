import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon, 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-full font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl focus:ring-gray-900 border border-transparent",
    secondary: "bg-wood-500 text-white hover:bg-wood-600 focus:ring-wood-500",
    outline: "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200",
    ghost: "bg-transparent text-gray-600 hover:text-black hover:bg-gray-100",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`} 
      {...props}
    >
      {icon && <span className="mr-3">{icon}</span>}
      {children}
    </button>
  );
};