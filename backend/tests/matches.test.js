const request = require("supertest");
const app = require("../index");
const db = require("../db");

let adminToken;
let adminUserId;
let playerToken;
let playerUserId;
let agentToken;
let agentUserId;
let testMatchId;
let testTeamId;

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
  // Clean up test team
  if (testTeamId) {
    await db.query("DELETE FROM Teams WHERE id = ?", [testTeamId]);
  }
  await db.end();
});

describe("Matches API", () => {

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

    // Create a test team for matches
    const [teamResult] = await db.query(
      "INSERT INTO Teams (name, age_limit) VALUES (?, ?)",
      ["Test Team", 15]
    );
    testTeamId = teamResult.insertId;
  });

  // 1️⃣ Add new match
  describe("POST /api/v1/matches", () => {

    test("Add new match (success)", async () => {
      const res = await request(app)
        .post("/api/v1/matches")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          date: "2024-12-01T15:00:00.000Z",
          opponent: "Rival Team FC",
          location: "Home",
          match_type: "Friendly",
          team_goals: 3,
          opponent_goals: 1,
          team_id: testTeamId
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Match added successfully");
      expect(res.body).toHaveProperty("id");

      testMatchId = res.body.id;
    });

    test("Add new match (unauthorized - no token)", async () => {
      const res = await request(app)
        .post("/api/v1/matches")
        .send({
          date: "2024-12-01T15:00:00.000Z",
          opponent: "Test Opponent",
          location: "Away",
          match_type: "Officially",
          team_goals: 2,
          opponent_goals: 2,
          team_id: testTeamId
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    test("Add new match (forbidden - player role)", async () => {
      const res = await request(app)
        .post("/api/v1/matches")
        .set("Authorization", `Bearer ${playerToken}`)
        .send({
          date: "2024-12-01T15:00:00.000Z",
          opponent: "Test Opponent",
          location: "Away",
          match_type: "Officially",
          team_goals: 2,
          opponent_goals: 2,
          team_id: testTeamId
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    test("Add new match (forbidden - agent role)", async () => {
      const res = await request(app)
        .post("/api/v1/matches")
        .set("Authorization", `Bearer ${agentToken}`)
        .send({
          date: "2024-12-01T15:00:00.000Z",
          opponent: "Test Opponent",
          location: "Away",
          match_type: "Officially",
          team_goals: 2,
          opponent_goals: 2,
          team_id: testTeamId
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    test("Add new match (invalid team_id)", async () => {
      const invalidTeamId = 999999;
      const res = await request(app)
        .post("/api/v1/matches")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          date: "2024-12-01T15:00:00.000Z",
          opponent: "Test Opponent",
          location: "Home",
          match_type: "Friendly",
          team_goals: 0,
          opponent_goals: 0,
          team_id: invalidTeamId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Add new match (invalid location)", async () => {
      const res = await request(app)
        .post("/api/v1/matches")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          date: "2024-12-01T15:00:00.000Z",
          opponent: "Test Opponent",
          location: "Invalid",
          match_type: "Friendly",
          team_goals: 0,
          opponent_goals: 0,
          team_id: testTeamId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Add new match (invalid match_type)", async () => {
      const res = await request(app)
        .post("/api/v1/matches")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          date: "2024-12-01T15:00:00.000Z",
          opponent: "Test Opponent",
          location: "Home",
          match_type: "Invalid",
          team_goals: 0,
          opponent_goals: 0,
          team_id: testTeamId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Add new match (negative team_goals)", async () => {
      const res = await request(app)
        .post("/api/v1/matches")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          date: "2024-12-01T15:00:00.000Z",
          opponent: "Test Opponent",
          location: "Home",
          match_type: "Friendly",
          team_goals: -1,
          opponent_goals: 0,
          team_id: testTeamId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Add new match (missing required field - opponent)", async () => {
      const res = await request(app)
        .post("/api/v1/matches")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          date: "2024-12-01T15:00:00.000Z",
          location: "Home",
          match_type: "Friendly",
          team_goals: 0,
          opponent_goals: 0,
          team_id: testTeamId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

  });

  // 2️⃣ Get all matches
  describe("GET /api/v1/matches", () => {

    test("Get all matches (success - admin)", async () => {
      const res = await request(app)
        .get("/api/v1/matches")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test("Get all matches (success - player role)", async () => {
      const res = await request(app)
        .get("/api/v1/matches")
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("Get all matches (success - agent role)", async () => {
      const res = await request(app)
        .get("/api/v1/matches")
        .set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("Get all matches (unauthorized - no token)", async () => {
      const res = await request(app).get("/api/v1/matches");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

  });

  // 3️⃣ Get match by ID
  describe("GET /api/v1/matches/:id", () => {

    test("Get match by ID (success - admin)", async () => {
      const res = await request(app)
        .get(`/api/v1/matches/${testMatchId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", testMatchId);
      expect(res.body).toHaveProperty("opponent", "Rival Team FC");
      expect(res.body).toHaveProperty("location", "Home");
      expect(res.body).toHaveProperty("match_type", "Friendly");
      expect(res.body).toHaveProperty("team_goals", 3);
      expect(res.body).toHaveProperty("opponent_goals", 1);
      expect(res.body).toHaveProperty("team_name", "Test Team");
    });

    test("Get match by ID (success - player role)", async () => {
      const res = await request(app)
        .get(`/api/v1/matches/${testMatchId}`)
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", testMatchId);
    });

    test("Get match by ID (success - agent role)", async () => {
      const res = await request(app)
        .get(`/api/v1/matches/${testMatchId}`)
        .set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", testMatchId);
    });

    test("Get match by ID (not found)", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .get(`/api/v1/matches/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Match not found");
    });

    test("Get match by ID (unauthorized - no token)", async () => {
      const res = await request(app).get(`/api/v1/matches/${testMatchId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

  });

  // 4️⃣ Update match
  describe("PUT /api/v1/matches/:id", () => {

    test("Update match (success - single field)", async () => {
      const res = await request(app)
        .put(`/api/v1/matches/${testMatchId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ opponent: "Updated Opponent FC" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Match updated successfully");

      const [rows] = await db.query("SELECT opponent FROM Matches WHERE id = ?", [testMatchId]);
      expect(rows[0].opponent).toBe("Updated Opponent FC");
    });

    test("Update match (success - multiple fields)", async () => {
      const updates = {
        opponent: "Multi Update FC",
        location: "Away",
        team_goals: 2,
        opponent_goals: 2
      };

      const res = await request(app)
        .put(`/api/v1/matches/${testMatchId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Match updated successfully");

      const [rows] = await db.query(
        "SELECT opponent, location, team_goals, opponent_goals FROM Matches WHERE id = ?",
        [testMatchId]
      );
      expect(rows[0].opponent).toBe(updates.opponent);
      expect(rows[0].location).toBe(updates.location);
      expect(rows[0].team_goals).toBe(updates.team_goals);
      expect(rows[0].opponent_goals).toBe(updates.opponent_goals);
    });

    test("Update match (not found)", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .put(`/api/v1/matches/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ opponent: "Test" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Match not found");
    });

    test("Update match (no valid fields)", async () => {
      const res = await request(app)
        .put(`/api/v1/matches/${testMatchId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ invalid_field: "value" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "No fields provided to update");
    });

    test("Update match (invalid location)", async () => {
      const res = await request(app)
        .put(`/api/v1/matches/${testMatchId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ location: "Invalid" });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Update match (invalid match_type)", async () => {
      const res = await request(app)
        .put(`/api/v1/matches/${testMatchId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ match_type: "Invalid" });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Update match (unauthorized - no token)", async () => {
      const res = await request(app)
        .put(`/api/v1/matches/${testMatchId}`)
        .send({ opponent: "Test" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    test("Update match (forbidden - player role)", async () => {
      const res = await request(app)
        .put(`/api/v1/matches/${testMatchId}`)
        .set("Authorization", `Bearer ${playerToken}`)
        .send({ opponent: "Forbidden" });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    test("Update match (forbidden - agent role)", async () => {
      const res = await request(app)
        .put(`/api/v1/matches/${testMatchId}`)
        .set("Authorization", `Bearer ${agentToken}`)
        .send({ opponent: "Forbidden" });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

  });

  // 5️⃣ Delete match
  describe("DELETE /api/v1/matches/:id", () => {

    test("Delete match (success)", async () => {
      const res = await request(app)
        .delete(`/api/v1/matches/${testMatchId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Match deleted successfully");

      const [rows] = await db.query("SELECT * FROM Matches WHERE id = ?", [testMatchId]);
      expect(rows.length).toBe(0);
    });

    test("Delete match (not found)", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .delete(`/api/v1/matches/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Match not found");
    });

    test("Delete match (unauthorized - no token)", async () => {
      // Create a new match to test deletion
      const createRes = await request(app)
        .post("/api/v1/matches")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          date: "2024-11-15T14:00:00.000Z",
          opponent: "ToDelete FC",
          location: "Home",
          match_type: "Friendly",
          team_goals: 1,
          opponent_goals: 0,
          team_id: testTeamId
        });

      const matchIdToDelete = createRes.body.id;

      const res = await request(app).delete(`/api/v1/matches/${matchIdToDelete}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");

      // Cleanup
      await request(app)
        .delete(`/api/v1/matches/${matchIdToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);
    });

    test("Delete match (forbidden - player role)", async () => {
      // Create a new match to test deletion
      const createRes = await request(app)
        .post("/api/v1/matches")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          date: "2024-11-15T14:00:00.000Z",
          opponent: "ToDelete FC 2",
          location: "Away",
          match_type: "Officially",
          team_goals: 0,
          opponent_goals: 1,
          team_id: testTeamId
        });

      const matchIdToDelete = createRes.body.id;

      const res = await request(app)
        .delete(`/api/v1/matches/${matchIdToDelete}`)
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");

      // Cleanup
      await request(app)
        .delete(`/api/v1/matches/${matchIdToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);
    });

    test("Delete match (forbidden - agent role)", async () => {
      // Create a new match to test deletion
      const createRes = await request(app)
        .post("/api/v1/matches")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          date: "2024-11-15T14:00:00.000Z",
          opponent: "ToDelete FC 3",
          location: "Home",
          match_type: "Friendly",
          team_goals: 2,
          opponent_goals: 1,
          team_id: testTeamId
        });

      const matchIdToDelete = createRes.body.id;

      const res = await request(app)
        .delete(`/api/v1/matches/${matchIdToDelete}`)
        .set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");

      // Cleanup
      await request(app)
        .delete(`/api/v1/matches/${matchIdToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);
    });

  });

});
