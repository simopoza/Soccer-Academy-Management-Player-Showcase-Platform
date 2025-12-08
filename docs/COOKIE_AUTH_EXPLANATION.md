# 🍪 Cookie-Based Authentication - Technical Deep Dive

## The Decision: Cookies vs localStorage

### Your Backend Setup
```javascript
// Backend sends token in httpOnly cookie
res.cookie("accessToken", accessToken, {
  httpOnly: true,      // ✅ JavaScript CANNOT access
  secure: isProduction, // ✅ HTTPS only in production
  sameSite: "lax",     // ✅ CSRF protection
  maxAge: 15 * 60 * 1000, // 15 minutes
});
```

### What is httpOnly?
An httpOnly cookie **cannot be accessed by JavaScript**. Even if a hacker injects malicious code (XSS attack), they cannot steal the token.

---

## Security Comparison

### localStorage Approach (Less Secure):
```javascript
// ❌ Token visible in localStorage
localStorage.setItem("accessToken", "eyJhbGc...");

// ❌ Any script can steal it
const stolenToken = localStorage.getItem("accessToken");
```

**Vulnerable to:** XSS (Cross-Site Scripting) attacks

### httpOnly Cookie Approach (More Secure):
```javascript
// ✅ Token in httpOnly cookie
// Browser has it, but JavaScript cannot access it

console.log(document.cookie); 
// accessToken is NOT visible here!

// ✅ Even malicious scripts cannot steal it
```

**Protected from:** XSS attacks

---

## What Changed in the Code

### Before (localStorage - Insecure):
```javascript
// Storing token in localStorage
localStorage.setItem("accessToken", token);

// Manually adding to every request
const token = localStorage.getItem("accessToken");
config.headers.Authorization = `Bearer ${token}`;
```

### After (httpOnly Cookie - Secure):
```javascript
// Token stored by backend in httpOnly cookie
// Frontend only stores user data
localStorage.setItem("user", JSON.stringify(user));

// Browser automatically sends cookie with every request
// No manual token management needed!
```

---

## Updated Code Explained

### 1. AuthContext Changes

#### Initialize Auth (Lines 14-35):
**Before:**
```javascript
const token = localStorage.getItem("accessToken");
const storedUser = localStorage.getItem("user");

if (token && storedUser) {  // Check both
  setUser(JSON.parse(storedUser));
  setIsAuthenticated(true);
}
```

**After:**
```javascript
// Only check user (can't read httpOnly cookie anyway)
const storedUser = localStorage.getItem("user");

if (storedUser) {  // Check only user
  setUser(JSON.parse(storedUser));
  setIsAuthenticated(true);
}
```

**Why?** httpOnly cookies are invisible to JavaScript!

---

#### Login Function (Lines 38-61):
**Before:**
```javascript
const { user: userData, accessToken } = response;

localStorage.setItem("accessToken", accessToken);  // ❌ Insecure
localStorage.setItem("user", JSON.stringify(userData));
```

**After:**
```javascript
const { user: userData } = response;
// Token already in httpOnly cookie (backend set it)

localStorage.setItem("user", JSON.stringify(userData));  // ✅ Only user
```

**Why?** Backend already set the cookie automatically!

---

#### Logout Function (Lines 63-76):
**Before:**
```javascript
localStorage.removeItem("accessToken");  // Remove token
localStorage.removeItem("user");         // Remove user
```

**After:**
```javascript
localStorage.removeItem("user");  // Only remove user
// Cookie cleared by backend's res.clearCookie()
```

**Why?** Only the server can delete httpOnly cookies!

---

### 2. axiosInstance Changes

#### Request Interceptor:
**Before:**
```javascript
const token = localStorage.getItem("accessToken");
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

**After:**
```javascript
// No need to do anything!
// Browser automatically sends cookie
return config;
```

**How it works:**
```javascript
withCredentials: true  // Makes browser send cookies

