# ChatFree Development Guide

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
