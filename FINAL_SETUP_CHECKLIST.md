# 🎉 Final Setup Checklist

## ✅ Part A: Deploy to hlpfl.io

### 1. Deploy Worker
- [ ] Go to: https://dash.cloudflare.com/workers/
- [ ] Create worker: `hlpfl-chatbot`
- [ ] Copy worker.js from: https://github.com/HLPFLCG/hlpflchatbot/blob/main/worker.js
- [ ] Paste and deploy

### 2. Configure Domain
- [ ] Add custom domain: `hlpfl.io`
- [ ] Set route: `hlpfl.io/api/*`
- [ ] Test: `curl https://hlpfl.io/api/health`

### 3. Expected URLs
- [ ] API: `https://hlpfl.io/api/chat`
- [ ] Health: `https://hlpfl.io/api/health`
- [ ] Docs: `https://hlpfl.io/api/docs`

## ✅ Part B: Embed in hlpfl.org

### 1. Choose Your Method
- [ ] React component: `components/ChatWidget.jsx`
- [ ] Vue component: `components/ChatWidget.vue`
- [ ] Universal: `chat-widget.js` + `chat-widget.css`

### 2. Copy Files to hlpfl.org
- [ ] Copy component files to your website
- [ ] Ensure apiUrl is: `'https://hlpfl.io/api/chat'`
- [ ] Add component to your main page

### 3. Test Integration
- [ ] Visit hlpfl.org
- [ ] Click the chat widget
- [ ] Send a test message
- [ ] Verify response from hlpfl.io API

## 🎯 Architecture

```
┌─────────────────┐    API Calls    ┌─────────────────┐
│   hlpfl.org     │ ──────────────→ │  hlpfl.io/api   │
│  (Website)      │                 │   (Chatbot)     │
└─────────────────┘                 └─────────────────┘
```

## 🔧 If Something Goes Wrong

### API Not Working
1. Check Cloudflare Worker is deployed
2. Verify custom domain is configured
3. Test: `curl https://hlpfl.io/api/health`

### Widget Not Showing
1. Check component files are copied correctly
2. Verify apiUrl is `https://hlpfl.io/api/chat`
3. Check browser console for errors

### CORS Issues
1. Ensure requests come from `hlpfl.org`
2. Check worker CORS headers
3. Verify HTTPS is used

## 📞 Quick Reference

**Repository**: https://github.com/HLPFLCG/hlpflchatbot

**Components Available**:
- React: `ChatWidget.jsx`
- Vue: `ChatWidget.vue`
- Universal: `chat-widget.js` + `chat-widget.css`

**API Endpoints**:
- Chat: `https://hlpfl.io/api/chat`
- Health: `https://hlpfl.io/api/health`
- Docs: `https://hlpfl.io/api/docs`

**All set! 🎉**