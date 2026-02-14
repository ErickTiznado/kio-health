import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};
