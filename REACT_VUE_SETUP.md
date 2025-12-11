# 🚀 React & Vue Setup Guide

## 📍 **API URL Configuration**

Your API will be at: `https://api.hlpfl.io/api/chat`

## ⚛️ **React Setup**

### Option 1: Using the Component

```bash
# Copy the React component
cp components/ChatWidget.jsx src/components/
```

```jsx
// src/App.jsx
import React from 'react';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <div className="App">
      {/* Your existing app content */}
      <header>
        <h1>HLPFL Records</h1>
        <p>Grand Rapids, Michigan</p>
      </header>
      
      <main>
        {/* Your website content */}
      </main>
      
      {/* Add the chat widget */}
      <ChatWidget 
        apiUrl="https://api.hlpfl.io/api/chat"
        position="bottom-right"
        primaryColor="#667eea"
      />
    </div>
  );
}

export default App;
```

### Option 2: Custom Styling

```jsx
<ChatWidget 
  apiUrl="https://api.hlpfl.io/api/chat"
  position="bottom-right"
  primaryColor="#764ba2"  // Your brand color
  showBranding={true}
/>
```

## 🟢 **Vue Setup**

### Option 1: Using the Component

```bash
# Copy the Vue component
cp components/ChatWidget.vue src/components/
```

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- Your existing app content -->
    <header>
      <h1>HLPFL Records</h1>
      <p>Grand Rapids, Michigan</p>
    </header>
    
    <main>
      <!-- Your website content -->
    </main>
    
    <!-- Add the chat widget -->
    <ChatWidget 
      apiUrl="https://api.hlpfl.io/api/chat"
      position="bottom-right"
      primaryColor="#667eea"
    />
  </div>
</template>

<script>
import ChatWidget from './components/ChatWidget.vue'

export default {
  name: 'App',
  components: {
    ChatWidget
  }
}
</script>
```

### Option 2: Global Registration

```javascript
// src/main.js
import Vue from 'vue'
import App from './App.vue'
import ChatWidget from './components/ChatWidget.vue'

Vue.component('ChatWidget', ChatWidget)

new Vue({
  render: h => h(App),
}).$mount('#app')
```

## 🔧 **Configuration Options**

Both React and Vue components support these props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiUrl` | String | `https://api.hlpfl.io/api/chat` | Your API endpoint |
| `position` | String | `bottom-right` | Widget position |
| `primaryColor` | String | `#667eea` | Theme color |
| `showBranding` | Boolean | `true` | Show HLPFL branding |

### Position Options
- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`

## 🎨 **Customization Examples**

```jsx
// React - Custom branded colors
<ChatWidget 
  apiUrl="https://api.hlpfl.io/api/chat"
  primaryColor="#764ba2"
  position="bottom-left"
/>

// Vue - Minimal branding
<ChatWidget 
  apiUrl="https://api.hlpfl.io/api/chat"
  showBranding={false}
  position="bottom-right"
/>
```

## 📱 **Next.js Setup**

```jsx
// pages/_app.js
import ChatWidget from '../components/ChatWidget'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <ChatWidget apiUrl="https://api.hlpfl.io/api/chat" />
    </>
  )
}

export default MyApp
```

## 🔨 **Create React App Setup**

```bash
npx create-react-app hlpfl-website
cd hlpfl-website
npm install

# Copy the component
cp /path/to/ChatWidget.jsx src/components/
```

## 🚀 **Vue CLI Setup**

```bash
vue create hlpfl-website
cd hlpfl-website

# Copy the component
cp /path/to/ChatWidget.vue src/components/
```

## 🎯 **Quick Test**

```bash
# Test your API
curl -X POST https://api.hlpfl.io/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

## 🔍 **Troubleshooting**

### CORS Issues
Make sure your API allows your domain:
```javascript
// In worker.js, update CORS headers
headers: {
  'Access-Control-Allow-Origin': 'https://hlpfl.org'
}
```

### Component Not Showing
- Check imports are correct
- Verify API URL is accessible
- Check browser console for errors

### Styling Issues
- Components include all necessary styles
- No external CSS files needed
- Uses CSS-in-JS (React) or scoped CSS (Vue)

## 🚀 **Production Deployment**

1. **Build your app**: `npm run build`
2. **Deploy to your hosting**: Netlify, Vercel, etc.
3. **Test the live widget**
4. **Monitor API usage** in Cloudflare dashboard

---

**Your chat widget is ready to embed!** 🎉

Both components are fully self-contained with styling included.