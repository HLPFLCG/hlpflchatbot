# HLPFL Chatbot - API Documentation

## Overview

The HLPFL Chatbot API provides programmatic access to our AI-powered chatbot functionality. This API allows developers to integrate chatbot capabilities into their applications, websites, and services.

## Base URL

```
https://api.hlpfl.org
```

## Authentication

Currently, the API is publicly accessible for demonstration purposes. For production use, API keys will be required.

## Endpoints

### POST /api/chat

Process a user message and return a chatbot response.

**Endpoint:** `/api/chat`

**Method:** `POST`

**Content-Type:** `application/json`

#### Request Body

```json
{
  "message": "string (required)",
  "conversationHistory": "array (optional)"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | The user's message/question to the chatbot |
| conversationHistory | array | No | Array of previous messages for context (optional) |

#### Example Request

```bash
curl -X POST https://api.hlpfl.org/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What services do you offer?"
  }'
```

#### Response

```json
{
  "response": "string",
  "intent": "string",
  "confidence": "number",
  "quickActions": "array",
  "cached": "boolean"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| response | string | The chatbot's response message |
| intent | string | The classified intent (e.g., "services", "greeting", "company_info") |
| confidence | number | Confidence score (0.0 to 1.0) of the intent classification |
| quickActions | array | Suggested follow-up questions/actions |
| cached | boolean | Whether the response was retrieved from cache |

#### Example Response

```json
{
  "response": "I'd be happy to tell you about our toolkit! HLPFL offers 6+ professional tools: Social Media Manager, Link in Bio, Music Distribution, Artist Management, Form Builder, and Music Vault. Which tool interests you most? 🎵",
  "intent": "services",
  "confidence": 0.9,
  "quickActions": [
    "Social Media Manager",
    "Music Distribution",
    "Artist Management",
    "Link in Bio Tool"
  ],
  "cached": false
}
```

### GET /api/health

Check the health status of the API.

**Endpoint:** `/api/health`

**Method:** `GET`

#### Response

```json
{
  "status": "string",
  "timestamp": "string"
}
```

#### Example Response

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

## Intents

The chatbot classifies messages into the following intents:

### Core Intents
- `greeting` - Greetings and hellos
- `goodbye` - Farewells and goodbyes
- `services` - Information about HLPFL services
- `company_info` - Company and business information
- `contact` - Contact information and support
- `featured_artist` - Information about featured artists
- `artist_submission` - Artist submission process

### Advanced Intents
- `career_advice` - Music career guidance and tips
- `industry_problems` - Music industry issues and challenges
- `hlpfl_solution` - How HLPFL solves industry problems
- `statistics` - Industry statistics and data
- `artist_resources` - Resources for artists
- `unknown` - When intent cannot be determined

## Quick Actions

Quick actions are suggested follow-up questions based on the conversation context:

### Common Quick Actions
- "What tools do you offer?"
- "How do I submit my music?"
- "Tell me about HLPFL"
- "What makes HLPFL different?"
- "Where are you located?"
- "Who founded HLPFL?"

### Service-Specific Quick Actions
- "Social Media Manager"
- "Music Distribution"
- "Artist Management"
- "Link in Bio Tool"
- "Form Builder"
- "Music Vault"

## Caching

The API implements response caching for improved performance:

- **Cache Duration:** 5 minutes
- **Cache Key:** Case-insensitive message text
- **Cache Response:** Includes `cached: true` flag
- **Automatic Expiration:** Cached responses expire after TTL

### Cache Behavior

- First request: Processes message, generates response, caches it
- Subsequent identical requests (within 5 min): Returns cached response
- Different messages: Processed normally
- Case variations: Treated as same cache key

## Error Handling

The API uses standard HTTP status codes:

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input parameters |
| 500 | Internal Server Error - Server-side error |

### Error Response Format

```json
{
  "error": "string",
  "response": "string"
}
```

#### Example Error Response

```json
{
  "error": "Message is required",
  "response": "I'm having trouble processing your request. Please try again or contact us directly at https://hlpfl.org."
}
```

## Rate Limiting

Currently, there are no rate limits in place. For production deployment, rate limiting will be implemented:

- **Standard Rate:** 100 requests per minute
- **Premium Rate:** 1000 requests per minute
- **Rate Limit Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Code Examples

### JavaScript/Node.js

```javascript
const response = await fetch('https://api.hlpfl.org/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'What services do you offer?'
  })
});

const data = await response.json();
console.log(data.response);
```

### Python

```python
import requests

response = requests.post(
    'https://api.hlpfl.org/api/chat',
    json={
        'message': 'What services do you offer?'
    }
)

data = response.json()
print(data['response'])
```

### PHP

```php
$response = curl_init('https://api.hlpfl.org/api/chat');
curl_setopt($response, CURLOPT_RETURNTRANSFER, true);
curl_setopt($response, CURLOPT_POST, true);
curl_setopt($response, CURLOPT_POSTFIELDS, json_encode([
    'message' => 'What services do you offer?'
]));
curl_setopt($response, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$data = json_decode(curl_exec($response), true);
echo $data['response'];
```

## Best Practices

1. **Handle Errors Gracefully**: Implement proper error handling for network issues
2. **Cache Responses**: Utilize the built-in caching to reduce API calls
3. **Use Quick Actions**: Provide quick action buttons for better UX
4. **Monitor Confidence Scores**: Low confidence may indicate unclear intent
5. **Respect Rate Limits**: Implement appropriate backoff strategies
6. **Secure API Keys**: Never expose API keys in client-side code

## Support

For API support and questions:

- **Email:** api-support@hlpfl.org
- **Documentation:** https://docs.hlpfl.org/api
- **Status Page:** https://status.hlpfl.org

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Core chat functionality
- Intent classification
- Quick actions
- Response caching
- Health check endpoint

## License

This API is provided by HLPFL Records. See terms of service for usage rights and restrictions.

---

**HLPFL Records - Tools, Not Contracts. Independence, Not Ownership.**

For more information, visit https://hlpfl.org