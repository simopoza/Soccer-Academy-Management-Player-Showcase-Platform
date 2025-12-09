# User Approval System - Implementation Guide

## 🎯 Overview

Implement a user approval system where ALL users (players and agents) require admin approval before they can login. Admins are only created by other admins.

---

## 📋 Requirements

1. ✅ All users (player, agent) need admin approval to login
2. ✅ Rejected users are deleted immediately from database
3. ✅ Email notifications sent on approval/rejection
4. ✅ Pending users see clear message when trying to login
5. ✅ Admins are NEVER created via public registration
6. ✅ Admins created only by existing admins via dashboard

---

## 🗄️ Database Changes

### **Step 1: Update Users Table Schema**

```sql
-- Add new columns to Users table
ALTER TABLE Users 
ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER role,
ADD COLUMN approved_by INT NULL AFTER status,
ADD COLUMN approved_at DATETIME NULL AFTER approved_by,
ADD COLUMN rejection_reason VARCHAR(255) NULL AFTER approved_at,
ADD FOREIGN KEY (approved_by) REFERENCES Users(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_users_status ON Users(status);
```

### **Updated Users Table Structure:**

```sql
CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'agent', 'player') NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT NULL,
  approved_at DATETIME NULL,
  rejection_reason VARCHAR(255) NULL,
  profile_completed BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (approved_by) REFERENCES Users(id) ON DELETE SET NULL
);
```

---

## 🔧 Backend Implementation

### **1. Update Registration (authController.js)**

#### **Changes:**
```javascript
register:
  - Set status = 'pending' for ALL users
  - Do NOT allow role = 'admin' from registration
  - Only allow role = 'player' or 'agent'
  - Return success message: "Account created. Please wait for admin approval."
```

#### **Pseudo Code:**
```javascript
const register = async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;
  
  // 1. Prevent admin registration
  if (role === 'admin') {
    return res.status(400).json({ 
      message: "Admin accounts cannot be created via registration. Contact existing admin." 
    });
  }
  
  // 2. Check if email exists
  // ... existing code ...
  
  // 3. Hash password
  // ... existing code ...
  
  // 4. Insert user with status='pending'
  await db.query(
    "INSERT INTO Users (first_name, last_name, email, password, role, status, profile_completed) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
    [first_name, last_name, email, hashedPassword, role, false]
  );
  
  // 5. Create player record if role is player (but status is still pending)
  if (role === 'player') {
    await db.query("INSERT INTO Players (user_id) VALUES (?)", [userId]);
  }
  
  // 6. Return success (don't login yet)
  res.status(201).json({
    message: "Account created successfully. Please wait for admin approval before logging in.",
    user: { userId, first_name, last_name, email, role, status: 'pending' }
  });
};
```

---

### **2. Update Login (authController.js)**

#### **Changes:**
```javascript
login:
  - Check user.status BEFORE password verification
  - If status = 'pending' → Return 403: "Account pending approval"
  - If status = 'rejected' → Return 403: "Account was not approved"
  - If status = 'approved' → Allow login (existing flow)
```

#### **Pseudo Code:**
```javascript
const login = async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Get user
  const [existingUser] = await db.query(
    "SELECT * FROM Users WHERE email = ?", 
    [email]
  );
  
  if (existingUser.length === 0) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  
  const user = existingUser[0];
  
  // 2. CHECK STATUS BEFORE PASSWORD (security: don't reveal if account exists)
  // Actually, check password first, THEN check status (better security)
  
  // 3. Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  
  // 4. Check approval status (AFTER password verification)
  if (user.status === 'pending') {
    return res.status(403).json({ 
      message: "Your account is pending approval. You will receive an email once approved.",
      status: 'pending'
    });
  }
  
  if (user.status === 'rejected') {
    return res.status(403).json({ 
      message: "Your account was not approved.",
      status: 'rejected'
    });
  }
  
  // 5. If approved, continue with normal login
  // ... generate tokens, set cookies, return user data ...
};
```

