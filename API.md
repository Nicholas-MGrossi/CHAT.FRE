# ChatFree API Documentation

Complete API reference with examples for all endpoints.

## Base URL

```
http://localhost:3001/api
```

For production, replace with your domain:
```
https://api.yourdomain.com/api
```

## Authentication

All endpoints marked with 🔐 require JWT token in the `Authorization` header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "john_doe",
    "role": "user"
  }
}
```

Store the token and include it in all subsequent requests.

---

## Endpoints

### 🔓 Authentication Endpoints

#### Register User

**POST** `/auth/register`

Create a new user account.

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "SecurePassword123"
  }'
```

**Required Fields:**
- `email` (string): Valid email address, must be unique
- `username` (string): 3-20 characters, alphanumeric, must be unique
- `password` (string): Minimum 8 characters

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "newuser@example.com",
    "username": "newuser",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400`: Validation failed (missing fields, invalid format, password too short)
- `409`: Email or username already exists

---

#### Login User

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

**Required Fields:**
- `email` (string): User email
- `password` (string): User password

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2NzA4NDMwMDAsImV4cCI6MTY3MTQ0ODAwMH0.xyz789...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "john_doe",
    "role": "user",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials (user not found or password incorrect)

---

#### Get Current User Profile 🔐

**GET** `/auth/me`

Get authenticated user information.

**Request:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "john_doe",
    "role": "user",
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "defaultModel": "llama2"
    },
    "createdAt": "2024-01-10T08:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `401`: Missing or invalid token

---

#### Update User Profile 🔐

**PUT** `/auth/update-profile`

Update username and preferences.

**Request:**
```bash
curl -X PUT http://localhost:3001/api/auth/update-profile \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe_updated",
    "preferences": {
      "theme": "light",
      "notifications": false,
      "defaultModel": "mistral"
    }
  }'
```

**Optional Fields:**
- `username` (string): New username (3-20 chars, alphanumeric)
- `preferences` (object):
  - `theme` (string): "light" or "dark"
  - `notifications` (boolean)
  - `defaultModel` (string): Default Ollama model

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "john_doe_updated",
    "preferences": {
      "theme": "light",
      "notifications": false,
      "defaultModel": "mistral"
    }
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Missing or invalid token
- `409`: Username already taken

---

#### Logout 🔐

**POST** `/auth/logout`

Invalidate user session (frontend should delete token).

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401`: Missing or invalid token

---

### 💬 Conversation Endpoints

#### List All Conversations 🔐

**GET** `/conversations`

Get all conversations for authenticated user.

**Request:**
```bash
curl -X GET http://localhost:3001/api/conversations \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Query Parameters:**
- `limit` (optional, default: 50): Max results
- `skip` (optional, default: 0): Pagination offset
- `sort` (optional): "createdAt" or "updatedAt" (default: updatedAt)

**Response (200 OK):**
```json
{
  "success": true,
  "conversations": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Understanding Bias",
      "userId": "507f1f77bcf86cd799439011",
      "messageCount": 5,
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "isArchived": false
    }
  ],
  "total": 1
}
```

**Error Responses:**
- `401`: Missing or invalid token

---

#### Create Conversation 🔐

**POST** `/conversations`

Create a new conversation.

**Request:**
```bash
curl -X POST http://localhost:3001/api/conversations \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Chat"
  }'
```

**Optional Fields:**
- `title` (string): Conversation title (default: "New Conversation")

**Response (201 Created):**
```json
{
  "success": true,
  "conversation": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "My First Chat",
    "userId": "507f1f77bcf86cd799439011",
    "messages": [],
    "controls": {
      "role": "unbiased_assistant",
      "tone": "neutral",
      "audience": "general",
      "model": "llama2",
      "temperature": 0.7,
      "top_p": 0.9
    },
    "metadata": {
      "tokenCount": 0,
      "analysisCount": 0
    },
    "isArchived": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `400`: Validation failed

---

#### Get Conversation Details 🔐

**GET** `/conversations/:id`

Get full conversation with all messages.

**Request:**
```bash
curl -X GET http://localhost:3001/api/conversations/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "conversation": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "My First Chat",
    "userId": "507f1f77bcf86cd799439011",
    "messages": [
      {
        "id": "msg_1",
        "role": "user",
        "content": "What is machine learning?",
        "timestamp": "2024-01-15T10:31:00Z"
      },
      {
        "id": "msg_2",
        "role": "assistant",
        "content": "Machine learning is a subset of artificial intelligence...",
        "timestamp": "2024-01-15T10:31:15Z"
      }
    ],
    "controls": {
      "role": "unbiased_assistant",
      "tone": "neutral",
      "audience": "general",
      "model": "llama2",
      "temperature": 0.7,
      "top_p": 0.9
    },
    "metadata": {
      "tokenCount": 456,
      "analysisCount": 1,
      "lastAnalyzedAt": "2024-01-15T10:31:20Z"
    }
  }
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `403`: Not authorized (you don't own this conversation)
- `404`: Conversation not found

---

#### Update Conversation 🔐

**PUT** `/conversations/:id`

Update conversation settings (title, controls, archive).

**Request:**
```bash
curl -X PUT http://localhost:3001/api/conversations/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Understanding AI",
    "controls": {
      "role": "technical_expert",
      "tone": "authoritative",
      "audience": "expert",
      "model": "mistral",
      "temperature": 0.5,
      "top_p": 0.8
    },
    "isArchived": false
  }'
