const knowledgeBase = {
  company: {
    name: "HLPFL Records",
    founded: 2009,
    location: "Nashville, Tennessee",
    description: "Independent record label specializing in artist development and global music distribution",
    stats: {
      artists: "50+",
      releases: "200+",
      streams: "1B+"
    },
    mission: "Empowering independent artists with professional development, global distribution, and career advancement"
  },
  
  services: {
    artistDevelopment: {
      name: "Artist Development",
      description: "Comprehensive artist development programs including vocal coaching, performance training, and brand development",
      features: ["Vocal coaching", "Performance training", "Brand development", "Social media strategy", "Image consulting"]
    },
    musicProduction: {
      name: "Music Production",
      description: "Professional music production services with state-of-the-art recording facilities",
      features: ["Recording sessions", "Mixing & mastering", "Producer collaboration", "Studio access", "Audio engineering"]
    },
    globalDistribution: {
      name: "Global Distribution",
      description: "Worldwide music distribution across all major streaming platforms and digital stores",
      features: ["Spotify", "Apple Music", "Amazon Music", "YouTube Music", "Tidal", "150+ platforms"]
    },
    publishingRights: {
      name: "Publishing & Rights",
      description: "Music publishing administration and rights management services",
      features: ["Copyright registration", "Royalty collection", "Publishing administration", "Licensing", "Sync opportunities"]
    },
    marketingPromotion: {
      name: "Marketing & Promotion",
      description: "Strategic marketing and promotional campaigns for music releases",
      features: ["Digital marketing", "PR campaigns", "Radio promotion", "Playlist pitching", "Social media marketing"]
    },
    careerManagement: {
      name: "Career Management",
      description: "Long-term career management and strategic planning for artists",
      features: ["Career planning", "Tour management", "Brand partnerships", "Merchandising", "Financial planning"]
    }
  },
  
  faqs: {
    "artist_submission": {
      question: "How do I submit my music to HLPFL Records?",
      answer: "You can submit your music through our online submission portal at hlpfl.org/submit. Please include 3-5 of your best tracks, a brief bio, and your social media links. Our A&R team reviews all submissions within 2-3 weeks."
    },
    "contract_terms": {
      question: "What are your contract terms?",
      answer: "We offer flexible contract structures tailored to each artist's needs. Our standard deals include 50/50 revenue splits, 2-3 album commitments, and retain creative control for artists. We believe in fair, transparent partnerships."
    },
    "support_services": {
      question: "What support do you provide new artists?",
      answer: "New artists receive comprehensive support including vocal coaching, production assistance, marketing campaigns, social media strategy development, and personalized career planning. We're invested in your long-term success."
    },
    "contact_info": {
      question: "How can I contact HLPFL Records?",
      answer: "You can reach us at: Email: info@hlpfl.org, Phone: (615) 555-0123, Address: 123 Music Row, Nashville, TN 37203. Business hours: Monday-Friday, 9 AM - 6 PM CST."
    }
  },
  
  responseTemplates: {
    greeting: [
      "Welcome to HLPFL Records! I'm here to help you learn about our services and answer any questions about working with us.",
      "Hi there! Thanks for visiting HLPFL Records. How can I assist you with your music career today?",
      "Hello! Welcome to HLPFL Records - Nashville's home for independent artists. What would you like to know?"
    ],
    
    artistSubmission: [
      "Great to hear you're interested in working with us! You can submit your music through our online portal at hlpfl.org/submit. Make sure to include your best 3-5 tracks and a bio about yourself.",
      "We'd love to hear your music! Please submit your tracks through our website at hlpfl.org/submit. Our A&R team reviews every submission personally.",
      "Thanks for your interest in HLPFL Records! Head over to hlpfl.org/submit to share your music with our team. We're always looking for talented artists."
    ],
    
    services: [
      "HLPFL Records offers comprehensive services including artist development, music production, global distribution, publishing & rights management, marketing & promotion, and career management.",
      "We provide end-to-end support for artists: from vocal coaching and production to worldwide distribution and marketing campaigns. What specific service interests you most?",
      "Our services cover every aspect of an artist's career - development, production, distribution, marketing, and management. Which area would you like to explore?"
    ],
    
    companyInfo: [
      "HLPFL Records was founded in 2009 in Nashville, Tennessee. We're an independent label supporting 50+ artists with 200+ releases and over 1 billion streams worldwide.",
      "We're a Nashville-based independent record label founded in 2009, dedicated to empowering independent artists with professional development and global reach.",
      "Since 2009, HLPFL Records has been helping independent artists achieve their dreams. Based in Music City, we've helped over 50 artists reach global audiences."
    ],
    
    contact: [
      "You can reach HLPFL Records at info@hlpfl.org or (615) 555-0123. Our office is located at 123 Music Row, Nashville, TN 37203.",
      "Contact us via email at info@hlpfl.org or call (615) 555-0123. We're available Monday-Friday, 9 AM - 6 PM CST.",
      "Get in touch with us at info@hlpfl.org or visit our office on Music Row in Nashville. We'd love to hear from you!"
    ],
    
    fallback: [
      "I'm here to help with information about HLPFL Records, our services, artist submissions, or general inquiries. Could you rephrase your question?",
      "I can assist with questions about our record label services, artist opportunities, or company information. What would you like to know?",
      "I'd be happy to help you learn about HLPFL Records! You can ask about our services, submitting music, or contact information."
    ]
  },
  
  quickActions: {
    "Submit Music": { intent: "artist_submission", message: "I want to submit my music" },
    "Learn About Services": { intent: "services", message: "Tell me about your services" },
    "Company Info": { intent: "company_info", message: "Tell me about HLPFL Records" },
    "Contact Us": { intent: "contact", message: "How can I contact you" }
  }
};

module.exports = knowledgeBase;