import React from 'react';
import { motion } from 'framer-motion';

const VoiceVisualizer = ({ isActive, colorClass = "bg-emerald-500" }) => {
  const bars = Array.from({ length: 15 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-[3px] h-12 w-full max-w-[200px] px-4 py-2 bg-black/10 rounded-full backdrop-blur-sm border border-white/5">
      {bars.map((bar) => {
        // Vary heights slightly for organic look
        const defaultHeight = 4 + (bar % 3) * 3;
        
        return (
          <motion.div
            key={bar}
            className={`w-[4px] rounded-full ${colorClass}`}
            initial={{ height: defaultHeight }}
            animate={isActive ? {
              height: [defaultHeight, 36 - (bar % 4) * 8, defaultHeight],
            } : {
              height: defaultHeight
            }}
            transition={isActive ? {
              duration: 0.6 + (bar % 3) * 0.15,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse"
            } : {
              duration: 0.3
            }}
          />
        );
      })}
    </div>
  );
};

export default VoiceVisualizer;