```

**Optional Fields:**
- `title` (string): New conversation title
- `controls` (object): Updated controls
  - `role` (string): Agent role
  - `tone` (string): Communication tone
  - `audience` (string): Target audience
  - `model` (string): Ollama model
  - `temperature` (number): 0-2, default 0.7
  - `top_p` (number): 0-1, default 0.9
- `isArchived` (boolean): Archive the conversation

**Response (200 OK):**
```json
{
  "success": true,
  "conversation": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Understanding AI",
    "controls": {
      "role": "technical_expert",
      "tone": "authoritative",
      "audience": "expert",
      "model": "mistral",
      "temperature": 0.5,
      "top_p": 0.8
    },
    "updatedAt": "2024-01-15T10:32:00Z"
  }
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `403`: Not authorized
- `404`: Conversation not found
- `400`: Invalid controls

---

#### Delete Conversation 🔐

**DELETE** `/conversations/:id`

Delete a conversation (soft delete - archive instead).

**Request:**
```bash
curl -X DELETE http://localhost:3001/api/conversations/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `403`: Not authorized
- `404`: Conversation not found

---

#### Send Message 🔐

**POST** `/conversations/:id/messages`

Send a message and get AI response.

**Request:**
```bash
curl -X POST http://localhost:3001/api/conversations/507f1f77bcf86cd799439013/messages \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "Explain quantum computing in simple terms"
  }'
```

**Required Fields:**
- `userMessage` (string): User's message (1-5000 characters)

**Response (200 OK):**
```json
{
  "success": true,
  "userMessage": {
    "id": "msg_3",
    "role": "user",
    "content": "Explain quantum computing in simple terms",
    "timestamp": "2024-01-15T10:33:00Z"
  },
  "assistantMessage": {
    "id": "msg_4",
    "role": "assistant",
    "content": "Quantum computing is a new type of computing that uses quantum bits...",
    "timestamp": "2024-01-15T10:33:05Z"
  },
  "tokenCount": 234
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `403`: Not authorized
- `404`: Conversation not found
- `400`: Invalid message (empty, too long)
- `503`: Ollama service unavailable

---

#### Analyze Message 🔐

**POST** `/conversations/:id/analyze`

Analyze bias in the latest conversation message.

**Request:**
```bash
curl -X POST http://localhost:3001/api/conversations/507f1f77bcf86cd799439013/analyze \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "analysis": {
    "riskScore": 3,
    "level": "low",
    "issuesFound": [
      {
        "pattern": "false_consensus",
        "example": "Everyone knows that...",
        "suggestion": "Replace with specific evidence"
      }
    ],
    "timestamp": "2024-01-15T10:33:20Z"
  }
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `403`: Not authorized
- `404`: Conversation not found or no messages to analyze

---

### ⚠️ Analysis Endpoints

#### Analyze Text

**POST** `/analyze/text`

Analyze standalone text for bias patterns.

**Request:**
```bash
curl -X POST http://localhost:3001/api/analyze/text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Everyone knows that social media is bad for you."
  }'
