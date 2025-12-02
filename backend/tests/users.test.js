const request = require("supertest");
const app = require("../index");
const db = require("../db");

let testUserId;
let testUserEmail = `testuser${Date.now()}@mail.com`;
const testUserPassword = "Test1234@";
let adminToken;
let adminUserId;
let playerToken;
let playerUserId;
let playerEmail;

afterAll(async () => {
  // Clean up admin user if created
  if (adminUserId) {
    await db.query("DELETE FROM Users WHERE id = ?", [adminUserId]);
  }
  // Clean up player user if created
  if (playerUserId) {
    await db.query("DELETE FROM Users WHERE id = ?", [playerUserId]);
  }
  await db.end(); // Close MySQL connection pool
});

describe("Users API", () => {

  // 0️⃣ Setup: Create admin and player users, get tokens
  beforeAll(async () => {
    const adminEmail = `admin${Date.now()}@mail.com`;
    const adminPassword = "Admin1234@";

    // Register admin user
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: adminEmail,
        password: adminPassword,
        first_name: "Admin",
        last_name: "Test",
        role: "admin"
      });

    // Login to get admin token
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: adminEmail,
        password: adminPassword
      });

    adminToken = loginRes.body.token;
    
    // Get admin user ID for cleanup
    const [users] = await db.query("SELECT id FROM Users WHERE email = ?", [adminEmail]);
    adminUserId = users[0].id;

    // Create a player user for role-based tests
    playerEmail = `player${Date.now()}@mail.com`;
    const playerPassword = "Player1234@";

    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: playerEmail,
        password: playerPassword,
        first_name: "Player",
        last_name: "Test",
        role: "player"
      });

    // Login to get player token
    const playerLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: playerEmail,
        password: playerPassword
      });

    playerToken = playerLoginRes.body.token;
    
    // Get player user ID for cleanup
    const [playerUsers] = await db.query("SELECT id FROM Users WHERE email = ?", [playerEmail]);
    playerUserId = playerUsers[0].id;
  });

  // 1️⃣ Add new user - Success
  test("POST /api/v1/users - add new user (success)", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        first_name: "Test",
        last_name: "User",
        email: testUserEmail,
        password: testUserPassword,
        role: "player"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User added successfully");
    expect(res.body.user).toHaveProperty("userId");
    expect(res.body.user.first_name).toBe("Test");
    expect(res.body.user.last_name).toBe("User");
    expect(res.body.user.email).toBe(testUserEmail);
    expect(res.body.user.role).toBe("player");

    testUserId = res.body.user.userId;
  });

  // 1️⃣b Add new user - Unauthorized (no token)
  test("POST /api/v1/users - add new user (unauthorized)", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .send({
        first_name: "Test",
        last_name: "User",
        email: `another${Date.now()}@mail.com`,
        password: testUserPassword,
        role: "player"
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  // 1️⃣c Add new user - Forbidden (player role)
  test("POST /api/v1/users - add new user (forbidden - player role)", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        first_name: "Test",
        last_name: "User",
        email: `another${Date.now()}@mail.com`,
        password: testUserPassword,
        role: "player"
      });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error");
  });

  // 2️⃣ Get all users - Success
  test("GET /api/v1/users - get all users (success)", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // 2️⃣b Get all users - Unauthorized
  test("GET /api/v1/users - get all users (unauthorized)", async () => {
    const res = await request(app).get("/api/v1/users");
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  // 2️⃣c Get all users - Forbidden (player role)
  test("GET /api/v1/users - get all users (forbidden - player role)", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${playerToken}`);
    
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error");
  });

  // 3️⃣ Get user by ID - Success
  test("GET /api/v1/users/:id - get user by ID (success)", async () => {
    const res = await request(app)
      .get(`/api/v1/users/${testUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", testUserId);
    expect(res.body).toHaveProperty("email", testUserEmail);
    expect(res.body).toHaveProperty("first_name");
    expect(res.body).toHaveProperty("last_name");
  });

  // 3️⃣b Get user by ID - Not found
  test("GET /api/v1/users/:id - get user by ID (not found)", async () => {
    const nonExistentId = 999999;
    const res = await request(app)
      .get(`/api/v1/users/${nonExistentId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "User not found");
  });

  // 3️⃣c Get user by ID - Unauthorized
  test("GET /api/v1/users/:id - get user by ID (unauthorized)", async () => {
    const res = await request(app).get(`/api/v1/users/${testUserId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  // 3️⃣d Get user by ID - Success (player role can access)
  test("GET /api/v1/users/:id - get user by ID (player role)", async () => {
    const res = await request(app)
      .get(`/api/v1/users/${playerUserId}`)
      .set("Authorization", `Bearer ${playerToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", playerUserId);
    expect(res.body).toHaveProperty("email", playerEmail);
  });

  // 4️⃣ Update user - Success
  test("PUT /api/v1/users/:id - update user (success)", async () => {
    const newFirstName = "UpdatedTest";
    const res = await request(app)
      .put(`/api/v1/users/${testUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ first_name: newFirstName });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "User updated successfully");

    const [rows] = await db.query("SELECT first_name FROM Users WHERE id = ?", [testUserId]);
    expect(rows[0].first_name).toBe(newFirstName);
  });

  // 4️⃣b Update user - Multiple fields
  test("PUT /api/v1/users/:id - update user (multiple fields)", async () => {
    const updates = {
      first_name: "MultiUpdate",
      last_name: "TestUser",
      email: `updated${Date.now()}@mail.com`
    };
    
    const res = await request(app)
      .put(`/api/v1/users/${testUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updates);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "User updated successfully");

    const [rows] = await db.query("SELECT first_name, last_name, email FROM Users WHERE id = ?", [testUserId]);
    expect(rows[0].first_name).toBe(updates.first_name);
    expect(rows[0].last_name).toBe(updates.last_name);
    expect(rows[0].email).toBe(updates.email);
    
    // Update testUserEmail for future tests
    testUserEmail = updates.email;
  });

  // 4️⃣c Update user - Not found
  test("PUT /api/v1/users/:id - update user (not found)", async () => {
    const nonExistentId = 999999;
    const res = await request(app)
      .put(`/api/v1/users/${nonExistentId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ first_name: "Test" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "User not found");
  });

  // 4️⃣d Update user - No fields provided
  test("PUT /api/v1/users/:id - update user (no valid fields)", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${testUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ invalid_field: "value" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "No valid fields provided for update");
  });

  // 4️⃣e Update user - Unauthorized
  test("PUT /api/v1/users/:id - update user (unauthorized)", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${testUserId}`)
      .send({ first_name: "Test" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  // 4️⃣f Update user - Success (player role can update)
  test("PUT /api/v1/users/:id - update user (player role)", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${playerUserId}`)
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ first_name: "UpdatedPlayer" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "User updated successfully");

    const [rows] = await db.query("SELECT first_name FROM Users WHERE id = ?", [playerUserId]);
    expect(rows[0].first_name).toBe("UpdatedPlayer");
  });

  // 5️⃣ Reset password - Success
  test("PUT /api/v1/users/:id/password - reset password (success)", async () => {
    // Login as the test user to get their token (password reset requires player role)
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testUserEmail,
        password: testUserPassword
      });
    
    const userToken = loginRes.body.token;
    const newPassword = "NewPass123!";
    
    const res = await request(app)
      .put(`/api/v1/users/${testUserId}/password`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ oldPassword: testUserPassword, newPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Password reset successfully");

    // Verify can login with new password
    const loginWithNewPass = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testUserEmail,
        password: newPassword
      });
    
    expect(loginWithNewPass.statusCode).toBe(200);
    expect(loginWithNewPass.body).toHaveProperty("token");
  });

  // 5️⃣b Reset password - Wrong old password
  test("PUT /api/v1/users/:id/password - reset password (wrong old password)", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testUserEmail,
        password: "NewPass123!" // Use the new password from previous test
      });
    
    const userToken = loginRes.body.token;
    
    const res = await request(app)
      .put(`/api/v1/users/${testUserId}/password`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ 
        oldPassword: "WrongPassword123!", 
        newPassword: "AnotherPass123!" 
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Old password is incorrect");
  });

  // 5️⃣c Reset password - Same as old password
  test("PUT /api/v1/users/:id/password - reset password (same as old)", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testUserEmail,
        password: "NewPass123!"
      });
    
    const userToken = loginRes.body.token;
    
    const res = await request(app)
      .put(`/api/v1/users/${testUserId}/password`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ 
        oldPassword: "NewPass123!", 
        newPassword: "NewPass123!" 
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "New password must be different from the old password");
  });

  // 5️⃣d Reset password - User not found
  test("PUT /api/v1/users/:id/password - reset password (user not found)", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testUserEmail,
        password: "NewPass123!"
      });
    
    const userToken = loginRes.body.token;
    const nonExistentId = 999999;
    
    const res = await request(app)
      .put(`/api/v1/users/${nonExistentId}/password`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ 
        oldPassword: "NewPass123!", 
        newPassword: "AnotherPass123!" 
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "User not found");
  });

  // 5️⃣e Reset password - Unauthorized
  test("PUT /api/v1/users/:id/password - reset password (unauthorized)", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${testUserId}/password`)
      .send({ 
        oldPassword: "NewPass123!", 
        newPassword: "AnotherPass123!" 
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  // 5️⃣f Reset password - Forbidden (admin role cannot reset password)
  test("PUT /api/v1/users/:id/password - reset password (forbidden - admin role)", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${testUserId}/password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ 
        oldPassword: "NewPass123!", 
        newPassword: "AnotherPass123!" 
      });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error");
  });

  // 6️⃣ Delete user - Success
  test("DELETE /api/v1/users/:id - delete user (success)", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${testUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "User deleted successfully");

    const [rows] = await db.query("SELECT * FROM Users WHERE id = ?", [testUserId]);
    expect(rows.length).toBe(0);
  });

  // 6️⃣b Delete user - Not found
  test("DELETE /api/v1/users/:id - delete user (not found)", async () => {
    const nonExistentId = 999999;
    const res = await request(app)
      .delete(`/api/v1/users/${nonExistentId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "User not found");
  });

  // 6️⃣c Delete user - Unauthorized
  test("DELETE /api/v1/users/:id - delete user (unauthorized)", async () => {
    // Create a new user to test deletion without auth
    const newUser = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        first_name: "ToDelete",
        last_name: "User",
        email: `todelete${Date.now()}@mail.com`,
        password: testUserPassword,
        role: "player"
      });

    const userIdToDelete = newUser.body.user.userId;

    const res = await request(app).delete(`/api/v1/users/${userIdToDelete}`);
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");

    // Cleanup - delete the user
    await request(app)
      .delete(`/api/v1/users/${userIdToDelete}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  // 6️⃣d Delete user - Forbidden (player role)
  test("DELETE /api/v1/users/:id - delete user (forbidden - player role)", async () => {
    // Create a new user to test deletion
    const newUser = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        first_name: "ToDelete",
        last_name: "User",
        email: `todelete2${Date.now()}@mail.com`,
        password: testUserPassword,
        role: "player"
      });

    const userIdToDelete = newUser.body.user.userId;

    const res = await request(app)
      .delete(`/api/v1/users/${userIdToDelete}`)
      .set("Authorization", `Bearer ${playerToken}`);
    
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error");

    // Cleanup - delete the user with admin token
    await request(app)
      .delete(`/api/v1/users/${userIdToDelete}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

});
