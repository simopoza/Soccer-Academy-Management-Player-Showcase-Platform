const request = require('supertest');

// Provide an in-memory mock for the DB so tests don't require a real MySQL
// This mock implements the small subset of SQL operations used by the
// controllers/tests (INSERT/SELECT/UPDATE/DELETE, getConnection/transaction).
function createMockDb() {
  const state = {
    users: [],
    players: [],
    teams: [],
    passwordResets: [],
    counters: { users: 1, players: 1, teams: 1, passwordResets: 1 }
  };

  const toRows = (arr) => arr.map(r => ({ ...r }));

  const pool = {
    async query(sql, params = []) {
      const s = String(sql).trim();

      // INSERT statements: attempt to parse columns and VALUES to construct records
      if (/^INSERT INTO Users/i.test(s)) {
        const colsMatch = s.match(/INSERT INTO Users \(([^)]+)\) VALUES\s*\(([^)]+)\)/i);
        let cols = [];
        let valuesTokens = [];
        if (colsMatch) {
          cols = colsMatch[1].split(',').map(c => c.trim());
          valuesTokens = colsMatch[2].split(',').map(v => v.trim());
        }
        const id = state.counters.users++;
        const row = { id };
        let paramIndex = 0;
        cols.forEach((col, i) => {
          const token = valuesTokens[i];
          if (token === '?') {
            row[col] = params[paramIndex++];
          } else if (/^'.*'$/.test(token)) {
            row[col] = token.slice(1, -1);
          } else if (/^TRUE$/i.test(token)) {
            row[col] = true;
          } else if (/^FALSE$/i.test(token)) {
            row[col] = false;
          } else if (/^NOW\(\)$/i.test(token)) {
            row[col] = new Date();
          } else if (/^\d+$/.test(token)) {
            row[col] = Number(token);
          } else {
            row[col] = params[paramIndex++] || null;
          }
        });
        state.users.push(row);
        return [{ insertId: id }];
      }

      if (/^INSERT INTO Teams/i.test(s)) {
        const colsMatch = s.match(/INSERT INTO Teams \(([^)]+)\) VALUES\s*\(([^)]+)\)/i);
        let cols = [];
        let valuesTokens = [];
        if (colsMatch) {
          cols = colsMatch[1].split(',').map(c => c.trim());
          valuesTokens = colsMatch[2].split(',').map(v => v.trim());
        }
        const id = state.counters.teams++;
        const row = { id };
        let paramIndex = 0;
        cols.forEach((col, i) => {
          const token = valuesTokens[i];
          if (token === '?') row[col] = params[paramIndex++];
          else if (/^'.*'$/.test(token)) row[col] = token.slice(1, -1);
          else if (/^\d+$/.test(token)) row[col] = Number(token);
          else row[col] = params[paramIndex++] || null;
        });
        state.teams.push(row);
        return [{ insertId: id }];
      }

      if (/^INSERT INTO Players/i.test(s)) {
        const colsMatch = s.match(/INSERT INTO Players \(([^)]+)\) VALUES\s*\(([^)]+)\)/i);
        let cols = [];
        let valuesTokens = [];
        if (colsMatch) {
          cols = colsMatch[1].split(',').map(c => c.trim());
          valuesTokens = colsMatch[2].split(',').map(v => v.trim());
        }
        const id = state.counters.players++;
        const row = { id };
        let paramIndex = 0;
        cols.forEach((col, i) => {
          const token = valuesTokens[i];
          if (token === '?') row[col] = params[paramIndex++];
          else if (/^'.*'$/.test(token)) row[col] = token.slice(1, -1);
          else if (/^\d+$/.test(token)) row[col] = Number(token);
          else row[col] = params[paramIndex++] || null;
        });
        state.players.push(row);
        return [{ insertId: id }];
      }

      if (/^INSERT INTO PasswordResets/i.test(s)) {
        const colsMatch = s.match(/INSERT INTO PasswordResets \(([^)]+)\) VALUES\s*\(([^)]+)\)/i);
        let cols = [];
        let valuesTokens = [];
        if (colsMatch) {
          cols = colsMatch[1].split(',').map(c => c.trim());
          valuesTokens = colsMatch[2].split(',').map(v => v.trim());
        }
        const id = state.counters.passwordResets++;
        const row = { id };
        let paramIndex = 0;
        cols.forEach((col, i) => {
          const token = valuesTokens[i];
          if (token === '?') row[col] = params[paramIndex++];
          else if (/^'.*'$/.test(token)) row[col] = token.slice(1, -1);
          else if (/^\d+$/.test(token)) row[col] = Number(token);
          else if (/^NOW\(\)$/i.test(token)) row[col] = new Date();
          else row[col] = params[paramIndex++] || null;
        });
        state.passwordResets.push(row);
        return [{ insertId: id }];
      }

      // SELECT patterns
      if (/FROM Users WHERE email = \?/i.test(s) && /^SELECT/i.test(s)) {
        const email = params[0];
        const rows = state.users.filter(u => u.email === email);
        return [toRows(rows)];
      }

      if (/SELECT \* FROM Users WHERE email = \?/i.test(s)) {
        const email = params[0];
        const rows = state.users.filter(u => u.email === email);
        return [toRows(rows)];
      }

      if (/SELECT id FROM Users WHERE email = \?/i.test(s)) {
        const email = params[0];
        const rows = state.users.filter(u => u.email === email).map(u => ({ id: u.id }));
        return [toRows(rows)];
      }

      if (/SELECT id FROM Players WHERE user_id = \?/i.test(s)) {
        const userId = params[0];
        const rows = state.players.filter(p => p.user_id === userId).map(p => ({ id: p.id }));
        return [toRows(rows)];
      }

      if (/SELECT \* FROM PasswordResets WHERE user_id = \?/i.test(s) || /SELECT \* FROM PasswordResets WHERE user_id = \?/i.test(s)) {
        const userId = params[0];
        const rows = state.passwordResets.filter(t => t.user_id === userId);
        return [toRows(rows)];
      }

      if (/SELECT user_id, expires_at, used FROM PasswordResets WHERE token = \? AND used = FALSE/i.test(s)) {
        const token = params[0];
        const rows = state.passwordResets.filter(t => t.token === token && t.used === false);
        return [toRows(rows)];
      }

      if (/SELECT id FROM Users WHERE id = \?/i.test(s) || /SELECT id FROM Users WHERE email = \?/i.test(s)) {
        const val = params[0];
        const rows = state.users.filter(u => u.id === val || u.email === val).map(u => ({ id: u.id }));
        return [toRows(rows)];
      }

      // Generic SELECT from Teams
      if (/SELECT .* FROM Teams/i.test(s)) {
        return [toRows(state.teams)];
      }

      // DELETE
      if (/^DELETE FROM Players WHERE id = \?/i.test(s)) {
        const id = params[0];
        const before = state.players.length;
        state.players = state.players.filter(p => p.id !== id);
        return [{ affectedRows: before - state.players.length }];
      }

      if (/^DELETE FROM Users WHERE id = \?/i.test(s)) {
        const id = params[0];
        const before = state.users.length;
        state.users = state.users.filter(u => u.id !== id);
        return [{ affectedRows: before - state.users.length }];
      }

      if (/^DELETE FROM Teams WHERE id = \?/i.test(s)) {
        const id = params[0];
        const before = state.teams.length;
        state.teams = state.teams.filter(t => t.id !== id);
        return [{ affectedRows: before - state.teams.length }];
      }

      if (/^DELETE FROM PasswordResets WHERE user_id = \?/i.test(s)) {
        const userId = params[0];
        const before = state.passwordResets.length;
        state.passwordResets = state.passwordResets.filter(t => t.user_id !== userId);
        return [{ affectedRows: before - state.passwordResets.length }];
      }

      // UPDATE Users SET profile_completed = TRUE WHERE id = ?
      if (/^UPDATE Users SET profile_completed = TRUE WHERE id = \?/i.test(s)) {
        const id = params[0];
        const usr = state.users.find(u => u.id === id);
        if (usr) { usr.profile_completed = true; return [{ affectedRows: 1 }]; }
        return [{ affectedRows: 0 }];
      }

      if (/^UPDATE Users SET password = \? WHERE id = \?/i.test(s)) {
        const pwd = params[0]; const id = params[1];
        const usr = state.users.find(u => u.id === id);
        if (usr) { usr.password = pwd; return [{ affectedRows: 1 }]; }
        return [{ affectedRows: 0 }];
      }

      if (/^UPDATE PasswordResets SET used = TRUE WHERE token = \?/i.test(s)) {
        const token = params[0];
        const pr = state.passwordResets.find(p => p.token === token);
        if (pr) { pr.used = true; return [{ affectedRows: 1 }]; }
        return [{ affectedRows: 0 }];
      }

      // Generic fallback: return empty result to avoid crashing tests for unhandled queries
      return [[]];
    },

    async getConnection() {
      // A connection shares the same state but exposes transaction methods
      const conn = Object.create(this);
      conn._inTransaction = false;
      conn.beginTransaction = async () => { conn._inTransaction = true; };
      conn.commit = async () => { conn._inTransaction = false; };
      conn.rollback = async () => { conn._inTransaction = false; };
      conn.release = () => {};
      return conn;
    },

    async end() {
      // no-op for mock
    },

    // expose state for tests if needed
    __state: state
  };

  return pool;
}

