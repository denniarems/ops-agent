import React, { useEffect, useRef } from 'react';

interface AIAgentsTitleProps {
  className?: string;
}

const AIAgentsTitle: React.FC<AIAgentsTitleProps> = ({ className = '' }) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Ensure the font is applied even if the CSS doesn't load properly
    if (spanRef.current) {
      spanRef.current.style.fontFamily = '"Montserrat", sans-serif';
      spanRef.current.style.fontWeight = '800';
      spanRef.current.style.letterSpacing = '0.03em';
      spanRef.current.style.textShadow = '0 0 10px rgba(58, 188, 247, 0.3)';
    }
  }, []);

  return (
    <span 
      ref={spanRef}
      className={`text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] px-8 py-2 rounded-full montserrat-font ${className}`} 
      style={{ 
        fontFamily: '"Montserrat", sans-serif', 
        fontWeight: 800, 
        letterSpacing: '0.03em',
        textShadow: '0 0 10px rgba(58, 188, 247, 0.3)'
      }}
    >
      AI Agents
    </span>
  );
};

export default AIAgentsTitle;
