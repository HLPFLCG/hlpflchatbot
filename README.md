# HLPFL Records AI Chatbot

A sophisticated AI chatbot built for HLPFL Records, a Nashville-based independent record label. This chatbot assists artists with information about services, music submissions, company information, and career advice.

## 🎵 About HLPFL Records

Founded in 2009 in Nashville, Tennessee, HLPFL Records is an independent record label specializing in artist development and global music distribution. We support 50+ artists with 200+ releases and over 1 billion streams worldwide.

## 🤖 Chatbot Features

- **Intent Recognition**: Advanced natural language processing for understanding user queries
- **Context-Aware Responses**: Smart responses based on conversation history
- **Multiple Service Areas**: Covers artist development, production, distribution, marketing, and more
- **Quick Actions**: One-click buttons for common requests
- **Smart Suggestions**: Contextual suggestions for follow-up questions
- **Mobile Responsive**: Optimized for all devices
- **Professional Music Industry Branding**: Tailored specifically for the music industry

## 🏗️ Technical Architecture

### Backend (Node.js)
- **Express.js** server with RESTful API
- **Natural.js** for NLP and intent classification
- **Modular knowledge base** for easy customization
- **Context-aware conversation management**

### Frontend (React + TypeScript)
- **Modern React 18** with TypeScript
- **Real-time messaging interface**
- **Responsive design** with mobile optimization
- **Smooth animations** and professional UI

### Key Components
- **Intent Classification System**: Keyword-based NLP with priority scoring
- **Knowledge Base**: JSON-based for easy content management
- **Response Generation**: Dynamic, context-aware response system
- **Conversation Management**: Maintains chat history for better responses

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HLPFLCG/hlpflchatbot.git
   cd hlpflchatbot
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (server + client)
   npm run install-all
   
   # Or install separately
   npm install
   cd client && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to access the chatbot

## 📁 Project Structure

```
hlpflchatbot/
├── server/
│   ├── index.js              # Main server file
│   ├── data/
│   │   └── knowledgeBase.js  # Chatbot knowledge base
│   └── utils/
│       └── chatbotLogic.js   # NLP and response logic
├── client/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── App.tsx           # Main React component
│   │   ├── App.css           # Styles
│   │   ├── index.tsx         # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json          # Client dependencies
│   └── tsconfig.json         # TypeScript configuration
├── package.json              # Server dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🎯 Chatbot Capabilities

### Supported Intents
1. **Greeting** - Welcome messages and initial interactions
2. **Artist Submission** - Music submission process and requirements
3. **Services Information** - Details about all HLPFL services
4. **Company Information** - About HLPFL Records, history, and mission
5. **Contact Information** - How to reach the company
6. **Career Advice** - Tips for aspiring artists
7. **FAQ Support** - Common questions about contracts, terms, etc.

### Service Areas Covered
- **Artist Development**: Vocal coaching, performance training, brand development
- **Music Production**: Recording, mixing, mastering, producer collaboration
- **Global Distribution**: 150+ streaming platforms worldwide
- **Publishing & Rights**: Copyright, royalties, licensing, sync opportunities
- **Marketing & Promotion**: Digital marketing, PR, playlist pitching
- **Career Management**: Tour management, partnerships, financial planning

## 🔧 Customization Guide

### Adding New Intents
1. Update `server/utils/chatbotLogic.js` - Add new intent definition
2. Add keywords and priority for the new intent
3. Update `generateResponse` function to handle the new intent
4. Add response templates to `server/data/knowledgeBase.js`

### Modifying Knowledge Base
Edit `server/data/knowledgeBase.js`:
- Update company information
- Modify service descriptions
- Add new FAQ entries
- Customize response templates

### Changing the UI
Edit `client/src/App.css` and `client/src/App.tsx`:
- Modify colors and branding
- Adjust layout and responsiveness
- Add new UI components
- Customize animations

### Industry Adaptation
This chatbot is designed to be easily adapted for any industry:

1. **Update Knowledge Base** - Replace music industry content with your industry
2. **Modify Intents** - Adjust intent classification for your use case
3. **Customize Responses** - Tailor response templates to your brand voice
4. **Update Branding** - Change colors, logo, and company information

## 🚀 Deployment Options

### Option 1: GitHub Pages (Frontend Only)
1. Build the React app:
   ```bash
   npm run build
   ```

2. Deploy to GitHub Pages:
   ```bash
   # Add gh-pages branch
   git subtree push --prefix client/build origin gh-pages
   ```

### Option 2: Heroku (Full Stack)
1. Create `Procfile`:
   ```
   web: npm start
   ```

2. Deploy to Heroku:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

### Option 3: Vercel (Full Stack)
1. Install Vercel CLI
2. Run:
   ```bash
   vercel
   ```

### Option 4: Traditional Hosting
1. Build the application:
   ```bash
   npm run build
   ```

2. Upload the `client/build` folder to your hosting provider
3. Set up the Node.js server on your backend
4. Configure environment variables

## 🔍 API Endpoints

### Chat API
```
POST /api/chat
Content-Type: application/json

{
  "message": "User message here",
  "conversationHistory": [...]
}

Response:
{
  "response": "Chatbot response",
  "intent": "intent_name",
  "quickActions": ["Action 1", "Action 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}
```

### Health Check
```
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 Testing

### Running Tests
```bash
# Client tests
cd client && npm test

# Server tests (if implemented)
npm test
```

### Manual Testing
1. Start the development server
2. Open `http://localhost:3000`
3. Test various conversation flows:
   - Artist submissions
   - Service inquiries
   - Company information requests
   - Contact information
   - Career advice

## 📊 Performance Considerations

- **Response Time**: Average response time < 500ms
- **Memory Usage**: Lightweight NLP processing
- **Scalability**: Stateless design for horizontal scaling
- **Browser Compatibility**: Supports all modern browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/new-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/new-feature
   ```
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions about this chatbot or HLPFL Records:
- **Email**: info@hlpfl.org
- **Phone**: (615) 555-0123
- **Website**: https://hlpfl.org

## 🔮 Future Enhancements

- **Machine Learning Integration**: Replace keyword-based NLP with ML models
- **Multi-language Support**: Add internationalization
- **Voice Interface**: Implement speech-to-text and text-to-speech
- **Analytics Dashboard**: Track conversation metrics and user behavior
- **CRM Integration**: Connect with customer relationship management systems
- **WhatsApp/Instagram Integration**: Expand to social media platforms

---

Built with ❤️ for HLPFL Records and the independent music community.