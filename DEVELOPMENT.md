# ChatFree Development Guide

**Version**: 2.0.0+ (Production-Ready)

## Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **MongoDB** 5.0+ ([Download Community Edition](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
- **Ollama** ([Download](https://ollama.ai/))
- **Git** ([Download](https://git-scm.com/))

### Setup (5 minutes)

```bash
# 1. Clone and enter directory
git clone <repository-url>
cd CHATFREE

# 2. Start MongoDB (if not already running)
mongod
# Or use Docker: docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:6.0

# 3. Start Ollama (in another terminal)
ollama serve
ollama pull llama2  # Download a model

# 4. Backend setup (new terminal)
cd backend
cp .env.example .env  # Edit with your values
npm install
npm start
# Should see: "ChatFree backend running on http://localhost:3001"

# 5. Frontend setup (another terminal)
cd frontend
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
npm install
npm start
# Opens http://localhost:3000
```

### Create Account & Test

1. Register at http://localhost:3000 (email, username, password)
2. Login with credentials
3. Click "New Conversation"
4. Send a message and get AI response
5. Run bias analysis
6. Try different models and settings

## Development Workflow

### Making Changes

**Create a feature branch:**
```bash
git checkout -b feature/my-feature
```

**Make changes and test locally as you develop.**

**Commit with clear messages:**
```bash
git add .
git commit -m "feat: add dark mode toggle"
# Types: feat, fix, docs, style, refactor, test, chore
```

**Push and create Pull Request:**
```bash
git push origin feature/my-feature
```

### Adding Backend Features

#### Example: New API Endpoint

1. **Create validation schema** (middleware/validation.js):
   ```javascript
   const myFeatureSchema = Joi.object({
     field1: Joi.string().required(),
     field2: Joi.number().optional()
   });
   ```

2. **Create route** (routes/myfeature.js):
   ```javascript
   const { auth } = require('../middleware/auth');
   const { validate } = require('../middleware/validation');
   const { asyncHandler } = require('../middleware/errorHandler');

   router.post('/', auth, validate('myFeature'), asyncHandler(async (req, res) => {
     // Your logic here
     res.json({ success: true, data: {} });
   }));
   ```

3. **Mount in server.js**:
   ```javascript
   app.use('/api/myfeature', require('./routes/myfeature'));
   ```

4. **Test with curl**:
   ```bash
   TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}' | jq -r '.token')
   
   curl -X POST http://localhost:3001/api/myfeature \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"field1":"value"}'
   ```

### Adding Frontend Features

#### Example: New Component

1. **Create component** (src/components/MyComponent.jsx):
   ```javascript
   import { useContext } from 'react';
   import { ConversationContext } from '../contexts/ConversationContext';
   
   export function MyComponent() {
     const { conversations } = useContext(ConversationContext);
     
     return <div>My component content</div>;
   }
   ```

2. **Add to App.jsx**:
   ```javascript
   import { MyComponent } from './components/MyComponent';
   
   function App() {
     return <MyComponent />;
   }
   ```

3. **Add styles** (src/styles/MyComponent.css):
   ```css
   .my-component {
     padding: 1rem;
     border-radius: 8px;
   }
   ```

### Calling Backend API

```javascript
import { api } from '../utils/api';

// Automatically includes JWT token from localStorage
const { data } = await api.get('/conversations');
const { data } = await api.post('/feature', { field1: 'value' });
```

## Debugging

### Backend Debugging

**Check logs:**
```bash
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

**Enable debug mode:**
```bash
node --inspect server.js
# Then use Chrome DevTools
```

**Test endpoint with curl:**
```bash
curl -X GET http://localhost:3001/api/health
```

**Check MongoDB connection:**
```bash
mongosh "mongodb://admin:password@localhost:27017/chatfree?authSource=admin"
> db.users.find()
> db.conversations.find()
```

### Frontend Debugging

**Browser DevTools (F12):**
- Console: Check for errors
- Network: See API requests/responses
- Storage: Check localStorage token
- React DevTools: Inspect components and state

**React Profiler:**
- DevTools → Profiler tab
- Record component renders
- Identify performance issues

## Common Tasks

### Reset Development Environment

```bash
# Stop all services
# Kill MongoDB, Ollama, backend, frontend

# Clear data
rm -rf backend/logs/*

# MongoDB reset
mongosh
> db.dropDatabase()

# npm reset
rm -rf backend/node_modules
rm -rf frontend/node_modules
npm install (in each directory)

# Restart services
```

### Update Dependencies

```bash
npm outdated          # Check for updates
npm update            # Update patch/minor
npm install package@latest  # Update major
```

### Change Ollama Model

```bash
# List available
ollama list

# Pull a new model
ollama pull mistral

# Backend automatically detects available models
# Select in UI or set OLLAMA_MODEL in .env
```

### Test with Different MongoDB

```bash
# Change MONGODB_URI in .env
MONGODB_URI=mongodb://user:pass@host:27017/chatfree?authSource=admin

# Or use MongoDB Atlas (cloud)
# Create free cluster at https://www.mongodb.com/cloud/atlas
```

## Architecture Overview

ChatFree is a **three-tier application**:

1. **Frontend Tier** (React SPA)
   - Real-time UI with React Hooks
   - Context API for state management
   - Responsive three-panel layout
   - CSS3 animations and transitions

2. **API Tier** (Express.js Backend)
   - RESTful endpoints for conversations and analysis
   - Streaming response support for real-time tokens
   - Conversation history management
   - Bias/framing analysis engine

3. **LLM Integration** (Ollama)
   - Local model execution
   - API-driven generation
   - Multi-model support
   - Token streaming capability

## Data Flow Diagrams

### Conversation Flow
```
User Input
    ↓
React Component (ChatWindow)
    ↓
ConversationContext Hook
    ↓
API Client (sendMessage)
    ↓
Express Backend (/api/conversations/:id/messages)
    ↓
Conversation Manager → System Prompt Builder
    ↓
Ollama Client (generateResponse)
    ↓
Ollama API (http://localhost:11434)
    ↓
[LLM Processing]
    ↓
Response → Backend → Frontend Context
    ↓
MessageBubble Component Renders
```

### Analysis Flow
```
AI Response Generated
    ↓
User Action: Trigger Analysis
    ↓
API Call: /api/conversations/:id/analyze
    ↓
Backend: Get Latest Assistant Message
    ↓
BiasAnalyzer.analyze(text)
    ├─ Pattern Matching
    ├─ Issue Detection
    ├─ Risk Scoring
    └─ Suggestion Generation
    ↓
RightPanel Component Updates
    ↓
User Reviews Issues & Suggestions
```

## Core Components

### Backend Components

#### 1. **OllamaClient** (`utils/ollamaClient.js`)
Handles all communication with Ollama API:
- `generateResponse()` - Non-streaming generation
- `generateResponseStream()` - Streaming token generation
- `listModels()` - Available model enumeration
- `isAvailable()` - Health check

#### 2. **ConversationManager** (`utils/conversationManager.js`)
Manages conversation semantics:
- `buildSystemPrompt()` - Creates system prompts from controls
- `compileConversationPrompt()` - Converts conversation to prompt string
- `compressConversation()` - Trims old messages for token limits
- Token estimation and management

#### 3. **BiasAnalyzer** (`utils/biasAnalyzer.js`)
Core bias detection engine:
- Pattern library with 50+ heuristic patterns
- `analyze()` - Main analysis method
- `suggestAlternatives()` - Generates improvement suggestions
- Risk scoring algorithm (0-10 scale)

#### 4. **Conversation Routes** (`routes/conversations.js`)
API endpoints:
- CRUD operations for conversations
- Message sending and streaming
- Auto-analysis on response generation
- Database of in-memory conversations (could be swapped for MongoDB/PostgreSQL)

#### 5. **Analysis Routes** (`routes/analysis.js`)
Standalone analysis endpoints:
- `POST /api/analyze/text` - Analyze any text
- `POST /api/analyze/compare` - Compare original vs modified

### Frontend Components

#### 1. **ConversationContext** (`contexts/ConversationContext.js`)
Global state management using React Context:
- Conversation list and current conversation
- Messages array for current conversation
- Controls state (role, tone, audience, model settings)
- Analysis results
- Async operations with loading/error states

#### 2. **App.jsx**
Root component:
- Server health check
- Error boundary
- ConversationProvider wrapper
- AppContent component with three-region layout

#### 3. **SideBar.jsx**
Left panel (280px fixed width):
- Conversation list with search/filter potential
- New conversation button
- Delete conversation button (with confirmation)
- Server status indicator
- Responsive sidebar toggle for mobile

#### 4. **ChatWindow.jsx**
Main chat region:
- Messages list with auto-scroll
- Loading indicators
- Message input form with multi-line support
- Send button with validation
- Welcome screen when no conversation selected

#### 5. **MessageBubble.jsx**
Individual message component:
- User vs Assistant styling
- Timestamp display
- Copy to clipboard button
- Expand/collapse for long messages
- Style suggestion buttons (Shorter, Formal, Simplify)
- Vanishing actions on hover

#### 6. **RightPanel.jsx**
Controls and analysis panel:
- Collapsible sections (Intent & Tone, Model Config, Analysis)
- Control groups for each setting
- Range sliders for temperature/top_p
- Analysis results display with color-coded risk

### Utility Modules

#### API Client (`utils/api.js`)
Axios wrapper with typed endpoints:
- Conversation CRUD
- Message sending (streaming and non-streaming)
- Analysis calls
- Health checks

#### localStorage Helper (`utils/localStorage.js`)
Browser persistence layer:
- `loadConversations()` - Retrieve all conversations
- `saveConversation()` - Save/update single conversation
- `exportConversations()` - JSON export for backup
- `importConversations()` - Restore from JSON import

## Styling Architecture

### CSS Organization
- **global.css** - CSS variables, resets, base styles, typography
- **app.css** - Three-region layout and responsive grid
- **sidebar.css** - Left panel styling
- **chatwindow.css** - Main chat area and messages
- **messagebubble.css** - Individual message styling
- **rightpanel.css** - Controls and analysis panel

### Design Tokens
```css
:root {
  --primary-bg: #0f0f0f;      /* Main background */
  --secondary-bg: #1a1a1a;    /* Card/panel background */
  --tertiary-bg: #2a2a2a;     /* Hover/active background */
  --text-primary: #e5e7eb;    /* Main text */
  --text-secondary: #9ca3af;  /* Secondary text */
  --accent-color: #3b82f6;    /* Primary action color */
  --user-message-bg: #3b82f6; /* User message background */
  --assistant-message-bg: #2a2a2a; /* AI message background */
}
```

## State Management Flow

### ConversationContext Structure
```javascript
{
  conversations: [
    {
      id: "uuid",
      title: "Conversation Title",
      createdAt: "ISO-8601",
      updatedAt: "ISO-8601",
      messages: [
        { id, role: "user"|"assistant"|"system", content, timestamp },
        // ...
      ],
      controls: {
        role: "unbiased-assistant",
        tone: "neutral",
        audience: "general",
        model: "llama2",
        temperature: 0.7,
        top_p: 0.9
      }
    }
  ],
  currentConversation: { ...conversation },
  messages: [ ...messages from current conversation ],
  isLoading: boolean,
  error: string|null,
  analysisResult: { analysis, suggestions },
  controls: { ...controls }
}
```

## API Contract

### POST /api/conversations/:id/messages
**Request:**
```json
{
  "userMessage": "Your message here",
  "isStream": false
}
```

**Response (isStream=false):**
```json
{
  "userMessage": { id, role, content, timestamp },
  "assistantMessage": { id, role, content, timestamp },
  "conversationLength": 4
}
```

### POST /api/conversations/:id/analyze
**Response:**
```json
{
  "messageId": "message-uuid",
  "analysis": {
    "issues": [
      {
        "type": "identity-inflation",
        "pattern": "you are",
        "count": 2,
        "risk": "high",
        "explanation": "conflates behavior with permanent identity"
      }
    ],
    "score": 6,
    "summary": "⚠️ Detected potential issues...",
    "flagCount": 3
  },
  "suggestions": [
    {
      "issue": "pattern_name",
      "problematic": "Why this is an issue",
      "alternative": "What to use instead",
      "example": "Example usage"
    }
  ]
}
```

## Bias Detection Algorithm

### Pattern Matching
The BiasAnalyzer uses regex patterns organized by type:

1. **Loaded Language Patterns**
   - "obviously", "clearly", "everyone knows", "common sense"
   - Each pattern has a type, risk level, and explanation

2. **Gaslighting Patterns**
   - Identity conflation ("you are")
   - Definition shifts ("by definition", "technically")
   - False consensus ("everyone", "most would")
   - Tone aggression ("ridiculous", "insane")

3. **Domination Phrases**
   - Direct control: "you must", "you cannot"
   - Subtle control: "if you care", "real people"
   - False consensus appeals

### Risk Scoring
```
Risk Score = (Total Risk Points / Maximum Possible) * 10
Max = Issue Count × 3 (high=3, medium=2, low=1)
```

### Deduplication
Multiple instances of same pattern are combined:
```
Pattern: "you are"
Count: 3
Risk: high
```

## Conversation Compression Strategy

When conversation grows too large:

1. **Token Estimation**
   - English text: ~1 token per 4 characters
   - Code: ~1 token per 3 characters

2. **Trimming Strategy**
   - Always keep system messages
   - Keep most recent user/assistant turns
   - Discard oldest turns first

3. **Token Limit** (default: 3000)
   - Configurable per deployment
   - Automatic compression before reaching limit

Future enhancement: Extractive summarization of trimmed turns.

## Streaming Implementation

### Frontend Streaming
```javascript
// Create EventSource-style stream from fetch
const response = await fetch('/api/conversations/:id/messages', {
  method: 'POST',
  body: JSON.stringify({ userMessage, isStream: true })
});

// Parse server-sent events (SSE) format
// data: {"token": "hello"}
// data: {"token": " world"}
// data: {"done": true, "response": "..."}
```

### Backend Streaming
```javascript
// Ollama API returns stream, we convert to SSE
response.data.on('data', (chunk) => {
  const json = JSON.parse(line);
  res.write(`data: ${JSON.stringify({ token: json.response })}\n\n`);
});
```

## Performance Considerations

### Frontend Optimization
- React.memo for MessageBubble components
- useCallback for event handlers to prevent re-renders
- Lazy loading of older messages (future)
- Virtual scrolling for long conversations (future)

### Backend Optimization
- In-memory conversation storage (consider Redis for multi-instance)
- Conversation auto-cleanup (delete old conversations)
- Batch analysis if processing many messages
- Connection pooling for Ollama (via axios)

### Model Selection
- Smaller models (phi3: 2.7B) - Fast, good for basic tasks
- Medium models (llama2: 7B) - Balanced speed/quality
- Larger models (llama2: 13B+) - Better reasoning, slower

## Error Handling Strategy

### Frontend
- API call failures show in-app error messages
- User can retry failed operations
- localStorage fallback for offline conversations

### Backend
- 404: Conversation not found
- 400: Invalid request body
- 500: Server error with optional dev details
- Connection errors to Ollama reported to client

## Future Roadmap

### Phase 2: Enhanced Capabilities
- [ ] WebSocket for real-time updates
- [ ] Conversation search and tagging
- [ ] Custom system prompts
- [ ] Prompt templates and examples
- [ ] Message editing and regeneration

### Phase 3: Persistence & Sync
- [ ] Backend database (MongoDB/PostgreSQL)
- [ ] Cloud sync across devices
- [ ] User accounts and authentication
- [ ] Sharing conversations

### Phase 4: Advanced Features
- [ ] RAG (upload documents for context)
- [ ] Multi-turn reasoning chains
- [ ] Agent mode with tool calling
- [ ] Image input support
- [ ] Voice input/output

### Phase 5: Enterprise
- [ ] Team management
- [ ] Audit logging
- [ ] Fine-tuning local models
- [ ] Custom model deployment
- [ ] API rate limiting and keys

## Deployment Guide

### Docker Setup (Recommended)
```dockerfile
# backend.Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend . 
RUN npm install
EXPOSE 3001
CMD ["npm", "start"]
```

### Heroku/Vercel Frontend
- Build: `npm run build`
- Deploy: `build/` folder
- Set `REACT_APP_API_URL` environment variable

### Self-Hosted Backend
- Server: Node.js on port 3001
- Env vars: NODE_ENV, PORT, OLLAMA_API_URL
- Database: Default to in-memory, consider PostgreSQL

## Testing Strategy

### Backend Unit Tests
- BiasAnalyzer pattern detection
- ConversationManager compression
- API endpoint validation

### Frontend Integration Tests
- Component rendering
- State management
- API communication mocks

### E2E Tests
- Full conversation flow
- Analysis and suggestions
- Conversation persistence

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Submit pull request

## License

MIT - See LICENSE file
