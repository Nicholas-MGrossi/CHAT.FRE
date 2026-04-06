# ChatFree - Unbiased AI Chat with Local LLM
**[Production-Ready] v2.0.0**

A modern, ChatGPT-grade conversational interface for local LLMs (Ollama) with integrated bias detection, framing analysis, and conversation memory. Built with React + Node.js/Express, secured with JWT authentication, and backed by MongoDB for persistent storage.

**Status**: ✅ App Store Ready | ✅ Enterprise Secure | ✅ Cloud Deployable

## Features

### Core Capabilities

- **💬 Conversation Memory & History**
  - Full turn-by-turn history with persistent MongoDB storage
  - Multi-device sync and cross-session continuity
  - Conversation titles, timestamps, and archival
  - User-owned conversations with privacy controls
  - Easy conversation switching and management

- **🎯 Intent & Tone Controls**
  - Configure agent role (unbiased assistant, legal, empathetic, technical, casual)
  - Set tone (neutral, assertive, empathetic, authoritative, friendly)
  - Target audience selection (general, expert, layperson, academic, professional)
  - Real-time control updates applied to responses
  - Saved preferences per user account

- **⚠️ Bias & Framing Analysis**
  - Automatic detection of loaded language patterns
  - Gaslighting pattern recognition (identity inflation, definition shifts, tone aggression)
  - Domination/control phrase detection
  - Risk scoring and detailed suggestions
  - Side-panel analysis with visual indicators
  - Analysis history tracking

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
  - Per-conversation model overrides

- **🔐 Enterprise Security**
  - JWT authentication with 7-day token expiry
  - bcryptjs password hashing (10-round salt)
  - Rate limiting (100 req/15min general, 5 req/15min auth)
  - MongoDB with field-level encryption ready
  - Role-based access control (user/admin)
  - CORS whitelisting and security headers (Helmet)

- **📊 Production Monitoring**
  - Winston logging with file rotation (5MB, 5-file limit)
  - Separate error and combined log tracking
  - Request audit logging for compliance
  - Health check endpoints for load balancers
  - Structured error responses

- **🖥️ Modern Chat UI**
  - Three-region layout (sidebar, chat, controls)
  - Real-time message streaming
  - Responsive design for mobile and desktop
  - Dark theme optimized for readability
  - User authentication UI (login/register)

## Architecture

### System Design

```
ChatFree - Production Architecture
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                    │
│  ├─ Login/Register Pages                               │
│  ├─ Conversation UI with Auth                          │
│  ├─ Intent & Tone Controls                             │
│  └─ JWT Token Management (localStorage)                │
└──────────────┬──────────────────────────────────────────┘
               │ HTTPS / JWT Bearer Tokens
┌──────────────▼──────────────────────────────────────────┐
│                  API Gateway / Load Balancer            │
│  ├─ Rate Limiting (Helmet, express-rate-limit)         │
│  ├─ CORS Whitelist                                     │
│  └─ Request Logging (Winston)                          │
└──────────────┬──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────┐
│              Backend (Node.js/Express)                  │
│  ├─ Auth Middleware (JWT verification)                 │
│  ├─ Request Validation (Joi schemas)                   │
│  ├─ Error Handling (AppError class)                    │
│  ├─ Routes:                                            │
│  │  ├─ /api/auth (register, login, logout)             │
│  │  ├─ /api/conversations (CRUD operations)            │
│  │  ├─ /api/conversations/:id/messages (chat)          │
│  │  └─ /api/conversations/:id/analyze (bias)           │
│  └─ Ollama Integration (local LLM)                     │
└──────────────┬──────────────────────────────────────────┘
               │ Mongoose ODM
┌──────────────┼──────────────┬───────────────────────────┐
│              │              │                           │
│         ┌────▼────┐    ┌────▼────┐            ┌────────▼───────┐
│         │ MongoDB │    │  Ollama  │            │  Logs (Winston) │
│         │Database │    │   LLM    │            │                │
│         │         │    │ Models   │            │ ├─error.log    │
│         │ Users   │    │          │            │ ├─combined.log │
│         │ Conv.   │    │ llama2   │            │ └─rotated      │
│         │ History │    │ mistral  │            │    files       │
│         └─────────┘    └──────────┘            └────────────────┘
│
└─────────────────────────────────────────────────────────
```

