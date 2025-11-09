'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react'
import { useJWTAuthContext } from '@/config/Auth'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const SUGGESTED_QUESTIONS = [
  'How many tasks have I completed?',
  "What's my average rating?",
  'Show me my recent reviews',
  'How do I apply to a task?',
  'How does the payment system work?',
  'What is profile completion?',
]

export default function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Earnify Support Assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { controller } = useJWTAuthContext()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage
    if (!textToSend.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const token = controller.getAccessToken()
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages.slice(-10), // Send last 10 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (question: string) => {
    handleSendMessage(question)
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 16px rgba(6, 60, 122, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            zIndex: 1000,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 60, 122, 0.4)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(6, 60, 122, 0.3)'
          }}
        >
          <MessageCircle size={24} strokeWidth={2} />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '420px',
            height: '640px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
              color: 'white',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Support Assistant</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.85 }}>Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem',
              background: '#fafbfc',
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                }}
              >
                {/* Message Content */}
                <div
                  style={{
                    maxWidth: '85%',
                    background:
                      msg.role === 'assistant' ? 'white' : 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)',
                    color: msg.role === 'assistant' ? '#2c3e50' : 'white',
                    padding: '0.875rem 1.125rem',
                    borderRadius: msg.role === 'assistant' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                    fontSize: '0.9375rem',
                    lineHeight: '1.5',
                    boxShadow: msg.role === 'assistant' ? '0 2px 8px rgba(0, 0, 0, 0.06)' : 'none',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    border: msg.role === 'assistant' ? '1px solid #e8eaed' : 'none',
                  }}
                >
                  {msg.content}
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: '#8e9aaf',
                    marginTop: '0.375rem',
                    paddingLeft: msg.role === 'assistant' ? '0.5rem' : '0',
                    paddingRight: msg.role === 'user' ? '0.5rem' : '0',
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Suggested Questions */}
            {showSuggestions && messages.length === 1 && (
              <div style={{ marginTop: '1rem' }}>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: '#6c757d',
                    marginBottom: '0.75rem',
                    fontWeight: '500',
                  }}
                >
                  Suggested questions:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {SUGGESTED_QUESTIONS.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(question)}
                      disabled={isLoading}
                      style={{
                        background: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#063c7a',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        fontWeight: '500',
                      }}
                      onMouseEnter={e => {
                        if (!isLoading) {
                          e.currentTarget.style.borderColor = '#063c7a'
                          e.currentTarget.style.background = '#f8f9fa'
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#e0e0e0'
                        e.currentTarget.style.background = 'white'
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    background: 'white',
                    padding: '0.875rem 1.125rem',
                    borderRadius: '12px 12px 12px 4px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e8eaed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#063c7a' }} />
                  <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>Typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid #e8eaed',
              background: 'white',
            }}
          >
            <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Ask me anything..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  background: '#fafbfc',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#063c7a'
                  e.currentTarget.style.background = 'white'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.background = '#fafbfc'
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                style={{
                  padding: '0.875rem 1.125rem',
                  background:
                    inputMessage.trim() && !isLoading ? 'linear-gradient(135deg, #063c7a 0%, #084d99 100%)' : '#e9ecef',
                  color: inputMessage.trim() && !isLoading ? 'white' : '#adb5bd',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  minWidth: '48px',
                }}
                onMouseEnter={e => {
                  if (inputMessage.trim() && !isLoading) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 60, 122, 0.3)'
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <Send size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}
