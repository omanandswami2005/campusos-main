import { useState, useRef, useEffect } from 'react';

const CAMPUS_GPT_API = import.meta.env.VITE_CAMPUS_GPT_URL || 'http://localhost:3010';

interface UIComponent {
  type: string;
  data: unknown;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  uiComponents?: UIComponent[];
  isLoading?: boolean;
}

interface CampusGPTViewProps {
  onBack: () => void;
}

export function CampusGPTView({ onBack }: CampusGPTViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hey! 👋 I'm CampusGPT. Ask about events, food, or clubs!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', isLoading: true },
    ]);

    try {
      const response = await fetch(`${CAMPUS_GPT_API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

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
              if (data.type === 'text') content += data.content || '';
              if (data.type === 'ui_component')
                uiComponents.push({ type: data.uiComponent, data: data.uiData });

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content, uiComponents: [...uiComponents], isLoading: true }
                    : m
                )
              );
            } catch {
              // ignore invalid JSON
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: content.replace(/\n\*🔧.*?\.\.\.\*\n/g, ''),
                uiComponents,
                isLoading: false,
              }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: 'Sorry, error occurred!', isLoading: false } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b dark:border-gray-800">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          ← Back
        </button>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">
          🎓
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">CampusGPT</div>
          <div className="text-xs text-gray-500">Azure AI Powered</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
              }`}
            >
              {message.isLoading && !message.content ? (
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}

              {/* Render UI Components */}
              {message.uiComponents?.map((comp, idx) => (
                <div
                  key={idx}
                  className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700"
                >
                  <RenderUIComponent component={comp} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 py-2 overflow-x-auto">
        {['Events?', 'Menu', 'Clubs', 'Order samosas'].map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-full whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t dark:border-gray-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask anything..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          className="p-2 bg-indigo-500 text-white rounded-full disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function RenderUIComponent({ component }: { component: UIComponent }) {
  const data = component.data as any[];

  if (component.type === 'EventCard' && Array.isArray(data)) {
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500">📅 Events</div>
        {data.slice(0, 3).map((event: any) => (
          <div
            key={event.id}
            className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="text-lg">{event.category === 'technical' ? '💻' : '📅'}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{event.title}</div>
              <div className="text-xs text-gray-500">{event.location}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (component.type === 'MenuCard' && Array.isArray(data)) {
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500">🍽️ Menu</div>
        {data.slice(0, 4).map((item: any) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-medium text-indigo-500">₹{item.price}</span>
          </div>
        ))}
      </div>
    );
  }

  if (component.type === 'ClubCard' && Array.isArray(data)) {
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500">🎯 Clubs</div>
        {data.slice(0, 3).map((club: any) => (
          <div key={club.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm font-medium">{club.name}</div>
            <div className="text-xs text-gray-500">{club.memberCount} members</div>
          </div>
        ))}
      </div>
    );
  }

  if (component.type === 'OrderConfirmation') {
    const order = component.data as any;
    return (
      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="text-2xl mb-2">✅</div>
        <div className="font-bold text-green-600">Order Confirmed!</div>
        <div className="text-2xl font-bold tracking-widest my-2">{order.otp}</div>
        <div className="text-xs text-gray-500">Show OTP at counter • ₹{order.total}</div>
      </div>
    );
  }

  return null;
}
