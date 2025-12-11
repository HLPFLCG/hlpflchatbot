const express = require('express');
const cors = require('cors');
const path = require('path');
const natural = require('natural');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Knowledge Base
const knowledgeBase = require('./data/knowledgeBase');
const { classifyIntent, generateResponse } = require('./utils/chatbotLogic');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post('/api/chat', (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Classify user intent
    const intent = classifyIntent(message);
    
    // Generate response based on intent and context
    const response = generateResponse(intent, message, conversationHistory);
    
    res.json({
      response: response.text,
      intent: intent.name,
      quickActions: response.quickActions,
      suggestions: response.suggestions
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`HLPFL Chatbot server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});