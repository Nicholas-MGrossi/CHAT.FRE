# Changelog

All notable changes to ChatFree will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-15

### Production Release 🚀

Complete transformation from v1.0.0 to enterprise-ready application with database, authentication, and containerization.

### Added

#### Authentication & Security
- JWT authentication system (7-day expiry)
- User registration, login, logout endpoints
- User profile management
- Password hashing with bcryptjs (10-round salt)
- Role-based access control (user/admin)
- Rate limiting (100 req/15min general, 5 req/15min auth)
- Security headers (Helmet)
- CORS whitelist, NoSQL injection prevention (mongo-sanitize)
- Request compression (gzip)

#### Database & Persistence
- MongoDB integration with Mongoose ODM
- User model with authentication methods and preferences
- Conversation model with ownership verification
- Message array storage with timestamps
- Metadata tracking (token count, analysis count)
- Database connection handler with error handling
- Proper indexing for query performance

#### Request Validation & Error Handling
- Joi schema validation for all endpoints (8+ schemas)
- Centralized error handling with AppError class
- Specific error processing (MongoDB, JWT, validation)
- asyncHandler wrapper for Promise rejection handling
- Proper HTTP status codes

#### Logging & Monitoring
- Winston logger with file rotation (5MB, 5-file limit)
- Separate error and combined logs
- Console logging in development
- Request audit logging
- Error tracking with full context

#### Containerization
- Docker images for backend and frontend
- docker-compose orchestration (5 services)
- Health checks on all containers
- Service networking and data persistence
- Alpine Linux base images

#### Kubernetes Support
- Complete Kubernetes manifests (k8s/ directory)
- StatefulSet for MongoDB
- Deployments with auto-scaling
- ConfigMaps and Secrets management
- PersistentVolumeClaims for data
- Ingress configuration
- Health checks and readiness probes

#### Documentation
- Updated README.md (production-ready)
- API documentation (API.md) with 30+ examples
- Configuration reference (CONFIG.md)
- Production deployment guide (PRODUCTION.md)
- Development guide (DEVELOPMENT.md)
- Roadmap with feature tracking (ROADMAP.md)
- Architecture documentation
- Comprehensive troubleshooting

### Changed

#### Backend
- Migrated from localStorage Map to MongoDB persistent storage
- Conversation endpoints now use Mongoose queries
- Authentication middleware on all protected routes
- Ownership verification for user isolation
- Refactored server.js with proper middleware composition
- Enhanced error responses with consistent format

#### Frontend
- API client updated to include JWT token in requests
- ConversationContext prepared for auth state management
- Documentation with auth context examples

#### Project Structure
- Added config/, models/, middleware/ directories
- Added docker/ and k8s/ directories
- Reorganized routes with auth middleware
- Added comprehensive documentation files

### Security Improvements
- Passwords hashed before storage
- JWT tokens with signature verification
- Rate limiting for brute force protection
- CORS whitelisting
- NoSQL injection prevention
- Security headers for common vulnerabilities
- Sensitive data excluded from logs
- No password sent to frontend
- Database credentials in environment variables

### Performance
- Database indexes on frequent queries
- Connection pooling with MongoDB
- Response compression with gzip
- Efficient message storage
- Proper HTTP caching headers

### Infrastructure
- Docker for consistent environments
- Docker Compose for local development
- Kubernetes ready for cloud deployment
- Health checks for reliability
- Service dependencies properly configured

## [1.0.0] - 2024-01-10

### Initial Release

Complete chatbot application with local LLM integration, bias detection, and conversation memory.

### Features

#### Core Capabilities
- **Conversation Memory System**
  - Full turn-by-turn history with timestamps
  - localStorage persistence for browser-only mode
  - Conversation listing, create, switch, delete
  - Conversation reset functionality

- **Intent & Tone Controls**
  - Role selection (unbiased-assistant, legal, empathetic, technical, casual)
  - Tone configuration (neutral, assertive, empathetic, authoritative, friendly)
  - Audience targeting (general, expert, layperson, academic, professional)
  - Real-time control updates

- **Bias & Framing Detection**
  - Pattern-based detection (50+ patterns)
  - Identity inflation, definition shift, false consensus detection
  - Tone aggression flagging, domination phrase identification
  - Risk scoring (0-10 scale)
  - Detailed improvement suggestions

- **Model Configuration**
  - Model selection (llama2, llama3, phi3, gemma2, mistral)
  - Temperature and top_p control
  - Real-time model switching
  - Available models enumeration from Ollama

- **Message Tools**
  - Copy-to-clipboard
  - Message expansion/collapse
  - Formatting suggestions (shorter, formal, simplify)
  - Timestamps and role indicators

- **Modern UI/UX**
  - Three-region responsive layout
  - Real-time message streaming
  - Loading indicators
  - Error handling
  - Collapsible control panels
  - Mobile-responsive design
  - Dark theme

### Architecture
- **Frontend**: React 18 with Hooks and Context API
- **Backend**: Node.js/Express
- **LLM**: Ollama (local)
- **Storage**: localStorage (browser)
- **Styling**: CSS3 with CSS variables

---

## Unreleased

### Planned for v2.1.0
- Frontend authentication UI (login/register pages)
- Token persistence in localStorage
- Protected routes
- User profile page
- Password reset flow

### Planned for v2.2.0
- Docker image testing
- CI/CD pipeline (GitHub Actions)
- Kubernetes deployment testing
- Performance optimization

### Planned for v2.3.0
- Two-factor authentication
- API key management
- Field-level database encryption
- Audit logging

### Planned for v2.4.0
- Redis caching
- GraphQL endpoint
- Load testing
- Performance reports

### Planned for v2.5.0
- Conversation export (JSON, Markdown, PDF)
- Conversation search
- Custom personas
- RAG integration
- Team collaboration

---

## Migration Guide

### From v1.0.0 to v2.0.0

If upgrading from v1.0.0:

1. **Conversations**: Stored locally will be lost; export before upgrade
2. **Configuration**: New MongoDB, JWT_SECRET required
3. **API Changes**: All endpoints now require authentication
4. **Breaking Changes**: User ownership verification enforced

---

**For the latest changes, see [GitHub Releases](https://github.com/your-repo/releases)**

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
