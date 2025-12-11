# Embed Chatbot in hlpfl.org

## Option 1: React Component (if hlpfl.org uses React)

Copy this component file:
**File**: `components/ChatWidget.jsx`

```jsx
import React, { useState, useEffect, useRef } from 'react';

const ChatWidget = ({ 
  apiUrl = 'https://hlpfl.io/api/chat', 
  position = 'bottom-right',
  primaryColor = '#667eea',
  showBranding = true 
}) => {
  // [Copy the full component from your repo]
};

export default ChatWidget;

// Usage in your app:
// <ChatWidget apiUrl="https://hlpfl.io/api/chat" />
```

## Option 2: Vue Component (if hlpfl.org uses Vue)

Copy this component file:
**File**: `components/ChatWidget.vue`

```vue
<template>
  <!-- Copy the full template from your repo -->
</template>

<script>
// Copy the full script from your repo
</script>

<style scoped>
/* Copy the full styles from your repo */
</style>

<!-- Usage:
<ChatWidget apiUrl="https://hlpfl.io/api/chat" />
-->
```

## Option 3: Universal HTML/Javascript (works on any website)

Add this to your hlpfl.org HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://your-domain.com/chat-widget.css">
</head>
<body>
    <!-- Your website content -->
    
    <script src="https://your-domain.com/chat-widget.js"></script>
    <script>
        new HLPFLChatWidget({
            apiUrl: 'https://hlpfl.io/api/chat',
            position: 'bottom-right',
            primaryColor: '#667eea'
        });
    </script>
</body>
</html>
```

## Quick Setup

1. **Copy the component files** from your repo to hlpfl.org
2. **Update the apiUrl** to: `'https://hlpfl.io/api/chat'`
3. **Add the component** to your main page/layout
4. **Test** the chat functionality

## Files to Copy

From your repository to hlpfl.org:
- `components/ChatWidget.jsx` (React)
- `components/ChatWidget.vue` (Vue)
- `chat-widget.js` (Universal)
- `chat-widget.css` (Universal styles)