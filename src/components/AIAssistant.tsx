import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getServiceSlug } from '../utils/serviceMapping';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  actionService?: string;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      text: 'Hello! I am your AI Solutions Advisor. Ask me anything about our 10 core services, from AI Agents & Automation to Custom Software and Web Development.' 
    }
  ]);
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleStartProjectWithService = (serviceName?: string) => {
    setIsOpen(false);
    const slug = serviceName ? getServiceSlug(serviceName) : '';
    const targetUrl = slug ? `/project-request?service=${encodeURIComponent(slug)}` : '/project-request';

    if (isAuthenticated) {
      navigate(targetUrl);
    } else {
      openAuthModal({
        redirectUrl: targetUrl,
        serviceTitle: serviceName,
        customTitle: 'Login or Create an Account to Start Your Project',
        customMessage: 'To submit a project request and track your project, please log in or create your free client account first.'
      });
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    const newMessages = [...messages, { role: 'user', text: userText } as ChatMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages
        })
      });
      
      const data = await response.json();
      
      let suggestedService: string | undefined;
      const lowerReply = (data.text || '').toLowerCase();
      
      // Simple heuristic to detect if a specific service is being recommended
      if (lowerReply.includes('ai agent') || lowerReply.includes('automation')) suggestedService = "AI Agents & AI Automation";
      else if (lowerReply.includes('website development') || lowerReply.includes('web development')) suggestedService = "Website Development";
      else if (lowerReply.includes('e-commerce')) suggestedService = "E-Commerce Development";
      else if (lowerReply.includes('mobile app')) suggestedService = "Mobile App Development";
      else if (lowerReply.includes('custom software')) suggestedService = "Custom Software Development";
      else if (lowerReply.includes('ui/ux')) suggestedService = "UI/UX Design";
      else if (lowerReply.includes('api & third-party')) suggestedService = "API & Third-Party Integrations";
      else if (lowerReply.includes('seo & digital')) suggestedService = "SEO & Digital Growth";
      else if (lowerReply.includes('cloud, hosting')) suggestedService = "Cloud, Hosting & Deployment";
      else if (lowerReply.includes('technical support')) suggestedService = "Maintenance & Technical Support";

      setMessages(p => [...p, {
        role: 'assistant',
        text: data.text || "I'm sorry, I couldn't process that request right now.",
        actionService: suggestedService
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(p => [...p, {
        role: 'assistant',
        text: "I'm having trouble connecting to the server. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-primary-light transition-all hover:scale-105 z-30 ${isOpen ? 'scale-0' : 'scale-100'}`}
        aria-label="Open AI Assistant"
      >
        <Sparkles size={22} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[380px] h-[560px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Assistant Header */}
            <div className="bg-primary p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Solutions Advisor</h3>
                  <p className="text-[10px] text-accent-blue/90 uppercase tracking-wider font-semibold">AI Agents & Web</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[88%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-accent-blue text-white rounded-br-xs shadow-xs' 
                      : 'bg-white border border-slate-200/80 text-slate-700 rounded-bl-xs shadow-xs'
                  }`}>
                    {m.text}
                  </div>

                  {m.actionService && (
                    <button
                      onClick={() => handleStartProjectWithService(m.actionService)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-light transition-all shadow-xs"
                    >
                      <span>Request {m.actionService}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Input Box */}
            <div className="p-3 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about AI, websites, or apps..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl pl-3.5 pr-11 py-2.5 text-xs sm:text-sm outline-none focus:border-accent-blue focus:bg-white transition-all"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-1 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-light transition-colors"
                >
                  <Send size={14} className="-ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
