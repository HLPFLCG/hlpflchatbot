const express = require('express');
const cors = require('cors');
const natural = require('natural');
const path = require('path');
const fs = require('fs');
const LLMService = require('./llm-service');

const app = express();
const PORT = process.env.PORT || 12345;

// Middleware
app.use(cors());
app.use(express.json());

// Load knowledge base
const companyInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../knowledge-base/company-info.json'), 'utf8'));
const services = JSON.parse(fs.readFileSync(path.join(__dirname, '../knowledge-base/services.json'), 'utf8'));
const faqs = JSON.parse(fs.readFileSync(path.join(__dirname, '../knowledge-base/faqs.json'), 'utf8'));
const responseTemplates = JSON.parse(fs.readFileSync(path.join(__dirname, '../knowledge-base/response-templates.json'), 'utf8')).response_templates;
const intentsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../nlp-intents/intents.json'), 'utf8'));

// Load additional knowledge bases
let musicIndustryProblems, hlpflSolution, statisticsData, artistResources;
try {
  musicIndustryProblems = JSON.parse(fs.readFileSync(path.join(__dirname, '../knowledge-base/music-industry-problems.json'), 'utf8'));
  hlpflSolution = JSON.parse(fs.readFileSync(path.join(__dirname, '../knowledge-base/hlpfl-solution.json'), 'utf8'));
  statisticsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../knowledge-base/statistics-data.json'), 'utf8'));
  artistResources = JSON.parse(fs.readFileSync(path.join(__dirname, '../knowledge-base/artist-resources.json'), 'utf8'));
} catch (error) {
  console.log('Some knowledge base files not found, will use available data');
}

