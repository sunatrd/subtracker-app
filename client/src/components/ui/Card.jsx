import { motion } from 'framer-motion';

export const Card = ({ children, className }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-xl shadow-soft p-6 border border-gray-100 ${className}`}
  >
    {children}
  </motion.div>
);