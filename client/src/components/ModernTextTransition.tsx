import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModernTextTransitionProps {
  texts: string[];
  prefix?: string;
}

const ModernTextTransition: React.FC<ModernTextTransitionProps> = ({ texts, prefix }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (!texts || texts.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % texts.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [texts]);
  
  return (
    <div className="text-center">
      <div className="font-mono text-xl md:text-2xl lg:text-2xl text-white flex items-center justify-center h-8 overflow-hidden">
        {prefix && <span className="mr-2">{prefix}</span>}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span 
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-gradient-animated font-bold block"
            >
              {texts[currentIndex] || "Cloud Troubleshooting"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ModernTextTransition;
