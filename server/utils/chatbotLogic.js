const natural = require('natural');
const knowledgeBase = require('../data/knowledgeBase');

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Intent definitions with keywords
const intents = {
  greeting: {
    name: 'greeting',
    keywords: ['hello', 'hi', 'hey', 'greeting', 'welcome', 'good morning', 'good afternoon', 'howdy'],
    priority: 1
  },
  
  artist_submission: {
    name: 'artist_submission',
    keywords: ['submit', 'submission', 'demo', 'music', 'song', 'track', 'album', 'send music', 'apply', 'join', 'sign', 'get signed'],
    priority: 2
  },
  
  services: {
    name: 'services',
    keywords: ['service', 'services', 'offer', 'provide', 'help', 'support', 'development', 'production', 'distribution', 'marketing', 'management'],
    priority: 3
  },
  
  company_info: {
    name: 'company_info',
    keywords: ['company', 'about', 'who are', 'what is', 'hlpfl', 'records', 'label', 'founded', 'history', 'mission', 'story'],
    priority: 4
  },
  
  contact: {
    name: 'contact',
    keywords: ['contact', 'email', 'phone', 'address', 'reach', 'call', 'office', 'location', 'hours', 'where'],
    priority: 5
  },
  
  career_advice: {
    name: 'career_advice',
    keywords: ['career', 'advice', 'tips', 'how to', 'become', 'successful', 'music industry', 'artist career', 'break into'],
    priority: 6
  },
  
  faq: {
    name: 'faq',
    keywords: ['faq', 'question', 'contract', 'terms', 'payment', 'royalty', 'money', 'cost', 'price'],
    priority: 7
  }
};

// Classify user intent based on keywords
function classifyIntent(message) {
  const tokens = tokenizer.tokenize(message.toLowerCase());
  const stemmedTokens = tokens.map(token => stemmer.stem(token));
  
  let bestMatch = { intent: intents.greeting, score: 0 };
  
  for (const [intentName, intent] of Object.entries(intents)) {
    let score = 0;
    
    for (const keyword of intent.keywords) {
      const keywordTokens = tokenizer.tokenize(keyword.toLowerCase());
      const keywordStemmed = keywordTokens.map(token => stemmer.stem(token));
      
      for (const stemmedToken of stemmedTokens) {
        for (const stemmedKeyword of keywordStemmed) {
          if (stemmedToken === stemmedKeyword) {
            score += 1;
          }
        }
      }
    }
    
    if (score > bestMatch.score || (score === bestMatch.score && intent.priority < bestMatch.intent.priority)) {
      bestMatch = { intent, score };
    }
  }
  
  return bestMatch.intent;
}

// Generate context-aware response
function generateResponse(intent, message, conversationHistory = []) {
  let responseText = '';
  let quickActions = [];
  let suggestions = [];
  
  // Check conversation context
  const lastMessage = conversationHistory.length > 0 ? 
    conversationHistory[conversationHistory.length - 1] : null;
  
  switch (intent.name) {
    case 'greeting':
      responseText = getRandomResponse(knowledgeBase.responseTemplates.greeting);
      quickActions = Object.keys(knowledgeBase.quickActions);
      suggestions = ["What services do you offer?", "How do I submit music?", "Tell me about HLPFL Records"];
      break;
      
    case 'artist_submission':
      if (message.toLowerCase().includes('demo') || message.toLowerCase().includes('music')) {
        responseText = getRandomResponse(knowledgeBase.responseTemplates.artistSubmission);
        quickActions = ["Submit Music", "Contact Us"];
        suggestions = ["What are you looking for in artists?", "How long does review take?", "What are your contract terms?"];
      } else {
        responseText = getRandomResponse(knowledgeBase.responseTemplates.artistSubmission);
      }
      break;
      
    case 'services':
      const serviceKeywords = {
        'development': 'artistDevelopment',
        'production': 'musicProduction', 
        'distribution': 'globalDistribution',
        'publishing': 'publishingRights',
        'marketing': 'marketingPromotion',
        'management': 'careerManagement'
      };
      
      let specificService = null;
      for (const [keyword, serviceName] of Object.entries(serviceKeywords)) {
        if (message.toLowerCase().includes(keyword)) {
          specificService = knowledgeBase.services[serviceName];
          break;
        }
      }
      
      if (specificService) {
        responseText = `${specificService.name}: ${specificService.description}\n\nKey features:\n${specificService.features.map(f => `• ${f}`).join('\n')}`;
        suggestions = [`Tell me more about ${specificService.name}`, "How much does this cost?", "Get started with this service"];
      } else {
        responseText = getRandomResponse(knowledgeBase.responseTemplates.services);
        quickActions = Object.keys(knowledgeBase.services);
        suggestions = ["Artist Development", "Music Production", "Global Distribution"];
      }
      break;
      
    case 'company_info':
      if (message.toLowerCase().includes('founded') || message.toLowerCase().includes('history')) {
        responseText = `HLPFL Records was founded in 2009 in Grand Rapids, Michigan. We've grown to support ${knowledgeBase.company.stats.artists} artists with ${knowledgeBase.company.stats.releases} releases and over ${knowledgeBase.company.stats.streams} streams worldwide.`;
      } else if (message.toLowerCase().includes('mission')) {
        responseText = knowledgeBase.company.mission;
      } else {
        responseText = getRandomResponse(knowledgeBase.responseTemplates.companyInfo);
        suggestions = ["What's your mission?", "How many artists do you work with?", "Where are you located?"];
      }
      break;
      
    case 'contact':
      responseText = getRandomResponse(knowledgeBase.responseTemplates.contact);
      suggestions = ["What are your office hours?", "Do you offer virtual meetings?", "Best way to reach A&R?"];
      break;
      
    case 'career_advice':
      responseText = "Here are some career tips for aspiring artists:\n\n1. **Develop your craft** - Continuously improve your skills\n2. **Build your brand** - Create a unique image and story\n3. **Network actively** - Connect with industry professionals\n4. **Understand the business** - Learn about contracts, royalties, and rights\n5. **Stay persistent** - Success takes time and dedication\n\nWould you like specific advice on any of these areas?";
      suggestions = ["Tell me about networking", "How do I build my brand?", "What about music contracts?"];
      break;
      
    case 'faq':
      if (message.toLowerCase().includes('contract') || message.toLowerCase().includes('terms')) {
        responseText = knowledgeBase.faqs.contract_terms.answer;
      } else if (message.toLowerCase().includes('support') || message.toLowerCase().includes('help')) {
        responseText = knowledgeBase.faqs.support_services.answer;
      } else {
        responseText = getRandomResponse(knowledgeBase.responseTemplates.fallback);
      }
      break;
      
    default:
      responseText = getRandomResponse(knowledgeBase.responseTemplates.fallback);
      quickActions = Object.keys(knowledgeBase.quickActions);
      break;
  }
  
  return {
    text: responseText,
    quickActions: quickActions,
    suggestions: suggestions
  };
}

// Helper function to get random response from array
function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = {
  classifyIntent,
  generateResponse
};