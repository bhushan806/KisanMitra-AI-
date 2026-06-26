import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Volume2, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../locales/translations';

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState('idle'); // idle, listening, processing, responding
  const { language } = useSettings();
  const { t } = useTranslation(language);

  // Demo simulation logic
  useEffect(() => {
    if (!isOpen) {
      setState('idle');
      return;
    }

    setState('listening');
    
    const listenTimer = setTimeout(() => {
      setState('processing');
    }, 3000);

    const processTimer = setTimeout(() => {
      setState('responding');
    }, 5500);

    return () => {
      clearTimeout(listenTimer);
      clearTimeout(processTimer);
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center z-40 group border-4 border-zinc-950"
      >
        <Mic className="w-6 h-6 text-zinc-950 group-hover:scale-110 transition-transform" />
        
        {/* Tooltip */}
        <div className="absolute right-20 bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          {t('voice_prompt')}
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-zinc-900"></div>
        </div>
      </motion.button>

      {/* Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white shadow-md "
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center justify-center space-y-12 w-full max-w-2xl px-6">
              
              {/* Dynamic Sound Wave Animation */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                
                {state === 'listening' && (
                  <div className="flex items-center justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [20, Math.random() * 80 + 40, 20] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                        className="w-3 bg-primary rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                      />
                    ))}
                  </div>
                )}

                {state === 'processing' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-24 h-24 text-primary" />
                  </motion.div>
                )}

                {state === 'responding' && (
                  <div className="relative">
                    <Volume2 className="w-24 h-24 text-primary animate-pulse" />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 border-4 border-primary rounded-full"
                    />
                  </div>
                )}
              </div>

              {/* Status Text */}
              <motion.div
                key={state}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                  {state === 'listening' ? t('listening') : 
                   state === 'processing' ? t('processing') : 
                   t('responding')}
                </h2>
                <p className="text-gray-600 text-lg font-medium max-w-lg mx-auto">
                  {state === 'listening' ? "Go ahead, I'm listening to your query about the market or your farm..." : 
                   state === 'processing' ? "Analyzing data across mandis..." : 
                   "Based on current satellite data, the soil moisture is optimal..."}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
