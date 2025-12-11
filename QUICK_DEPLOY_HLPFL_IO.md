# Quick Deploy: HLPFL.io Chatbot

⚡ **Deploy your chatbot API to hlpfl.io in 5 minutes**

## Prequisites
- Cloudflare account with `hlpfl.io` domain
- Cloudflare API token
- GitHub repository access

## Step 1: GitHub Secrets (2 minutes)

1. Go to: https://github.com/HLPFLCG/hlpflchatbot/settings/secrets/actions
2. Click "New repository secret"
3. Add: `CLOUDFLARE_API_TOKEN` with your Cloudflare API token

## Step 2: Deploy (1 minute)

```bash
# Push any change to trigger deployment
git add .
git commit -m "Deploy to hlpfl.io"
git push origin main
```

## Step 3: Verify (2 minutes)

Watch the deployment: https://github.com/HLPFLCG/hlpflchatbot/actions

Test the API:
```bash
curl https://hlpfl.io/api/health
curl -X POST https://hlpfl.io/api/chat -d '{"message":"hello"}'
```

## Results

✅ **API Live**: `https://hlpfl.io/api/chat`
✅ **Health Check**: `https://hlpfl.io/api/health`
✅ **Documentation**: `https://hlpfl.io/api/docs`

## Embed in hlpfl.org

### React
```jsx
<ChatWidget apiUrl="https://hlpfl.io/api/chat" />
```

### Vue
```vue
<ChatWidget apiUrl="https://hlpfl.io/api/chat" />
```

### HTML
```html
<script>
new HLPFLChatWidget({apiUrl: 'https://hlpfl.io/api/chat'});
</script>
```

## Troubleshooting

❌ **Deployment failed**: Check GitHub Actions logs
❌ **API not responding**: Wait 5-10 minutes for DNS propagation
❌ **CORS errors**: Ensure requests come from hlpfl.org

## Need Help?

- Full Guide: [HLPFL_IO_DEPLOYMENT_GUIDE.md](./HLPFL_IO_DEPLOYMENT_GUIDE.md)
- GitHub Issues: https://github.com/HLPFLCG/hlpflchatbot/issues
- Manual Deploy: `./deploy-hlpfl-io.sh`

---

🎉 **Done! Your chatbot is now live at hlpfl.io**