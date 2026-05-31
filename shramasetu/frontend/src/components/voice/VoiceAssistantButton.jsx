import React from 'react';
import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const VoiceAssistantButton = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
      {/* Visual glowing pulsers */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.15, 0.45, 0.15],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-20 h-20 bg-emerald-500 rounded-full blur-xl pointer-events-none -z-10"
      />
      <motion.div
        animate={{
          scale: [1, 1.45, 1],
          opacity: [0.05, 0.25, 0.05],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-24 h-24 bg-emerald-400 rounded-full blur-2xl pointer-events-none -z-10"
      />

      <button
        onClick={onClick}
        className="relative group p-4 sm:p-5 rounded-full shadow-[0_12px_30px_rgba(16,185,129,0.35)] transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95 bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400 hover:border-emerald-300 text-white"
        title="Interactive Voice Assistant & IVR"
        aria-label="Toggle Voice Assistant"
      >
        <Mic size={32} className="group-hover:animate-pulse" />
        
        {/* Visual Pulse ring */}
        <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-25 group-hover:opacity-40" />
      </button>
    </div>
  );
};

export default VoiceAssistantButton;
