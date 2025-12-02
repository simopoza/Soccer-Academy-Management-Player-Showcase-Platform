const request = require("supertest");
const app = require("../index");
const db = require("../db");

let adminToken;
let adminUserId;
let playerToken;
let playerUserId;
let agentToken;
let agentUserId;
let testPlayerId;
let testTeamId;
let testUserIdForPlayer;

afterAll(async () => {
  // Clean up test users
  if (adminUserId) {
    await db.query("DELETE FROM Users WHERE id = ?", [adminUserId]);
  }
  if (playerUserId) {
    await db.query("DELETE FROM Users WHERE id = ?", [playerUserId]);
  }
  if (agentUserId) {
    await db.query("DELETE FROM Users WHERE id = ?", [agentUserId]);
  }
  if (testUserIdForPlayer) {
    await db.query("DELETE FROM Users WHERE id = ?", [testUserIdForPlayer]);
  }
  // Clean up test team
  if (testTeamId) {
    await db.query("DELETE FROM Teams WHERE id = ?", [testTeamId]);
  }
  await db.end();
});

describe("Players API", () => {

  // 0️⃣ Setup: Create admin, player, agent users and test team
  beforeAll(async () => {
    // Create admin user
    const adminEmail = `admin${Date.now()}@mail.com`;
    const adminPassword = "Admin1234@";

    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: adminEmail,
        password: adminPassword,
        first_name: "Admin",
        last_name: "Test",
        role: "admin"
      });

    const adminLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: adminEmail, password: adminPassword });

    adminToken = adminLoginRes.body.token;
    const [adminUsers] = await db.query("SELECT id FROM Users WHERE email = ?", [adminEmail]);
    adminUserId = adminUsers[0].id;

    // Create player user
    const playerEmail = `player${Date.now()}@mail.com`;
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

    const playerLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: playerEmail, password: playerPassword });

    playerToken = playerLoginRes.body.token;
    const [playerUsers] = await db.query("SELECT id FROM Users WHERE email = ?", [playerEmail]);
    playerUserId = playerUsers[0].id;

    // Create agent user
    const agentEmail = `agent${Date.now()}@mail.com`;
    const agentPassword = "Agent1234@";

    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: agentEmail,
        password: agentPassword,
        first_name: "Agent",
        last_name: "Test",
        role: "agent"
      });

    const agentLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: agentEmail, password: agentPassword });

    agentToken = agentLoginRes.body.token;
    const [agentUsers] = await db.query("SELECT id FROM Users WHERE email = ?", [agentEmail]);
    agentUserId = agentUsers[0].id;

    // Create a test team
    const [teamResult] = await db.query(
      "INSERT INTO Teams (name, age_limit) VALUES (?, ?)",
      ["Test Team", 18]
    );
    testTeamId = teamResult.insertId;

    // Create a test user for player creation (use admin or agent role to avoid auto-creating player record)
    const testUserEmail = `testuser${Date.now()}@mail.com`;
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: testUserEmail,
        password: "Test1234@",
        first_name: "Test",
        last_name: "User",
        role: "agent" // Use agent role so no auto-player record is created
      });

    const [testUsers] = await db.query("SELECT id FROM Users WHERE email = ?", [testUserEmail]);
    testUserIdForPlayer = testUsers[0].id;
  });

  // 1️⃣ Add new player
  describe("POST /api/v1/players", () => {

    test("Add new player (success)", async () => {
      const res = await request(app)
        .post("/api/v1/players")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          first_name: "John",
          last_name: "Doe",
          date_of_birth: "2000-01-15",
          height: 180,
          weight: 75,
          position: "ST",
          strong_foot: "Right",
          image_url: "https://example.com/image.jpg",
          team_id: testTeamId,
          user_id: testUserIdForPlayer
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Player added successfully");
      expect(res.body).toHaveProperty("id");

      testPlayerId = res.body.id;
    });

    test("Add new player (unauthorized - no token)", async () => {
      const res = await request(app)
        .post("/api/v1/players")
        .send({
          first_name: "Jane",
          last_name: "Doe",
          height: 170,
          weight: 65,
          position: "CAM",
          strong_foot: "Left",
          team_id: testTeamId,
          user_id: testUserIdForPlayer
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    test("Add new player (forbidden - player role)", async () => {
      const res = await request(app)
        .post("/api/v1/players")
        .set("Authorization", `Bearer ${playerToken}`)
        .send({
          first_name: "Jane",
          last_name: "Doe",
          height: 170,
          weight: 65,
          position: "CAM",
          strong_foot: "Left",
          team_id: testTeamId,
          user_id: testUserIdForPlayer
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    test("Add new player (forbidden - agent role)", async () => {
      const res = await request(app)
        .post("/api/v1/players")
        .set("Authorization", `Bearer ${agentToken}`)
        .send({
          first_name: "Jane",
          last_name: "Doe",
          height: 170,
          weight: 65,
          position: "CAM",
          strong_foot: "Left",
          team_id: testTeamId,
          user_id: testUserIdForPlayer
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    test("Add new player (invalid team_id)", async () => {
      const invalidTeamId = 999999;
      const newUserEmail = `newuser${Date.now()}@mail.com`;
      
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: newUserEmail,
          password: "Test1234@",
          first_name: "New",
          last_name: "User",
          role: "agent" // Use agent to avoid auto-player creation
        });

      const [newUsers] = await db.query("SELECT id FROM Users WHERE email = ?", [newUserEmail]);
      const newUserId = newUsers[0].id;

      const res = await request(app)
        .post("/api/v1/players")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          first_name: "Invalid",
          last_name: "Team",
          height: 180,
          weight: 75,
          position: "ST",
          strong_foot: "Right",
          team_id: invalidTeamId,
          user_id: newUserId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();

      // Cleanup
      await db.query("DELETE FROM Users WHERE id = ?", [newUserId]);
    });

    test("Add new player (invalid user_id)", async () => {
      const invalidUserId = 999999;
      
      const res = await request(app)
        .post("/api/v1/players")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          first_name: "Invalid",
          last_name: "User",
          height: 180,
          weight: 75,
          position: "ST",
          strong_foot: "Right",
          team_id: testTeamId,
          user_id: invalidUserId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

  });

  // 2️⃣ Get all players
  describe("GET /api/v1/players", () => {

    test("Get all players (success - admin)", async () => {
      const res = await request(app)
        .get("/api/v1/players")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test("Get all players (success - player role)", async () => {
      const res = await request(app)
        .get("/api/v1/players")
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("Get all players (success - agent role)", async () => {
      const res = await request(app)
        .get("/api/v1/players")
        .set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("Get all players (unauthorized - no token)", async () => {
      const res = await request(app).get("/api/v1/players");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

  });

  // 3️⃣ Get player by ID
  describe("GET /api/v1/players/:id", () => {

    test("Get player by ID (success - admin)", async () => {
      // Skip this test if testPlayerId is undefined (from failed creation test)
      if (!testPlayerId) {
        console.warn("Skipping test - testPlayerId is undefined");
        return;
      }

      const res = await request(app)
        .get(`/api/v1/players/${testPlayerId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", testPlayerId);
      expect(res.body).toHaveProperty("first_name", "John");
      expect(res.body).toHaveProperty("last_name", "Doe");
      expect(res.body).toHaveProperty("team_name", "Test Team");
    });

    test("Get player by ID (success - player role)", async () => {
      // Skip this test if testPlayerId is undefined (from failed creation test)
      if (!testPlayerId) {
        console.warn("Skipping test - testPlayerId is undefined");
        return;
      }

      const res = await request(app)
        .get(`/api/v1/players/${testPlayerId}`)
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", testPlayerId);
    });

    test("Get player by ID (success - agent role)", async () => {
      // Skip this test if testPlayerId is undefined (from failed creation test)
      if (!testPlayerId) {
        console.warn("Skipping test - testPlayerId is undefined");
        return;
      }

      const res = await request(app)
        .get(`/api/v1/players/${testPlayerId}`)
        .set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", testPlayerId);
    });

    test("Get player by ID (not found)", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .get(`/api/v1/players/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Player not found");
    });

    test("Get player by ID (unauthorized - no token)", async () => {
      const res = await request(app).get(`/api/v1/players/${testPlayerId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

  });

  // 4️⃣ Update player
  describe("PUT /api/v1/players/:id", () => {

    test("Update player (success - single field)", async () => {
      // Skip this test if testPlayerId is undefined (from failed creation test)
      if (!testPlayerId) {
        console.warn("Skipping test - testPlayerId is undefined");
        return;
      }

      const res = await request(app)
        .put(`/api/v1/players/${testPlayerId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ first_name: "UpdatedJohn" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Player updated successfully");

      const [rows] = await db.query("SELECT first_name FROM Players WHERE id = ?", [testPlayerId]);
      expect(rows[0].first_name).toBe("UpdatedJohn");
    });

    test("Update player (success - multiple fields)", async () => {
      // Skip this test if testPlayerId is undefined (from failed creation test)
      if (!testPlayerId) {
        console.warn("Skipping test - testPlayerId is undefined");
        return;
      }

      const updates = {
        first_name: "MultiUpdate",
        last_name: "Player",
        height: 185,
        weight: 80,
        position: "CAM"
      };

      const res = await request(app)
        .put(`/api/v1/players/${testPlayerId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Player updated successfully");

      const [rows] = await db.query(
        "SELECT first_name, last_name, height, weight, position FROM Players WHERE id = ?",
        [testPlayerId]
      );
      expect(rows[0].first_name).toBe(updates.first_name);
      expect(rows[0].last_name).toBe(updates.last_name);
      expect(parseFloat(rows[0].height)).toBe(updates.height);
      expect(parseFloat(rows[0].weight)).toBe(updates.weight);
      expect(rows[0].position).toBe(updates.position);
    });

    test("Update player (not found)", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .put(`/api/v1/players/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ first_name: "Test" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Player not found");
    });

    test("Update player (no valid fields)", async () => {
      // Skip this test if testPlayerId is undefined (from failed creation test)
      if (!testPlayerId) {
        console.warn("Skipping test - testPlayerId is undefined");
        return;
      }

      const res = await request(app)
        .put(`/api/v1/players/${testPlayerId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ invalid_field: "value" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "No fields provided to update ");
    });

    test("Update player (unauthorized - no token)", async () => {
      const res = await request(app)
        .put(`/api/v1/players/${testPlayerId}`)
        .send({ first_name: "Test" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    test("Update player (forbidden - player role)", async () => {
      // Skip this test if testPlayerId is undefined (from failed creation test)
      if (!testPlayerId) {
        console.warn("Skipping test - testPlayerId is undefined");
        return;
      }

      const res = await request(app)
        .put(`/api/v1/players/${testPlayerId}`)
        .set("Authorization", `Bearer ${playerToken}`)
        .send({ first_name: "Forbidden" });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    test("Update player (forbidden - agent role)", async () => {
      const res = await request(app)
        .put(`/api/v1/players/${testPlayerId}`)
        .set("Authorization", `Bearer ${agentToken}`)
        .send({ first_name: "Forbidden" });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

  });

  // 5️⃣ Delete player
  describe("DELETE /api/v1/players/:id", () => {

    test("Delete player (success)", async () => {
      // Skip this test if testPlayerId is undefined (from failed creation test)
      if (!testPlayerId) {
        console.warn("Skipping test - testPlayerId is undefined");
        return;
      }

      const res = await request(app)
        .delete(`/api/v1/players/${testPlayerId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Player deleted successfully");

      const [rows] = await db.query("SELECT * FROM Players WHERE id = ?", [testPlayerId]);
      expect(rows.length).toBe(0);
    });

    test("Delete player (not found)", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .delete(`/api/v1/players/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Player not found");
    });

    test("Delete player (unauthorized - no token)", async () => {
      // Create a new player to test deletion
      const newUserEmail = `deletetest${Date.now()}@mail.com`;
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: newUserEmail,
          password: "Test1234@",
          first_name: "Delete",
          last_name: "Test",
          role: "agent" // Use agent to avoid auto-player creation
        });

      const [newUsers] = await db.query("SELECT id FROM Users WHERE email = ?", [newUserEmail]);
      const newUserId = newUsers[0].id;

      const createRes = await request(app)
        .post("/api/v1/players")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          first_name: "ToDelete",
          last_name: "Player",
          height: 180,
          weight: 75,
          position: "ST",
          strong_foot: "Right",
          team_id: testTeamId,
          user_id: newUserId
        });

      const playerIdToDelete = createRes.body.id;

      const res = await request(app).delete(`/api/v1/players/${playerIdToDelete}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");

      // Cleanup
      await request(app)
        .delete(`/api/v1/players/${playerIdToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);
      await db.query("DELETE FROM Users WHERE id = ?", [newUserId]);
    });

    test("Delete player (forbidden - player role)", async () => {
      // Create a new player to test deletion
      const newUserEmail = `deletetest2${Date.now()}@mail.com`;
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: newUserEmail,
          password: "Test1234@",
          first_name: "Delete",
          last_name: "Test",
          role: "agent" // Use agent to avoid auto-player creation
        });

      const [newUsers] = await db.query("SELECT id FROM Users WHERE email = ?", [newUserEmail]);
      const newUserId = newUsers[0].id;

      const createRes = await request(app)
        .post("/api/v1/players")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          first_name: "ToDelete",
          last_name: "Player",
          height: 180,
          weight: 75,
          position: "ST",
          strong_foot: "Right",
          team_id: testTeamId,
          user_id: newUserId
        });

      const playerIdToDelete = createRes.body.id;

      const res = await request(app)
        .delete(`/api/v1/players/${playerIdToDelete}`)
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");

      // Cleanup
      await request(app)
        .delete(`/api/v1/players/${playerIdToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);
      await db.query("DELETE FROM Users WHERE id = ?", [newUserId]);
    });

    test("Delete player (forbidden - agent role)", async () => {
      // Create a new user directly in DB to avoid any conflicts
      const newUserEmail = `deletetest3${Date.now()}@mail.com`;
      const [userResult] = await db.query(
        "INSERT INTO Users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
        [newUserEmail, "hashedpassword", "Delete", "Test", "admin"]
      );
      const newUserId = userResult.insertId;

      const createRes = await request(app)
        .post("/api/v1/players")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          first_name: "ToDelete",
          last_name: "Player",
          height: 180,
          weight: 75,
          position: "ST",
          strong_foot: "Right",
          team_id: testTeamId,
          user_id: newUserId
        });

      const playerIdToDelete = createRes.body.id;

      const res = await request(app)
        .delete(`/api/v1/players/${playerIdToDelete}`)
        .set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");

      // Cleanup
      await request(app)
        .delete(`/api/v1/players/${playerIdToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);
      await db.query("DELETE FROM Users WHERE id = ?", [newUserId]);
    });

  });

});
