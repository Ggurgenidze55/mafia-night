'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@mafia-night/shared';

interface Props {
  messages: ChatMessage[];
  myPlayerId: string | null;
  channel: 'public' | 'mafia';
  onSend: (message: string) => void;
  disabled?: boolean;
  label?: string;
}

export function ChatPanel({ messages, myPlayerId, channel, onSend, disabled, label }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setInput('');
  };

  const borderColor = channel === 'mafia' ? 'rgba(230,57,70,0.3)' : 'rgba(200,169,110,0.2)';
  const headerColor = channel === 'mafia' ? '#E63946' : '#C8A96E';

  return (
    <div
      className="flex flex-col rounded-lg overflow-hidden"
      style={{ border: `1px solid ${borderColor}`, background: 'rgba(0,0,0,0.4)' }}
    >
      {label && (
        <div className="px-3 py-1.5 text-xs font-semibold" style={{ color: headerColor, background: `${headerColor}15` }}>
          {label}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5" style={{ maxHeight: 200 }}>
        {messages.map(msg => (
          <div key={msg.id} className={`text-sm ${msg.playerId === myPlayerId ? 'text-right' : ''}`}>
            <span className="text-gray-500 text-xs mr-1">{msg.playerName}:</span>
            <span className="text-gray-200">{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 p-2 border-t" style={{ borderColor }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={disabled}
          placeholder={disabled ? 'ჩატი მიუწვდომელია' : 'შეტყობინება...'}
          className="flex-1 bg-transparent text-sm text-gray-200 outline-none placeholder-gray-600"
          maxLength={200}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="text-xs px-2 py-1 rounded"
          style={{
            background: input.trim() && !disabled ? headerColor : 'rgba(255,255,255,0.05)',
            color: input.trim() && !disabled ? '#0A0A0F' : '#6b7280',
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
