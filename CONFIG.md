# ChatFree Configuration Guide

## Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development                    # development or production
PORT=3001                              # Backend API port
OLLAMA_API_URL=http://localhost:11434  # Ollama server address
```

### Frontend (.env)

Create `.env` in the `frontend/` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Optional: Analytics, if you add it
REACT_APP_ENABLE_ANALYTICS=false
```

## Customization

### Changing Colors (Dark Theme)

Edit `frontend/src/styles/global.css`:

```css
:root {
  --primary-bg: #0f0f0f;        /* Main dark background */
  --secondary-bg: #1a1a1a;      /* Cards, panels */
  --text-primary: #e5e7eb;      /* Main text color */
  --accent-color: #3b82f6;      /* Primary action (blue) */
  /* ... see file for all tokens ... */
}
```

Example: Change accent color from blue to purple:
```css
--accent-color: #9333ea;        /* Purple */
--accent-hover: #7e22ce;        /* Darker purple */
```

### System Prompt Template

Edit `backend/utils/conversationManager.js` in `buildSystemPrompt()`:

```javascript
buildSystemPrompt(controls = {}) {
  // Customize the instructions here
  return `Your custom system prompt...`;
}
```

### Bias Detection Patterns

Add or modify patterns in `backend/utils/biasAnalyzer.js`:

```javascript
this.loaded_language_patterns = {
  'your_pattern': {
    type: 'category',
    risk: 'high|medium|low',
    explanation: 'explanation'
  },
  // Add more patterns here
};
```

### Model List

Edit `backend/routes/conversations.js` - model dropdown options:

```javascript
<option value="model-name">Display Name</option>
```

Or make it dynamic by fetching from Ollama:

```javascript
const models = await ollamaClient.listModels();
// Update dropdown with dynamic list
```

### UI Layout & Spacing

Edit CSS files in `frontend/src/styles/`:

```css
/* Change sidebar width */
:root {
  --sidebar-width: 300px;  /* Default: 280px */
}

/* Change chat header height */
.chat-header {
  padding: 20px 32px;  /* More padding */
}
```

### Token Limits

Edit `backend/utils/conversationManager.js`:

```javascript
// Increase from 3000 tokens
const maxTokens = 5000;

// Or per-model config:
const maxTokensByModel = {
  'llama2': 2000,
  'llama3': 4000,
  'phi3': 1500,
};
```

## Feature Toggles

### Enable/Disable Auto-Analysis

In `backend/routes/conversations.js`:

```javascript
// Remove or comment out:
// analyzeLatestResponse();
```

### Streaming vs Non-Streaming

Default is non-streaming. To enable:

```javascript
// In frontend sendMessage():
const response = await api.sendMessage(
  currentConversation.id, 
  userMessage, 
  true  // Enable streaming
);
```

### localStorage vs Backend Persistence

Currently uses localStorage. To switch to backend:

1. Add database methods to `routes/conversations.js`
2. Modify `contexts/ConversationContext.js` to use backend storage

### Number of Messages in Context

Edit `backend/utils/conversationManager.js`:

```javascript
// Change from 10 to 20
compileConversationPrompt(messages, maxMessages = 20);
```

## Performance Tuning

### Model Selection by Hardware

```
CPU Only (no GPU):
→ phi3 (2.7B) - Fastest, good for chat
→ gemma2 (2B) - Very fast

GPU with < 6GB VRAM:
→ llama3 (7B) - Balanced

GPU with 6-12GB VRAM:
→ llama2 (13B) - Better reasoning
→ mistral (7B) - Faster with good quality

GPU with > 12GB VRAM:
→ llama2 (70B) - Excellent quality
→ Code Llama (70B) - Good for code
```

### Temperature Settings by Use Case

```
Technical/Facts (temperature = 0.3-0.5):
→ Lower = More consistent, reproducible

General Chat (temperature = 0.7):
→ Default, good balance

Creative/Brainstorm (temperature = 0.9):
→ Higher = More diverse, less predictable
```

### Conversation Compression

When conversations get too long:

```
Off:       Unlimited context, slower responses
Default:   3000 tokens, auto-trim old messages
Aggressive: 1500 tokens, more trimming
```

Edit in `backend/routes/conversations.js`:

```javascript
const messagesToSend = conversationManager.compressConversation(
  [systemMsg, ...conv.messages],
  2000  // Change token limit
);
```

## Database Integration (Future)

To add MongoDB:

1. Install dependencies:
   ```bash
   npm install mongoose
   ```

2. Create `backend/models/Conversation.js`:
   ```javascript
   const ConversationSchema = new Schema({
     userId: String,
     title: String,
     messages: Array,
     controls: Object,
     createdAt: Date,
     updatedAt: Date
   });
   ```

3. Update `routes/conversations.js` to use Mongoose instead of Map

## Security Considerations

### Before Production:

1. **Authentication**
   ```javascript
   // Add JWT middleware
   app.use(authenticateToken);
   ```

2. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   app.use(rateLimit({ windowMs: 1000, max: 10 }));
   ```

3. **Input Validation**
   ```javascript
   // Validate message length
   if (userMessage.length > 5000) {
     return res.status(400).json({ error: 'Message too long' });
   }
   ```

4. **CORS Configuration**
   ```javascript
   // Specify allowed origins
   cors({ origin: 'https://yourdomain.com' })
   ```

5. **Environment Secrets**
   - Use `.env.production` for production secrets
   - Never commit `.env` files
   - Rotate API keys regularly

## Troubleshooting Configuration

### Port Already in Use

```bash
# macOS/Linux - Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Windows - Find process
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <PID> /F
```

### Ollama Connection Issues

```bash
# Check if Ollama is running
curl -v http://localhost:11434/api/tags

# If using different machine, update .env:
OLLAMA_API_URL=http://192.168.1.100:11434

# If using different port:
OLLAMA_API_URL=http://localhost:11435
```

### CORS Errors

Update `backend/server.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

### messages Not Showing

1. Check browser console for API errors (F12)
2. Check backend logs for "Error sending message"
3. Verify Ollama is responding: `curl http://localhost:11434/api/tags`
4. Try a different, simpler message

## Testing Configuration

### API Testing with cURL

```bash
# Create conversation
curl -X POST http://localhost:3001/api/conversations \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'

# Send message
curl -X POST http://localhost:3001/api/conversations/[id]/messages \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"Hello"}'

# Analyze
curl -X POST http://localhost:3001/api/conversations/[id]/analyze
```

### Frontend Testing

Browser DevTools:
1. Open http://localhost:3000
2. Press F12 for Developer Tools
3. Check "Console" for errors
4. Check "Network" for API calls
5. Check "Application" → localStorage for persistence

## Reset to Defaults

### Clear All Data
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### Reset Configuration
Delete `.env` files and recreate from examples above.

---

For more help, see README.md and DEVELOPMENT.md
