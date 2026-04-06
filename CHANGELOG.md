# Changelog - ChatFree v1.0.0

## Initial Release - [April 2026]

### Core Features
- **Conversation Memory System**
  - Full turn-by-turn history with timestamps
  - localStorage persistence for browser-only mode
  - Conversation listing with timestamps and personas
  - Create, switch, and delete conversations
  - Reset conversations to start fresh

- **Intent & Tone Controls**
  - Role selection (unbiased-assistant, legal, empathetic, technical, casual)
  - Tone configuration (neutral, assertive, empathetic, authoritative, friendly)
  - Audience targeting (general, expert, layperson, academic, professional)
  - Real-time control updates without conversation loss

- **Bias & Framing Detection**
  - Pattern-based heuristic detection (50+ patterns)
  - Identity inflation detection
  - Definition shift recognition
  - False consensus pattern detection
  - Tone aggression flagging
  - Domination phrase identification
  - 0-10 risk scoring algorithm
  - Detailed improvement suggestions

- **Model Configuration**
  - Model selection (llama2, llama3, phi3, gemma2, mistral)
  - Temperature slider (0-1.0 scale)
  - Top_p sampling control
  - Real-time model switching
  - Available models enumeration from Ollama

- **Message Tools**
  - Copy-to-clipboard for all messages
  - Message expansion/collapse for long content
  - Formatting suggestions (shorter, formal, simplify)
  - Message timestamps and role indicators
  - User vs AI message distinction

- **Modern UI/UX**
  - Three-region responsive layout (sidebar | chat | controls)
  - Real-time message streaming
  - Loading indicators with animations
  - Error handling and display
  - Collapsible control panels
  - Mobile-responsive design
  - Dark theme optimized for readability

### Backend API
- **Conversation Endpoints**
  - `GET /api/conversations` - List all conversations
  - `POST /api/conversations` - Create new conversation
  - `GET /api/conversations/:id` - Get conversation details
  - `PUT /api/conversations/:id` - Update title/controls
  - `DELETE /api/conversations/:id` - Delete conversation
  - `POST /api/conversations/:id/messages` - Send message
  - `POST /api/conversations/:id/analyze` - Analyze response

- **Analysis Endpoints**
  - `POST /api/analyze/text` - Analyze standalone text
  - `POST /api/analyze/compare` - Compare original vs modified

- **Health Check**
  - `GET /api/health` - Server status

### Technical Stack
- **Backend**: Node.js 16+, Express.js 4.18+
- **Frontend**: React 18+, React Hooks, Context API
- **Styling**: CSS3 with design tokens
- **API Communication**: Axios with JSON
- **Local Storage**: Browser localStorage with JSON serialization
- **LLM Integration**: Ollama REST API (v0.1.x+)

### Documentation
- Comprehensive README.md with setup, usage, and troubleshooting
- Development guide with architecture details and API contracts
- Quick-start scripts for Windows (batch) and Unix (shell)
- .gitignore for Node.js/React projects
- Inline code comments for complex logic

### Known Limitations (v1.0)
- In-memory conversation storage (no database)
- Single-user session (no authentication)
- Message editing/regeneration not yet implemented
- No document upload or RAG yet
- No voice input/output
- Desktop-first responsive design

### Future Roadmap
- Database backend (MongoDB/PostgreSQL) for persistence
- WebSocket support for real-time updates
- Conversation search and filtering
- Custom persona creation
- Message editing and regeneration
- RAG with document upload
- User authentication and team features
- Voice input/output integration
- API-based access control

### Breaking Changes
N/A - Initial release

### Migration Guide
N/A - First version

### Contributors
Initial development: ChatFree Team

---

## How to Use This Release

### Quick Start
```bash
# Windows
quick-start.bat

# macOS/Linux
bash quick-start.sh
```

### Manual Setup
```bash
# Backend
cd backend && npm install && npm start

# Frontend (new terminal)
cd frontend && npm install && npm start
```

### First Run Checklist
- [ ] Ollama installed and running
- [ ] Backend starts on port 3001
- [ ] Frontend starts on port 3000
- [ ] Can create new conversation
- [ ] Can send messages
- [ ] Can see analysis panel
- [ ] Can toggle controls
- [ ] Conversations persist after reload

## Feedback & Issues
Please report issues or feature requests via the development guide or README.

---

**Version**: 1.0.0  
**Release Date**: April 2026  
**License**: MIT  
**Repository**: [ChatFree](https://github.com/chatfree/chatfree-local)
