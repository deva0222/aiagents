import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, User, Bot, RefreshCw, Shield } from 'lucide-react';

interface Message {
  id: string;
  sender: 'CLIENT' | 'AGENCY';
  senderName: string;
  text: string;
  timestamp: string;
}

export const ClientMessages: React.FC = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/client/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const outgoing = inputText;
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/client/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: outgoing })
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
      }
    } catch {
      // ignore
    }
    setIsSending(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-sm">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-primary">Technical Team & Project Lead</h2>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online • Priority Client Desk</span>
            </div>
          </div>
        </div>

        <button 
          onClick={fetchMessages}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors"
          title="Refresh Messages"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-white to-slate-50/30">
        {messages.map((m) => {
          const isMe = m.sender === 'CLIENT';
          return (
            <div 
              key={m.id} 
              className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                isMe ? 'bg-primary text-white' : 'bg-blue-100 text-accent-blue'
              }`}>
                {isMe ? (user?.name?.charAt(0) || 'C') : <Bot size={15} />}
              </div>

              <div>
                <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isMe 
                    ? 'bg-primary text-white rounded-tr-none shadow-sm' 
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-xs'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                <div className={`flex items-center gap-2 mt-1 text-[10px] text-slate-400 ${isMe ? 'justify-end' : ''}`}>
                  <span>{m.senderName}</span>
                  <span>•</span>
                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-100 bg-white flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Type your message or project question..."
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-accent-blue/20"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-primary-light transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send size={15} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
