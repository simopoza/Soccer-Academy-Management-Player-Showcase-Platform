const request = require("supertest");
const app = require("../index");
const db = require("../db");

let adminToken;
let adminUserId;
let playerToken;
let playerUserId;
let agentToken;
let agentUserId;
let testStatId;
let testTeamId;
let testMatchId;
let testPlayerId;
let testPlayerUserId;

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
  if (testPlayerUserId) {
    await db.query("DELETE FROM Users WHERE id = ?", [testPlayerUserId]);
  }
  // Clean up test match (will cascade delete stats)
  if (testMatchId) {
    await db.query("DELETE FROM Matches WHERE id = ?", [testMatchId]);
  }
  // Clean up test team
  if (testTeamId) {
    await db.query("DELETE FROM Teams WHERE id = ?", [testTeamId]);
  }
  await db.end();
});

describe("Stats API", () => {

  // 0️⃣ Setup: Create admin, player, agent users, team, player, and match
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
      ["Test Team", 15]
    );
    testTeamId = teamResult.insertId;

    // Create a test user for player
    const testPlayerEmail = `testplayer${Date.now()}@mail.com`;
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: testPlayerEmail,
        password: "Test1234@",
        first_name: "Test",
        last_name: "Player",
        role: "agent"
      });

    const [testPlayerUsers] = await db.query("SELECT id FROM Users WHERE email = ?", [testPlayerEmail]);
    testPlayerUserId = testPlayerUsers[0].id;

    // Create a test player
    const [playerResult] = await db.query(
      "INSERT INTO Players (first_name, last_name, height, weight, position, strong_foot, team_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      ["Test", "Player", 180, 75, "ST", "Right", testTeamId, testPlayerUserId]
    );
    testPlayerId = playerResult.insertId;

    // Create a test match
    const [matchResult] = await db.query(
      "INSERT INTO Matches (date, opponent, location, match_type, team_goals, opponent_goals, team_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ["2024-12-01 15:00:00", "Test Opponent", "Home", "Friendly", 3, 1, testTeamId]
    );
    testMatchId = matchResult.insertId;
  });

  // 1️⃣ Add new stat
  describe("POST /api/v1/stats", () => {

    test("Add new stat (success)", async () => {
      const res = await request(app)
        .post("/api/v1/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          player_id: testPlayerId,
          match_id: testMatchId,
          goals: 2,
          assists: 1,
          minutes_played: 90
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Stat added successfully");
      expect(res.body).toHaveProperty("id");

      testStatId = res.body.id;

      // Verify rating was calculated
      const [rows] = await db.query("SELECT rating FROM Stats WHERE id = ?", [testStatId]);
      expect(parseFloat(rows[0].rating)).toBeGreaterThan(0);
    });

    test("Add new stat (unauthorized - no token)", async () => {
      const res = await request(app)
        .post("/api/v1/stats")
        .send({
          player_id: testPlayerId,
          match_id: testMatchId,
          goals: 1,
          assists: 0,
          minutes_played: 45
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    test("Add new stat (forbidden - player role)", async () => {
      const res = await request(app)
        .post("/api/v1/stats")
        .set("Authorization", `Bearer ${playerToken}`)
        .send({
          player_id: testPlayerId,
          match_id: testMatchId,
          goals: 1,
          assists: 0,
          minutes_played: 45
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    test("Add new stat (forbidden - agent role)", async () => {
      const res = await request(app)
        .post("/api/v1/stats")
        .set("Authorization", `Bearer ${agentToken}`)
        .send({
          player_id: testPlayerId,
          match_id: testMatchId,
          goals: 1,
          assists: 0,
          minutes_played: 45
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    test("Add new stat (invalid player_id)", async () => {
      const invalidPlayerId = 999999;
      const res = await request(app)
        .post("/api/v1/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          player_id: invalidPlayerId,
          match_id: testMatchId,
          goals: 1,
          assists: 0,
          minutes_played: 45
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Add new stat (invalid match_id)", async () => {
      const invalidMatchId = 999999;
      const res = await request(app)
        .post("/api/v1/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          player_id: testPlayerId,
          match_id: invalidMatchId,
          goals: 1,
          assists: 0,
          minutes_played: 45
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Add new stat (negative goals)", async () => {
      const res = await request(app)
        .post("/api/v1/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          player_id: testPlayerId,
          match_id: testMatchId,
          goals: -1,
          assists: 0,
          minutes_played: 45
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Add new stat (minutes_played > 120)", async () => {
      const res = await request(app)
        .post("/api/v1/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          player_id: testPlayerId,
          match_id: testMatchId,
          goals: 0,
          assists: 0,
          minutes_played: 150
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Add new stat (missing required field - goals)", async () => {
      const res = await request(app)
        .post("/api/v1/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          player_id: testPlayerId,
          match_id: testMatchId,
          assists: 0,
          minutes_played: 45
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

  });

  // 2️⃣ Get all stats
  describe("GET /api/v1/stats", () => {

    test("Get all stats (success - admin)", async () => {
      const res = await request(app)
        .get("/api/v1/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("player_name");
    });

    test("Get all stats (success - player role)", async () => {
      const res = await request(app)
        .get("/api/v1/stats")
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("Get all stats (success - agent role)", async () => {
      const res = await request(app)
        .get("/api/v1/stats")
        .set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("Get all stats (unauthorized - no token)", async () => {
      const res = await request(app).get("/api/v1/stats");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

  });

  // 3️⃣ Get stat by ID
  describe("GET /api/v1/stats/:id", () => {

    test("Get stat by ID (success - admin)", async () => {
      const res = await request(app)
        .get(`/api/v1/stats/${testStatId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", testStatId);
      expect(res.body).toHaveProperty("player_id", testPlayerId);
      expect(res.body).toHaveProperty("match_id", testMatchId);
      expect(res.body).toHaveProperty("goals", 2);
      expect(res.body).toHaveProperty("assists", 1);
      expect(res.body).toHaveProperty("minutes_played", 90);
      expect(res.body).toHaveProperty("rating");
      expect(res.body).toHaveProperty("player_name", "Test Player");
    });

    test("Get stat by ID (success - player role)", async () => {
      const res = await request(app)
        .get(`/api/v1/stats/${testStatId}`)
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", testStatId);
    });

    test("Get stat by ID (success - agent role)", async () => {
      const res = await request(app)
        .get(`/api/v1/stats/${testStatId}`)
        .set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", testStatId);
    });

    test("Get stat by ID (not found)", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .get(`/api/v1/stats/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Stat not found");
    });

    test("Get stat by ID (unauthorized - no token)", async () => {
      const res = await request(app).get(`/api/v1/stats/${testStatId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

  });

  // 4️⃣ Update stat
  describe("PUT /api/v1/stats/:id", () => {

    test("Update stat (success - single field)", async () => {
      const res = await request(app)
        .put(`/api/v1/stats/${testStatId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ goals: 3 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Stat updated successfully");

      const [rows] = await db.query("SELECT goals, rating FROM Stats WHERE id = ?", [testStatId]);
      expect(rows[0].goals).toBe(3);
      // Rating should be recalculated when goals change
      expect(parseFloat(rows[0].rating)).toBeGreaterThan(0);
    });

    test("Update stat (success - multiple fields)", async () => {
      const updates = {
        goals: 1,
        assists: 2,
        minutes_played: 75
      };

      const res = await request(app)
        .put(`/api/v1/stats/${testStatId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Stat updated successfully");

      const [rows] = await db.query(
        "SELECT goals, assists, minutes_played, rating FROM Stats WHERE id = ?",
        [testStatId]
      );
      expect(rows[0].goals).toBe(updates.goals);
      expect(rows[0].assists).toBe(updates.assists);
      expect(rows[0].minutes_played).toBe(updates.minutes_played);
      expect(parseFloat(rows[0].rating)).toBeGreaterThan(0);
    });

    test("Update stat (not found)", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .put(`/api/v1/stats/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ goals: 5 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Stat not found");
    });

    test("Update stat (no valid fields)", async () => {
      const res = await request(app)
        .put(`/api/v1/stats/${testStatId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ invalid_field: "value" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "No fields provided to update");
    });

    test("Update stat (invalid minutes_played)", async () => {
      const res = await request(app)
        .put(`/api/v1/stats/${testStatId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ minutes_played: 130 });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Update stat (negative assists)", async () => {
      const res = await request(app)
        .put(`/api/v1/stats/${testStatId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ assists: -1 });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Update stat (unauthorized - no token)", async () => {
      const res = await request(app)
        .put(`/api/v1/stats/${testStatId}`)
        .send({ goals: 2 });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    test("Update stat (forbidden - player role)", async () => {
      const res = await request(app)
        .put(`/api/v1/stats/${testStatId}`)
        .set("Authorization", `Bearer ${playerToken}`)
        .send({ goals: 2 });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    test("Update stat (forbidden - agent role)", async () => {
      const res = await request(app)
        .put(`/api/v1/stats/${testStatId}`)
        .set("Authorization", `Bearer ${agentToken}`)
        .send({ goals: 2 });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

  });

  // 5️⃣ Delete stat
  describe("DELETE /api/v1/stats/:id", () => {

    test("Delete stat (success)", async () => {
      const res = await request(app)
        .delete(`/api/v1/stats/${testStatId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Stats deleted successfully");

      const [rows] = await db.query("SELECT * FROM Stats WHERE id = ?", [testStatId]);
      expect(rows.length).toBe(0);
    });

    test("Delete stat (not found)", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .delete(`/api/v1/stats/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Stat not found");
    });

    test("Delete stat (unauthorized - no token)", async () => {
      // Create a new stat to test deletion
      const [statResult] = await db.query(
        "INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES (?, ?, ?, ?, ?, ?)",
        [testPlayerId, testMatchId, 0, 0, 30, 5.0]
      );
      const statIdToDelete = statResult.insertId;

      const res = await request(app).delete(`/api/v1/stats/${statIdToDelete}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");

      // Cleanup
      await db.query("DELETE FROM Stats WHERE id = ?", [statIdToDelete]);
    });

    test("Delete stat (forbidden - player role)", async () => {
      // Create a new stat to test deletion
      const [statResult] = await db.query(
        "INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES (?, ?, ?, ?, ?, ?)",
        [testPlayerId, testMatchId, 0, 1, 45, 6.0]
      );
      const statIdToDelete = statResult.insertId;

      const res = await request(app)
        .delete(`/api/v1/stats/${statIdToDelete}`)
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");

      // Cleanup
      await db.query("DELETE FROM Stats WHERE id = ?", [statIdToDelete]);
    });

    test("Delete stat (forbidden - agent role)", async () => {
      // Create a new stat to test deletion
      const [statResult] = await db.query(
        "INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES (?, ?, ?, ?, ?, ?)",
        [testPlayerId, testMatchId, 1, 0, 60, 6.5]
      );
      const statIdToDelete = statResult.insertId;

      const res = await request(app)
        .delete(`/api/v1/stats/${statIdToDelete}`)
        .set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");

      // Cleanup
      await db.query("DELETE FROM Stats WHERE id = ?", [statIdToDelete]);
    });

  });

});
