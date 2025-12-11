# 🚀 Quick Embed Setup Guide

## Step 1: Test Your API

Test your API to make sure it's working:

```bash
# Test health endpoint
curl https://your-worker-url.workers.dev/api/health

# Test chat endpoint
curl -X POST https://your-worker-url.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

## Step 2: Copy Widget Files to Your Website

Copy these files to your website:

1. `chat-widget.js` - The chat widget JavaScript
2. `chat-widget.css` - The chat widget styles

## Step 3: Add to Your Website HTML

Add this to your existing website's HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Your existing head content -->
    <link rel="stylesheet" href="chat-widget.css">
</head>
<body>
    <!-- Your existing website content -->
    
    <!-- Add this before closing body tag -->
    <script src="chat-widget.js"></script>
    <script>
        new HLPFLChatWidget({
            apiUrl: 'https://your-worker-url.workers.dev',
            position: 'bottom-right'
        });
    </script>
</body>
</html>
```

## Step 4: Customize the API URL

In `chat-widget.js`, update this line:
```javascript
this.apiUrl = options.apiUrl || 'https://your-actual-worker-url.workers.dev';
```

## Step 5: Test the Widget

Open your website - you should see a chat bubble in the bottom-right corner!

## Next Options

- **WordPress**: Add to theme footer
- **React**: Use as component
- **Squarespace**: Add code injection
- **Custom CMS**: Add to template

Need help with any specific platform?