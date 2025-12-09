# Testing Profile Completion Flow

## ✅ Servers Running
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

---

## Test 1: Admin/Agent Registration (profile_completed = TRUE)

### Expected Behavior:
- Admin and Agent should have `profile_completed = TRUE` automatically
- They should NEVER see the `/complete-profile` page

### Steps:

1. **Register as Admin**:
   - Go to: http://localhost:5173/
   - Fill form:
     - First Name: `Admin`
     - Last Name: `User`
     - Email: `admin@test.com`
     - Password: `Admin123!`
     - Role: `admin`
   - Click Register

2. **Verify Response** (check browser console or Network tab):
   ```json
   {
     "message": "User registered successfully",
     "user": {
       "userId": <id>,
       "first_name": "Admin",
       "last_name": "User",
       "email": "admin@test.com",
       "role": "admin"
     }
   }
   ```

3. **Check Database** (optional):
   ```sql
   SELECT id, email, role, profile_completed FROM Users WHERE email = 'admin@test.com';
   ```
   Expected: `profile_completed = 1` (TRUE)

4. **Login as Admin**:
   - Go to: http://localhost:5173/login
   - Email: `admin@test.com`
   - Password: `Admin123!`
   - Click Login

5. **Expected Result**:
   - ✅ Should redirect to: `/admin/dashboard`
   - ❌ Should NOT go to `/complete-profile`

6. **Repeat for Agent**:
   - Register with role: `agent`
   - Login should redirect to: `/agent/dashboard`

---

## Test 2: Player Registration (profile_completed = FALSE)

### Expected Behavior:
- Player should have `profile_completed = FALSE` on registration
- New players should be redirected to `/complete-profile` on first login

### Steps:

1. **Register as Player**:
   - Go to: http://localhost:5173/
   - Fill form:
     - First Name: `Test`
     - Last Name: `Player`
     - Email: `player1@test.com`
     - Password: `Player123!`
     - Role: `player`
   - Click Register

2. **Check Database**:
   ```sql
   SELECT u.id, u.email, u.role, u.profile_completed, p.id as player_id
   FROM Users u
   LEFT JOIN Players p ON u.id = p.user_id
   WHERE u.email = 'player1@test.com';
   ```
   Expected:
   - `profile_completed = 0` (FALSE)
   - `player_id` should exist (Players record created)

---

## Test 3: First-Time Player Login

### Expected Behavior:
- Player with `profile_completed = FALSE` should redirect to `/complete-profile`

### Steps:

1. **Login as New Player**:
   - Go to: http://localhost:5173/login
   - Email: `player1@test.com`
   - Password: `Player123!`
   - Click Login

2. **Check Console** (F12 → Console):
   - Should see: `"Logged in user:"` with object containing:
     ```json
     {
       "id": <user_id>,
       "email": "player1@test.com",
       "role": "player",
       "profile_completed": false
     }
     ```

3. **Expected Result**:
   - ✅ Should redirect to: `/complete-profile`
   - ✅ Should see: "Complete Your Profile" heading
   - ✅ Should see TODO comment about form

---

## Test 4: Profile Completion (Backend Endpoint)

### Expected Behavior:
- Player can complete profile only once
- After completion, `profile_completed` is set to TRUE

### Option A: Test via Postman/Thunder Client

1. **Login to get cookies**:
   ```http
   POST http://localhost:5000/api/v1/auth/login
   Content-Type: application/json

   {
     "email": "player1@test.com",
     "password": "Player123!"
   }
   ```
   - Save the cookies from response

2. **Get Player ID**:
   ```sql
   SELECT p.id FROM Players p
   JOIN Users u ON p.user_id = u.id
   WHERE u.email = 'player1@test.com';
   ```
   Example: player_id = `5`

3. **Complete Profile**:
   ```http
   PUT http://localhost:5000/api/v1/players/5/complete-profile
   Content-Type: application/json
   Cookie: <paste cookies from login>

   {
     "first_name": "Test",
     "last_name": "Player",
     "date_of_birth": "2005-03-15",
     "position": "ST",
     "height": 180.5,
     "weight": 75.0,
     "strong_foot": "Right"
   }
   ```

4. **Expected Response**:
   ```json
   {
     "message": "Profile completed successfully",
     "profile_completed": true
   }
   ```

5. **Verify Database**:
   ```sql
   SELECT u.profile_completed, p.first_name, p.last_name, p.position
   FROM Users u
   JOIN Players p ON u.id = p.user_id
   WHERE u.email = 'player1@test.com';
   ```
   Expected:
   - `profile_completed = 1`
   - Player fields filled

### Option B: Test via Browser Console

1. While logged in as player at `/complete-profile`, open console (F12)