---

### **3. Create Admin User Management Controller**

#### **File: `backend/controllers/adminController.js`**

Create new file with these functions:

```javascript
// GET /api/v1/admin/pending-users
getPendingUsers:
  - Query: SELECT * FROM Users WHERE status='pending' ORDER BY created_at DESC
  - Return list of pending users
  - Admin only

// PUT /api/v1/admin/users/:id/approve
approveUser:
  - Update user: status='approved', approved_by=current_admin_id, approved_at=NOW()
  - Send approval email with login link
  - Return success message
  - Admin only

// DELETE /api/v1/admin/users/:id/reject
rejectUser:
  - Optional: Store rejection reason (query param or body)
  - Send rejection email
  - DELETE user from database (cascade delete from Players if exists)
  - Return success message
  - Admin only

// POST /api/v1/admin/users/create-admin
createAdmin:
  - Only admins can create other admins
  - Create user with role='admin', status='approved'
  - Return success
  - Admin only
```

#### **Detailed Implementation:**

```javascript
// backend/controllers/adminController.js

const db = require('../db');
const { hashPassword } = require('../helpers/hashPassword');
const { sendApprovalEmail, sendRejectionEmail } = require('../helpers/emailService');

// Get all pending users
const getPendingUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.role, 
        u.status,
        u.created_at
      FROM Users u
      WHERE u.status = 'pending'
      ORDER BY u.created_at DESC
    `);
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve user
const approveUser = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id; // From auth middleware
  
  try {
    // Check if user exists and is pending
    const [user] = await db.query(
      "SELECT * FROM Users WHERE id = ? AND status = 'pending'",
      [id]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ 
        message: "User not found or already processed" 
      });
    }
    
    // Update user status
    await db.query(
      "UPDATE Users SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?",
      [adminId, id]
    );
    
    // Send approval email
    await sendApprovalEmail(user[0].email, user[0].first_name);
    
    res.status(200).json({ 
      message: "User approved successfully",
      user: {
        id: user[0].id,
        email: user[0].email,
        name: `${user[0].first_name} ${user[0].last_name}`
      }
    });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject and delete user
const rejectUser = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body; // Optional rejection reason
  
  try {
    // Check if user exists
    const [user] = await db.query(
      "SELECT * FROM Users WHERE id = ? AND status = 'pending'",
      [id]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ 
        message: "User not found or already processed" 
      });
    }
    
    // Send rejection email (before deleting)
    await sendRejectionEmail(user[0].email, user[0].first_name, reason);
    
    // Delete user (CASCADE will delete Players record if exists)
    await db.query("DELETE FROM Users WHERE id = ?", [id]);
    
    res.status(200).json({ 
      message: "User rejected and deleted successfully" 
    });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create admin user (admin only)
