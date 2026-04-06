# ChatFree End-to-End Integration Testing

Complete guide for testing the full authentication and chat flow.

## Pre-Test Checklist

- [ ] MongoDB is running
- [ ] Ollama is running with at least one model
- [ ] Backend is running on port 3001
- [ ] Frontend is running on port 3000
- [ ] All npm dependencies installed

## Quick Start Commands

```bash
# Terminal 1: MongoDB
mongod
# Or: docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:6.0

# Terminal 2: Ollama
ollama serve
# Pre-download a model: ollama pull llama2

# Terminal 3: Backend
cd backend
npm install  # Only first time
npm start

# Terminal 4: Frontend
cd frontend
npm install  # Only first time
npm start
# Opens http://localhost:3000 automatically
```

## Test Scenarios

### Scenario 1: New User Registration

**Steps:**
1. Open http://localhost:3000 in browser
2. Verify redirect to /login page
3. Click "Sign up here" link
4. Fill registration form:
   - Email: newuser@test.com
   - Username: newuser123
   - Password: SecurePassword123
   - Confirm: SecurePassword123
5. Click "Create Account"

**Expected Results:**
- ✅ Form validates input
- ✅ "Username must be 3-20 characters" error shown for short names
- ✅ "Passwords do not match" error shown if different
- ✅ No error for valid input
- ✅ After submission, redirected to chat interface
- ✅ Can see app header with username
- ✅ Token saved in localStorage

**Verify in DevTools:**
- Open DevTools → Application → Storage → localStorage
- Look for: `chatfree_token` (JWT), `chatfree_user` (JSON)

---

### Scenario 2: User Login

**Steps:**
1. Logout (click user menu → Logout)
2. Verify redirect to /login
3. Fill login form:
   - Email: newuser@test.com
   - Password: SecurePassword123
4. Click "Login"

**Expected Results:**
- ✅ "Email and password are required" error if fields empty
- ✅ "Invalid credentials" error for wrong password
- ✅ Successful login shows chat interface
- ✅ Header shows username "newuser123"
- ✅ Token in localStorage

---

### Scenario 3: Create Conversation & Send Message

**Steps:**
1. Click "New Conversation" in sidebar
2. Start typing in chat input
3. Send a message
4. Wait for AI response

**Expected Results:**
- ✅ New conversation appears in sidebar
- ✅ Your message appears with "user" styling
- ✅ AI response appears with "assistant" styling
- ✅ Both messages have timestamps
- ✅ No authentication errors
- ✅ API calls include Authorization header

**Network Tab Details:**
- Open DevTools → Network tab
- Send a message
- Check `POST /conversations/:id/messages` request
- Verify Request Headers contains:
  ```
  Authorization: Bearer eyJhbGc...
  ```

---

### Scenario 4: Bias Analysis

**Steps:**
1. Send a message that contains bias patterns (e.g., "You are toxic")
2. Check right panel for analysis results
3. Review risk score and suggestions

**Expected Results:**
- ✅ Analysis appears automatically
- ✅ Risk score displayed (0-10)
- ✅ Issues found listed
- ✅ Suggestions provided
- ✅ API call to `/analyze` succeeds

---

### Scenario 5: Token Expiration & Re-authentication

**Steps:**
1. Open DevTools → Application → localStorage
2. Delete `chatfree_token` entry
3. Try to send a message
4. Check what happens

**Expected Results:**
- ✅ Message send fails with 401 error
- ✅ Automatically redirected to /login
- ✅ Previous token cleared
- ✅ User must login again

---

### Scenario 6: Session Persistence

**Steps:**
1. Login successfully
2. Create a conversation and send a message
3. Close browser tab (keep backend running)
4. Open http://localhost:3000 in new tab

**Expected Results:**
- ✅ Automatically logs in (token in localStorage)
- ✅ Previous conversation is loaded
- ✅ Chat history visible
- ✅ Can send new messages to same conversation

---

### Scenario 7: Protected Route Access

**Steps:**
1. Logout (authenticated = false)
2. Manually navigate to http://localhost:3000
3. Try to access root URL while logged out

**Expected Results:**
- ✅ Automatically redirected to /login
- ✅ Cannot access chat interface without token
- ✅ ProtectedRoute guard working

---

### Scenario 8: Multiple Conversations

**Steps:**
1. In chat, create conversation 1, send a message
2. Click "New Conversation" to create conversation 2
3. Send a different message
4. Click conversation 1 in sidebar to switch back
5. Verify message 1 is still there

**Expected Results:**
- ✅ Each conversation maintains its own message history
- ✅ Conversations list shows correct titles
- ✅ Switching conversations updates messages
- ✅ All data persists with proper user isolation

---

## Performance Testing

### Response Times

**Expected latencies:**
- Login: < 500ms
- Create conversation: < 200ms
- Send message: 1-5s (depends on model size)
- List conversations: < 200ms
- Switch conversation: < 300ms

**Monitor in DevTools:**
```
Network tab → Filter: XHR
Look at "Time" column for each request
```

