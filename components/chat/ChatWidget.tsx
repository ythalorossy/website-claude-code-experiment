'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsEnabled(process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true');
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (!isEnabled) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message || 'Sorry, something went wrong.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to connect. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[360px] h-[500px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-brand-600 to-brand-500">
            <div className="flex items-center gap-2 text-white">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">Chat Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Hi! How can I help you today?</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  'flex gap-2',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-md'
                  )}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600 dark:text-brand-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 h-10 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300',
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 shadow-brand-500/30'
        )}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