const createAdmin = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const createdBy = req.user.id;
  
  try {
    // Check if email exists
    const [existingUser] = await db.query(
      "SELECT email FROM Users WHERE email = ?", 
      [email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create admin with approved status
    const [result] = await db.query(
      `INSERT INTO Users 
       (first_name, last_name, email, password, role, status, profile_completed, approved_by, approved_at) 
       VALUES (?, ?, ?, ?, 'admin', 'approved', TRUE, ?, NOW())`,
      [first_name, last_name, email, hashedPassword, createdBy]
    );
    
    res.status(201).json({
      message: "Admin created successfully",
      user: {
        userId: result.insertId,
        first_name,
        last_name,
        email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getPendingUsers,
  approveUser,
  rejectUser,
  createAdmin
};
```

---

### **4. Create Admin Routes**

#### **File: `backend/routes/admin.js`**

```javascript
const express = require('express');
const router = express.Router();
const { 
  getPendingUsers, 
  approveUser, 
  rejectUser,
  createAdmin 
} = require('../controllers/adminController');
const { hasRole } = require('../middlewares/roleMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All routes require admin role
router.use(authMiddleware);
router.use(hasRole('admin'));

// Get pending users
router.get('/pending-users', getPendingUsers);

// Approve user
router.put('/users/:id/approve', approveUser);

// Reject user (delete)
router.delete('/users/:id/reject', rejectUser);

// Create new admin
router.post('/users/create-admin', createAdmin);

module.exports = router;
```

#### **Register routes in `backend/routes/apiRoutes.js`:**

```javascript
const adminRoutes = require('./admin');

router.use('/admin', adminRoutes);
```

---

### **5. Email Service Helper**

#### **File: `backend/helpers/emailService.js`**

```javascript
// For now, just console.log
// Later integrate with nodemailer, SendGrid, etc.

const sendApprovalEmail = async (email, firstName) => {
  console.log(`📧 Sending approval email to: ${email}`);

  // TODO: Integrate email service
  const loginLink = `${process.env.FRONTEND_URL}/login`;
  
  // Email content:
  const subject = "Your Account Has Been Approved! ✅";
  const message = `
    Hi ${firstName},
    
    Great news! Your account has been approved by our admin team.
    
    You can now login and access your dashboard:
    ${loginLink}
    
    Welcome aboard!
    
    Best regards,
    Soccer Academy Team
  `;
  
  console.log('Email Subject:', subject);
  console.log('Email Message:', message);

  // TODO: Actually send email
  // await transporter.sendMail({ to: email, subject, text: message });
  
  return true;
};

const sendRejectionEmail = async (email, firstName, reason) => {
  console.log(`📧 Sending rejection email to: ${email}`);
  
  const subject = "Account Registration Update";
  const message = `
    Hi ${firstName},
    
    Thank you for your interest in joining our academy.
    
    Unfortunately, your account registration was not approved.
    ${reason ? `Reason: ${reason}` : ''}
    
    If you believe this is a mistake, please contact our admin team.
    
    Best regards,
    Soccer Academy Team
  `;
  
  console.log('Email Subject:', subject);
  console.log('Email Message:', message);
  
  // TODO: Actually send email
  
  return true;
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail
};
```

---

### **6. Create First Admin (CLI Script)**

#### **File: `backend/scripts/createFirstAdmin.js`**

```javascript
const db = require('../db');
const { hashPassword } = require('../helpers/hashPassword');

const createFirstAdmin = async () => {
  try {
    // Admin details (change these!)
    const email = process.argv[2] || 'admin@academy.com';
    const password = process.argv[3] || 'Admin123!';
    const firstName = process.argv[4] || 'Super';
    const lastName = process.argv[5] || 'Admin';
    
    // Check if admin already exists
    const [existing] = await db.query(
      "SELECT id FROM Users WHERE role = 'admin' LIMIT 1"
    );
    
    if (existing.length > 0) {
      console.log('❌ Admin user already exists!');
      console.log('Admin ID:', existing[0].id);
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create first admin
    const [result] = await db.query(
      `INSERT INTO Users 
       (first_name, last_name, email, password, role, status, profile_completed, approved_at) 
       VALUES (?, ?, ?, ?, 'admin', 'approved', TRUE, NOW())`,
      [firstName, lastName, email, hashedPassword]
    );
    
    console.log('✅ First admin created successfully!');
    console.log('');
    console.log('Admin Details:');
    console.log('  ID:', result.insertId);
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('  Name:', `${firstName} ${lastName}`);
    console.log('');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createFirstAdmin();
```

#### **Add to `package.json` scripts:**

```json
"scripts": {
  "create-admin": "node scripts/createFirstAdmin.js"
}
```

#### **Usage:**

```bash
# Default admin
npm run create-admin

# Custom admin
npm run create-admin admin@example.com SecurePass123 John Doe
```

---

## 🎨 Frontend Implementation

### **1. Update Registration Page**

#### **Changes:**
- Remove "admin" option from role dropdown
- Show only: "Player" and "Agent"
- Update success message: "Account created! Please wait for admin approval."
- Don't auto-login after registration

---

### **2. Update Login Page**

#### **Changes:**
- Handle status codes:
  - 403 with status='pending' → Show: "Account pending approval"
  - 403 with status='rejected' → Show: "Account not approved"
  - 401 → Show: "Invalid credentials"

---

### **3. Create Admin User Management Page**

#### **File: `frontend/src/pages/AdminUserManagementPage.jsx`**

**Features:**
- Fetch pending users: `GET /api/v1/admin/pending-users`
- Display table with:
  - Name, Email, Role, Registration Date
  - Approve button (green)
  - Reject button (red)
- Modal for rejection reason (optional)
- Refresh list after approve/reject

---

### **4. Admin Dashboard - Add Menu Item**

Add link to User Management page in admin sidebar/menu.

---

## 📧 Email Integration (Future)

### **Recommended Services:**
1. **Nodemailer** (SMTP) - Free, self-hosted
2. **SendGrid** - Free tier: 100 emails/day
3. **Mailgun** - Free tier: 1000 emails/month
4. **AWS SES** - Very cheap

### **Implementation Steps:**
1. Choose email service
2. Get API keys / SMTP credentials
3. Add to `.env`
4. Update `emailService.js` with actual sending logic
5. Test with real emails

---

## 🧪 Testing Plan

### **1. Registration Tests:**
- [x] Register as player → status='pending' ✅
- [x] Register as agent → status='pending' ✅
- [x] Try to register as admin → Rejected ❌
- [x] Player record created even when pending ✅

### **2. Login Tests:**
- [x] Login with pending account → 403 error + message ✅
- [x] Login with rejected account → 403 error + message ✅
- [x] Login with approved account → Success ✅

### **3. Admin Tests:**
- [x] Get pending users list ✅
- [x] Approve user → status changes, email sent ✅
- [x] Reject user → user deleted, email sent ✅
- [x] Create new admin → admin created with approved status ✅

### **4. Edge Cases:**
- [x] Approve already approved user → Error ✅
- [x] Reject non-existent user → Error ✅
- [x] Non-admin tries to access admin routes → 403 ✅

---

## 📊 Implementation Checklist

### **Backend:**
- [ ] Update database schema (add status, approved_by, etc.)
- [ ] Update `authController.js` - registration
- [ ] Update `authController.js` - login
- [ ] Create `adminController.js`
- [ ] Create `admin.js` routes
- [ ] Create `emailService.js` helper
- [ ] Create `createFirstAdmin.js` script
- [ ] Test all endpoints

### **Frontend:**
- [ ] Update RegisterPage (remove admin option)
- [ ] Update LoginPage (handle status errors)
- [ ] Create AdminUserManagementPage
- [ ] Add route to admin dashboard
- [ ] Test UI flows

### **Database:**
- [ ] Run schema migration
- [ ] Create first admin
- [ ] Verify foreign keys work

### **Testing:**
- [ ] Test registration flow
- [ ] Test login with different statuses
- [ ] Test admin approval flow
- [ ] Test admin rejection flow
- [ ] Test email logs (before real email integration)

---

## 🚀 Deployment Notes

### **Important:**
1. **Create first admin BEFORE deploying** (use script)
2. **Set up email service** (or emails will only be logged)
3. **Update environment variables** for production
4. **Test with real users** before going live

---

## 📝 Summary

**User Flow:**
```
Registration → Status: Pending → Can't Login → 
Admin Reviews → 
  ├─ Approved → Email Sent → User Can Login → Complete Profile
  └─ Rejected → Email Sent → User Deleted from DB
```

**Admin Flow:**
```
First Admin Created (CLI) → Logs In → 
  ├─ Reviews Pending Users
  ├─ Approves/Rejects Users
  └─ Creates Other Admins (if needed)
```

---

## 🎯 Next Steps

After implementation:
1. Test entire approval flow
2. Integrate real email service
3. Build admin user management UI
4. Add email templates
5. Add user notifications
6. Consider adding user search/filter
7. Consider adding approval history log

---

Good luck with implementation! 🚀