### File Structure

```
ChatFree/
│
├── backend/                    # Node.js/Express server (Production)
│   ├── server.js              # Main entry point with middleware
│   ├── package.json           # Dependencies (13 production packages)
│   ├── .env                   # Configuration (MongoDB, JWT, Ollama)
│   ├── Dockerfile             # Container image (Alpine Node.js)
│   │
│   ├── config/
│   │   ├── database.js        # MongoDB connection handler
│   │   └── logger.js          # Winston logging setup
│   │
│   ├── models/
│   │   ├── User.js            # User schema (auth, hashing)
│   │   └── Conversation.js    # Conversation & messages schema
│   │
│   ├── routes/
│   │   ├── auth.js            # Register, login, logout, profile
│   │   └── conversations.js   # CRUD + chat + analysis endpoints
│   │
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & token generation
│   │   ├── validation.js      # Joi request validation
│   │   └── errorHandler.js    # Centralized error processing
│   │
│   ├── utils/
│   │   ├── ollamaClient.js    # Ollama API wrapper
│   │   ├── conversationManager.js # History & compression logic
│   │   └── biasAnalyzer.js    # 50+ bias detection patterns
│   │
│   └── logs/                  # Rotating log directory
│       ├── error.log
│       ├── combined.log
│       └── [rotated logs]
│
├── frontend/                  # React web app (Production)
│   ├── package.json          # Dependencies (+axios, jwt-decode)
│   ├── .env                  # REACT_APP_API_URL config
│   ├── Dockerfile            # Multi-stage build (serve)
│   │
│   ├── public/
│   │   └── index.html
│   │
│   └── src/
│       ├── components/
│       │   ├── SideBar.jsx          # Conversation list
│       │   ├── ChatWindow.jsx       # Main chat interface
│       │   ├── MessageBubble.jsx    # Messages with analysis
│       │   ├── RightPanel.jsx       # Controls & analysis
│       │   ├── Login.jsx            # [NEW] Auth form
│       │   └── Register.jsx         # [NEW] Registration form
│       │
│       ├── contexts/
│       │   └── ConversationContext.js # State + auth token
│       │
│       ├── utils/
│       │   ├── api.js              # Axios client (w/ JWT header)
│       │   ├── auth.js             # [NEW] Token management
│       │   └── localStorage.js     # Browser storage helper
│       │
│       ├── App.jsx                 # [UPDATED] Protected routes
│       └── index.js
│
├── docker-compose.yml         # 5-service orchestration
│   └─ MongoDB, Backend, Frontend, Ollama, volumes
│
├── k8s/                       # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── storage.yaml
│   ├── mongodb.yaml
│   ├── backend.yaml
│   └── frontend.yaml
│
├── README.md                  # This file (updated)
├── DEVELOPMENT.md             # Developer setup guide
├── CONFIG.md                  # Configuration reference
├── PRODUCTION.md              # Deployment guide (new)
├── CHANGELOG.md               # Version history
└── .gitignore
```

## Quick Start

### Option 1: Docker (Recommended for Production)

```bash
# Clone repository
git clone <your-repo>
cd CHATFREE

# Create .env with MongoDB password
echo "MONGO_PASSWORD=your-secure-password" > .env

# Start all services
docker-compose up -d

# Pull an Ollama model
docker exec chatfree-ollama ollama pull llama2

# Access the app
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

### Option 2: Local Development

#### Prerequisites

1. **Node.js** (v18+) - [Download](https://nodejs.org/)
2. **Ollama** - [Download](https://ollama.ai/)
3. **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
4. A local LLM installed via Ollama (e.g., `ollama pull llama2`)

#### Step 1: Verify Ollama is Running

```bash
# Start Ollama
ollama serve

# In another terminal, verify
curl http://localhost:11434/api/tags
```

#### Step 2: Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with MongoDB URI and JWT_SECRET

# Start the server
npm start
```

