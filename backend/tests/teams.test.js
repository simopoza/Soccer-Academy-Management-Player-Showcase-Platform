const request = require("supertest");
const app = require("../index");
const db = require("../db");

let adminToken;
let adminUserId;
let playerToken;
let playerUserId;
let agentToken;
let agentUserId;
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
  await db.end();
});

describe("Teams API", () => {

  // 0️⃣ Setup: Create admin, player, agent users
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
  });

  // 1️⃣ Add new team
  describe("POST /api/v1/teams", () => {

    test("Add new team (success)", async () => {
      const res = await request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Team U15",
          age_limit: 15
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Team added successfully");
      expect(res.body).toHaveProperty("id");

      testTeamId = res.body.id;
    });

    test("Add new team (unauthorized - no token)", async () => {
      const res = await request(app)
        .post("/api/v1/teams")
        .send({
          name: "Unauthorized Team",
          age_limit: 14
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    test("Add new team (forbidden - player role)", async () => {
      const res = await request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${playerToken}`)
        .send({
          name: "Player Team",
          age_limit: 14
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    test("Add new team (forbidden - agent role)", async () => {
      const res = await request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${agentToken}`)
        .send({
          name: "Agent Team",
          age_limit: 14
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    test("Add new team (invalid age_limit - too low)", async () => {
      const res = await request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Invalid Team",
          age_limit: 8
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Add new team (invalid age_limit - too high)", async () => {
      const res = await request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Invalid Team",
          age_limit: 18
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Add new team (missing name)", async () => {
      const res = await request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          age_limit: 15
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

  });

  // 2️⃣ Get all teams
  describe("GET /api/v1/teams", () => {

    test("Get all teams (success - admin)", async () => {
      const res = await request(app)
        .get("/api/v1/teams")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test("Get all teams (success - player role)", async () => {
      const res = await request(app)
        .get("/api/v1/teams")
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("Get all teams (success - agent role)", async () => {
      const res = await request(app)
        .get("/api/v1/teams")
        .set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("Get all teams (unauthorized - no token)", async () => {
      const res = await request(app).get("/api/v1/teams");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

  });

  // 3️⃣ Get team by ID
  describe("GET /api/v1/teams/:id", () => {

    test("Get team by ID (success - admin)", async () => {
      const res = await request(app)
        .get(`/api/v1/teams/${testTeamId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", testTeamId);
      expect(res.body).toHaveProperty("name", "Test Team U15");
      expect(res.body).toHaveProperty("age_limit", 15);
    });

    test("Get team by ID (success - player role)", async () => {
      const res = await request(app)
        .get(`/api/v1/teams/${testTeamId}`)
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", testTeamId);
    });

    test("Get team by ID (success - agent role)", async () => {
      const res = await request(app)
        .get(`/api/v1/teams/${testTeamId}`)
        .set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", testTeamId);
    });

    test("Get team by ID (not found)", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .get(`/api/v1/teams/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Team not found");
    });

    test("Get team by ID (unauthorized - no token)", async () => {
      const res = await request(app).get(`/api/v1/teams/${testTeamId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

  });

  // 4️⃣ Update team
  describe("PUT /api/v1/teams/:id", () => {

    test("Update team (success - single field)", async () => {
      const res = await request(app)
        .put(`/api/v1/teams/${testTeamId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Updated Team U15" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Team updated successfully");

      const [rows] = await db.query("SELECT name FROM Teams WHERE id = ?", [testTeamId]);
      expect(rows[0].name).toBe("Updated Team U15");
    });

    test("Update team (success - multiple fields)", async () => {
      const updates = {
        name: "Multi Update Team",
        age_limit: 16
      };

      const res = await request(app)
        .put(`/api/v1/teams/${testTeamId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Team updated successfully");

      const [rows] = await db.query("SELECT name, age_limit FROM Teams WHERE id = ?", [testTeamId]);
      expect(rows[0].name).toBe(updates.name);
      expect(rows[0].age_limit).toBe(updates.age_limit);
    });

    test("Update team (not found)", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .put(`/api/v1/teams/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Test" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Team not found");
    });

    test("Update team (no valid fields)", async () => {
      const res = await request(app)
        .put(`/api/v1/teams/${testTeamId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ invalid_field: "value" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "No fields provided to update");
    });

    test("Update team (invalid age_limit)", async () => {
      const res = await request(app)
        .put(`/api/v1/teams/${testTeamId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ age_limit: 20 });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("Update team (unauthorized - no token)", async () => {
      const res = await request(app)
        .put(`/api/v1/teams/${testTeamId}`)
        .send({ name: "Test" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    test("Update team (forbidden - player role)", async () => {
      const res = await request(app)
        .put(`/api/v1/teams/${testTeamId}`)
        .set("Authorization", `Bearer ${playerToken}`)
        .send({ name: "Forbidden" });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    test("Update team (forbidden - agent role)", async () => {
      const res = await request(app)
        .put(`/api/v1/teams/${testTeamId}`)
        .set("Authorization", `Bearer ${agentToken}`)
        .send({ name: "Forbidden" });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

  });

  // 5️⃣ Delete team
  describe("DELETE /api/v1/teams/:id", () => {

    test("Delete team (success)", async () => {
      const res = await request(app)
        .delete(`/api/v1/teams/${testTeamId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Team deleted successfully");

      const [rows] = await db.query("SELECT * FROM Teams WHERE id = ?", [testTeamId]);
      expect(rows.length).toBe(0);
    });

    test("Delete team (not found)", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .delete(`/api/v1/teams/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Team not found");
    });

    test("Delete team (unauthorized - no token)", async () => {
      // Create a new team to test deletion
      const createRes = await request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "ToDelete Team",
          age_limit: 13
        });

      const teamIdToDelete = createRes.body.id;

      const res = await request(app).delete(`/api/v1/teams/${teamIdToDelete}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");

      // Cleanup
      await request(app)
        .delete(`/api/v1/teams/${teamIdToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);
    });

    test("Delete team (forbidden - player role)", async () => {
      // Create a new team to test deletion
      const createRes = await request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "ToDelete Team 2",
          age_limit: 13
        });

      const teamIdToDelete = createRes.body.id;

      const res = await request(app)
        .delete(`/api/v1/teams/${teamIdToDelete}`)
        .set("Authorization", `Bearer ${playerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");

      // Cleanup
      await request(app)
        .delete(`/api/v1/teams/${teamIdToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);
    });

    test("Delete team (forbidden - agent role)", async () => {
      // Create a new team to test deletion
      const createRes = await request(app)
        .post("/api/v1/teams")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "ToDelete Team 3",
          age_limit: 13
        });

      const teamIdToDelete = createRes.body.id;

      const res = await request(app)
        .delete(`/api/v1/teams/${teamIdToDelete}`)
        .set("Authorization", `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");

      // Cleanup
      await request(app)
        .delete(`/api/v1/teams/${teamIdToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);
    });

  });

});
