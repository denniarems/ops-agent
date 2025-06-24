import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Bot, Cloud, FileText } from 'lucide-react';
import { AgentType, AgentOption } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface AgentSelectorProps {
  selectedAgent: AgentType;
  onAgentChange: (agent: AgentType) => void;
  disabled?: boolean;
  className?: string;
}

// Available agents configuration
const AGENT_OPTIONS: AgentOption[] = [
  // {
  //   id: 'coreAgent',
  //   name: 'Core Agent',
  //   description: 'General infrastructure management and operations',
  //   icon: 'bot'
  // },
  {
    id: 'cfnAgent',
    name: 'CloudFormation Agent',
    description: 'Manage over 1000+ AWS resources',
    icon: 'cloud'
  },
  {
    id: 'documentationAgent',
    name: 'Documentation Agent',
    description: 'Documentation retrieval and knowledge queries',
    icon: 'file-text'
  }
];

// Icon mapping
const getAgentIcon = (iconType: string) => {
  switch (iconType) {
    case 'bot':
      return Bot;
    case 'cloud':
      return Cloud;
    case 'file-text':
      return FileText;
    default:
      return Bot;
  }
};

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  selectedAgent,
  onAgentChange,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldDropUp, setShouldDropUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = AGENT_OPTIONS.find(option => option.id === selectedAgent) || AGENT_OPTIONS[0];
  const SelectedIcon = getAgentIcon(selectedOption.icon);

  // Calculate dropdown height (approximate)
  const DROPDOWN_HEIGHT = 280; // Approximate height of the dropdown with 3 options
  const DROPDOWN_MARGIN = 8; // mt-2 = 8px

  // Calculate position and determine if dropdown should open upward
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Calculate space below and above the trigger
    const spaceBelow = viewportHeight - triggerRect.bottom - DROPDOWN_MARGIN;
    const spaceAbove = triggerRect.top - DROPDOWN_MARGIN;

    // Determine if we should drop up
    // Prefer dropping down unless there's significantly more space above
    const shouldDropUpward = spaceBelow < DROPDOWN_HEIGHT && spaceAbove > spaceBelow && spaceAbove >= DROPDOWN_HEIGHT * 0.7;
    setShouldDropUp(shouldDropUpward);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Recalculate position when opening dropdown or on window resize
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, calculatePosition]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (agent: AgentType) => {
    onAgentChange(agent);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
          "bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#3ABCF7]/50",
          "text-gray-300 hover:text-white",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-[#3ABCF7]/50",
          isOpen && "bg-white/15 border-[#3ABCF7]/50"
        )}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <SelectedIcon className="w-4 h-4" />
        <span
          className="text-sm font-medium truncate max-w-[100px]"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          {selectedOption.name}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen && (shouldDropUp ? "rotate-0" : "rotate-180"),
            shouldDropUp && !isOpen && "rotate-180"
          )}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: shouldDropUp ? 10 : -10,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: shouldDropUp ? 10 : -10,
              scale: 0.95
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute left-0 w-80 max-w-[90vw] z-50",
              "bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl",
              "overflow-hidden",
              shouldDropUp
                ? "bottom-full mb-2"
                : "top-full mt-2"
            )}
          >
            <div className="p-2">
              {AGENT_OPTIONS.map((option) => {
                const Icon = getAgentIcon(option.icon);
                const isSelected = option.id === selectedAgent;
                
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={cn(
                      "w-full flex items-start space-x-3 p-3 rounded-lg transition-all duration-200",
                      "hover:bg-white/10 focus:bg-white/10 focus:outline-none",
                      "text-left group",
                      isSelected && "bg-gradient-to-r from-[#3ABCF7]/20 to-[#8B2FF8]/20 border border-[#3ABCF7]/30"
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      "bg-gradient-to-br transition-all duration-200",
                      isSelected 
                        ? "from-[#3ABCF7] to-[#8B2FF8]" 
                        : "from-gray-600 to-gray-700 group-hover:from-[#3ABCF7]/50 group-hover:to-[#8B2FF8]/50"
                    )}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 
                          className={cn(
                            "font-semibold text-sm transition-colors",
                            isSelected ? "text-white" : "text-gray-300 group-hover:text-white"
                          )}
                          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                        >
                          {option.name}
                        </h4>
                        {isSelected && (
                          <div className="w-2 h-2 bg-[#3ABCF7] rounded-full animate-pulse" />
                        )}
                      </div>
                      <p 
                        className="text-xs text-gray-400 mt-1 leading-relaxed"
                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                      >
                        {option.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentSelector;
