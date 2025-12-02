const request = require("supertest");
const app = require("../index");
const db = require("../db");

let testUserId;
let testUserEmail;
let testPassword;
let accessToken;

afterAll(async () => {
  // Clean up test user if created
  if (testUserId) {
    await db.query("DELETE FROM Users WHERE id = ?", [testUserId]);
  }
  await db.end(); // close MySQL connection
});

describe("Auth API Tests", () => {

  // 1️⃣ Register - Success
  describe("POST /api/v1/auth/register", () => {
    
    test("Register new user (success)", async () => {
      testUserEmail = `test${Date.now()}@mail.com`;
      testPassword = "Test1234@";

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: testUserEmail,
          password: testPassword,
          first_name: "Test",
          last_name: "User",
          role: "player"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "User registered successfully");
      expect(res.body.user).toHaveProperty("userId");
      expect(res.body.user).toHaveProperty("email", testUserEmail);
      expect(res.body.user).toHaveProperty("first_name", "Test");
      expect(res.body.user).toHaveProperty("last_name", "User");
      expect(res.body.user).toHaveProperty("role", "player");

      testUserId = res.body.user.userId;
    });

    test("Register new user (duplicate email)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: testUserEmail, // Same email as before
          password: testPassword,
          first_name: "Duplicate",
          last_name: "User",
          role: "player"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Email already in use");
    });

    test("Register new user (creates player record for player role)", async () => {
      const playerEmail = `player${Date.now()}@mail.com`;
      
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: playerEmail,
          password: testPassword,
          first_name: "Player",
          last_name: "Test",
          role: "player"
        });

      expect(res.statusCode).toBe(201);
      
      // Verify player record was created
      const [players] = await db.query(
        "SELECT * FROM Players WHERE user_id = ?", 
        [res.body.user.userId]
      );
      expect(players.length).toBe(1);

      // Cleanup
      await db.query("DELETE FROM Users WHERE id = ?", [res.body.user.userId]);
    });

    test("Register new user (admin role)", async () => {
      const adminEmail = `admin${Date.now()}@mail.com`;
      
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: adminEmail,
          password: testPassword,
          first_name: "Admin",
          last_name: "Test",
          role: "admin"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe("admin");

      // Cleanup
      await db.query("DELETE FROM Users WHERE id = ?", [res.body.user.userId]);
    });

    test("Register new user (agent role)", async () => {
      const agentEmail = `agent${Date.now()}@mail.com`;
      
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: agentEmail,
          password: testPassword,
          first_name: "Agent",
          last_name: "Test",
          role: "agent"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe("agent");

      // Cleanup
      await db.query("DELETE FROM Users WHERE id = ?", [res.body.user.userId]);
    });

    test("Register new user (invalid email format)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "invalidemail",
          password: testPassword,
          first_name: "Test",
          last_name: "User",
          role: "player"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Register new user (weak password)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: `test${Date.now()}@mail.com`,
          password: "weak",
          first_name: "Test",
          last_name: "User",
          role: "player"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Register new user (missing required field - email)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          password: testPassword,
          first_name: "Test",
          last_name: "User",
          role: "player"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Register new user (missing required field - password)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: `test${Date.now()}@mail.com`,
          first_name: "Test",
          last_name: "User",
          role: "player"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Register new user (missing required field - first_name)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: `test${Date.now()}@mail.com`,
          password: testPassword,
          last_name: "User",
          role: "player"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Register new user (missing required field - role)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: `test${Date.now()}@mail.com`,
          password: testPassword,
          first_name: "Test",
          last_name: "User"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Register new user (invalid role)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: `test${Date.now()}@mail.com`,
          password: testPassword,
          first_name: "Test",
          last_name: "User",
          role: "invalid_role"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Register new user (empty first_name)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: `test${Date.now()}@mail.com`,
          password: testPassword,
          first_name: "",
          last_name: "User",
          role: "player"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

  });

  // 2️⃣ Login - Success and failures
  describe("POST /api/v1/auth/login", () => {

    test("Login user (success)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUserEmail,
          password: testPassword
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "User logged in successfully");
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user).toHaveProperty("email", testUserEmail);
      expect(res.body.user).toHaveProperty("first_name");
      expect(res.body.user).toHaveProperty("last_name");
      expect(res.body.user).toHaveProperty("role");

      accessToken = res.body.token;
    });

    test("Login user (invalid email)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@mail.com",
          password: testPassword
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid credentials.");
    });

    test("Login user (wrong password)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUserEmail,
          password: "WrongPassword123!"
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid credentials.");
    });

    test("Login user (sets cookies)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUserEmail,
          password: testPassword
        });

      expect(res.statusCode).toBe(200);
      
      // Check if cookies are set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('accessToken'))).toBe(true);
      expect(cookies.some(cookie => cookie.includes('refreshToken'))).toBe(true);
    });

    test("Login user (missing email)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          password: testPassword
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Login user (missing password)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUserEmail
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Login user (invalid email format)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "notanemail",
          password: testPassword
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Login user (empty email)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "",
          password: testPassword
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Login user (empty password)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUserEmail,
          password: ""
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

  });

  // 3️⃣ Logout - Success and unauthorized
  describe("POST /api/v1/auth/logout", () => {

    test("Logout user (success)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "User logged out successfully");
      
      // Check if cookies are cleared
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        expect(cookies.some(cookie => cookie.includes('accessToken=;'))).toBe(true);
        expect(cookies.some(cookie => cookie.includes('refreshToken=;'))).toBe(true);
      }
    });

    test("Logout user (unauthorized - no token)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

  });

});

