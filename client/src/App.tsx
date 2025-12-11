import React, { useState, useEffect, useRef } from 'react';
import './App.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickActions?: string[];
  suggestions?: string[];
}

interface ChatResponse {
  response: string;
  intent: string;
  quickActions?: string[];
  suggestions?: string[];
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send initial greeting message
    const initialMessage: Message = {
      id: Date.now().toString(),
      text: "Welcome to HLPFL Records! I'm here to help you learn about our services and answer any questions about working with us. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      quickActions: ['Submit Music', 'Learn About Services', 'Company Info', 'Contact Us']
    };
    setMessages([initialMessage]);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text.trim(),
          conversationHistory: messages
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: ChatResponse = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        quickActions: data.quickActions || [],
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment or contact us directly at info@hlpfl.org.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const handleSuggestion = (suggestion: string) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <h1>HLPFL Records</h1>
            <p>Nashville's Home for Independent Artists</p>
          </div>
          <div className="status">
            <span className="status-dot online"></span>
            <span className="status-text">Online</span>
          </div>
        </div>
      </header>

      <main className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                <p className="message-text">{message.text}</p>
                <span className="message-time">{formatTime(message.timestamp)}</span>
                
                {message.quickActions && message.quickActions.length > 0 && (
                  <div className="quick-actions">
                    {message.quickActions.map((action, index) => (
                      <button
                        key={index}
                        className="quick-action-btn"
                        onClick={() => handleQuickAction(action)}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="suggestions">
                    <p className="suggestions-label">You might ask:</p>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="suggestion-btn"
                        onClick={() => handleSuggestion(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form className="input-container" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..."
              className="message-input"
              disabled={isTyping}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!inputText.trim() || isTyping}
            >
              Send
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default App;