```

**Required Fields:**
- `text` (string): Text to analyze (1-5000 characters)

**Response (200 OK):**
```json
{
  "success": true,
  "analysis": {
    "riskScore": 6,
    "level": "medium",
    "issuesFound": [
      {
        "pattern": "false_consensus",
        "example": "Everyone knows that...",
        "explanation": "Appeals to non-existent agreement",
        "suggestion": "Provide specific research or evidence"
      }
    ]
  }
}
```

**Error Responses:**
- `400`: Missing or invalid text

---

#### Compare Texts

**POST** `/analyze/compare`

Compare original and modified text to measure bias reduction.

**Request:**
```bash
curl -X POST http://localhost:3001/api/analyze/compare \
  -H "Content-Type: application/json" \
  -d '{
    "original": "You are a bad person for disagreeing.",
    "modified": "I disagree with your perspective on this issue."
  }'
```

**Required Fields:**
- `original` (string): Original text (1-5000 chars)
- `modified` (string): Modified text (1-5000 chars)

**Response (200 OK):**
```json
{
  "success": true,
  "comparison": {
    "originalAnalysis": {
      "riskScore": 8,
      "level": "high",
      "issues": 2
    },
    "modifiedAnalysis": {
      "riskScore": 2,
      "level": "low",
      "issues": 0
    },
    "improvement": {
      "riskReduced": 6,
      "percentChange": 75,
      "message": "Improvement from High to Low risk"
    }
  }
}
```

**Error Responses:**
- `400`: Missing or invalid text

---

### 🏥 Health Check

#### Service Health

**GET** `/health`

Check service health (no authentication required).

**Request:**
```bash
curl -X GET http://localhost:3001/api/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": "connected",
    "ollama": "available"
  }
}
```

---

## Error Handling

### Error Response Format

All errors return a structured response:

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "error_code"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Successful request |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Not authorized to access resource |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (duplicate) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | Ollama or database unavailable |

---

## Rate Limiting

### Limits Per IP

- **General endpoints**: 100 requests per 15 minutes
- **Auth endpoints** (`/auth/*`): 5 requests per 15 minutes

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 97
X-RateLimit-Reset: 1705330200
```

When limit is exceeded, you'll receive:
```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

---

## Pagination

List endpoints support pagination:

```bash
curl -X GET "http://localhost:3001/api/conversations?limit=10&skip=20" \
  -H "Authorization: Bearer <token>"
```

**Query Parameters:**
- `limit` (default: 50, max: 100): Results per page
- `skip` (default: 0): Number of results to skip

**Response:**
```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "limit": 10,
  "skip": 20
}
```

---

## Token Expiration

JWT tokens expire after **7 days**. When expired:

```json
{
  "success": false,
  "error": "Token has expired"
}
```

Client should:
1. Delete the token from localStorage
2. Redirect user to login page
3. User re-authenticates

Future improvement: Implement refresh token endpoint for seamless token rotation.

---

## Best Practices

1. **Store token securely**: Use HttpOnly cookies in production (frontend currently uses localStorage)
2. **Always use HTTPS**: Tokens transmitted in plaintext over HTTP
3. **Include token in requests**: `Authorization: Bearer <token>` header
4. **Handle expiration**: Implement logout on 401 response
5. **Validate on frontend**: Check token exists before making requests
6. **Don't expose token**: Never log or display token to console (except for debugging)
7. **Use pagination**: Don't fetch unlimited results
8. **Cache responses**: Reduce API calls, improve performance
9. **Implement retry logic**: Handle temporary failures gracefully
10. **Monitor rate limits**: Spread requests over time, implement exponential backoff

---

## SDK & Client Examples

### JavaScript/Node.js with Axios

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

// Add token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const { data } = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});
localStorage.setItem('token', data.token);

// Create conversation
const conversation = await api.post('/conversations', {
  title: 'My Chat'
});

// Send message
const response = await api.post(`/conversations/${conversation.data._id}/messages`, {
  userMessage: 'Hello!'
});
```

### cURL

```bash
# Login and save token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# Use token in subsequent requests
curl -X GET http://localhost:3001/api/conversations \
  -H "Authorization: Bearer $TOKEN"
```

### Python with requests

```python
import requests

BASE_URL = 'http://localhost:3001/api'

# Login
response = requests.post(f'{BASE_URL}/auth/login', json={
  'email': 'user@example.com',
  'password': 'password'
})
token = response.json()['token']

# Create conversation
headers = {'Authorization': f'Bearer {token}'}
response = requests.post(f'{BASE_URL}/conversations',
  headers=headers,
  json={'title': 'My Chat'}
)
```

---

For more examples and integration guides, see [PRODUCTION.md](PRODUCTION.md) and [CONFIG.md](CONFIG.md).