// Initialize LLM Service
const llmService = new LLMService(process.env.OPENAI_API_KEY);
console.log(`LLM Service ${llmService.isEnabled() ? 'enabled' : 'disabled'}`);

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
      // Improved keyword matching - more precise matching
        const keywordMatches = intentData.keywords.filter(keyword => {
          const keywordLower = keyword.toLowerCase();
          
          // Exact token match (highest priority)
          if (stemmedTokens.some(token => token === keywordLower)) {
            return true;
          }
          
          // Multi-word keyword match
          if (keywordLower.includes(' ')) {
            const keywordWords = keywordLower.split(' ');
            const keywordStems = keywordWords.map(word => stemmer.stem(word));
            const allStemsPresent = keywordStems.every(stem => 
              stemmedTokens.some(token => token.includes(stem))
            );
            if (allStemsPresent) {
              return true;
            }
          }
          
          // Single word partial match (only if keyword is single word)
          if (!keywordLower.includes(' ')) {
            const keywordStem = stemmer.stem(keywordLower);
            const hasPartialMatch = stemmedTokens.some(token => 
              token.includes(keywordStem) || keywordStem.includes(token)
            );
            if (hasPartialMatch) {
              return true;
            }
          }
          
          return false;
        });
      
      // Improved confidence calculation:
        // 1. Perfect match: if we found at least one keyword match, give base confidence
        // 2. Bonus for multiple matches
        // 3. Consider how many tokens matched
        let confidence = 0;
        
        if (keywordMatches.length > 0) {
          // Base confidence for having any match
          confidence = 0.3;
          
          // Add bonus for each matching keyword
          confidence += (keywordMatches.length * 0.2);
          
          // Bonus if multiple tokens match keywords
          const matchedTokens = stemmedTokens.filter(token => 
            keywordMatches.some(kw => token.includes(kw.toLowerCase()) || kw.toLowerCase().includes(token))
          );
          confidence += (matchedTokens.length * 0.1);
          
          // Cap at 1.0
          confidence = Math.min(confidence, 1.0);
        }
      
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
    this.templates = responseTemplates;
    this.knowledgeBase = {
      companyInfo,
      services,
      faqs,
      musicIndustryProblems,
      hlpflSolution,
      statisticsData,
      artistResources
    };
  }

  async generateResponse(classification, message, context = {}) {
    const { intent, sub_intent } = classification;
    
    // Try LLM first if enabled
    if (llmService.isEnabled()) {
      try {
        const llmResponse = await llmService.generateContextualResponse(
          message,
          intent,
          context
        );
        if (llmResponse) {
          return llmResponse;
        }
      } catch (error) {
        console.error('LLM generation failed, falling back to templates:', error);
      }
    }
    
    // Fallback to template-based responses
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
        if (sub_intent === 'social_media') {
          return this.generateServiceResponse('social_media_manager');
        } else if (sub_intent === 'link_in_bio') {
          return this.generateServiceResponse('link_in_bio');
        } else if (sub_intent === 'distribution') {
          return this.generateServiceResponse('music_distribution');
        } else if (sub_intent === 'management') {
          return this.generateServiceResponse('artist_management');
        } else if (sub_intent === 'form_builder') {
          return this.generateServiceResponse('form_builder');
        } else if (sub_intent === 'music_vault') {
          return this.generateServiceResponse('music_vault');
        } else {
          return "I'd be happy to tell you about our toolkit! HLPFL offers 6+ professional tools: Social Media Manager, Link in Bio, Music Distribution, Artist Management, Form Builder, and Music Vault. Which tool interests you most? 🎵";
        }
      
      case 'company_info':
        if (sub_intent === 'differentiators' || sub_intent === 'philosophy') {
          return this.generateCompanyInfoResponse('differentiators');
        } else if (sub_intent === 'location') {
          return this.generateCompanyInfoResponse('location');
        } else if (sub_intent === 'team') {
          return this.generateCompanyInfoResponse('team');
        } else if (sub_intent === 'mission') {
          return this.generateCompanyInfoResponse('mission');
        } else {
          return this.generateCompanyInfoResponse('about');
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
          return this.generateCareerAdviceResponse('networking');
        } else if (sub_intent === 'business') {
          return this.generateCareerAdviceResponse('business');
        } else if (sub_intent === 'marketing') {
          return this.generateCareerAdviceResponse('marketing');
        } else if (sub_intent === 'contracts') {
          return this.generateCareerAdviceResponse('contracts');
        } else if (sub_intent === 'mental_health') {
          return this.generateCareerAdviceResponse('mental_health');
        } else {
          return this.generateCareerAdviceResponse('beginner');
        }
      
      case 'industry_problems':
        if (sub_intent === 'royalties') {
          return this.generateIndustryProblemsResponse('royalty_crisis');
        } else if (sub_intent === 'contracts') {
          return this.generateIndustryProblemsResponse('contractual_exploitation');
        } else if (sub_intent === 'gatekeepers') {
          return this.generateIndustryProblemsResponse('systemic_barriers');
        } else if (sub_intent === 'burnout') {
          return this.generateIndustryProblemsResponse('psychological_toll');
        } else {
          return this.generateIndustryProblemsResponse('overview');
        }
      
      case 'hlpfl_solution':
        if (sub_intent === 'philosophy') {
          return this.generateHLPFLSolutionResponse('philosophy');
        } else if (sub_intent === 'toolkit') {
          return this.generateHLPFLSolutionResponse('toolkit_approach');
        } else if (sub_intent === 'economic_model') {
          return this.generateHLPFLSolutionResponse('economic_model');
        } else if (sub_intent === 'success_stories') {
          return this.generateHLPFLSolutionResponse('success_stories');
        } else {
          return this.generateHLPFLSolutionResponse('overview');
        }
      
      case 'statistics':
        if (sub_intent === 'streaming') {
          return this.generateStatisticsResponse('streaming_royalties');
        } else if (sub_intent === 'industry') {
          return this.generateStatisticsResponse('industry_size_growth');
        } else if (sub_intent === 'mental_health') {
          return this.generateStatisticsResponse('mental_health');
        } else if (sub_intent === 'contracts') {
          return this.generateStatisticsResponse('contract_exploitation');
        } else {
          return this.generateStatisticsResponse('overview');
        }
      
      case 'artist_resources':
        if (sub_intent === 'building_career') {
          return this.generateArtistResourcesResponse('building_your_career');
        } else if (sub_intent === 'marketing') {
          return this.generateArtistResourcesResponse('marketing_promotion');
        } else if (sub_intent === 'streaming_strategy') {
          return this.generateArtistResourcesResponse('streaming_strategies');
        } else if (sub_intent === 'avoiding_pitfalls') {
          return this.generateArtistResourcesResponse('avoiding_pitfalls');
        } else if (sub_intent === 'contracts_101') {
          return this.generateArtistResourcesResponse('understanding_contracts');
        } else if (sub_intent === 'wellness') {
          return this.generateArtistResourcesResponse('mental_health_wellness');
        } else {
          return this.generateArtistResourcesResponse('overview');
        }
      
      case 'featured_artist':
        if (sub_intent === 'about_priv' || sub_intent === 'philosophy') {
          return this.generateFeaturedArtistResponse('about');
        } else if (sub_intent === 'music') {
          return this.generateFeaturedArtistResponse('music');
        } else {
          return this.generateFeaturedArtistResponse('overview');
        }
      
      case 'goodbye':
        return "Thanks for chatting with me! Feel free to reach out anytime at https://hlpfl.org. We'd love to hear from you! 🎸";
      
      default:
        return this.getTemplate('fallback.confused');
    }
  }

  getTemplate(path) {
    const keys = path.split('.');
    let template = this.templates;
    
    for (const key of keys) {
      if (template && template[key]) {
        template = template[key];
      } else {
        template = null;
        break;
      }
    }
    
    // Return template or a random fallback message
    if (template) {
      return Array.isArray(template) ? template[Math.floor(Math.random() * template.length)] : template;
    }
    
    // Fallback messages
    const fallbacks = [
      "That's a great question! While I don't have specific information about that right now, I'd be happy to connect you with our team who can provide more details.",
      "I can assist with questions about our record label services, artist opportunities, or company information. Could you rephrase your question or let me know what specific area you'd like to learn about?",
      "I'd be happy to help you learn about HLPFL Records! You can ask about our services, submitting music, company information, or contact details. What would you like to know?"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  async getQuickActions(intent, message, response) {
    // Try LLM for contextual quick actions first
    if (llmService.isEnabled()) {
      try {
        const llmQuickActions = await llmService.generateFollowUpQuestions(message, intent, response);
        if (llmQuickActions && llmQuickActions.length > 0) {
          return llmQuickActions;
        }
      } catch (error) {
        console.error('LLM quick actions failed, using defaults:', error);
      }
    }
    
    // Fallback to intent-based quick actions
    const quickActionsMap = {
      'greeting': [
        "What tools do you offer?",
        "How do I submit my music?",
        "Tell me about HLPFL"
      ],
      'artist_submission': [
        "Submission requirements",
        "How long to hear back?",
        "What genres do you accept?"
      ],
      'services': [
        "Social Media Manager",
        "Music Distribution",
        "Artist Management",
        "Link in Bio Tool"
      ],
      'company_info': [
        "What makes HLPFL different?",
        "Where are you located?",
        "Who founded HLPFL?"
      ],
      'contact': [
        "Submit my music",
        "Business inquiry",
        "General contact"
      ],
      'career_advice': [
        "Getting started tips",
        "Marketing strategies",
        "Understanding contracts"
      ],
      'industry_problems': [
        "Streaming royalties explained",
        "360 deal problems",
        "How to avoid burnout"
      ],
      'hlpfl_solution': [
        "What tools do you offer?",
        "How does your model work?",
        "Artist success stories"
      ],
      'statistics': [
        "Streaming payout rates",
        "Industry revenue",
        "Mental health stats"
      ],
      'artist_resources': [
        "Building my career",
        "Marketing tips",
        "Avoiding pitfalls"
      ],
      'featured_artist': [
        "About PRIV",
        "PRIV's music",
        "PRIV's philosophy"
      ],
      'default': [
        "How do I submit my music?",
        "What services do you offer?",
        "Tell me about HLPFL"
      ]
    };

    return quickActionsMap[intent] || quickActionsMap['default'];
  }
}

// Helper methods for generating responses from knowledge base
ResponseGenerator.prototype.generateServiceResponse = function(serviceKey) {
  const service = this.knowledgeBase.services.services[serviceKey];
  if (!service) {
    return "I'd be happy to tell you about our services! Which tool interests you most?";
  }
  
  let response = `**${service.name}**\n\n`;
  response += `${service.description}\n\n`;
  response += `**Key Features:**\n`;
  service.features.forEach(feature => {
    response += `• ${feature}\n`;
  });
  response += `\n**Benefits:**\n`;
  service.benefits.slice(0, 3).forEach(benefit => {
    response += `• ${benefit}\n`;
  });
  
  return response;
};

ResponseGenerator.prototype.generateCompanyInfoResponse = function(infoKey) {
  const company = this.knowledgeBase.companyInfo.company;
  
  switch (infoKey) {
    case 'about':
      return `**About HLPFL Records**\n\n${company.description}\n\nFounded in ${company.founded} by ${company.founder}, HLPFL operates on a "${company.tagline}" philosophy. We provide artists with label-level resources without predatory contracts.\n\n${company.statistics.artists} artists • ${company.statistics.releases} releases • ${company.statistics.streams} streams`;
    
    case 'mission':
      return `**Our Mission**\n\n${company.mission}\n\n**Core Values:**\n${company.core_values.slice(0, 4).map((v, i) => `${i + 1}. ${v}`).join('\n')}`;
    
    case 'differentiators':
      return `**What Makes HLPFL Different**\n\n${company.differentiators.map((d, i) => `• ${d}`).join('\n')}\n\n**Business Model:**\n• ${company.business_model.revenue_split} revenue split\n• ${company.business_model.management_fee} management fee\n• ${company.business_model.artist_ownership} artist ownership\n• ${company.business_model.restrictive_contracts} restrictive contracts`;
    
    case 'location':
      return `**Location**\n\nHLPFL is based in ${company.location.city}, ${company.location.state}.\n\n**Contact:**\n• Email: ${company.contact.email}\n• Website: ${company.contact.website}\n• Artist Portal: ${company.contact.artist_portal}`;
    
    case 'team':
      return `**Our Team**\n\n${company.founder} - Founder & CEO\n\nFounded HLPFL in 2019 at age 18 with a revolutionary vision for artist partnerships. James has transformed how independent musicians build sustainable careers through the groundbreaking 50/50 model.`;
    
    default:
      return this.generateCompanyInfoResponse('about');
  }
};

ResponseGenerator.prototype.generateCareerAdviceResponse = function(adviceKey) {
  const resources = this.knowledgeBase.artistResources?.artist_resources;
  if (!resources) {
    return "I'd be happy to help with career advice! What specific area would you like to know about?";
  }
  
  const section = resources[adviceKey];
  if (!section) {
    return "I'd be happy to help with career advice! What specific area would you like to know about?";
  }
  
  let response = `**${section.title}**\n\n`;
  
  if (section.tips) {
    section.tips.slice(0, 3).forEach((tip, i) => {
      response += `${i + 1}. **${tip.tip}**\n${tip.description}\n\n`;
    });
  } else if (section.warnings) {
    section.warnings.slice(0, 3).forEach((warning, i) => {
      response += `${i + 1}. **${warning.warning}**\n${warning.description}\n⚠️ ${warning.consequence}\n\n`;
    });
  } else if (section.platforms) {
    section.platforms.slice(0, 2).forEach(platform => {
      response += `**${platform.platform}**\nBest for: ${platform.best_for}\n\n`;
    });
  }
  
  return response;
};

ResponseGenerator.prototype.generateIndustryProblemsResponse = function(problemKey) {
  const problems = this.knowledgeBase.musicIndustryProblems?.music_industry_problems;
  if (!problems) {
    return "The music industry has many challenges. Would you like to know about streaming royalties, contracts, or artist burnout?";
  }
  
  const section = problems[problemKey];
  if (!section) {
    return "The music industry has many challenges. Would you like to know about streaming royalties, contracts, or artist burnout?";
  }
  
  let response = `**${section.title}**\n\n${section.description}\n\n`;
  
  if (section.key_statistics) {
    const stats = section.key_statistics;
    Object.keys(stats).slice(0, 3).forEach(key => {
      if (typeof stats[key] === 'object' && stats[key].statistic) {
        response += `• ${stats[key].statistic}: ${stats[key].description}\n`;
      }
    });
  } else if (section.mental_health_statistics) {
    const stats = section.mental_health_statistics;
    Object.keys(stats).slice(0, 3).forEach(key => {
      if (typeof stats[key] === 'object' && stats[key].statistic) {
        response += `• ${stats[key].statistic}: ${stats[key].description}\n`;
      }
    });
  }
  
  return response;
};

ResponseGenerator.prototype.generateHLPFLSolutionResponse = function(solutionKey) {
  const solution = this.knowledgeBase.hlpflSolution?.hlpfl_solution;
  if (!solution) {
    return "HLPFL provides tools, not contracts. Would you like to learn about our toolkit, economic model, or success stories?";
  }
  
  const section = solution[solutionKey];
  if (!section) {
    return "HLPFL provides tools, not contracts. Would you like to learn about our toolkit, economic model, or success stories?";
  }
  
  let response = `**${section.title}**\n\n`;
  
  if (solutionKey === 'core_philosophy') {
    response += `${section.philosophy}\n\n"${section.tagline}"\n\n${section.mission}`;
  } else if (solutionKey === 'toolkit_approach') {
    response += `${section.description}\n\n**6+ Tools:**\n${section.tools_overview.map((t, i) => `${i + 1}. ${t.name}: ${t.benefit}`).join('\n')}`;
  } else if (solutionKey === 'economic_model') {
    response += `${section.title}\n\n• Revenue Model: ${section.revenue_model}\n• No Debt: ${section.no_debt}\n• Transparency: ${section.transparency}\n• Sustainability: ${section.sustainability}`;
  } else {
    response += section.description || JSON.stringify(section).substring(0, 300);
  }
  
  return response;
};

ResponseGenerator.prototype.generateStatisticsResponse = function(statsKey) {
  const stats = this.knowledgeBase.statisticsData?.statistics_data;
  if (!stats) {
    return "I can share statistics about the music industry! What would you like to know about?";
  }
  
  const section = stats[statsKey];
  if (!section) {
    return "I can share statistics about the music industry! What would you like to know about?";
  }
  
  let response = `**${section.title}**\n\n`;
  
  const data = section;
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'object' && data[key].statistic) {
      response += `• ${data[key].statistic} ${data[key].description}\n`;
      if (data[key].source) {
        response += `  Source: ${data[key].source}\n`;
      }
    }
  });
  
  return response;
};