2. Run this code:
   ```javascript
   // Get user from localStorage
   const user = JSON.parse(localStorage.getItem('user'));
   console.log('User ID:', user.id);

   // Make API call
   fetch(`http://localhost:5000/api/v1/players/${user.id}/complete-profile`, {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
     },
     credentials: 'include', // Important: sends cookies
     body: JSON.stringify({
       first_name: "Test",
       last_name: "Player",
       date_of_birth: "2005-03-15",
       position: "ST",
       height: 180.5,
       weight: 75.0,
       strong_foot: "Right"
     })
   })
   .then(res => res.json())
   .then(data => console.log('Response:', data))
   .catch(err => console.error('Error:', err));
   ```

3. Check console for response

---

## Test 5: Try to Complete Profile Again (Should Fail)

### Expected Behavior:
- Backend should reject with 400 error
- Message: "Profile already completed. Contact admin to make changes."

### Steps:

1. **Use same API call from Test 4** (with same player)

2. **Expected Response**:
   ```json
   {
     "message": "Profile already completed. Contact admin to make changes."
   }
   ```
   Status: `400 Bad Request`

---

## Test 6: Returning Player Login

### Expected Behavior:
- Player with `profile_completed = TRUE` should redirect to `/player/dashboard`

### Steps:

1. **Logout** (or clear localStorage):
   ```javascript
   localStorage.clear();
   ```
   Then refresh page

2. **Login Again**:
   - Email: `player1@test.com`
   - Password: `Player123!`

3. **Check Console**:
   - Should see: `profile_completed: true`

4. **Expected Result**:
   - ✅ Should redirect to: `/player/dashboard`
   - ❌ Should NOT go to `/complete-profile`
   - ⚠️ Note: `/player/dashboard` doesn't exist yet, so you'll see 404 or blank page

---

## Test 7: Manual URL Access Prevention

### Expected Behavior:
- Player with completed profile should be auto-redirected away from `/complete-profile`

### Steps:

1. **While logged in as completed player**, manually navigate to:
   - http://localhost:5173/complete-profile

2. **Check Console**:
   - Should see: `"Profile already completed, redirecting to dashboard..."`

3. **Expected Result**:
   - ✅ Should immediately redirect to `/player/dashboard`
   - ✅ Should NOT see the form

---

## Test 8: Ownership Protection

### Expected Behavior:
- Player A cannot complete Player B's profile

### Steps:

1. **Register second player**:
   - Email: `player2@test.com`
   - Password: `Player123!`

2. **Get both player IDs**:
   ```sql
   SELECT p.id, u.email FROM Players p
   JOIN Users u ON p.user_id = u.id
   WHERE u.email IN ('player1@test.com', 'player2@test.com');
   ```

3. **Login as player1@test.com**

4. **Try to complete player2's profile**:
   ```javascript
   // Assuming player2's id is 6
   fetch('http://localhost:5000/api/v1/players/6/complete-profile', {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({
       first_name: "Hacker",
       last_name: "Attempt",
       date_of_birth: "2005-01-01",
       position: "GK"
     })
   })
   .then(res => res.json())
   .then(console.log);
   ```

5. **Expected Response**:
   ```json
   {
     "message": "Access denied"
   }
   ```
   Status: `403 Forbidden`

---

## Test 9: Role Protection

### Expected Behavior:
- Admin/Agent cannot access `/players/:id/complete-profile` endpoint

### Steps:

1. **Login as admin**

2. **Try to complete a player's profile**:
   ```javascript
   fetch('http://localhost:5000/api/v1/players/5/complete-profile', {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({
       first_name: "Admin",
       last_name: "Attempt",
       date_of_birth: "2005-01-01",
       position: "ST"
     })
   })
   .then(res => res.json())
   .then(console.log);
   ```

3. **Expected Response**:
   ```json
   {
     "message": "Only players can complete profile"
   }
   ```
   Status: `403 Forbidden`

---

## Quick Test Checklist

Copy this checklist and mark as you test:

```
Registration:
[ ] Admin registration sets profile_completed = TRUE
[ ] Agent registration sets profile_completed = TRUE  
[ ] Player registration sets profile_completed = FALSE
[ ] Player record is created in Players table

Login Redirects:
[ ] Admin login → /admin/dashboard
[ ] Agent login → /agent/dashboard
[ ] New player (profile_completed=false) → /complete-profile
[ ] Returning player (profile_completed=true) → /player/dashboard

Profile Completion:
[ ] First completion succeeds (200 OK)
[ ] Second attempt fails (400 Bad Request)
[ ] profile_completed is set to TRUE in database
[ ] Player fields are updated in Players table

Security:
[ ] Player cannot complete other player's profile (403)
[ ] Admin cannot use complete-profile endpoint (403)
[ ] Manual URL access is prevented (auto-redirect)

Frontend Flow:
[ ] CompleteProfilePage shows form for incomplete profiles
[ ] CompleteProfilePage redirects for completed profiles
[ ] Login redirect logic works correctly
```

---

## Debugging Tips

### If something doesn't work:

1. **Check Backend Console**:
   - Look for errors in the terminal running backend
   - SQL errors, validation errors, etc.

2. **Check Browser Console (F12)**:
   - JavaScript errors
   - Network errors (401, 403, 500)
   - Console.log messages

3. **Check Network Tab (F12 → Network)**:
   - See actual API requests/responses
   - Check cookies are being sent
   - Verify request payload

4. **Check Database**:
   ```sql
   -- See all users and their profile status
   SELECT u.id, u.email, u.role, u.profile_completed, p.id as player_id
   FROM Users u
   LEFT JOIN Players p ON u.id = p.user_id;
   ```

5. **Check localStorage** (Browser Console):
   ```javascript
   console.log(localStorage.getItem('user'));
   ```

---

## Common Issues

### Issue: "Cannot read property 'id' of null"
**Solution**: User not logged in. Clear localStorage and login again.

### Issue: 401 Unauthorized
**Solution**: Token expired or not sent. Login again.

### Issue: 403 Forbidden
**Solution**: Wrong role or trying to access another player's profile.

### Issue: 400 Bad Request "Profile already completed"
**Solution**: Expected! This means the protection is working.

### Issue: Redirect not working
**Solution**: 
- Check browser console for errors
- Verify `profile_completed` is in user object
- Check if route exists (e.g., `/player/dashboard` needs to be created)

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Build the profile completion form UI
2. ✅ Create player dashboard page
3. ✅ Add form validation
4. ✅ Add loading states
5. ✅ Improve error handling
