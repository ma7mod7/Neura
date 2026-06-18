import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../shared/api/axiosInstance';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface Props {
  lessonId: number;
  lessonTitle?: string;
}

// Typing animation
function TypingText({ text, onDone }: { text: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    setDone(false);

    const interval = setInterval(() => {
      idx.current += 1;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(interval);
        setDone(true);
        onDone();
      }
    }, 18);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {displayed}
      {!done && (
        <span className="inline-block w-0.5 h-4 bg-[#0061EF] ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}

// Bubble
function Bubble({ msg, isLatestAssistant, onTypingDone }: {
  msg: Message;
  isLatestAssistant: boolean;
  onTypingDone: () => void;
}) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
        isUser
          ? 'bg-[#0061EF] shadow-lg shadow-[#0061EF]/30'
          : 'bg-gradient-to-br from-purple-500 to-[#0061EF] shadow-lg shadow-purple-500/30'
      }`}>
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} className="text-white" />}
      </div>
      <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm ${
        isUser
          ? 'bg-[#0061EF] text-white rounded-br-sm shadow-lg shadow-[#0061EF]/20'
          : 'bg-white dark:bg-[#2a2a2e] text-slate-800 dark:text-slate-100 rounded-bl-sm shadow-sm border border-slate-100 dark:border-[#333]'
      }`}>
        {isLatestAssistant
          ? <TypingText text={msg.text} onDone={onTypingDone} />
          : <span className="whitespace-pre-wrap leading-relaxed">{msg.text}</span>
        }
      </div>
    </div>
  );
}

// Dots loader
function ThinkingDots() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-[#0061EF] flex items-center justify-center shrink-0">
        <Bot size={13} className="text-white" />
      </div>
      <div className="bg-white dark:bg-[#2a2a2e] border border-slate-100 dark:border-[#333] px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#0061EF]/60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// Main component
export function LessonChatbot({ lessonId, lessonTitle }: Props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: `مرحباً! 👋 أنا مساعدك الذكي لهذا الدرس${lessonTitle ? ` "${lessonTitle}"` : ''}.\nاسألني أي سؤال وسأساعدك في الفهم! 🚀`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingDone, setTypingDone] = useState(true);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const latestAIId = useRef<string | null>(null);

  // Load chat history when opened for the first time
  useEffect(() => {
    if (!open || historyLoaded) return;

    axiosInstance.get(`/api/Lessons/${lessonId}/chat`)
      .then(res => {
        const history: Message[] = (res.data ?? []).map((item: any) => ([
          {
            id: `h-q-${item.id}`,
            role: 'user' as const,
            text: item.question,
            timestamp: new Date(item.createdOn),
          },
          {
            id: `h-a-${item.id}`,
            role: 'assistant' as const,
            text: item.answer,
            timestamp: new Date(item.createdOn),
          },
        ])).flat();

        if (history.length > 0) {
          setMessages(prev => [...prev, ...history]);
        }
      })
      .catch(() => {
      })
      .finally(() => {
        setHistoryLoaded(true);
      });
  }, [open, historyLoaded, lessonId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || !typingDone) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axiosInstance.post(`/api/Lessons/${lessonId}/chat`, {
        question: text,
      });

      
      const replyText = typeof res.data === 'string'
        ? res.data
        : res.data?.answer ?? res.data?.reply ?? 'Sorry, I could not get a response.';

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: replyText,
        timestamp: new Date(),
      };

      latestAIId.current = aiMsg.id;
      setTypingDone(false);
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
      setTypingDone(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 end-6 z-50 w-14 h-14 rounded-full
          bg-gradient-to-br from-[#0061EF] to-purple-600
          shadow-xl shadow-[#0061EF]/40 hover:shadow-2xl hover:shadow-[#0061EF]/50
          flex items-center justify-center
          transition-all duration-300 hover:scale-110 active:scale-95 group"
        title="AI Assistant"
      >
        <MessageCircle size={24} className="text-white group-hover:scale-110 transition-transform" />
        <span className="absolute inset-0 rounded-full bg-[#0061EF]/30 animate-ping" />
      </button>
    );
  }

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`fixed bottom-6 end-6 z-50 w-[360px] rounded-3xl overflow-hidden
        border border-white/60 dark:border-[#2a2a2e]
        bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-2xl
        shadow-2xl shadow-black/20 dark:shadow-black/60
        transition-all duration-300
        ${minimized ? 'h-[60px]' : 'h-[520px]'}
        flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#0061EF] to-purple-600 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-none">AI Assistant</p>
          <p className="text-blue-200 text-[10px] mt-0.5 truncate">{lessonTitle ?? 'Lesson Helper'}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(m => !m)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            {minimized
              ? <Maximize2 size={13} className="text-white" />
              : <Minimize2 size={13} className="text-white" />
            }
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={13} className="text-white" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
            {messages.map((msg) => (
              <Bubble
                key={msg.id}
                msg={msg}
                isLatestAssistant={msg.role === 'assistant' && msg.id === latestAIId.current && !typingDone}
                onTypingDone={() => setTypingDone(true)}
              />
            ))}
            {loading && <ThinkingDots />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-slate-100 dark:border-[#2a2a2e] shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#222] rounded-2xl px-3 py-2 border border-slate-200 dark:border-[#333] focus-within:border-[#0061EF]/50 focus-within:ring-2 focus-within:ring-[#0061EF]/10 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={isRTL ? 'اسأل عن الدرس...' : 'Ask about this lesson...'}
                disabled={loading || !typingDone}
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading || !typingDone}
                className="w-8 h-8 rounded-xl bg-[#0061EF] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 shrink-0"
              >
                <Send size={14} className={`text-white ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Powered by AI · Press Enter to send
            </p>
          </div>
        </>
      )}
    </div>
  );
}