// Browser adds automatically:
Cookie: accessToken=eyJhbGc...; refreshToken=xyz...
```

---

#### Response Interceptor:
**Before:**
```javascript
if (error.response?.status === 401) {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
}
```

**After:**
```javascript
if (error.response?.status === 401) {
  localStorage.removeItem("user");  // Only user
  // Cookie already expired/invalid
  window.location.href = "/login";
}
```

---

## Complete Authentication Flow

### Login Flow:
```
┌─────────────────────────────────────────────────┐
│ 1. User enters email/password                    │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. Frontend: POST /api/v1/auth/login             │
│    Body: { email, password }                     │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. Backend validates credentials                 │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. Backend sets httpOnly cookie:                 │
│    res.cookie("accessToken", token, {            │
│      httpOnly: true, secure: true })             │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 5. Backend responds:                             │
│    { user: {...}, token: "..." }                 │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 6. Frontend stores in localStorage:              │
│    { user: {...} }  ← Only user data!            │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 7. User is logged in!                            │
│    - Browser has httpOnly cookie                 │
│    - Frontend knows user info                    │
└─────────────────────────────────────────────────┘
```

### API Request Flow:
```
┌─────────────────────────────────────────────────┐
│ 1. Component: axiosInstance.get("/players")      │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. Axios interceptor (does nothing)              │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. Browser automatically adds:                   │
│    Cookie: accessToken=...; refreshToken=...     │
│    (thanks to withCredentials: true)             │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. Backend authMiddleware validates cookie       │
└──────────────────┬──────────────────────────────┘
                   ↓
          ┌────────┴────────┐
          ↓                 ↓
    [Valid Token]      [Invalid/Expired]
          ↓                 ↓
    Returns data      Returns 401
          ↓                 ↓
    Component         Auto-redirect
    gets data         to /login
```

---

## Data Storage Strategy

| Data Type | Storage Location | Reason |
|-----------|------------------|--------|
| **JWT Token** | httpOnly Cookie | 🔒 Secure - JS can't access, XSS protection |
| **Refresh Token** | httpOnly Cookie | 🔒 Secure - Long-lived, needs protection |
| **User Info** | localStorage | 📋 Need to read in components (name, role, etc.) |

---

## Security Benefits

### Attack Protection:

| Attack Type | localStorage | httpOnly Cookie |
|-------------|--------------|-----------------|
| **XSS (Cross-Site Scripting)** | ❌ Vulnerable | ✅ Protected |
| **CSRF (Cross-Site Request Forgery)** | ✅ Not vulnerable | ⚠️ Needs SameSite |
| **Man-in-the-Middle** | ⚠️ Needs HTTPS | ⚠️ Needs HTTPS + Secure |

### Your Current Protection:
```javascript
res.cookie("accessToken", token, {
  httpOnly: true,   // ✅ XSS protection
  secure: true,     // ✅ HTTPS only (production)
  sameSite: "lax",  // ✅ CSRF protection
});
```

**Result:** ✅ All three protections active!

---

## Testing Cookie Authentication

### Test 1: Verify Cookie is Set
1. Open DevTools → Application → Cookies
2. Login to app
3. Look for `accessToken` and `refreshToken`
4. ✅ Should see `HttpOnly: ✓` checkbox

### Test 2: Verify JS Can't Read Cookie
1. Open DevTools → Console
2. Type: `document.cookie`
3. ✅ Should NOT see accessToken

### Test 3: Verify Cookie Sent Automatically
1. Login to app
2. DevTools → Network tab
3. Make API request
4. Click request → Headers → Request Headers
5. ✅ Should see: `Cookie: accessToken=...`

### Test 4: Verify Token Not in localStorage
1. DevTools → Application → Local Storage
2. ✅ Should see: `user: {...}`
3. ✅ Should NOT see: `accessToken`

---

## Backend Middleware Requirement

Your backend authMiddleware should check cookies:
```javascript
const authMiddleware = (req, res, next) => {
  let token = null;
  
  // Check Authorization header (for mobile apps, APIs)
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }
  
  // Check cookie (for web browsers) - PRIORITY
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // Validate token...
};
```

✅ **Your backend already does this!**

---

## Common Questions

### Q: How does browser know to send cookie?
**A:** `withCredentials: true` in axios config tells browser to include cookies with cross-origin requests.

### Q: Can I still check if user is authenticated?
**A:** Yes! Check if `user` exists in localStorage. If yes, cookie is valid (until API returns 401).

### Q: What if cookie expires?
**A:** Backend returns 401 → Response interceptor catches it → Clears user → Redirects to login.

### Q: Can malicious code steal user data from localStorage?
**A:** Yes, but it only has name, email, role. The TOKEN (the key) is safe in httpOnly cookie!

### Q: What about mobile apps?
**A:** Mobile apps can still use `Authorization: Bearer` header. Backend checks both cookies and headers.

---

## Summary

### Old Way (Insecure):
```
Token: localStorage ❌
User:  localStorage ✅
Security: Vulnerable to XSS
```

### New Way (Secure):
```
Token: httpOnly Cookie 🔒
User:  localStorage      ✅
Security: Protected from XSS
```

**Result:** Your app is now significantly more secure! 🎯

---

## Key Takeaways

1. ✅ **Tokens in httpOnly cookies** = Secure from XSS
2. ✅ **User data in localStorage** = Accessible to components
3. ✅ **Browser sends cookies automatically** = No manual work
4. ✅ **Backend already configured** = Just works!
5. ✅ **Token expiration handled** = Auto-logout on 401

**Your authentication system is now production-ready!** 🚀
