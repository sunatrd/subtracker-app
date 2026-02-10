import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-brand-primary text-white hover:bg-brand-dark shadow-soft hover:shadow-card",
    outline: "border-2 border-gray-200 text-brand-black hover:border-brand-black bg-transparent",
    ghost: "text-brand-gray hover:bg-gray-100 hover:text-brand-black",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(baseStyle, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
};