Expected output: `ChatFree backend running on http://localhost:3001`

#### Step 3: Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env

# Start the React dev server
npm start
```

The app will open at `http://localhost:3000`

#### Step 4: Register & Login

1. Go to Register page
2. Create an account (email, password)
3. Login with credentials
4. Start chatting!

## Installation & Setup

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

## API Reference

### Authentication Endpoints
- `POST /api/auth/register` - Create user account (email, password, username)
- `POST /api/auth/login` - Get JWT token (email, password)
- `POST /api/auth/logout` - Invalidate session
- `GET /api/auth/me` - Get current user profile (requires JWT)
- `PUT /api/auth/update-profile` - Update username/preferences (requires JWT)

### Conversation Endpoints
- `GET /api/conversations` - List all user conversations (requires JWT)
- `POST /api/conversations` - Create new conversation (requires JWT)
- `GET /api/conversations/:id` - Get conversation details (requires JWT + ownership)
- `PUT /api/conversations/:id` - Update conversation settings (requires JWT + ownership)
- `DELETE /api/conversations/:id` - Delete conversation (requires JWT + ownership)
- `POST /api/conversations/:id/messages` - Send message & get response (requires JWT + ownership)
- `POST /api/conversations/:id/analyze` - Analyze latest response (requires JWT + ownership)

### Analysis Endpoints
- `POST /api/analyze/text` - Analyze standalone text (optional JWT)
- `POST /api/analyze/compare` - Compare original vs modified text (optional JWT)

### Health Check
- `GET /api/health` - Service health status (used by load balancers)

## Configuration

### Backend Environment Variables (.env)

```env
# Server
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/chatfree?authSource=admin
MONGO_PASSWORD=your-secure-password

# Authentication
JWT_SECRET=your-jwt-secret-key-min-32-chars
JWT_EXPIRE=7d

# Ollama
OLLAMA_API_URL=http://localhost:11434

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

See `.env.example` in the backend directory for all available options and production guidance.

### Frontend Environment Variables (.env)

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Docker Compose Variables

Edit `docker-compose.yml` for:
- **MONGO_PASSWORD**: Master password for MongoDB admin user
- **OLLAMA models**: Pre-load models by modifying the Ollama service
- **PORT mappings**: Map different ports if 3000/3001 are in use
- **Volume mounts**: Persist logs and models

## Production Deployment

See [PRODUCTION.md](PRODUCTION.md) for detailed deployment guides:

- **Docker** (recommended) - `docker-compose up`
- **Heroku** - One-click deployment with managed MongoDB
- **AWS EC2 + RDS** - Full infrastructure setup
- **Kubernetes** - Scalable cloud-native deployment (k8s/ manifests included)
- **Vercel** (frontend) - Automatic GitHub deployments
- **DigitalOcean App Platform** - Simple app deployment

### Security Checklist

- [ ] Change JWT_SECRET to a random 32+ character string
- [ ] Update ALLOWED_ORIGINS for your domain
- [ ] Enable HTTPS with certificate (Let's Encrypt)
- [ ] Set NODE_ENV=production before deployment
- [ ] Configure MongoDB authentication in production
- [ ] Set up automated database backups
- [ ] Enable rate limiting on API gateway
- [ ] Monitor logs for suspicious activity
- [ ] Use environment-specific .env files
- [ ] Store credentials in secure vault (AWS Secrets Manager, HashiCorp Vault)

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

### Authentication Issues

**"Invalid credentials" on login**
- Verify user exists: `mongosh` → `db.users.findOne({email: "user@example.com"})`
- Reset password by creating new account or deleting user doc
- Check JWT_SECRET is consistent across instances

**"Token expired" errors**
- Frontend should handle token refresh (implement refresh token endpoint)
- Clear localStorage: DevTools → Application → Storage → Clear All

**Forgot password**
- Currently: Delete user and re-register (add password reset flow in PRODUCTION.md)
- Future: Implement email-based password reset

### Database Connection Issues

**"MongoError: connect ECONNREFUSED 127.0.0.1:27017"**
- Start MongoDB: `mongod` or `docker-compose up mongodb`
- Verify MONGODB_URI in .env matches actual connection
- Check MongoDB is listening: `mongosh`

**"MongoError: authentication failed"**
- Verify username/password in MONGODB_URI
- Ensure authSource=admin is set in connection string
- Check MongoDB admin user exists: `db.system.users.find()`

### Backend Issues

**"Port 3001 already in use"**
```bash
# Kill process using port 3001
# Linux/Mac: lsof -ti:3001 | xargs kill -9
# Windows: netstat -ano | findstr :3001
#         taskkill /PID <PID> /F
# Or change PORT in .env
```

**"Ollama connection failed"**
```bash
# Start Ollama
ollama serve

