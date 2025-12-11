# Upcoming Features - Implementation Plan

## 📋 Overview

This document outlines the implementation plan for the next set of features to be added to the Soccer Academy Management Platform.

---

## 🎯 Features to Implement

1. **Logout Functionality**
2. **Sidebar Navigation**
3. **Dark/Light Theme Toggle**
4. **Cookie-based Auth Cleanup**

---

## 📊 Current State Analysis

### ✅ What We Have
- **Backend:** Logout endpoint exists (`POST /auth/logout`)
- **Frontend:** AuthContext has `logout()` function implemented
- **Authentication:** Using httpOnly cookies for tokens (secure!)
- **User Data:** Stored in localStorage (user info only, not tokens)
- **UI Framework:** Chakra UI (has built-in dark mode support)
- **i18n:** Already configured with English/Arabic support

### ⚠️ What's Missing
- No UI component to trigger logout
- No sidebar/navigation menu
- No dark/light theme toggle
- No visual feedback for current theme

---

## 🔧 Task Breakdown

### 1. Logout Functionality 🔐

**Priority:** HIGH  
**Estimated Time:** 15-20 minutes  
**Status:** Not Started

#### Current Implementation
```javascript
// ✅ Already exists in AuthContext
const logout = async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  }
};
```

#### What's Needed
- [ ] Add logout button to UI (temporary header placement)
- [ ] Test logout flow clears cookies + localStorage
- [ ] Verify redirect to login page works
- [ ] Test on different user roles

#### Implementation Steps
1. Add logout button to existing header/navbar as temporary solution
2. Import `useAuth()` hook to get logout function
3. Call `logout()` on button click
4. Add loading state during logout
5. Redirect to `/login` after successful logout
6. Show toast notification on logout

