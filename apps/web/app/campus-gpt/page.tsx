'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Message, UIComponent } from './components/ChatMessage';
import { VoiceInput } from './components/VoiceInput';

const CAMPUS_GPT_API = process.env.NEXT_PUBLIC_CAMPUS_GPT_URL || 'http://localhost:3010';

export default function CampusGPTPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial greeting
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hey there! 👋 I'm **CampusGPT**, your AI campus assistant powered by Azure OpenAI.

I can help you with:
- 📅 **Events** - Find workshops, seminars, cultural events
- 🍽️ **Canteen** - Browse menu and order food
- 🎯 **Clubs** - Discover clubs and societies
- 📚 **Studies** - Get help with academic concepts

Try asking: *"What events are happening this week?"*`,
      },
    ]);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create placeholder for assistant response
    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isLoading: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch(`${CAMPUS_GPT_API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      // Handle SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';
      const uiComponents: UIComponent[] = [];

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'text':
                  content += data.content || '';
                  break;

                case 'ui_component':
                  uiComponents.push({
                    type: data.uiComponent,
                    data: data.uiData,
                  });
                  break;

                case 'tool_call':
                  // Show that we're calling a tool
                  content += `\n*🔧 Calling ${data.toolName}...*\n`;
                  break;
              }

              // Update message in real-time
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content, uiComponents: [...uiComponents], isLoading: true }
                    : m
                )
              );
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Finalize message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: content.replace(/\n\*🔧 Calling .*?\.\.\.\*\n/g, ''),
                uiComponents,
                isLoading: false,
              }
            : m
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: 'Sorry, I encountered an error. Please try again!',
                isLoading: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleVoiceResult = (text: string) => {
    sendMessage(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🎓</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CampusGPT
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by Azure OpenAI + Azure Speech
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              Microsoft Azure
            </span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-32">
        <div className="space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <VoiceInput onResult={handleVoiceResult} disabled={isLoading} />

            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about events, food, clubs, or studies..."
                disabled={isLoading}
                className="w-full px-5 py-3 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {['What events are happening?', 'Show menu', 'Tech clubs', 'Order samosas'].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors whitespace-nowrap"
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </form>
      </footer>
    </div>
  );
}
