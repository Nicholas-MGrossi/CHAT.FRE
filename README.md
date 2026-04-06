# ChatFree - Unbiased AI Chat with Local LLM

A modern, ChatGPT-grade conversational interface for local LLMs (Ollama) with integrated bias detection, framing analysis, and conversation memory. Built with React + Node.js/Express.

## Features

### Core Capabilities

- **💬 Conversation Memory & History**
  - Full turn-by-turn history with persistent storage
  - localStorage for browser-only persistence
  - Conversation titles and timestamps
  - Easy conversation switching and management

- **🎯 Intent & Tone Controls**
  - Configure agent role (unbiased assistant, legal, empathetic, technical, casual)
  - Set tone (neutral, assertive, empathetic, authoritative, friendly)
  - Target audience selection (general, expert, layperson, academic, professional)
  - Real-time control updates applied to responses

- **⚠️ Bias & Framing Analysis**
  - Automatic detection of loaded language patterns
  - Gaslighting pattern recognition (identity inflation, definition shifts, tone aggression)
  - Domination/control phrase detection
  - Risk scoring and detailed suggestions
  - Side-panel analysis with visual indicators

- **✏️ Formatting & Editing Tools**
  - Copy-to-clipboard for all messages
  - Formatting suggestions (shorter, formal, simplify)
  - Expandable/collapsible messages
  - Easy message review before use

- **⚙️ Model Configuration**
  - Switch between available Ollama models
  - Adjust temperature and top_p parameters
  - Token usage awareness
  - Real-time model settings

- **🖥️ Modern Chat UI**
  - Three-region layout (sidebar, chat, controls)
  - Real-time message streaming
  - Responsive design for mobile and desktop
  - Dark theme optimized for readability

## Architecture

```
ChatFree/
├── backend/                 # Node.js/Express server
│   ├── server.js           # Main server entry point
│   ├── routes/
│   │   ├── conversations.js # Conversation API endpoints
│   │   └── analysis.js      # Analysis API endpoints
│   ├── utils/
│   │   ├── ollamaClient.js  # Ollama API wrapper
│   │   ├── conversationManager.js # Conversation history logic
│   │   └── biasAnalyzer.js  # Bias detection engine
│   ├── package.json
│   └── .env
│
└── frontend/               # React web app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── SideBar.jsx  # Conversation list & new conversation
    │   │   ├── ChatWindow.jsx # Main chat interface
    │   │   ├── MessageBubble.jsx # Individual messages
    │   │   └── RightPanel.jsx # Controls & analysis
    │   ├── contexts/
    │   │   └── ConversationContext.js # State management
    │   ├── utils/
    │   │   ├── api.js        # API client
    │   │   └── localStorage.js # Browser storage helper
    │   ├── styles/           # CSS files
    │   ├── App.jsx          # Root component
    │   └── index.js         # Entry point
    └── package.json
```

## Installation & Setup

### Prerequisites

