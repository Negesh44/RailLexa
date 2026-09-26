import React, { useState, useRef, useEffect } from 'react';
import { streamRailLexaAI } from '../services/aiService';
import { useBlocks } from '../context/BlockContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, X, Bot, User, Loader2 } from 'lucide-react';

const renderCleanText = (text) => {
  if (!text) return '';
  // Remove markdown asterisks, bold markers, and weird artifacts
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '• ')
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '');
};

export const AIAssistantWidget = () => {
  const { currentUser } = useAuth();
  const { blocks, trains } = useBlocks();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Namaste! I am RailLexa AI Copilot for Indian Railways — Chennai Division (Southern Railway MAS). Ask me anything about Chennai superfast corridors, Vande Bharat headway gaps, multi-department problem bundling, or 25kV OHE power isolation.`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const userText = textToSend || inputValue.trim();
    if (!userText || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userText
    };

    const assistantMsgId = Date.now() + 1;
    const initialAssistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      content: ''
    };

    const currentHistory = [...messages, userMsg];
    setMessages([...currentHistory, initialAssistantMsg]);
    setInputValue('');
    setIsLoading(true);

    let accumulatedContent = '';

    await streamRailLexaAI(
      userText,
      messages.map(m => ({ role: m.role, content: m.content })),
      // On each SSE chunk
      (chunk) => {
        accumulatedContent += chunk;
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? { ...m, content: accumulatedContent }
              : m
          )
        );
      },
      // On stream done
      () => {
        setIsLoading(false);
      },
      // On error
      (err) => {
        setIsLoading(false);
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? { ...m, content: `Error connecting to RailLexa AI: ${err.message}` }
              : m
          )
        );
      }
    );
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #0f2942 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(29, 78, 216, 0.35)',
            cursor: 'pointer',
            zIndex: 9999,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Sparkles size={18} color="#93c5fd" />
          <span>RailLexa AI</span>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 48px)',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, #0f2942 0%, #1e3a8a 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="#93c5fd" />
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                RailLexa AI
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#f8fafc'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%'
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Bot size={14} />
                  </div>
                )}

                <div
                  style={{
                    background: msg.role === 'user' ? '#1d4ed8' : '#ffffff',
                    color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                    border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    fontSize: '0.825rem',
                    lineHeight: '1.5',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.content ? (
                    renderCleanText(msg.content)
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Loader2 size={12} className="spin-slow" />
                      Thinking...
                    </span>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#0f2942', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '10px 12px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, padding: '9px 12px', fontSize: '0.825rem' }}
              placeholder="Ask RailLexa AI anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isLoading || !inputValue.trim()}
              style={{ padding: '9px 14px' }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
