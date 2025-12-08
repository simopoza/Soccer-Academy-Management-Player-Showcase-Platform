# 🔒 Frontend Route Protection - Complete Guide

## What Was Implemented

### 1. **AuthContext & AuthProvider** (`frontend/src/context/AuthContext.jsx`)
Central authentication state management that provides:
- User authentication state (`isAuthenticated`)
- Current user data (`user`)
- Login/logout/register functions
- Token management with httpOnly cookies
- Role-based access helpers (`hasRole`)
- Custom `useAuth()` hook for components

### 2. **Axios Instance with Interceptors** (`frontend/src/services/axiosInstance.js`)
- **Request Interceptor**: Cookies automatically sent via `withCredentials: true`
- **Response Interceptor**: Auto-logout on 401 errors (token expiration)
- Seamless authentication flow

### 3. **ProtectedRoute Component** (`frontend/src/components/ProtectedRoute.jsx`)
Guards routes requiring authentication:
- Checks if user is logged in
- Redirects to `/login` if not authenticated
- Shows loading state during auth check

### 4. **RoleBasedRoute Component** (`frontend/src/components/RoleBasedRoute.jsx`)
Guards routes by user role:
- Checks authentication AND role
- Only allows specified roles to access route
- Redirects unauthorized users to their own dashboard

### 5. **App Integration**
- `App.jsx`: Wrapped with `<AuthProvider>`
- `AppRoutes.jsx`: Protected routes with guards
- `LoginPage.jsx`: Integrated with AuthContext

---

## How Route Protection Works

### Authentication Flow:
```
1. User visits protected route (e.g., /admin/dashboard)
   ↓
2. RoleBasedRoute checks: Is user authenticated?
   ├─ NO → Redirect to /login
   └─ YES → Continue to step 3
   ↓
3. RoleBasedRoute checks: Does user have allowed role?
   ├─ NO → Redirect to their own dashboard
   └─ YES → Show protected component ✅
```

### Cookie-Based Authentication:
```
1. User logs in
   ↓
2. Backend sets httpOnly cookie (secure!)
   ↓
3. Frontend stores user data in localStorage
   ↓
4. Every API request: Cookie automatically sent
   ↓
5. Backend validates cookie token
```

---

## Usage Examples

### Using AuthContext in Components:
```jsx
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  
  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }
  
  return (
    <div>
      <p>Welcome {user.first_name}!</p>
      <p>Role: {user.role}</p>
      
      {hasRole("admin") && <button>Admin Feature</button>}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Adding Protected Routes:
```jsx
// Any authenticated user
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } 
/>

// Admin only
<Route 
  path="/admin/settings" 
  element={
    <RoleBasedRoute allowedRoles={["admin"]}>
      <SettingsPage />
    </RoleBasedRoute>
  } 
/>

// Multiple roles
<Route 
  path="/matches" 
  element={
    <RoleBasedRoute allowedRoles={["admin", "agent"]}>
      <MatchesPage />
    </RoleBasedRoute>
  } 
/>
```

---

## Security Features

### httpOnly Cookies (Secure):
- ✅ Tokens stored in httpOnly cookies
- ✅ JavaScript cannot access tokens (XSS protection)
- ✅ Browser automatically sends cookies
- ✅ CSRF protection via SameSite flag

### What's Stored Where:
| Data | Location | Reason |
|------|----------|--------|
| JWT Token | httpOnly Cookie | Secure - JS can't access |
| User Info | localStorage | Need to read in components |

---

## Testing Route Protection

### Test 1: Unauthenticated Access
```
1. Clear cookies and localStorage
2. Visit: http://localhost:5173/admin/dashboard
3. Expected: Redirects to /login ✅
```

### Test 2: Wrong Role Access
```
1. Login as agent
2. Visit: http://localhost:5173/admin/dashboard
3. Expected: Redirects to /agent/dashboard ✅
```

### Test 3: Correct Access
```
1. Login as admin
2. Visit: http://localhost:5173/admin/dashboard
3. Expected: Shows admin dashboard ✅
```

### Test 4: Token Expiration
```
1. Login successfully
2. Wait 15 minutes (token expires)
3. Make any API request
4. Expected: Auto-redirect to /login ✅
```

---

## Backend Requirements

Your backend must return this structure on login:
```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin"
  },
  "token": "eyJhbGc..."
}
```

And set httpOnly cookies:
```javascript
res.cookie("accessToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000 // 15 minutes
});
```

---

## Common Issues

### Issue: "useAuth must be used within an AuthProvider"
**Solution**: Ensure `App.jsx` wraps routes with `<AuthProvider>`

### Issue: Token not being sent
**Solution**: Check `withCredentials: true` in axiosInstance

### Issue: Infinite redirect loop
**Solution**: Ensure `/login` is NOT wrapped in ProtectedRoute

### Issue: User data not persisting on refresh
**Solution**: Already handled - AuthContext reads from localStorage on mount

---

## File Structure

```
frontend/src/
├── context/
│   └── AuthContext.jsx          # Authentication state management
├── components/
│   ├── ProtectedRoute.jsx       # Auth guard
│   └── RoleBasedRoute.jsx       # Role-based guard
├── services/
│   └── axiosInstance.js         # HTTP client with interceptors
├── routes/
│   └── AppRoutes.jsx            # Route configuration
├── pages/
│   └── LoginPage.jsx            # Login with AuthContext
└── App.jsx                      # Wrapped with AuthProvider
```

---

## Summary

✅ Routes protected from unauthenticated access  
✅ Role-based access control enforced  
✅ JWT tokens managed securely via httpOnly cookies  
✅ Token expiration handled gracefully  
✅ Auth state persists across page refreshes  
✅ Automatic redirects for unauthorized access  

Your application is now secure! 🔒
