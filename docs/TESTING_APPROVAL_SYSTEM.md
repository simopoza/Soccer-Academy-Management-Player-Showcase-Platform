# User Approval System - Complete Testing Guide

## 🎯 Testing Overview

This guide will walk you through testing the entire user approval system end-to-end.

---

## ✅ Implementation Status

### Backend ✅
- [x] Database schema updated (status, approved_by, approved_at)
- [x] authController.js - blocks admin registration
- [x] authController.js - checks status on login
- [x] adminController.js - getPendingUsers, approveUser, rejectUser, createAdmin
- [x] admin.js routes - all 4 endpoints protected
- [x] emailService.js - console.log implementation
- [x] createFirstAdmin.js script
- [x] Fixed adminController.js typo (approvedBy → approved_by)
- [x] Removed created_at from query (column doesn't exist)

### Frontend ✅
- [x] RegisterPage - removed admin option, shows approval message
- [x] LoginPage - handles pending/rejected/approved status
- [x] LoginPage - fixed success message (was showing registration message)
- [x] AdminDashboardPage - beautiful card-based dashboard
- [x] AdminUserManagementPage - full featured UI
- [x] adminService.js - API integration
- [x] Routes added and protected
- [x] Translations (English + Arabic)
- [x] @chakra-ui/icons installed

### Database ✅
- [x] First admin created (admin@academy.com)
- [x] 2 pending test users (agent@test.com, player1@test.com)

---

## 🧪 Test Plan

### **Test 1: Start the Servers**

```bash
# Terminal 1 - Backend
cd /home/mannahri/Desktop/SAMPSP/backend
npm run dev

# Terminal 2 - Frontend
cd /home/mannahri/Desktop/SAMPSP/frontend
npm run dev
```

**Expected Result:**
- Backend running on port 5000
- Frontend running on http://localhost:5173
- No errors in either terminal

---

### **Test 2: Admin Login**

1. Open browser: `http://localhost:5173/login`
2. Enter credentials:
   - Email: `admin@academy.com`
   - Password: `Admin123!`
3. Click "Login"

**Expected Result:**
- ✅ Green toast: "Login successful - Welcome back! You have successfully logged in."
- ✅ Redirected to `/admin/dashboard`
- ✅ See beautiful dashboard with 4 cards
- ✅ Toast shows for 3 seconds then disappears

**Common Issues:**
- If wrong password, check your createFirstAdmin.js script
- If you see "Account Pending Approval", the admin status is wrong in database

---

### **Test 3: Admin Dashboard Navigation**

On the Admin Dashboard:

1. You should see 4 cards:
   - 👥 **User Management** (active, green)
   - ⚽ **Players Management** (disabled, "Coming Soon")
   - 🏆 **Teams Management** (disabled, "Coming Soon")
   - 📅 **Matches Management** (disabled, "Coming Soon")

2. Click on the "User Management" card

**Expected Result:**
- ✅ Navigated to `/admin/users`
- ✅ See "User Management" page with green header
- ✅ Badge showing "2 Pending" (or however many pending users you have)

---

### **Test 4: View Pending Users**

On the User Management page, you should see a table with:

| ID | Name | Email | Role | Status | Actions |
|----|------|-------|------|--------|---------|
| 2 | Agent User | agent@test.com | AGENT | PENDING | ✓ ✗ |
| 3 | player user | player1@test.com | PLAYER | PENDING | ✓ ✗ |

**Expected Result:**
- ✅ Table shows all pending users
- ✅ Role badges have colors (Agent=blue, Player=green)
- ✅ Status badge is yellow for "PENDING"
- ✅ Green checkmark button (approve)
- ✅ Red X button (reject)

**If you see "No Pending Users":**
```sql
-- Check pending users in database
SELECT id, email, first_name, last_name, role, status FROM Users WHERE status = 'pending';
```

---

### **Test 5: Approve a User (Agent)**

1. Find the Agent user (agent@test.com) in the table
2. Click the green ✓ button next to their row
3. Watch the loading spinner on the button
4. Wait for the action to complete

**Expected Result:**
- ✅ Green success toast: "Success - Agent User has been approved successfully"
- ✅ User disappears from the pending list
- ✅ Backend console shows approval email log:
  ```
  📧 Sending approval email to: agent@test.com
  Email Subject: Your Account Has Been Approved! ✅
  Email Message: Hi Agent, Great news! Your account has been approved...
  ```

**Verify in Database:**
```sql
SELECT id, email, status, approved_by, approved_at FROM Users WHERE email = 'agent@test.com';
```

**Expected:**
- status = 'approved'
- approved_by = 1 (admin's user ID)
- approved_at = timestamp

---

### **Test 6: Test Approved User Login (Agent)**

1. Logout from admin account
2. Go to `/login`
3. Login with approved agent:
   - Email: `agent@test.com`
   - Password: `Agent123!` (or whatever password you used)

**Expected Result:**
- ✅ Green success toast: "Login successful - Welcome back! You have successfully logged in."
- ✅ Redirected to `/agent/dashboard`
- ✅ See "Agent Dashboard" page

**Common Issues:**
- If you see "Account Pending Approval" → Check database status
- If you see "Invalid credentials" → Check password used during registration

---

### **Test 7: Reject a User (Player)**

1. Login back as admin
2. Go to `/admin/users`
3. Find the Player user (player1@test.com) in the table
4. Click the red ✗ button next to their row
5. Watch the loading spinner

**Expected Result:**
- ✅ Yellow warning toast: "Success - player user has been rejected"
- ✅ User disappears from the pending list
- ✅ Backend console shows rejection email log:
  ```
  📧 Sending rejection email to: player1@test.com
  Email Subject: Account Registration Update
  Email Message: Hi player, Thank you for your interest...
  ```

**Verify in Database:**
```sql
-- User should be DELETED from database
SELECT * FROM Users WHERE email = 'player1@test.com';
-- Should return 0 rows

-- Players record should also be deleted (CASCADE)
SELECT * FROM Players WHERE user_id = 3;
-- Should return 0 rows
```

---

### **Test 8: Test Rejected User Cannot Login**

1. Logout from admin
2. Try to login with rejected player email:
   - Email: `player1@test.com`
   - Password: (whatever it was)

**Expected Result:**
- ✅ Red error toast: "Login failed - Invalid email or password"
- ✅ User cannot login (account deleted)

---

### **Test 9: New User Registration Flow**

1. Logout (if logged in)
2. Go to `/` (register page)
3. Fill in registration form:
   - First Name: Test
   - Last Name: Player
   - Email: newplayer@test.com
   - Password: Test123!@
   - Role: Player
4. Click "Register"

**Expected Result:**
- ✅ Green success toast: "Registration successful - Your account has been created. Please wait for admin approval..."
- ✅ Toast shows for 8 seconds
- ✅ After 1.5 seconds, redirected to `/login`

**Verify in Database:**
```sql
SELECT id, email, role, status, profile_completed FROM Users WHERE email = 'newplayer@test.com';
```

**Expected:**
- status = 'pending'
- profile_completed = 0

---

### **Test 10: Pending User Cannot Login**

1. Try to login with the newly registered user:
   - Email: `newplayer@test.com`
   - Password: `Test123!@`

**Expected Result:**
- ✅ Yellow warning toast: "Account Pending Approval - Your account is pending admin approval..."
- ✅ User cannot login
- ✅ Stays on login page

---

### **Test 11: Admin Sees New Pending User**

1. Login as admin
2. Go to `/admin/users`
3. Look for the new user in the table

**Expected Result:**
- ✅ See "Test Player" with email "newplayer@test.com"
- ✅ Role badge shows "PLAYER" (green)
- ✅ Status badge shows "PENDING" (yellow)
- ✅ Can approve or reject

---

### **Test 12: Try to Register as Admin**

1. Logout
2. Go to `/` (register page)
3. Check the Role dropdown

**Expected Result:**
- ✅ Only 2 options visible: "Player" and "Agent"
- ✅ No "Admin" option in dropdown

**If you try to hack it (API call):**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Hacker",
    "last_name": "Admin",
    "email": "hacker@test.com",
    "password": "Hack123!",
    "role": "admin"
  }'
```

**Expected Result:**
- ✅ 400 Bad Request
- ✅ Message: "Admin accounts cannot be created via registration. Contact existing admin."

---

### **Test 13: Bilingual Support (Arabic)**

1. Go to login or register page
2. Click the language switcher button (العربية)

**Expected Result:**
- ✅ All text switches to Arabic
- ✅ Layout switches to RTL (right-to-left)
- ✅ Form fields align to the right
- ✅ Navigation flows right-to-left

Test on Admin Dashboard:
- ✅ Card titles in Arabic
- ✅ Descriptions in Arabic
- ✅ Button text in Arabic

---

### **Test 14: Refresh Pending Users List**

1. On `/admin/users` page
2. Click the 🔄 "Refresh" button at the bottom

**Expected Result:**
- ✅ Button shows loading spinner
- ✅ Table refreshes with current pending users
- ✅ No errors

---

### **Test 15: Empty State**

1. Approve all pending users
2. Stay on `/admin/users` page

**Expected Result:**
- ✅ See large ✅ emoji
- ✅ Heading: "No Pending Users"
- ✅ Text: "All user registrations have been processed"
- ✅ Badge at top shows "0 Pending"

---

### **Test 16: Profile Completion Flow (Approved Player)**

1. Approve a player user
2. Logout and login as that player
3. On successful login

**Expected Result:**
- ✅ Green success toast: "Login successful - Welcome back!"
- ✅ Redirected to `/complete-profile` (because profile_completed = false)
- ✅ See "Complete Your Profile" page

**Note:** Profile completion form is not built yet (TODO comments in place)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Unknown column 'created_at'"
**Solution:** ✅ Already fixed - removed from query

### Issue 2: "Unknown column 'approvedBy'"
**Solution:** ✅ Already fixed - changed to 'approved_by'

### Issue 3: Login shows registration message
**Solution:** ✅ Already fixed - using loginSuccessMessage now

### Issue 4: @chakra-ui/icons not found
**Solution:** ✅ Already fixed - installed package

### Issue 5: Pending users not showing in admin UI
**Check:**
```sql
SELECT * FROM Users WHERE status = 'pending';
```
If empty, register new test users.

### Issue 6: Cannot approve/reject users
**Check:**
1. Are you logged in as admin?
2. Check browser console for errors
3. Check backend console for errors
4. Verify routes are registered: `GET http://localhost:5000/api/v1/admin/pending-users`

---

## 📊 Test Results Template

Use this to track your testing:

```
✅ Test 1: Start servers - PASS
✅ Test 2: Admin login - PASS  
✅ Test 3: Dashboard navigation - PASS
✅ Test 4: View pending users - PASS
✅ Test 5: Approve user - PASS
✅ Test 6: Approved user login - PASS
✅ Test 7: Reject user - PASS
✅ Test 8: Rejected user cannot login - PASS
✅ Test 9: New registration - PASS
✅ Test 10: Pending user cannot login - PASS
✅ Test 11: Admin sees new user - PASS
✅ Test 12: Cannot register as admin - PASS
✅ Test 13: Arabic/RTL support - PASS
✅ Test 14: Refresh list - PASS
✅ Test 15: Empty state - PASS
✅ Test 16: Profile completion redirect - PASS
```

---

## 🎯 What's Next After Testing

Once all tests pass:

1. **Email Integration** - Replace console.log with real email service
   - SendGrid (recommended, free tier)
   - Mailgun
   - Nodemailer with SMTP

2. **Profile Completion Form** - Build the player profile UI
   - Height, weight, position fields
   - Image upload
   - Date of birth picker

3. **Additional Features**
   - Search/filter pending users
   - Pagination
   - Rejection reason field
   - Admin activity logs

---

## 🚀 Quick Start Testing

**Fastest way to test everything:**

```bash
# 1. Start servers (2 terminals)
cd backend && npm run dev
cd frontend && npm run dev

# 2. Open browser: http://localhost:5173

# 3. Login as admin:
#    Email: admin@academy.com
#    Password: Admin123!

# 4. Go to User Management

# 5. Approve one user, reject another

# 6. Login as approved user to verify

# 7. Register new user and see in pending list

# Done! 🎉
```

---

**Good luck with testing! Let me know if you encounter any issues!** 🚀⚽
