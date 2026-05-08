import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Trash2, Bot, User, Sparkles } from 'lucide-react';
import { getChatCompletion } from '../services/aiService';

const SUGGESTED = [
  "Where is the ISS right now?",
  "How fast is the ISS moving?",
  "Who is in space?",
  "What altitude is the ISS at?",
  "Summarize today's top news",
];

const WELCOME = "👋 Hello! I'm your dashboard assistant. I can answer questions about the **ISS position, speed, altitude, crew**, and **current news headlines**. What would you like to know?";

export function Chatbot({ contextData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch { /* ignore */ }
    } else {
      setMessages([{ role: 'assistant', text: WELCOME, time: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }) }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages.slice(-30)));
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText) return;
    setInput('');
    const now = new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: userText, time: now }]);
    setIsTyping(true);
    const reply = await getChatCompletion(userText, contextData);
    setMessages(prev => [...prev, { role: 'assistant', text: reply, time: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }) }]);
    setIsTyping(false);
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', text: WELCOME, time: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }) }]);
    localStorage.removeItem('chat_messages');
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] animate-in slide-in-from-bottom-4 duration-300"
          style={{ maxHeight: '80vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">Dashboard Assistant</p>
                <p className="text-[10px] opacity-75">Powered by Llama 3 · Dashboard data only</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat} title="Clear chat" className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setIsOpen(false)} title="Close" className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[hsl(var(--muted)/0.3)]" style={{ minHeight: 260, maxHeight: 400 }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
                  {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                </div>
                <div className="max-w-[80%]">
                  <div className={`px-3 py-2 rounded-xl text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-tr-sm' : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-tl-sm'}`}>
                    {msg.text}
                  </div>
                  {msg.time && <p className="text-[9px] text-[hsl(var(--muted-foreground))] mt-0.5 px-1">{msg.time}</p>}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                </div>
                <div className="px-3 py-3 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex items-center gap-1">
                  {[0,75,150].map(d => (
                    <div key={d} className="w-1.5 h-1.5 bg-[hsl(var(--muted-foreground))] rounded-full animate-bounce" style={{ animationDelay:`${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {showSuggestions && (
            <div className="px-4 py-2 border-t border-[hsl(var(--border))] flex gap-2 overflow-x-auto hide-scrollbar">
              {SUGGESTED.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} className="chip flex-shrink-0 text-[10px]">
                  <Sparkles className="h-2.5 w-2.5" /> {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask about ISS or news..."
              disabled={isTyping}
              className="flex-1 bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] transition disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isTyping || !input.trim()}
              className="p-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl hover:opacity-90 disabled:opacity-40 transition-all active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      {!isOpen && (
        <button
          id="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          title="Open Assistant"
          className="p-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 glow-primary"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