# Verify endpoint
curl http://localhost:11434/api/tags

# Check OLLAMA_API_URL in .env
```

**"Out of memory" errors**
```bash
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

### Frontend Issues

**"Failed to fetch" or 404 API errors**
- Verify REACT_APP_API_URL in .env matches backend URL
- Check backend is running: `curl http://localhost:3001/api/health`
- Clear browser cache: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)

**"Blank page or won't load"**
- Check browser console (F12) for errors
- Verify Node modules are installed: `npm install`
- Clear node_modules: `rm -rf node_modules && npm install`

**"localStorage errors"**
- Browser may have storage disabled
- Check DevTools → Application → Storage
- Private/Incognito mode doesn't persist storage

### Docker Issues

**"Cannot connect to Docker daemon"**
- Start Docker Desktop or Docker service
- Linux: `sudo systemctl start docker`

**"docker-compose: command not found"**
- Install Docker Desktop (includes compose)
- Or: `pip install docker-compose`

**"Containers not communicating"**
- Check docker-compose network: `docker network ls`
- Use service names (not localhost) in Docker: `mongodb:27017`

### Rate Limiting Issues

**"429 Too Many Requests"**
- Default: 100 req/15min on general routes, 5 req/15min on auth
- Wait 15 minutes or restart the server
- Adjust limits in server.js middleware for development

### Logging & Debugging

**View real-time logs**
```bash
# Docker
docker logs -f chatfree-backend

# Local
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# PM2
pm2 logs chatfree-api
```

**Enable debug logging**
```env
LOG_LEVEL=debug
```

**MongoDB query logging**
```bash
mongosh
> db.setProfilingLevel(1)
> db.system.profile.find().limit(5).sort({ts:-1}).pretty()


## Building for Production

### Using Docker (Recommended)

```bash
# Build and start all services
docker-compose up -d --build

# Check service health
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Scale backend replicas
docker-compose up -d --scale backend=3

# Stop all services
docker-compose down
```

### Manual Build

#### Backend
```bash
cd backend
npm install
npm run build  # if applicable
NODE_ENV=production npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run build
# Deploy the 'build' folder to your hosting provider
# or use: npx serve -s build -l 3000
```

### Database Initialization

For production, ensure MongoDB is running with authentication:

```bash
# Connect to MongoDB
mongosh "mongodb://admin:PASSWORD@localhost:27017/chatfree?authSource=admin"

