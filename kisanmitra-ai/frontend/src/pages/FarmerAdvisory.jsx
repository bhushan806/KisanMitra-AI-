import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFarmerAdvisory } from '../utils/api';
import { Bot, User, Sparkles, Send, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';

const FarmerAdvisory = ({ commodity, mandi }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  const { mode, language } = useSettings();
  const isFarmer = mode === 'farmer';

  useEffect(() => {
    const fetchAdvisory = async () => {
      setLoading(true);
      try {
        const res = await getFarmerAdvisory(commodity, mandi);
        setData(res);
        
        // Use Hindi text if language is anything other than English for the demo,
        // since our backend currently only provides en/hi
        const advisoryText = language === 'en' ? res.advisory_text : res.advisory_text_hi;

        setMessages([
          {
            role: 'user',
            content: isFarmer 
              ? `What should I do with my ${commodity} today?`
              : `Analyze the market conditions for ${commodity} in ${mandi} and provide an advisory.`
          },
          {
            role: 'assistant',
            content: advisoryText,
            meta: isFarmer ? null : {
              window: res.best_sell_window,
              price: res.expected_price_range
            }
          }
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisory();
  }, [commodity, mandi, language, isFarmer]);

  if (loading && messages.length === 0) return (
    <div className="flex items-center justify-center h-[500px]">
      <div className="flex flex-col items-center text-zinc-500 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-sm font-bold tracking-widest uppercase animate-pulse">
          {isFarmer ? "Asking AI..." : "Initializing AI Agent..."}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col relative animate-fade-in">
      
      {/* Chat Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 flex items-center">
              {isFarmer ? "My AI Assistant" : "KisanMitra Intelligence"} <Sparkles className="w-4 h-4 ml-2 text-yellow-500" />
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wider">
              {isFarmer ? `${commodity} · ${mandi}` : `GPT-4 Agri-Model · ${commodity} · ${mandi}`}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-8 pr-4 pb-10 scroll-smooth">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className={cn(
                "flex space-x-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse space-x-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                msg.role === 'user' ? "bg-zinc-800 border border-white/10" : "bg-emerald-500/10 border border-emerald-500/20"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-emerald-400" />}
              </div>
              
              <div className={cn(
                "rounded-2xl p-5 text-[15px] leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-zinc-800 text-zinc-200 rounded-tr-sm border border-white/5" 
                  : "bg-transparent text-zinc-300 font-medium"
              )}>
                <div className={isFarmer && msg.role === 'assistant' ? "text-xl font-bold leading-relaxed text-zinc-100" : ""}>
                  {msg.content}
                </div>
                
                {/* Embedded Widgets for Assistant (Only in Pro Mode) */}
                {msg.meta && !isFarmer && (
                  <motion.div 
                    initial={{ opacity: 0, marginTop: 0 }}
                    animate={{ opacity: 1, marginTop: 24 }}
                    transition={{ delay: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5"
                  >
                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">Recommended Window</span>
                      <span className="text-emerald-400 font-bold">{msg.meta.window}</span>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">Target Price</span>
                      <span className="text-zinc-100 font-mono font-bold">₹{msg.meta.price} <span className="text-zinc-600 text-xs font-sans">/ Qtl</span></span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex space-x-4 max-w-[85%]"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="bg-transparent p-5">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/40 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent pt-10 pb-2">
        <div className="relative">
          <input 
            type="text" 
            placeholder={isFarmer ? "Tap the microphone button to ask a question..." : "Ask a follow-up question..."} 
            disabled
            className="w-full bg-zinc-900 border border-white/10 rounded-full py-4 pl-6 pr-14 text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-colors shadow-lg cursor-not-allowed opacity-70"
          />
          <button className="absolute right-2 top-2 p-2 bg-emerald-500 rounded-full hover:bg-emerald-400 transition-colors opacity-50 cursor-not-allowed">
            <Send className="w-4 h-4 text-zinc-950" />
          </button>
        </div>
        <div className="text-center mt-3">
          <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
            {isFarmer ? "AI answers may not be 100% accurate." : "Responses are AI generated. Verify critical decisions."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FarmerAdvisory;