1. **Node.js** (v16+) - [Download](https://nodejs.org/)
2. **Ollama** - [Download](https://ollama.ai/)
3. A local LLM installed via Ollama (e.g., `ollama pull llama2`)

### Step 1: Verify Ollama is Running

```bash
# Start Ollama (or ensure it's running in the background)
ollama serve

# In another terminal, verify it's working
curl http://localhost:11434/api/tags
```

### Step 2: Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

You should see: `ChatFree backend running on http://localhost:3001`

### Step 3: Set Up Frontend (in a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The app will open at `http://localhost:3000`

## Usage Guide

### Creating a Conversation

1. Click **"New Conversation"** in the left sidebar
2. A new conversation is created with default settings

### Sending Messages

1. Type your message in the input field at the bottom
2. Press **Enter** or click the send button
3. The AI response streams in real-time
4. Analysis runs automatically on the response

### Configuring Intent & Tone

Use the **"Intent & Tone"** section in the right panel:

- **Role**: Select the agent's persona
- **Tone**: Choose communication style
- **Audience**: Specify your audience

Changes apply immediately to new responses.

### Analyzing Responses

The **"Analysis"** section shows:

- **Risk Score** (0-10): Overall framing risk
- **Issues Found**: Specific patterns detected with explanations
- **Suggestions**: Alternatives to reduce bias

Color-coded indicators:
- 🔴 **Red/High**: Strong manipulation risk
- 🟡 **Yellow/Medium**: Potential bias present
- 🟢 **Green/Low**: Minimal framing issues

### Formatting Messages

Hover over any AI message to reveal formatting options:

- **Copy**: Copy to clipboard
- **Shorter**: Generate a shorter version
- **Formal**: Make it more professional
- **Simplify**: Reduce complexity for general audience

### Managing Conversations

- **Switch**: Click any conversation in the sidebar
- **Delete**: Hover over a conversation and click the trash icon
- **Reset**: Click "Reset" in the chat header to start fresh
- **Export**: Use browser localStorage tools to backup conversations

## API Endpoints

### Conversations

- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation details
- `PUT /api/conversations/:id` - Update conversation (title, controls)
- `DELETE /api/conversations/:id` - Delete conversation
- `POST /api/conversations/:id/messages` - Send message & get response
- `POST /api/conversations/:id/analyze` - Analyze latest response

### Analysis

- `POST /api/analyze/text` - Analyze standalone text
- `POST /api/analyze/compare` - Compare original vs modified text

## Configuration

### Backend (.env)

```env
NODE_ENV=development
PORT=3001
OLLAMA_API_URL=http://localhost:11434
```

### Frontend Environment

Create `.env` in frontend folder:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Bias Detection Patterns

ChatFree detects multiple manipulation techniques:

### 1. **Identity Inflation**
- Conflates behavior with permanent identity
- Example: "You are a bad person" vs "You made a mistake"

### 2. **Definition Shifts**
- Redefines terms to fit an argument
- Example: "By 'success,' I mean..."

### 3. **False Consensus**
- Appeals to non-existent agreement
- Example: "Everyone knows that..."

### 4. **Tone Aggression**
- Dismisses without argument
- Example: "That's obviously wrong"

### 5. **Domination Phrases**
- Uses controlling language
- Example: "You must..." vs "Consider..."

### 6. **Confusion of Condition vs Identity**
- Treats temporary states as permanent traits
- Example: "You are confused" vs "You seem unsure"

## Performance Tips

1. **Token Management**: Backend automatically trims old messages when approaching token limits
2. **Model Selection**: Use smaller models (phi3, gemma2) for faster responses
3. **Temperature Tuning**: Lower values (0.3-0.5) for technical tasks, higher (0.7-0.9) for creative
4. **Local Storage**: Conversations persist in browser automatically

## Troubleshooting

### Backend won't start
```
Error: EADDRINUSE: address already in use :::3001
```
- Change PORT in .env or kill process using port 3001

### Ollama connection failed
```
Error: Failed to generate response: connect ECONNREFUSED 127.0.0.1:11434
```
- Ensure Ollama is running: `ollama serve` in a terminal
- Check OLLAMA_API_URL in .env matches your setup

### React won't load
- Clear browser cache: Ctrl+Shift+Delete
- Check backend is running on port 3001
- Look for errors in browser console (F12)

### No models available
```
curl http://localhost:11434/api/tags
```
- Install a model: `ollama pull llama2`

## Building for Production

### Backend
```bash
cd backend
npm install
# Deploy to your server, set NODE_ENV=production
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your hosting
```

## Future Enhancements

- [ ] Database backend (MongoDB/PostgreSQL) for cloud sync
- [ ] More sophisticated summarization for long conversations
- [ ] RAG (Retrieval-Augmented Generation) for document integration
- [ ] Conversation search and filtering
- [ ] Custom persona creation
- [ ] Multi-language support
- [ ] WebSocket support for real-time streaming
- [ ] User authentication and team features
- [ ] Advanced prompt templates

## Design Philosophy

ChatFree is built on the principle that **the human remains in control**:

1. **Transparency**: All analysis and suggestions are visible and reviewable
2. **Non-Prescriptive**: The AI suggests, the human decides
3. **Bias-Aware**: Actively detects and flags manipulation patterns
4. **Privacy-First**: All conversations stored locally by default
5. **Open Architecture**: Built on standard web technologies

Per OpenAI's guidance on high-quality chatbot apps, ChatFree emphasizes:
- Clear UI/UX showing context and analysis
- Human review before any action
- Structured intent controls
- Transparent bias detection
- Conversation memory and continuity

## License

MIT

## Support

For issues, questions, or suggestions:
1. Check the Troubleshooting section above
2. Review backend logs in the terminal
3. Check browser console (F12) for frontend errors
4. Verify Ollama is properly installed and running

## References

- [OpenAI: What Makes a Great ChatGPT App](https://developers.openai.com/blog/what-makes-a-great-chatgpt-app/)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Building AI Chatbots with Ollama](https://xsoneconsultants.com/blog/how-to-build-ai-chatbot/)

---

**Built with ❤️ for unbiased, human-centered AI conversations**.
