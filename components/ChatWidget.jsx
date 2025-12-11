import React, { useState, useEffect, useRef } from 'react';

const ChatWidget = ({ 
  apiUrl = 'https://hlpfl.io/api/chat', 
  position = 'bottom-right',
  primaryColor = '#667eea',
  showBranding = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage = {
      text: "Welcome to HLPFL Records! I'm here to help you learn about our services and answer any questions about working with us.",
      sender: 'bot',
      timestamp: new Date(),
      quickActions: ["Submit Music", "Learn About Services", "Company Info", "Contact Us"]
    };
    setMessages([welcomeMessage]);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText.trim(),
          conversationHistory: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage = {
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        quickActions: data.quickActions || [],
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: inputText.trim() },
        { role: 'assistant', content: data.response }
      ]);

    } catch (error) {
      const errorMessage = {
        text: 'Sorry, I\'m having trouble connecting. Please try again later or contact us directly at info@hlpfl.org.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (action) => {
    setInputText(action);
    setTimeout(() => sendMessage(), 100);
  };

  const handleSuggestion = (suggestion) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const widgetStyles = {
    '--primary-color': primaryColor,
    '--primary-gradient': `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
  };

  return (
    <div className="chat-widget-container" style={widgetStyles}>
      <style jsx>{`
        .chat-widget-container {
          position: fixed;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .position-bottom-right {
          bottom: 20px;
          right: 20px;
        }

        .position-bottom-left {
          bottom: 20px;
          left: 20px;
        }

        .position-top-right {
          top: 20px;
          right: 20px;
        }

        .position-top-left {
          top: 20px;
          left: 20px;
        }

        .chat-toggle {
          background: var(--primary-gradient);
          color: white;
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          user-select: none;
        }

        .chat-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .chat-window {
          position: absolute;
          bottom: 60px;
          right: 0;
          width: 380px;
          height: 550px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          display: ${isOpen ? 'flex' : 'none'};
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e1e5e9;
        }

        .chat-header {
          background: var(--primary-gradient);
          color: white;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .company-subtitle {
          font-size: 12px;
          opacity: 0.9;
          margin-top: 2px;
        }

        .chat-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .chat-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f8f9fa;
          scroll-behavior: smooth;
        }

        .message {
          margin-bottom: 12px;
          display: flex;
          max-width: 85%;
        }

        .user-message {
          justify-content: flex-end;
          margin-left: auto;
        }

        .bot-message {
          justify-content: flex-start;
          margin-right: auto;
        }

        .message-content {
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .user-message .message-content {
          background: var(--primary-gradient);
          color: white;
          border-bottom-right-radius: 6px;
        }

        .bot-message .message-content {
          background: white;
          color: #333;
          border: 1px solid #e1e5e9;
          border-bottom-left-radius: 6px;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 4px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 10px 14px;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #999;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .quick-actions {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .quick-action-btn {
          background: var(--primary-gradient);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .quick-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .suggestions {
          margin-top: 12px;
        }

        .suggestions-label {
          font-size: 12px;
          color: #666;
          margin: 0 0 6px 0;
          font-style: italic;
        }

        .suggestion-btn {
          display: block;
          width: 100%;
          background: white;
          border: 1px solid #e1e5e9;
          color: var(--primary-color);
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          margin-bottom: 4px;
        }

        .suggestion-btn:hover {
          background: #f8f9ff;
          border-color: var(--primary-color);
          transform: translateX(2px);
        }

        .chat-input-container {
          padding: 16px;
          border-top: 1px solid #e1e5e9;
          background: white;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .chat-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #e1e5e9;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .chat-input:focus {
          border-color: var(--primary-color);
        }

        .chat-send {
          background: var(--primary-gradient);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
        }

        .chat-send:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
          .chat-window {
            width: calc(100vw - 40px);
            height: 60vh;
            max-height: 500px;
          }
        }
      `}</style>

      <div className={`position-${position}`}>
        {!isOpen && (
          <button className="chat-toggle" onClick={toggleChat}>
            💬 Chat
          </button>
        )}
        
        {isOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <h3>HLPFL Records</h3>
              <span className="company-subtitle">Grand Rapids, MI</span>
              <button className="chat-close" onClick={toggleChat}>×</button>
            </div>
            
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.sender}-message`}>
                  <div className="message-content">
                    {message.text}
                    <div className="message-time">{formatTime(message.timestamp)}</div>
                  </div>
                  
                  {message.quickActions && message.quickActions.length > 0 && (
                    <div className="quick-actions">
                      {message.quickActions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
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
                      {message.suggestions.map((suggestion, suggestionIndex) => (
                        <button
                          key={suggestionIndex}
                          className="suggestion-btn"
                          onClick={() => handleSuggestion(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
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
            
            <div className="chat-input-container">
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about our services..."
              />
              <button className="chat-send" onClick={sendMessage}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;