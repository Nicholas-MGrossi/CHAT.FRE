# Frontend Authentication Implementation Guide

## What Was Added (v2.1.0 Authentication)

### New Files Created

1. **src/utils/auth.js** - Token management utilities
   - `saveToken()` - Store JWT in localStorage
   - `getToken()` - Retrieve JWT from localStorage
   - `saveUser()` - Store user info in localStorage
   - `getUser()` - Retrieve user info from localStorage
   - `isAuthenticated()` - Check if user has valid token
   - `clearAuth()` - Clear all auth data on logout
   - `getAuthHeader()` - Return Authorization header

2. **src/components/Login.jsx** - User login form
   - Email and password form with validation
   - Error handling with clear messages
   - Loading state during authentication
   - Link to register page
   - Demo credentials for testing

3. **src/components/Register.jsx** - User registration form
   - Email, username, password validation
   - Password confirmation matching
   - Username format validation (3-20 alphanumeric)
   - Password strength requirements
   - Link to login page
   - Success redirect to chat

4. **src/components/ProtectedRoute.jsx** - Route guard component
   - Redirects unauthenticated users to login
   - Wraps protected routes

5. **src/components/Header.jsx** - Top navigation bar
   - Displays current user info
   - User avatar with initials
   - Dropdown menu with:
     - Current email display
     - Profile settings (future)
     - Preferences (future)
     - Logout button

6. **src/styles/auth.css** - Authentication page styles
   - Login/register form styling
   - Form validation error display
   - Responsive design for mobile
   - Gradient backgrounds

7. **src/styles/header.css** - Header and user menu styles
   - Top navigation bar layout
   - User avatar styling
   - Dropdown menu animation
   - Responsive mobile menu

### Updated Files

1. **src/utils/api.js**
   - Added JWT token to all requests via axios interceptor
   - Added 401 error handling (redirect to login on expiry)
   - New auth endpoints:
     - `register(email, username, password)`
     - `login(email, password)`
     - `logout()`
     - `getCurrentUser()`
     - `updateProfile(updates)`

2. **src/contexts/ConversationContext.js**
   - Added auth state: `user`, `isAuthenticated`
   - Added `logout()` function
   - Updated `loadInitialConversations()` to check auth
   - New context properties available to all components

3. **src/App.jsx** - Complete routing implementation
   - BrowserRouter wrapper
   - Three routes:
     - `/login` - Public login page
     - `/register` - Public registration page
     - `/` - Protected chat interface
   - Automatic redirect based on auth status
   - Server health check integration

4. **src/styles/app.css**
   - Updated layout to support header
   - Flex layout instead of grid for header
   - Proper spacing for new app structure

5. **frontend/package.json**
   - Added `react-router-dom` dependency

## How It Works

### Authentication Flow

```
User visits http://localhost:3000
  ↓
App checks localStorage for token
  ↓
If no token → Redirect to /login
If token exists → Load conversations and render chat
  ↓
User fills login form (email, password)
  ↓
API call to POST /api/auth/login
  ↓
Backend returns JWT token and user info
  ↓
Token and user saved to localStorage
  ↓
Axios interceptor automatically adds token to all future requests
  ↓
Chat interface loads with user's conversations
```

### Protected Routes

```
<ProtectedRoute>
  <AppContent />
</ProtectedRoute>
```

The `ProtectedRoute` component checks:
1. Is there a token in localStorage?
2. Is the user authenticated?
3. If NO → Redirect to /login
4. If YES → Render the component

### Token Injection

Every API request automatically includes:
```
Authorization: Bearer <jwt_token>
```

via the axios interceptor in `src/utils/api.js`

### Logout Flow

When user clicks logout button in Header:
1. Call `api.logout()` to notify backend (optional)
2. Call `clearAuth()` to delete localStorage token
3. Call `useConversation().logout()` to clear context
4. Redirect to `/login` page

## Testing the Implementation

### Setup

```bash
# Install new dependencies
cd frontend
npm install

# Start frontend
npm start
```

This will install `react-router-dom` and start the app on http://localhost:3000

### Create Test Account

1. Navigate to http://localhost:3000
   - You'll be redirected to /login
2. Click "Sign up here" link
3. Fill registration form:
   - Email: test@example.com
   - Username: testuser
   - Password: SecurePass123
   - Confirm: SecurePass123
4. Click "Create Account"
5. You should be logged in and see the chat interface

### Login with Test Account

1. Logout (click user menu → Logout)
2. You'll be redirected to /login
3. Enter credentials:
   - Email: test@example.com
   - Password: SecurePass123
4. Click "Login"
5. You should see your previous conversations