const mockDb = createMockDb();

jest.mock('../db', () => mockDb);

// Mock email service so tests don't send real emails
jest.mock('../helpers/emailService', () => ({
  sendResetEmail: jest.fn(() => Promise.resolve(true)),
}));

const db = require('../db');

// Ensure JWT secrets are present for tests (avoids requiring changes to .env)
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';
process.env.TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '1h';
process.env.REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const app = require('../index');

let adminToken;
let adminUserId;
let createdUserIds = [];
let createdPlayerIds = [];
let testTeamId;

afterAll(async () => {
  // cleanup created players
  for (const pid of createdPlayerIds) {
    await db.query('DELETE FROM Players WHERE id = ?', [pid]);
  }
  // cleanup created users
  for (const uid of createdUserIds) {
    await db.query('DELETE FROM Users WHERE id = ?', [uid]);
  }
  if (testTeamId) {
    await db.query('DELETE FROM Teams WHERE id = ?', [testTeamId]);
  }
  await db.end();
});

describe('Admin create player with user flow', () => {
  beforeAll(async () => {
    // create admin
    const email = `admintest+${Date.now()}@mail.com`;
    const pass = 'Admin123!';
    // create admin directly in DB (registration endpoint disallows admin creation)
    const { hashPassword } = require('../helpers/hashPassword');
    const hashed = await hashPassword(pass);
    const [insertRes] = await db.query(
      `INSERT INTO Users (first_name, last_name, email, password, role, status, profile_completed, approved_at) VALUES (?, ?, ?, ?, 'admin', 'approved', TRUE, NOW())`,
      ['Admin', 'Test', email, hashed]
    );
    adminUserId = insertRes.insertId;
    createdUserIds.push(adminUserId);

    // login to obtain token
    const res = await request(app).post('/api/v1/auth/login').send({ email, password: pass });
    adminToken = res.body.token;

    // create a team
    const [teamRes] = await db.query('INSERT INTO Teams (name, age_limit) VALUES (?, ?)', ['AdminTestTeam', 16]);
    testTeamId = teamRes.insertId;
  });

  test('create player without email -> user_id null', async () => {
    const payload = { first_name: 'NoEmail', last_name: 'Player', position: 'GK', team_id: testTeamId };
    const res = await request(app).post('/api/v1/players/admin-create').set('Authorization', `Bearer ${adminToken}`).send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('user_id', null);
    createdPlayerIds.push(res.body.id);
  });

  test('create player with new email (sendInvite=false) -> creates user + password reset token', async () => {
    const email = `invited+${Date.now()}@mail.com`;
    const payload = { first_name: 'Invited', last_name: 'Player', email, sendInvite: false, position: 'CM' };
    const res = await request(app).post('/api/v1/players/admin-create').set('Authorization', `Bearer ${adminToken}`).send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.user_id).toBeGreaterThan(0);
    createdPlayerIds.push(res.body.id);
    createdUserIds.push(res.body.user_id);

    // ensure password reset token was created
    const [tokens] = await db.query('SELECT * FROM PasswordResets WHERE user_id = ?', [res.body.user_id]);
    expect(tokens.length).toBeGreaterThan(0);
  });

  test('creating same email again returns 409 with existing player id', async () => {
    const email = `dup+${Date.now()}@mail.com`;
    // first create
    const r1 = await request(app).post('/api/v1/players/admin-create').set('Authorization', `Bearer ${adminToken}`).send({ first_name: 'Dup', last_name: 'One', email, position: 'CM' });
    expect(r1.statusCode).toBe(201);
    createdPlayerIds.push(r1.body.id);
    createdUserIds.push(r1.body.user_id);

    // second create should return 409
    const r2 = await request(app).post('/api/v1/players/admin-create').set('Authorization', `Bearer ${adminToken}`).send({ first_name: 'Dup', last_name: 'Two', email, position: 'CM' });
    expect(r2.statusCode).toBe(409);
    expect(r2.body).toHaveProperty('player_id');
  });

  test('link to existing user without player -> uses existing user record', async () => {
    // create a user (role agent) that has no player
    const email = `exist+${Date.now()}@mail.com`;
    await request(app).post('/api/v1/auth/register').send({ email, password: 'Test1234!', first_name: 'Exist', last_name: 'User', role: 'agent' });
    const [rows] = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
    const existingUserId = rows[0].id;
    createdUserIds.push(existingUserId);

    const res = await request(app).post('/api/v1/players/admin-create').set('Authorization', `Bearer ${adminToken}`).send({ first_name: 'Link', last_name: 'User', email, position: 'LW' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user_id).toBe(existingUserId);
    createdPlayerIds.push(res.body.id);
  });

});