### Concurrent Users (Docker Only)

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Send requests from multiple browser tabs
# Each backend instance handles traffic
```

---

## Error Scenarios (Should Handle Gracefully)

### Backend Down

**Steps:**
1. Stop backend: `Ctrl+C` in backend terminal
2. Try to login or send message
3. Check error handling

**Expected Results:**
- ✅ Clear error message displayed
- ✅ "Backend not available" shown
- ✅ Retry button available
- ✅ Page doesn't crash

---

### Database Connection Error

**Steps:**
1. Create conversation and send message (works)
2. Stop MongoDB: `ps aux | grep mongod` → `kill <pid>`
3. Try to send another message

**Expected Results:**
- ✅ Error message shown
- ✅ No crash
- ✅ Can retry after restarting MongoDB

---

### Ollama Unavailable

**Steps:**
1. Stop Ollama
2. Try to send a message
3. Check error handling

**Expected Results:**
- ✅ "Ollama service unavailable" message
- ✅ User can continue using app logic
- ✅ Retry when Ollama is back online

---

## Security Testing

### Cross-Origin Requests

**Verify CORS:**
```bash
# From different origin (not localhost:3000)
curl -X GET http://localhost:3001/api/conversations \
  -H "Authorization: Bearer <token>" \
  -H "Origin: https://example.com"

# Should get CORS error (as expected)
```

---

### Unauthorized Access

**Test 1: Invalid Token**
```bash
curl -X GET http://localhost:3001/api/conversations \
  -H "Authorization: Bearer invalid_token"
# Should get 401 Unauthorized
```

**Test 2: Missing Token**
```bash
curl -X GET http://localhost:3001/api/conversations
# Should get 401 Unauthorized
```

**Test 3: Expired Token**
- Delete token from localStorage
- Try to access protected resource
- Should redirect to login

---

### SQL/NoSQL Injection

**Try injection in username field:**
```
Username: "; drop collection users; //
```

**Expected:** 
- ✅ Stored as literal string (not executed)
- ✅ Backend sanitizes inputs

---

## Browser Compatibility Testing

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Check:**
- [ ] Responsive layout
- [ ] localStorage works
- [ ] Forms submit correctly
- [ ] WebSocket/SSE works (for streaming)

---

## Mobile Testing

```bash
# Find your computer's IP
ipconfig (Windows) or ifconfig (Linux/Mac)

# On phone, navigate to:
http://<your-ip>:3000

# Test:
- [ ] Login/register forms are mobile-optimized
- [ ] Chat is usable on small screens
- [ ] Sidebar collapses properly
- [ ] Touch interactions work
```

---

## Load Testing

### Manual Load Test

```bash
# In separate terminals, open multiple browser windows:
Terminal 1: http://localhost:3000
Terminal 2: http://localhost:3000
Terminal 3: http://localhost:3000

# All logged in
# Send messages simultaneously from each
```

**Monitor:**
- CPU usage
- Memory usage
- Response times
- Backend logs

### Automated Load Test

```bash
# Install k6 (https://k6.io/docs/getting-started/installation/)
k6 run load-test.js

# See sample load-test.js in docs/
```

---

## Accessibility Testing

### Keyboard Navigation

- [ ] Can tab through login form
- [ ] Enter submits form
- [ ] Can tab through message input
- [ ] Can send message with keyboard

### Screen Reader (NVDA/JAWS)

- [ ] Form labels announced
- [ ] Error messages announced
- [ ] Buttons have accessible names
- [ ] Chat messages readable

### Color Contrast

- [ ] Use WebAIM Color Contrast Checker
- [ ] All text >= 4.5:1 ratio (normal)
- [ ] >= 3:1 ratio (large text)

---

## Monitoring & Logs

### Backend Logs

```bash
# View real-time logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Search for errors
grep ERROR backend/logs/error.log
```

### Frontend Console

- Open DevTools → Console
- Look for warnings/errors
- Check Network tab timing
- Memory usage in Performance tab

---

## Test Report Template

```markdown
# Chat Free v2.0.0 Integration Test Report

**Test Date:** [DATE]
**Tester:** [NAME]
**Environment:** Chrome 120, Windows 11, localhost

## Test Results

| Scenario | Status | Notes |
|----------|--------|-------|
| Registration | ✅ PASS | Created user newuser123 |
| Login | ✅ PASS | Token saved, redirected correctly |
| Send Message | ✅ PASS | AI response in 2.3s |
| Token Expiry | ✅ PASS | Redirected to login after deletion |
| Protected Routes | ✅ PASS | Cannot access / without token |
| ... | ... | ... |

## Issues Found

1. **Login Button Disabled Too Long** - HIGH
   - Loading state shows for 5+ seconds on slow connection
   - Should show timeout message after 30s

2. **localStorage Quota Issue** - MEDIUM
   - Conversations not storing after ~50 messages
   - localStorage full (5MB limit)

## Performance

- Average login time: 200ms
- Average message response: 2.5s ✅ (acceptable)
- Chat UI responsive: ✅ Yes

## Recommendations

1. Implement refresh tokens for longer sessions
2. Add request timeout handling
3. Optimize localStorage usage with compression
4. Add analytics dashboard

## Sign-off

- [ ] All critical tests pass
- [ ] No blocking issues
- [ ] Ready for production: **YES** ✅

Tester: ________________  Date: ________________
```

---

## Continuous Testing

After each deployment:

```bash
# Run these checks
1. Login/register workflow
2. Send message and get AI response
3. Check logs for errors
4. Monitor performance metrics
5. Verify database backups
6. Confirm Docker container health
```

---

See [README.md](../README.md) and [PRODUCTION.md](../PRODUCTION.md) for more information.