### Test Token Expiration

1. Open DevTools → Application → Storage → localhost:3000 → localStorage
2. Find and delete `chatfree_token`
3. Try to send a message
4. You should be redirected to `/login`

### Test Protected Routes

1. Try to access http://localhost:3000 without authentication
   - You should be redirected to /login
2. Logout, try again
   - Same redirect behavior

## Components Architecture

### Login Page Structure
```
Login Component
├── Form (email, password)
├── Error display
├── Submit button
└── Register link
```

### Register Page Structure
```
Register Component
├── Form (email, username, password, confirm)
├── Form validation with feedback
├── Error display
├── Submit button
└── Login link
```

### Header Structure
```
Header Component
├── App title (ChatFree)
├── User menu
│   ├── User avatar + name
│   └── Dropdown
│       ├── Email display
│       ├── Profile settings
│       ├── Preferences
│       └── Logout button
```

### App Structure
```
App Component
├── BrowserRouter
└── ConversationProvider
    └── Routes
        ├── /login → Login Component
        ├── /register → Register Component
        └── / → ProtectedRoute
            └── AppContent
                ├── Header
                └── App Content (3-panel layout)
                    ├── SideBar
                    ├── ChatWindow
                    └── RightPanel
```

## API Integration

### New API Functions

```javascript
// Authentication
await api.register(email, username, password)
// Returns: { token, user }

await api.login(email, password)
// Returns: { token, user }

await api.logout()
// No return value

await api.getCurrentUser()
// Returns: user object

await api.updateProfile({ username, preferences })
// Returns: updated user object
```

### Authorization Header

```javascript
// Automatically added by axios interceptor
GET /api/conversations
Authorization: Bearer eyJhbGciOi...

POST /api/conversations
Authorization: Bearer eyJhbGciOi...
```

## Error Handling

### Login/Register Errors

Frontend shows user-friendly messages:
- "Email and password are required"
- "Please enter a valid email address"
- "Username must be between 3 and 20 characters"
- "Password must be at least 8 characters long"
- "Passwords do not match"
- "Invalid credentials" (from backend)
- "Email already exists" (from backend)
- "Username already exists" (from backend)

### 401 Unauthorized

When backend returns 401:
1. Axios interceptor detects the error
2. Clears token from localStorage
3. Redirects to /login
4. User must login again

## LocalStorage Keys

- `chatfree_token` - JWT authentication token
- `chatfree_user` - User information (JSON)

## Security Considerations

1. **Token Storage**: Currently in localStorage (accessible via JavaScript)
   - Future: Use HttpOnly cookies in production
2. **HTTPS Required**: Always use HTTPS in production
3. **Token Expiry**: Backend tokens expire after 7 days
   - Implement refresh token for longer sessions (future)
4. **CORS**: Backend validates origin headers
5. **NoSQL Injection**: Backend sanitizes inputs

## Future Improvements (v2.2.0+)

- [ ] Refresh token implementation (seamless re-auth)
- [ ] HttpOnly cookie storage (better security)
- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] Profile edit page
- [ ] Preferences page
- [ ] Account deletion
- [ ] Login activity history

## Troubleshooting

### "React Router not found" error
```bash
cd frontend
npm install react-router-dom@^6.20.0
```

### Blank login page
- Check that Login.jsx and Register.jsx are in `src/components/`
- Check that auth.css is in `src/styles/`
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### "Cannot GET /login" error
- Make sure `npm start` is running in frontend folder
- React Router needs to handle the route client-side

### Token keeps expiring
- Tokens expire after 7 days on backend
- Browser clears token after that period
- User must login again
- Implementation of refresh tokens coming in v2.2.0

### Axios "Cannot find name 'getToken'" error
- Make sure `src/utils/auth.js` exists
- Check that `getToken` is exported
- Clear node_modules: `rm -rf node_modules && npm install`

## Testing Checklist

- [ ] Can register a new account
- [ ] Can login with registered credentials
- [ ] Can see chat interface after login
- [ ] Can create and send messages (requires backend)
- [ ] Can logout and be redirected to login
- [ ] Cannot access / when logged out
- [ ] Token is stored in localStorage
- [ ] Token is in Authorization header of API requests
- [ ] Expired token redirects to login
- [ ] Demo credentials work (if set up on backend)

## Next Steps

1. **Run the app**: `npm install && npm start`
2. **Test registration**: Create a test account
3. **Test login**: Login with that account
4. **Backend validation**: Ensure backend is running
5. **Docker setup**: Build and test with docker-compose

See [PRODUCTION.md](../PRODUCTION.md) for deployment instructions.
