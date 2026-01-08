'use client';

import { EventCard } from './EventCard';
import { MenuCard } from './MenuCard';
import { ClubCard } from './ClubCard';
import { OrderConfirmation } from './OrderConfirmation';

export interface UIComponent {
  type: string;
  data: unknown;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  uiComponents?: UIComponent[];
  isLoading?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] ${
          isUser
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl rounded-br-md shadow-lg'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md shadow-md border border-gray-100 dark:border-gray-700'
        } px-5 py-3`}
      >
        {/* Message content */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.isLoading && !message.content ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <span>Thinking...</span>
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: formatMarkdown(message.content),
              }}
            />
          )}
        </div>

        {/* UI Components - Generative UI */}
        {message.uiComponents && message.uiComponents.length > 0 && (
          <div className="mt-4 space-y-3">
            {message.uiComponents.map((component, index) => (
              <UIComponentRenderer key={index} component={component} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UIComponentRenderer({ component }: { component: UIComponent }) {
  switch (component.type) {
    case 'EventCard':
      return <EventCard events={component.data as any[]} />;
    case 'MenuCard':
      return <MenuCard items={component.data as any[]} />;
    case 'ClubCard':
      return <ClubCard clubs={component.data as any[]} />;
    case 'OrderConfirmation':
      return <OrderConfirmation order={component.data as any} />;
    default:
      return null;
  }
}

// Simple markdown formatter
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(
      /`(.*?)`/g,
      '<code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">$1</code>'
    )
    .replace(/\n/g, '<br />');
}
