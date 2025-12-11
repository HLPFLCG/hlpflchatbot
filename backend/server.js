const express = require('express');
const cors = require('cors');
const natural = require('natural');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 12345;

// Middleware
app.use(cors());
app.use(express.json());

// Load knowledge base
const companyInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../knowledge-base/company-info.json'), 'utf8'));
const services = JSON.parse(fs.readFileSync(path.join(__dirname, '../knowledge-base/services.json'), 'utf8'));
const faqs = JSON.parse(fs.readFileSync(path.join(__dirname, '../knowledge-base/faqs.json'), 'utf8'));
const responseTemplates = JSON.parse(fs.readFileSync(path.join(__dirname, '../knowledge-base/response-templates.json'), 'utf8'));
const intentsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../nlp-intents/intents.json'), 'utf8'));

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

class IntentClassifier {
  constructor() {
    this.intents = intentsConfig.intents;
    this.confidence_threshold = 0.3;
  }

  classify(message) {
    const tokens = tokenizer.tokenize(message.toLowerCase());
    const stemmedTokens = tokens.map(token => stemmer.stem(token));
    
    let bestMatch = {
      intent: 'unknown',
      confidence: 0,
      sub_intent: null,
      entities: {}
    };

    for (const [intentName, intentData] of Object.entries(this.intents)) {
      const keywordMatches = intentData.keywords.filter(keyword => 
        stemmedTokens.some(token => token.includes(keyword.toLowerCase()) || 
                                 keyword.toLowerCase().includes(token))
      );
      
      const confidence = keywordMatches.length / Math.max(intentData.keywords.length, stemmedTokens.length);
      
      if (confidence > bestMatch.confidence && confidence >= this.confidence_threshold) {
        bestMatch = {
          intent: intentName,
          confidence: confidence,
          sub_intent: null,
          entities: {}
        };

        // Check for sub-intents
        if (intentData.sub_intents) {
          for (const [subIntentName, subKeywords] of Object.entries(intentData.sub_intents)) {
            const subKeywordMatches = subKeywords.filter(keyword =>
              stemmedTokens.some(token => token.includes(keyword.toLowerCase()) || 
                                       keyword.toLowerCase().includes(token))
            );
            
            if (subKeywordMatches.length > 0) {
              bestMatch.sub_intent = subIntentName;
              break;
            }
          }
        }
      }
    }

    return bestMatch;
  }
}

class ResponseGenerator {
  constructor() {
    this.templates = responseTemplates.templates;
    this.knowledgeBase = {
      companyInfo,
      services,
      faqs
    };
  }

  generateResponse(classification, message) {
    const { intent, sub_intent } = classification;
    
    switch (intent) {
      case 'greeting':
        return this.getTemplate('greeting.friendly');
      
      case 'artist_submission':
        if (sub_intent === 'requirements') {
          return this.getTemplate('artist_submission.requirements');
        } else if (sub_intent === 'genre') {
          return this.getTemplate('artist_submission.genre');
        } else {
          return this.getTemplate('artist_submission.process');
        }
      
      case 'services':
        if (sub_intent === 'development') {
          return this.getTemplate('services.development');
        } else if (sub_intent === 'production') {
          return this.getTemplate('services.production');
        } else if (sub_intent === 'distribution') {
          return this.getTemplate('services.distribution');
        } else if (sub_intent === 'marketing') {
          return this.getTemplate('services.marketing');
        } else {
          return "I'd be happy to tell you about our services! We offer artist development, music production, distribution, and marketing. Which area interests you most? 🎵";
        }
      
      case 'company_info':
        if (sub_intent === 'differentiators') {
          return this.getTemplate('company_info.differentiators');
        } else if (sub_intent === 'location') {
          return this.getTemplate('company_info.location');
        } else {
          return this.getTemplate('company_info.about');
        }
      
      case 'contact':
        if (sub_intent === 'submissions') {
          return this.getTemplate('contact.submissions');
        } else if (sub_intent === 'business') {
          return this.getTemplate('contact.business');
        } else {
          return this.getTemplate('contact.general');
        }
      
      case 'career_advice':
        if (sub_intent === 'networking') {
          return this.getTemplate('career_advice.networking');
        } else if (sub_intent === 'business') {
          return this.getTemplate('career_advice.business');
        } else {
          return this.getTemplate('career_advice.beginner');
        }
      
      case 'goodbye':
        return "Thanks for chatting with me! Feel free to reach out anytime at info@hlpfl.org. We'd love to hear from you! 🎸";
      
      default:
        return this.getTemplate('fallback.confused');
    }
  }

  getTemplate(path) {
    const keys = path.split('.');
    let template = this.templates;
    
    for (const key of keys) {
      template = template[key];
      if (!template) break;
    }
    
    return template || this.getTemplate('fallback.unknown');
  }

  getQuickActions(intent) {
    const quickActions = [
      "How do I submit music?",
      "What services do you offer?",
      "Tell me about HLPFL Records",
      "Contact information"
    ];

    switch (intent) {
      case 'artist_submission':
        return ["Submission requirements", "How long to hear back?", "What genres do you accept?"];
      case 'services':
        return ["Artist development", "Music production", "Distribution services", "Marketing & promotion"];
      case 'company_info':
        return ["About HLPFL", "What makes you different?", "Where are you located?"];
      default:
        return quickActions;
    }
  }
}

// Initialize classifier and generator
const classifier = new IntentClassifier();
const generator = new ResponseGenerator();

// Routes
app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const classification = classifier.classify(message);
    const response = generator.generateResponse(classification, message);
    const quickActions = generator.getQuickActions(classification.intent);

    res.json({
      response,
      intent: classification.intent,
      confidence: classification.confidence,
      quickActions
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      response: "I'm having trouble processing your request. Please try again or contact us directly at info@hlpfl.org."
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});