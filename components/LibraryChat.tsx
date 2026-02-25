
import React, { useState, useRef, useEffect } from 'react';
import { chatWithStandards } from '../services/geminiService';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, Loader2 } from 'lucide-react';

export const LibraryChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<{role: 'user' | 'model', text: string}[]>([
      { role: 'model', text: "I am 'The Standard'. Ask me about drafting protocols, layer names, or plot styles. Keep it brief." }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [history, isOpen, isMinimized]);

  const handleSend = async () => {
      if (!input.trim()) return;
      
      const userMsg = input;
      setInput('');
      setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setIsTyping(true);

      // Convert history for Gemini API format
      const apiHistory = history.map(h => ({
          role: h.role,
          parts: [{ text: h.text }]
      }));

      try {
          const response = await chatWithStandards(apiHistory, userMsg);
          setHistory(prev => [...prev, { role: 'model', text: response }]);
      } catch (e) {
          setHistory(prev => [...prev, { role: 'model', text: "Connection severed. Re-align satellite." }]);
      } finally {
          setIsTyping(false);
      }
  };

  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-[0_4px_20px_rgba(79,70,229,0.4)] flex items-center justify-center text-white transition-all hover:scale-105 z-50 group"
          >
              <Bot size={28} />
              <div className="absolute right-0 top-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#18181b]"></div>
              <span className="absolute right-full mr-4 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                  Consult Standard AI
              </span>
          </button>
      );
  }

  return (
    <div className={`
        fixed bottom-6 right-6 bg-[#18181b] border border-indigo-500/50 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300
        ${isMinimized ? 'w-72 h-14' : 'w-80 md:w-96 h-[500px]'}
    `}>
        {/* Header */}
        <div 
            className="h-14 bg-indigo-900/40 border-b border-white/10 flex items-center justify-between px-4 cursor-pointer"
            onClick={() => setIsMinimized(!isMinimized)}
        >
            <div className="flex items-center gap-2">
                <Bot size={18} className="text-indigo-400"/>
                <span className="font-bold text-white text-sm">The Standard AI</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="text-neutral-400 hover:text-white">
                    {isMinimized ? <Maximize2 size={14}/> : <Minimize2 size={14}/>}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-neutral-400 hover:text-white">
                    <X size={16}/>
                </button>
            </div>
        </div>

        {/* Chat Body */}
        {!isMinimized && (
            <>
                <div className="flex-1 bg-[#09090b] overflow-y-auto custom-scrollbar p-4 space-y-4" ref={scrollRef}>
                    {history.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-neutral-700' : 'bg-indigo-600'}`}>
                                {msg.role === 'user' ? <User size={14}/> : <Bot size={14}/>}
                            </div>
                            <div className={`
                                max-w-[80%] p-3 rounded text-xs leading-relaxed
                                ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-100'}
                            `}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shrink-0">
                                <Bot size={14}/>
                            </div>
                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded flex gap-1">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-3 bg-[#18181b] border-t border-white/10">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about standards..."
                            className="w-full bg-black/40 border border-white/10 rounded-full pl-4 pr-10 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-1 top-1 w-7 h-7 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white disabled:bg-neutral-700 transition-colors"
                        >
                            {isTyping ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>}
                        </button>
                    </div>
                </div>
            </>
        )}
    </div>
  );
};
