import React, { useEffect } from 'react';
import { Wheat } from 'lucide-react';
import { motion } from 'motion/react';

export function Splash({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500); // 2.5 seconds splash screen
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-[#f4f1ea] flex flex-col items-center justify-center z-[100]">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-24 h-24 bg-[#6F4E37] text-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
      >
        <Wheat size={48} />
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-4xl font-extrabold text-[#6F4E37] tracking-tight leading-none mb-1">Neighbourhood</h1>
        <h1 className="text-4xl font-extrabold text-[#6F4E37] tracking-tight leading-none">Greens</h1>
      </motion.div>
    </div>
  );
}
