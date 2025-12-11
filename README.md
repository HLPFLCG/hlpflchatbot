# HLPFL Records AI Chatbot

A sophisticated AI-powered chatbot built for HLPFL Records, a Nashville-based independent record label. This chatbot provides information about artist submissions, services, company details, and music career advice.

## 🎵 About HLPFL Records

HLPFL Records was founded in 2009 in Nashville, Tennessee, and has grown to represent 50+ artists with 200+ releases and over 1 billion streams. The label focuses on artist development and quality music production with an artist-first approach.

## 🚀 Features

- **Intelligent Intent Classification**: Advanced NLP using Natural.js for understanding user queries
- **Industry-Specific Responses**: Tailored responses for the music industry
- **Quick Action Buttons**: Context-aware suggestions for common questions
- **Real-time Messaging**: Smooth chat interface with typing indicators
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Professional UI**: Modern, branded interface with smooth animations

## 🏗️ Architecture

### Frontend (React + TypeScript)
- Modern React with TypeScript for type safety
- Responsive chat interface with CSS animations
- Real-time messaging with WebSocket-like experience
- Quick action buttons for enhanced UX

### Backend (Node.js + Express)
- RESTful API with Express.js
- Natural Language Processing with Natural.js
- Intent classification and response generation
- Knowledge base with structured JSON data

### Knowledge Base
- Company information and statistics
- Service details and pricing
- Frequently asked questions
- Response templates with industry terminology

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, CSS3
- **Backend**: Node.js, Express.js
- **NLP**: Natural.js for intent classification
- **Styling**: Custom CSS with animations
- **Deployment**: Ready for GitHub Pages and Vercel

## 📁 Project Structure

```
hlpflchatbot/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── App.tsx          # Main chat component
│   │   ├── App.css          # Chat interface styles
│   │   ├── index.tsx        # React entry point
│   │   └── index.css        # Global styles
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── package.json         # Frontend dependencies
│   └── tsconfig.json        # TypeScript configuration
├── backend/                 # Node.js Express server
│   ├── server.js            # Main server file
│   └── package.json         # Backend dependencies
├── knowledge-base/          # Knowledge base data
│   ├── company-info.json    # Company information
│   ├── services.json        # Service details
│   ├── faqs.json           # Frequently asked questions
│   └── response-templates.json # Response templates
├── nlp-intents/            # NLP configuration
│   └── intents.json        # Intent definitions and keywords
├── deployment/             # Deployment configurations
├── docs/                   # Documentation
├── package.json            # Root package configuration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Git for cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HLPFLCG/hlpflchatbot.git
   cd hlpflchatbot
   ```

2. **Install all dependencies**
   ```bash
   npm run install-deps
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the chatbot in action.

## 🔧 Development

### Running Backend Only
```bash
npm run server
```

### Running Frontend Only
```bash
npm run client
```

### Building for Production
```bash
npm run build
```

## 📱 Supported Intents

The chatbot can handle the following types of queries:

1. **Artist Submissions** 🎤
   - Submission process and requirements
   - Response times and expectations
   - Genre preferences

2. **Services Information** 🎵
   - Artist development programs
   - Music production services
   - Distribution and marketing

3. **Company Information** 🏢
   - About HLPFL Records
   - Company history and statistics
   - Location and contact details

4. **Contact & Support** 📧
   - General contact information
   - Submission-specific contacts
   - Business inquiries

5. **Career Advice** 💡
   - Beginner tips for artists
   - Networking strategies
   - Industry business advice

## 🎨 Customization

### Adding New Intents
1. Update `nlp-intents/intents.json` with new intent definitions
2. Add response templates to `knowledge-base/response-templates.json`
3. Optionally add FAQ entries to `knowledge-base/faqs.json`

### Modifying Responses
Edit the response templates in `knowledge-base/response-templates.json` to customize the chatbot's personality and responses.

### Updating Company Information
Modify `knowledge-base/company-info.json` and `knowledge-base/services.json` with current information.

## 🚀 Deployment

### Deploy to GitHub Pages

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**
   ```bash
   npm run deploy-gh-pages
   ```

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

### Environment Variables
Create a `.env` file in the backend directory:
```
PORT=5000
NODE_ENV=production
```

## 🔒 Security Considerations

- Input validation and sanitization
- Rate limiting for API endpoints
- CORS configuration for frontend access
- No sensitive information in client-side code

## 📊 Performance

- Optimized bundle sizes with React lazy loading
- Efficient NLP processing with cached intents
- Smooth animations with CSS transforms
- Responsive design for all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- 📧 Email: info@hlpfl.org
- 🌐 Website: https://hlpfl.org
- 💬 Use the chatbot itself!

## 🌟 Acknowledgments

- Built with ❤️ for HLPFL Records
- Powered by modern web technologies
- Inspired by the Nashville music community

---

**Made with 🎵 in Music City, USA**