#### Files to Modify
- `frontend/src/components/Header.jsx` (or create if doesn't exist)
- Or temporarily add to `AdminDashboard.jsx`, `PlayerDashboard.jsx`

---

### 2. Sidebar Navigation 📂

**Priority:** MEDIUM-HIGH  
**Estimated Time:** 1-2 hours  
**Status:** Not Started

#### Decision: Build with Chakra UI (Not TypeScript/Radix)

**Why?**
- Matches existing design system
- Your app is JavaScript (.jsx), not TypeScript (.tsx)
- Current code uses Radix UI + Tailwind CSS (different dependencies)
- Easier to maintain consistency

#### Sidebar Features
- **Logo/Brand Section**
- **Navigation Items** (role-based)
- **User Info** (avatar, name, role)
- **Settings Section:**
  - Theme toggle (dark/light)
  - Language toggle (EN/AR)
  - Logout button
- **Responsive:** Drawer on mobile, fixed sidebar on desktop

#### Role-Based Navigation Items

**Admin:**
```
📊 Dashboard       → /admin/dashboard
👥 Users           → /admin/users
📈 Analytics       → /admin/analytics
⚙️  Settings       → /admin/settings
```

**Player:**
```
📊 Dashboard       → /player/dashboard
👤 Profile         → /player/profile
📊 Stats           → /player/stats
⚙️  Settings       → /player/settings
```

**Agent:**
```
📊 Dashboard       → /agent/dashboard
⚽ Players         → /agent/players
⚙️  Settings       → /agent/settings
```

#### Components to Create
- [ ] `frontend/src/components/Sidebar.jsx` - Main sidebar component
- [ ] `frontend/src/components/SidebarItem.jsx` - Navigation item
- [ ] `frontend/src/components/SidebarFooter.jsx` - Theme/Language/Logout section
- [ ] `frontend/src/components/Layout.jsx` - Wrapper with sidebar

#### Chakra Components to Use
```javascript
import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  Text,
  VStack,
  HStack,
  Avatar,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react';
```

#### Implementation Steps
1. Create `Sidebar.jsx` with basic structure
2. Add logo/brand section at top
3. Implement navigation items with icons
4. Add role-based filtering for menu items
5. Create footer section for settings
6. Make responsive (drawer on mobile, fixed on desktop)
7. Integrate with existing pages
8. Add active state highlighting
9. Test on all screen sizes

---

### 3. Dark/Light Theme Toggle 🌓

**Priority:** MEDIUM  
**Estimated Time:** 30-45 minutes  
**Status:** Not Started

#### Chakra UI Built-in Support

Chakra UI provides dark mode out of the box!

#### Implementation Steps

**Step 1: Update Theme Configuration**

File: `frontend/src/theme.js` (create if doesn't exist)
```javascript
import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false, // Set to true to use system preference
};

const theme = extendTheme({ 
  config,
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
      },
    }),
  },
});

export default theme;
```

**Step 2: Update main.jsx**

```javascript
import { ColorModeScript } from '@chakra-ui/react';
import theme from './theme';

// Add before <App />
<ColorModeScript initialColorMode={theme.config.initialColorMode} />
```

**Step 3: Create Theme Toggle Component**

File: `frontend/src/components/ThemeToggle.jsx`
```javascript
import { IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const icon = useColorModeValue(<MoonIcon />, <SunIcon />);
  
  return (
    <IconButton
      icon={icon}
      onClick={toggleColorMode}
      variant="ghost"
      aria-label="Toggle theme"
    />
  );
};

export default ThemeToggle;
```

**Step 4: Integration**
- [ ] Create theme configuration file
- [ ] Update main.jsx with ColorModeScript
- [ ] Create ThemeToggle component
- [ ] Add to sidebar footer
- [ ] Test theme persistence (Chakra saves to localStorage automatically)
- [ ] Verify all pages look good in both modes

#### Files to Create/Modify
- `frontend/src/theme.js` (create)
- `frontend/src/main.jsx` (modify)
- `frontend/src/components/ThemeToggle.jsx` (create)
- `frontend/src/components/Sidebar.jsx` (integrate toggle)

---

### 4. Cookie-based Auth Cleanup 🍪

**Priority:** LOW  
**Estimated Time:** 10 minutes  
**Status:** Partially Done

#### Current State ✅
- Tokens stored in httpOnly cookies (secure!)
- User data in localStorage (non-sensitive info only)
- Logout clears both cookies and localStorage
- 401 errors trigger auto-logout

#### What Works
```javascript
// ✅ Login stores user data in localStorage
localStorage.setItem("user", JSON.stringify(userData));

// ✅ Logout removes user data
localStorage.removeItem("user");

// ✅ Backend clears httpOnly cookies on logout
res.clearCookie("accessToken");
res.clearCookie("refreshToken");

// ✅ 401 errors clear localStorage and redirect
if (error.response?.status === 401) {
  localStorage.removeItem("user");
  window.location.href = "/login";
}
```

#### Improvements Needed
- [ ] Test session expiry handling
- [ ] Add better error messages for expired sessions
- [ ] Verify no manual localStorage manipulation needed during development
- [ ] Add "Keep me logged in" option (optional)

#### Optional Enhancement: "Keep Me Logged In"

**If needed**, add checkbox on login page:
- Checked: Refresh token lasts 7 days
- Unchecked: Refresh token lasts 1 day (more secure)

**Backend Changes:**
```javascript
const expiryTime = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
```

---

## 📅 Recommended Implementation Order

### Phase 1: Quick Wins (Session 1 - Today)
**Time:** ~45 minutes

1. **Logout Button** (15 min)
   - Add temporary logout button to header/navbar
   - Test logout flow
   - Verify cookies cleared

2. **Dark Mode Setup** (30 min)
   - Create theme configuration
   - Add ColorModeScript
   - Create ThemeToggle component
   - Test in isolation

**Deliverables:**
- Working logout functionality
- Theme toggle working (even without sidebar)

---

### Phase 2: Sidebar (Session 2 - Next Day)
**Time:** ~2 hours

3. **Build Sidebar** (2 hours)
   - Create sidebar structure
   - Add navigation items (role-based)
   - Integrate theme toggle
   - Integrate language switcher
   - Move logout button to sidebar
   - Make responsive
   - Test all roles

**Deliverables:**
- Complete sidebar with all features
- Responsive design (mobile/desktop)
- Role-based navigation

---

### Phase 3: Polish (Session 3 - Final)
**Time:** ~20 minutes

4. **Cookie Cleanup Validation** (10 min)
   - Test session expiry
   - Test 401 error handling
   - Verify no manual intervention needed

5. **Final Testing** (10 min)
   - Test all features together
   - Check different user roles
   - Mobile/desktop testing
   - i18n testing (EN/AR)

**Deliverables:**
- Fully tested authentication flow
- Complete navigation system

---

## 🧪 Testing Checklist

### Logout
- [ ] Logout button visible for all roles
- [ ] Clicking logout clears cookies
- [ ] localStorage user data removed
- [ ] Redirects to login page
- [ ] Shows success toast message
- [ ] Cannot access protected routes after logout

### Theme Toggle
- [ ] Toggle button works
- [ ] Theme persists on page reload
- [ ] All pages look good in dark mode
- [ ] All pages look good in light mode
- [ ] Icons change appropriately
- [ ] Toast notifications match theme

### Sidebar
- [ ] Desktop: Fixed sidebar visible
- [ ] Mobile: Drawer opens/closes
- [ ] Navigation items work
- [ ] Active route highlighted
- [ ] Role-based items display correctly
- [ ] Theme toggle in sidebar works
- [ ] Language toggle in sidebar works
- [ ] Logout in sidebar works
- [ ] User info displays correctly

### Auth Flow
- [ ] Login sets cookies + localStorage
- [ ] Logout clears cookies + localStorage
- [ ] 401 errors trigger auto-logout
- [ ] Session expiry handled gracefully
- [ ] No manual localStorage needed

---

## 🎨 Design Specifications

### Sidebar Dimensions
```
Desktop:
- Width: 260px (expanded)
- Position: Fixed left
- Height: 100vh

Mobile:
- Full width drawer
- Overlay background
- Slide from left animation
```

### Color Scheme

**Light Mode:**
```
Background: white
Sidebar: gray.50
Active: green.500
Text: gray.800
Border: gray.200
```

**Dark Mode:**
```
Background: gray.900
Sidebar: gray.800
Active: green.400
Text: white
Border: gray.700
```

---

## 📦 Dependencies

### No New Dependencies Needed! ✅

Everything uses existing packages:
- `@chakra-ui/react` - Sidebar, theme, icons
- `@chakra-ui/icons` - Icons for UI
- `react-router-dom` - Navigation
- `react-i18next` - Language switching
- Existing auth setup

---

## 🚀 Quick Start Commands

### Start Development
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Test Logout Flow
1. Login as different roles
2. Click logout button
3. Verify redirect to login
4. Try accessing protected routes
5. Should be redirected to login

### Test Theme Toggle
1. Click theme toggle button
2. Verify colors change
3. Reload page - theme should persist
4. Check all pages in both modes

---

## 📝 Notes

### Important Considerations

1. **TypeScript Sidebar Code:** 
   - Don't use the provided TypeScript sidebar
   - Build with Chakra UI in JavaScript
   - Maintains consistency with existing codebase

2. **localStorage vs Cookies:**
   - Keep current approach (it's secure!)
   - Tokens: httpOnly cookies ✅
   - User data: localStorage ✅
   - No changes needed

3. **Responsive Design:**
   - Desktop: Fixed sidebar
   - Mobile: Drawer (hamburger menu)
   - Use Chakra's `useDisclosure` for drawer state

4. **Role-Based Access:**
   - Filter navigation items by user role
   - Use `hasRole()` from AuthContext
   - Don't show admin items to players

---

## 🔗 Related Documentation

- [Chakra UI Dark Mode](https://chakra-ui.com/docs/styled-system/color-mode)
- [Chakra UI Drawer](https://chakra-ui.com/docs/components/drawer)
- [React Router Navigation](https://reactrouter.com/en/main)
- [i18next Documentation](https://www.i18next.com/)

---

## ✅ Completion Criteria

### Feature Complete When:
- [ ] All users can logout successfully
- [ ] Sidebar displays on all authenticated pages
- [ ] Theme toggle works and persists
- [ ] Language switcher accessible from sidebar
- [ ] Navigation items match user role
- [ ] Mobile responsive design working
- [ ] All tests passing
- [ ] Code committed and pushed to repository

---

## 📧 Questions or Issues?

If you encounter any blockers:
1. Check this document first
2. Review related documentation
3. Test in isolation (one feature at a time)
4. Ask for help if needed

---

**Document Version:** 1.0  
**Last Updated:** December 11, 2025  
**Status:** Planning Phase
