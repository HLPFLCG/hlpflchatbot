# 🚀 HLPFL Chatbot Deployment Instructions

This guide provides step-by-step instructions for deploying the HLPFL Records AI Chatbot to various platforms.

## 📋 Prerequisites

Before deploying, ensure you have:
- Node.js 16+ installed
- npm or yarn package manager
- Git installed and configured
- Access to the HLPFLCG/hlpflchatbot repository

## 🛠️ Quick Deployment Options

### Option 1: Automated Deployment Script (Recommended)

Use the included deployment script for guided deployment:

```bash
# Clone the repository
git clone https://github.com/HLPFLCG/hlpflchatbot.git
cd hlpflchatbot

# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

The script will guide you through:
- Local development setup
- Production builds
- Platform-specific deployment

### Option 2: Manual Deployment

Choose your preferred deployment platform below and follow the specific instructions.

## 🌐 Platform-Specific Deployment

### GitHub Pages (Frontend Only - Free)

**Best for**: Simple frontend-only deployment

1. **Clone and Setup**
   ```bash
   git clone https://github.com/HLPFLCG/hlpflchatbot.git
   cd hlpflchatbot
   npm run install-all
   ```

2. **Configure for GitHub Pages**
   ```bash
   # Add homepage to client/package.json
   sed -i 's/"private": true/"homepage": "https:\/\/HLPFLCG.github.io\/hlpflchatbot",\n  "private": true/' client/package.json
   
   # Build the React app
   cd client
   npm run build
   cd ..
   ```

3. **Deploy to GitHub Pages**
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages"
   git subtree push --prefix client/build origin gh-pages
   ```

4. **Access Your Chatbot**
   Visit: `https://HLPFLCG.github.io/hlpflchatbot`

**Note**: GitHub Pages deployment only hosts the frontend. The backend API will not be available.

### Heroku (Full Stack - Free Tier Available)

**Best for**: Complete full-stack deployment with backend API

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Ubuntu/Debian
   sudo snap install heroku --classic
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Deploy**
   ```bash
   git clone https://github.com/HLPFLCG/hlpflchatbot.git
   cd hlpflchatbot
   
   # Create Heroku app
   heroku create your-app-name
   
   # Deploy to Heroku
   git push heroku main
   
   # Open your app
   heroku open
   ```

4. **Configure Environment Variables** (Optional)
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PORT=3000
   ```

### Vercel (Full Stack - Free Tier Available)

**Best for**: Modern deployment with automatic scaling

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   git clone https://github.com/HLPFLCG/hlpflchatbot.git
   cd hlpflchatbot
   npm run install-all
   npm run build
   
   # Deploy to Vercel
   vercel
   
   # Deploy to production
   vercel --prod
   ```

3. **Configure Vercel** (Create `vercel.json` if needed)
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/index.js",
         "use": "@vercel/node"
       },
       {
         "src": "client/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "build"
         }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server/index.js"
       },
       {
         "src": "/(.*)",
         "dest": "/client/$1"
       }
     ]
   }
   ```

### Netlify (Full Stack - Free Tier Available)

**Best for**: Git-based deployment with continuous integration

1. **Prepare for Netlify**
   ```bash
   git clone https://github.com/HLPFLCG/hlpflchatbot.git
   cd hlpflchatbot
   npm run install-all
   ```

2. **Create Netlify Configuration** (`netlify.toml`)
   ```toml
   [build]
     base = "client/"
     command = "npm run build"
     publish = "build"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/server/:splat"
     status = 200
   
   [functions]
     directory = "server/"
   ```

3. **Deploy via Netlify Dashboard**
   - Connect your GitHub repository
   - Set build command: `cd client && npm run build`
   - Set publish directory: `client/build`
   - Add environment variables as needed

### DigitalOcean App Platform (Paid)

**Best for**: Professional deployment with managed databases

1. **Install DigitalOcean CLI**
   ```bash
   curl -sSL https://repos.insights.digitalocean.com/install.sh | sudo bash
   sudo apt-get install doctl
   doctl auth init
   ```

2. **Deploy**
   ```bash
   git clone https://github.com/HLPFLCG/hlpflchatbot.git
   cd hlpflchatbot
   
   # Deploy to DigitalOcean
   doctl apps create --spec .do/app.yaml
   ```

### AWS Amplify (Free Tier Available)

**Best for**: AWS ecosystem integration

1. **Install AWS Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. **Initialize and Deploy**
   ```bash
   git clone https://github.com/HLPFLCG/hlpflchatbot.git
   cd hlpflchatbot
   npm run install-all
   
   # Initialize Amplify
   amplify init
   
   # Add hosting
   amplify add hosting
   
   # Deploy
   amplify publish
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the template
cp .env.example .env

# Edit the file
nano .env
```

Key variables:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `REACT_APP_API_URL`: Frontend API URL

### Customizing the Chatbot

1. **Update Knowledge Base**
   - Edit `server/data/knowledgeBase.js`
   - Modify company information, services, and FAQs

2. **Adjust Intents**
   - Edit `server/utils/chatbotLogic.js`
   - Add new intents or modify existing ones

3. **Customize UI**
   - Edit `client/src/App.css` for styling
   - Modify `client/src/App.tsx` for functionality

## 🧪 Testing Before Deployment

### Local Development
```bash
# Start development server
npm run dev

# Test the chatbot at http://localhost:3000
```

### Production Build Test
```bash
# Build for production
npm run build

# Serve the build locally
npx serve -s client/build -l 3000
```

## 📊 Monitoring and Maintenance

### Health Check
Monitor your deployment at: `https://your-domain.com/api/health`

### Log Monitoring
- **Heroku**: `heroku logs --tail`
- **Vercel**: Check Vercel dashboard
- **GitHub Pages**: Check browser console

### Performance Optimization
- Monitor response times
- Check memory usage
- Optimize images and assets
- Use CDN for static assets

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Input Validation**: The chatbot includes basic input sanitization
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **HTTPS**: Ensure your deployment uses HTTPS

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules client/node_modules
   npm run install-all
   ```

2. **CORS Issues**
   - Ensure API URL is correctly set in environment variables
   - Check server CORS configuration

3. **Memory Issues**
   - Increase Node.js memory limit: `NODE_OPTIONS="--max-old-space-size=4096"`

4. **Port Conflicts**
   - Change PORT in environment variables
   - Check for other processes using the same port

### Platform-Specific Issues

**Heroku**: Check build logs with `heroku logs --tail`
**Vercel**: Check Vercel function logs
**GitHub Pages**: Ensure all paths are relative

## 📞 Support

For deployment issues:
1. Check this documentation first
2. Review platform-specific documentation
3. Check GitHub Issues for known problems
4. Contact HLPFL Records: info@hlpfl.org

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm run install-all
      - name: Build
        run: npm run build
      - name: Deploy
        run: # Add your deployment command here
```

---

🎵 **Your HLPFL Records AI Chatbot is now ready for deployment!**

Choose the deployment option that best fits your needs and budget. The chatbot is designed to be flexible and scalable, supporting everything from simple frontend-only deployments to full-stack production environments.