ResponseGenerator.prototype.generateArtistResourcesResponse = function(resourceKey) {
  const resources = this.knowledgeBase.artistResources?.artist_resources;
  if (!resources) {
    return "I have many resources for artists! What area would you like to explore?";
  }
  
  const section = resources[resourceKey];
  if (!section) {
    return "I have many resources for artists! What area would you like to explore?";
  }
  
  let response = `**${section.title}**\n\n`;
  
  if (section.tips) {
    section.tips.slice(0, 3).forEach((tip, i) => {
      response += `${i + 1}. **${tip.tip}**\n${tip.description}\n`;
    });
  } else if (section.warnings) {
    section.warnings.slice(0, 3).forEach((warning, i) => {
      response += `${i + 1}. **${warning.warning}**\n${warning.description}\n`;
    });
  }
  
  return response;
};

ResponseGenerator.prototype.generateFeaturedArtistResponse = function(artistKey) {
  const company = this.knowledgeBase.companyInfo?.company;
  if (!company) {
    return "PRIV is our featured artist! Would you like to know about their music or philosophy?";
  }
  
  if (artistKey === 'about' || artistKey === 'overview') {
    return `**PRIV**\n\nAlternative • Indie • Experimental\n\nPRIV is an emerging artist from Grand Rapids, Michigan, bringing a fresh perspective to the HLPFL roster. With a unique sound that blends innovation and authenticity, PRIV represents the next generation of independent music.\n\nAs part of HLPFL, PRIV maintains complete creative control and ownership while accessing the tools and support needed to build a sustainable music career.\n\n**Quote:**\n"I've been making music my whole life, but I've never felt truly free until now. HLPFL gets it. They understand that the best art comes from artists who aren't afraid to experiment, fail, and try again."`;
  } else if (artistKey === 'music') {
    return `**PRIV's Music**\n\nPRIV has released 10+ singles from 2023-2025, including:\n\n• "living a lie" (2025)\n• "reverence" (2024)\n• "victim" (2024)\n• "Throw Away" (2024)\n• "Bones" (2024)\n• "Numb" (2023)\n• "Libra" (2023)\n\n**Total Streams:** 125K+\n\n**Listen on:**\n• Spotify: https://open.spotify.com/artist/0jIqPF7laDAaZmSeoSzLlt\n• Apple Music: https://music.apple.com/ca/artist/priv/1617089388\n• SoundCloud: https://soundcloud.com/whereispriv`;
  } else {
    return this.generateFeaturedArtistResponse('about');
  }
};

// Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const classification = classifier.classify(message);
    const context = conversationHistory ? { previousMessages: conversationHistory } : {};
    const response = await generator.generateResponse(classification, message, context);
    const quickActions = await generator.getQuickActions(classification.intent, message, response);

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
      response: "I'm having trouble processing your request. Please try again or contact us directly at https://hlpfl.org."
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize classifier and generator (must be after all helper methods are defined)
const classifier = new IntentClassifier();
const generator = new ResponseGenerator();

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
