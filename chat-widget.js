class HLPFLChatWidget {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || 'https://hlpfl.io/api/chat';
    this.container = options.container || null;
    this.position = options.position || 'bottom-right';
    this.conversationHistory = [];
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    this.createWidgetHTML();
    this.attachEventListeners();
  }
  
  createWidgetHTML() {
    const widgetHTML = `
      <div id="hlpfl-chat-widget" class="position-${this.position}">
        <div id="chat-toggle">
          💬 Chat
        </div>
        <div id="chat-window">
          <div id="chat-header">
            <div id="chat-header-content">
              <div id="chat-header-logo">
                <img src="/assets/hlpfl-logo.svg" alt="HLPFL Records Logo" />
              </div>
              <div>
                <div id="chat-header-title">HLPFL Records</div>
                <div id="chat-header-subtitle">Grand Rapids, MI</div>
              </div>
            </div>
            <button id="chat-close">×</button>
          </div>
          <div id="chat-messages"></div>
          <div id="chat-input-container">
            <input type="text" id="chat-input" placeholder="Ask about our services..." autocomplete="off">
            <button id="chat-send">Send</button>
          </div>
        </div>
      </div>
    `;
    
    if (this.container) {
      const containerElement = document.getElementById(this.container);
      if (containerElement) {
        containerElement.innerHTML = widgetHTML;
      }
    } else {
      document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }
  }
  
  attachEventListeners() {
    const toggle = document.getElementById('chat-toggle');
    const close = document.getElementById('chat-close');
    const send = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    
    toggle?.addEventListener('click', () => this.toggleChat());
    close?.addEventListener('click', () => this.toggleChat());
    send?.addEventListener('click', () => this.sendMessage());
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    
    // Close chat when clicking outside
    document.addEventListener('click', (e) => {
      const widget = document.getElementById('hlpfl-chat-widget');
      if (this.isOpen && !widget.contains(e.target)) {
        this.toggleChat();
      }
    });
  }
  
  toggleChat() {
    const window = document.getElementById('chat-window');
    const toggle = document.getElementById('chat-toggle');
    
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      window.style.display = 'flex';
      toggle.style.display = 'none';
      this.focusInput();
    } else {
      window.style.display = 'none';
      toggle.style.display = 'flex';
    }
  }
  
  focusInput() {
    setTimeout(() => {
      const input = document.getElementById('chat-input');
      input?.focus();
    }, 100);
  }
  
  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input?.value.trim();
    
    if (!message) return;
    
    this.addMessage(message, 'user');
    input.value = '';
    
    this.showTypingIndicator();
    
    try {
      const response = await fetch(`${this.apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: this.conversationHistory
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      this.hideTypingIndicator();
      this.addMessage(data.response, 'bot');
      
      this.conversationHistory.push({ role: 'user', content: message });
      this.conversationHistory.push({ role: 'assistant', content: data.response });
      
      if (data.quickActions && data.quickActions.length > 0) {
        this.addQuickActions(data.quickActions);
      }
      
      if (data.suggestions && data.suggestions.length > 0) {
        this.addSuggestions(data.suggestions);
      }
      
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('Sorry, I\'m having trouble connecting. Please try again later or contact us directly at info@hlpfl.org.', 'bot');
    }
  }
  
  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = text;
    
    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
    
    this.scrollToBottom();
  }
  
  addQuickActions(actions) {
    const messagesContainer = document.getElementById('chat-messages');
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'quick-actions';
    
    actions.forEach(action => {
      const button = document.createElement('button');
      button.className = 'quick-action-btn';
      button.textContent = action;
      button.onclick = () => {
        document.getElementById('chat-input').value = action;
        this.sendMessage();
      };
      actionsContainer.appendChild(button);
    });
    
    messagesContainer.appendChild(actionsContainer);
    this.scrollToBottom();
  }
  
  addSuggestions(suggestions) {
    const messagesContainer = document.getElementById('chat-messages');
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggestions';
    
    const label = document.createElement('p');
    label.className = 'suggestions-label';
    label.textContent = 'You might ask:';
    suggestionsContainer.appendChild(label);
    
    suggestions.forEach(suggestion => {
      const button = document.createElement('button');
      button.className = 'suggestion-btn';
      button.textContent = suggestion;
      button.onclick = () => {
        document.getElementById('chat-input').value = suggestion;
        this.focusInput();
      };
      suggestionsContainer.appendChild(button);
    });
    
    messagesContainer.appendChild(suggestionsContainer);
    this.scrollToBottom();
  }
  
  showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const indicator = document.createElement('div');
    indicator.className = 'message bot-message typing';
    indicator.innerHTML = `
      <div class="message-content">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    indicator.id = 'typing-indicator';
    messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }
  
  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }
  
  scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Public methods
  open() {
    if (!this.isOpen) {
      this.toggleChat();
    }
  }
  
  close() {
    if (this.isOpen) {
      this.toggleChat();
    }
  }
  
  setApiUrl(url) {
    this.apiUrl = url;
  }
  
  clearHistory() {
    this.conversationHistory = [];
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = '';
  }
}

// Auto-initialize if script is included directly
if (typeof window !== 'undefined') {
  window.HLPFLChatWidget = HLPFLChatWidget;
  
  // Auto-initialize with default options if no manual initialization
  document.addEventListener('DOMContentLoaded', () => {
    // Only auto-initialize if no existing widget found
    if (!document.getElementById('hlpfl-chat-widget')) {
      // Look for configuration in script tag
      const scripts = document.getElementsByTagName('script');
      for (let script of scripts) {
        if (script.src && script.src.includes('chat-widget.js')) {
          const apiUrl = script.getAttribute('data-api-url');
          const position = script.getAttribute('data-position');
          
          new HLPFLChatWidget({
            apiUrl: apiUrl || 'https://hlpfl-chatbot.your-subdomain.workers.dev',
            position: position || 'bottom-right'
          });
          break;
        }
      }
    }
  });
}