# Collections are created automatically via Mongoose schemas
# Indexes are created on first write
```

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 2GB | 4GB+ |
| Storage | 2GB | 10GB+ |
| Node.js | 16.x | 18.x LTS |
| MongoDB | 5.0 | 6.0+ |
| Ollama | 0.1+ | Latest |

## Future Enhancements

- [ ] Machine learning bias detection (advanced NLP models)
- [ ] Conversation search and filtering
- [ ] PDF/document upload for context
- [ ] Custom persona creation and sharing
- [ ] Team collaboration features
- [ ] Multi-language support
- [ ] WebSocket support for real-time multiplayer
- [ ] Advanced prompt templates library
- [ ] Conversation export (PDF, Markdown, JSON)
- [ ] Multi-language support
- [ ] WebSocket support for real-time streaming
- [ ] User authentication and team features
- [ ] Advanced prompt templates

## Design Philosophy

ChatFree is built on the principle that **the human remains in control**:

1. **Transparency**: All analysis and suggestions are visible and reviewable
2. **Non-Prescriptive**: The AI suggests, the human decides
3. **Bias-Aware**: Actively detects and flags manipulation patterns
4. **Privacy-First**: User data encrypted and owned by the user
5. **Open Architecture**: Built on standard, open-source technologies
6. **Enterprise Ready**: Secure, auditable, and scalable to production

### Security-By-Design Principles

- **Defense in Depth**: Rate limiting → CORS → JWT → Joi validation → Error handling
- **Least Privilege**: Users can only access their own conversations
- **Data Minimization**: Only store necessary fields, auto-delete on schedule
- **Audit Trail**: All operations logged with timestamps and user context
- **Encryption Ready**: MongoDB field-level encryption ready (implement as needed)

Per OpenAI's guidance on high-quality chatbot apps, ChatFree emphasizes:
- Clear UI/UX showing context and analysis
- Human review before any action
- Structured intent controls
- Transparent bias detection
- Secure conversation memory and continuity
- Role-based access control

## Version History

- **v2.0.0** - Production release with JWT auth, MongoDB, Docker, Kubernetes
  - Added authentication system (register, login, JWT tokens)
  - Migrated from in-memory to MongoDB persistent storage
  - Added request validation (Joi) and centralized error handling
  - Added Winston logging with file rotation
  - Added Docker containerization and docker-compose orchestration
  - Added Kubernetes deployment manifests
  - Added production deployment guide
  - Security: Rate limiting, helmet headers, mongo-sanitize, CORS

- **v1.0.0** - Initial release
  - Conversation history and management
  - Bias detection and framing analysis
  - Intent and tone controls
  - Formatting and editing tools
  - Built-in Ollama integration

See [CHANGELOG.md](CHANGELOG.md) for detailed version notes.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Axios, JWT-decode, localStorage |
| **Backend** | Node.js 18, Express.js, Mongoose ODM |
| **Database** | MongoDB 6.0 with authentication |
| **Authentication** | JWT (jsonwebtoken), bcryptjs (password hashing) |
| **Validation** | Joi (schema validation) |
| **Logging** | Winston (with file rotation) |
| **Security** | Helmet, express-rate-limit, mongo-sanitize, CORS |
| **LLM Integration** | Ollama (local) |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (optional) |
| **Deployment** | Heroku, AWS, DigitalOcean, Vercel |

## Documentation

- [README.md](README.md) - Overview and quick start (this file)
- [DEVELOPMENT.md](DEVELOPMENT.md) - Developer setup and contribution guidelines
- [CONFIG.md](CONFIG.md) - Configuration reference with all options
- [PRODUCTION.md](PRODUCTION.md) - Production deployment guides for all platforms
- [CHANGELOG.md](CHANGELOG.md) - Version history and release notes

## Community & Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: See docs/ folder for detailed guides

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -am 'Add my feature'`)
4. Push to branch (`git push origin feature/my-feature`)
5. Create Pull Request

Please ensure:
- Tests pass (`npm test`)
- Code is formatted (`npm run lint`)
- Documentation is updated
- Commit messages are descriptive

## Acknowledgments

Built with:
- [OpenAI's ChatGPT app guidelines](https://openai.com)
- [Ollama for local LLM inference](https://ollama.ai)
- [React for modern UI patterns](https://react.dev)
- [Express.js for API conventions](https://expressjs.com)
- Open-source community contributions

## Support & Questions

For issues, questions, or suggestions:

1. **Check Documentation**: Review README, CONFIG.md, or PRODUCTION.md
2. **Review Logs**: Check `backend/logs/error.log` or `docker-compose logs`
3. **Check Console**: Browser DevTools (F12) for frontend errors
4. **Verify Services**: Ensure Ollama, MongoDB, backend are running
5. **Create Issue**: [Open a GitHub issue](https://github.com/your-repo/issues/new) with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Error logs/screenshots
   - Environment details

---

**Built with ❤️ for unbiased, human-centered, enterprise-grade AI conversations**

*Production-ready. Privacy-respecting. Privacy-first. Open-source.*
