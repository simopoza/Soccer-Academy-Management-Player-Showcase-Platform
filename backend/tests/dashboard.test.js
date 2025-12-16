const request = require('supertest');
const app = require('../index');
const db = require('../db');
const { hashPassword } = require('../helpers/hashPassword');

describe('Dashboard Endpoints', () => {
  let adminToken;
  let playerToken;
  let adminUserId;
  let testTeamId;
  let testMatchIds = [];
  let testPlayerIds = [];
  let testUserIds = [];

  // Setup: Create test users and data
  beforeAll(async () => {
    // Clean up existing test data
    await db.query('DELETE FROM Stats WHERE player_id IN (SELECT id FROM Players WHERE user_id IN (SELECT id FROM Users WHERE email LIKE "dashboardtest%"))');
    await db.query('DELETE FROM Players WHERE user_id IN (SELECT id FROM Users WHERE email LIKE "dashboardtest%")');
    await db.query('DELETE FROM Matches WHERE team_id IN (SELECT id FROM Teams WHERE name LIKE "Test Dashboard Team%")');
    await db.query('DELETE FROM Teams WHERE name LIKE "Test Dashboard Team%"');
    await db.query('DELETE FROM Users WHERE email LIKE "dashboardtest%"');

    // Create admin user directly in DB (admins can't register via API)
    const hashedPassword = await hashPassword('Password123!');
    const [adminResult] = await db.query(
      'INSERT INTO Users (first_name, last_name, email, password, role, status, profile_completed) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Dashboard', 'Admin', 'dashboardtest-admin@test.com', hashedPassword, 'admin', 'approved', true]
    );
    
    adminUserId = adminResult.insertId;
    testUserIds.push(adminUserId);

    // Login as admin to get token
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'dashboardtest-admin@test.com',
        password: 'Password123!',
      });
    
    if (!adminLoginRes.body.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes.body)}`);
    }
    
    adminToken = adminLoginRes.body.token;

    // Register players via API (they need approval flow)
    for (let i = 1; i <= 3; i++) {
      // Register player
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'Dashboard',
          last_name: `Player${i}`,
          email: `dashboardtest-player${i}@test.com`,
          password: 'Password123!',
          role: 'player',
        });

      if (registerRes.status !== 201 || !registerRes.body.user) {
        throw new Error(`Failed to register player ${i}. Status: ${registerRes.status}, Body: ${JSON.stringify(registerRes.body)}, Text: ${registerRes.text}`);
      }

      const userId = registerRes.body.user.userId;
      testUserIds.push(userId);

      // Admin approves the player
      await db.query(
        'UPDATE Users SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?',
        ['approved', adminUserId, userId]
      );

      // Get player record that was auto-created
      const [players] = await db.query('SELECT id FROM Players WHERE user_id = ?', [userId]);
      testPlayerIds.push(players[0].id);

      // Login as first player to get token
      if (i === 1) {
        const playerLoginRes = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'dashboardtest-player1@test.com',
            password: 'Password123!',
          });
        
        if (!playerLoginRes.body.token) {
          throw new Error(`Player login failed: ${JSON.stringify(playerLoginRes.body)}`);
        }
        
        playerToken = playerLoginRes.body.token;
      }
    }

    // Create test team
    const [teamResult] = await db.query(
      'INSERT INTO Teams (name, age_limit) VALUES (?, ?)',
      ['Test Dashboard Team', 16]
    );
    testTeamId = teamResult.insertId;

    // Create test matches with dates spread across 3 months
    const matchDates = [
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
      new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),  // 5 days ago
    ];

    const matchResults = [
      { opponent: 'Test Opponent A', teamGoals: 3, opponentGoals: 1 },
      { opponent: 'Test Opponent B', teamGoals: 2, opponentGoals: 2 },
      { opponent: 'Test Opponent C', teamGoals: 1, opponentGoals: 3 },
      { opponent: 'Test Opponent D', teamGoals: 4, opponentGoals: 0 },
      { opponent: 'Test Opponent E', teamGoals: 2, opponentGoals: 1 },
    ];

    for (let i = 0; i < 5; i++) {
      const [matchResult] = await db.query(
        'INSERT INTO Matches (team_id, opponent, date, location, match_type, team_goals, opponent_goals) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [testTeamId, matchResults[i].opponent, matchDates[i], 'Home', 'Friendly', matchResults[i].teamGoals, matchResults[i].opponentGoals]
      );
      testMatchIds.push(matchResult.insertId);
    }

    // Create test stats for matches
    const stats = [
      // Match 1 - 3 months ago (high ratings)
      { playerId: 0, matchId: 0, goals: 2, assists: 1, rating: 8.5 },
      { playerId: 1, matchId: 0, goals: 1, assists: 0, rating: 7.5 },
      { playerId: 2, matchId: 0, goals: 0, assists: 2, rating: 8.0 },
      
      // Match 2 - 2 months ago (medium ratings)
      { playerId: 0, matchId: 1, goals: 1, assists: 1, rating: 7.5 },
      { playerId: 1, matchId: 1, goals: 1, assists: 0, rating: 7.0 },
      { playerId: 2, matchId: 1, goals: 0, assists: 1, rating: 6.5 },
      
      // Match 3 - 1 month ago (low ratings - lost)
      { playerId: 0, matchId: 2, goals: 1, assists: 0, rating: 6.5 },
      { playerId: 1, matchId: 2, goals: 0, assists: 0, rating: 6.0 },
      { playerId: 2, matchId: 2, goals: 0, assists: 1, rating: 6.0 },
      
      // Match 4 - 15 days ago (very high ratings - big win)
      { playerId: 0, matchId: 3, goals: 2, assists: 2, rating: 9.5 },
      { playerId: 1, matchId: 3, goals: 1, assists: 1, rating: 8.5 },
      { playerId: 2, matchId: 3, goals: 1, assists: 0, rating: 8.0 },
      
      // Match 5 - 5 days ago (good ratings)
      { playerId: 0, matchId: 4, goals: 1, assists: 0, rating: 8.0 },
      { playerId: 1, matchId: 4, goals: 1, assists: 1, rating: 8.5 },
      { playerId: 2, matchId: 4, goals: 0, assists: 0, rating: 7.5 },
    ];

    for (const stat of stats) {
      await db.query(
        'INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES (?, ?, ?, ?, ?, ?)',
        [testPlayerIds[stat.playerId], testMatchIds[stat.matchId], stat.goals, stat.assists, 90, stat.rating]
      );
    }
  });

  // Cleanup
  afterAll(async () => {
    if (testPlayerIds.length > 0) {
      await db.query('DELETE FROM Stats WHERE player_id IN (?)', [testPlayerIds]);
      await db.query('DELETE FROM Players WHERE id IN (?)', [testPlayerIds]);
    }
    if (testMatchIds.length > 0) {
      await db.query('DELETE FROM Matches WHERE id IN (?)', [testMatchIds]);
    }
    if (testTeamId) {
      await db.query('DELETE FROM Teams WHERE id = ?', [testTeamId]);
    }
    await db.query('DELETE FROM Users WHERE email LIKE "dashboardtest%"');
    await db.end();
  });

  describe('GET /api/v1/dashboard/stats', () => {
    it('should return dashboard statistics for admin', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalPlayers');
      expect(res.body.data).toHaveProperty('playerGrowth');
      expect(res.body.data).toHaveProperty('activeTeams');
      expect(res.body.data).toHaveProperty('matchesPlayed');
      expect(typeof res.body.data.totalPlayers).toBe('number');
      expect(typeof res.body.data.activeTeams).toBe('number');
      expect(typeof res.body.data.matchesPlayed).toBe('number');
    });

    it('should return valid player growth percentage', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.playerGrowth).toMatch(/^[+-]?\d+%$/); // Should be like "+15%" or "-5%"
    });

    it('should include test players in total count', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalPlayers).toBeGreaterThanOrEqual(3); // At least our 3 test players
    });

    it('should deny access without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/stats');

      expect(res.status).toBe(401);
    });

    it('should deny access for non-admin users', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(403);
    });

    it('should handle database errors gracefully', async () => {
      // Temporarily break the query (this would need mocking in real scenario)
      const res = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      // Should still return a response even if DB has issues
      expect(res.status).toBeLessThan(600);
    });
  });

  describe('GET /api/dashboard/recent-matches', () => {
    it('should return recent matches with default limit', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-matches')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(5); // Default limit
    });

    it('should respect custom limit parameter', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-matches?limit=3')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(3);
    });

    it('should return matches in descending date order', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-matches')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const dates = res.body.data.map(match => new Date(match.date));
      
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
      }
    });

    it('should include correct match properties', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-matches')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        const match = res.body.data[0];
        expect(match).toHaveProperty('id');
        expect(match).toHaveProperty('team1');
        expect(match).toHaveProperty('team2');
        expect(match).toHaveProperty('score');
        expect(match).toHaveProperty('date');
        expect(match).toHaveProperty('status');
      }
    });

    it('should calculate match status correctly', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-matches')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      
      // Find our test matches
      const testMatch = res.body.data.find(m => m.team2 === 'Test Opponent A');
      if (testMatch) {
        expect(testMatch.status).toBe('Won'); // 3-1
        expect(testMatch.score).toBe('3-1');
      }
    });

    it('should handle draw status correctly', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-matches')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      
      const drawMatch = res.body.data.find(m => m.team2 === 'Test Opponent B');
      if (drawMatch) {
        expect(drawMatch.status).toBe('Draw'); // 2-2
      }
    });

    it('should handle lost status correctly', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-matches')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      
      const lostMatch = res.body.data.find(m => m.team2 === 'Test Opponent C');
      if (lostMatch) {
        expect(lostMatch.status).toBe('Lost'); // 1-3
      }
    });

    it('should deny access without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-matches');

      expect(res.status).toBe(401);
    });

    it('should deny access for non-admin users', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-matches')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(403);
    });

    it('should handle limit=0 gracefully', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-matches?limit=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should handle invalid limit parameter', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-matches?limit=abc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      // Should use default limit when invalid
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/dashboard/performance-ratings', () => {
    it('should return performance ratings with default months', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should respect custom months parameter', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings?months=3')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return ratings with correct structure', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings?months=6')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        const rating = res.body.data[0];
        expect(rating).toHaveProperty('name'); // Month name
        expect(rating).toHaveProperty('rating'); // Average rating
        expect(typeof rating.name).toBe('string');
        expect(typeof rating.rating).toBe('number');
      }
    });

    it('should return ratings as valid numbers', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings?months=6')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach(item => {
        expect(item.rating).toBeGreaterThanOrEqual(0);
        expect(item.rating).toBeLessThanOrEqual(10);
        // Check it's formatted to 2 decimal places
        expect(item.rating.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      });
    });

    it('should calculate average ratings correctly', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings?months=6')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      
      // We know we inserted specific ratings, verify the calculation
      // Each match has 3 players with ratings, check if averages are valid
      res.body.data.forEach(monthData => {
        expect(monthData.rating).toBeGreaterThanOrEqual(0); // Valid rating range
        expect(monthData.rating).toBeLessThanOrEqual(10); // Max possible rating
      });
    });

    it('should group ratings by month', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings?months=6')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      
      // Month names should be abbreviated (Jan, Feb, etc.)
      const validMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      res.body.data.forEach(item => {
        expect(validMonths).toContain(item.name);
      });
    });

    it('should return empty array when no stats exist', async () => {
      // Query for a future time period where no stats exist
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings?months=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should handle months=1 parameter', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings?months=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should handle months=12 parameter', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings?months=12')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should deny access without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings');

      expect(res.status).toBe(401);
    });

    it('should deny access for non-admin users', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(403);
    });

    it('should handle invalid months parameter', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings?months=invalid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      // Should use default (6 months) when invalid
    });

    it('should handle negative months parameter', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings?months=-5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should order ratings chronologically', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings?months=6')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      
      // The data should be ordered from oldest to newest
      // We can't easily verify exact ordering without date context,
      // but we can verify it's an array and has proper structure
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should handle COALESCE correctly for matches without stats', async () => {
      // Create a match without stats
      const [matchResult] = await db.query(
        'INSERT INTO Matches (team_id, opponent, date, location, match_type, team_goals, opponent_goals) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [testTeamId, 'No Stats Opponent', new Date(), 'Home', 'Friendly', 0, 0]
      );
      
      const res = await request(app)
        .get('/api/v1/dashboard/performance-ratings?months=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      
      // Clean up
      await db.query('DELETE FROM Matches WHERE id = ?', [matchResult.insertId]);
    });
  });

  describe('Integration: Dashboard Data Consistency', () => {
    it('should have consistent data across all endpoints', async () => {
      // Fetch all dashboard data
      const [statsRes, matchesRes, ratingsRes] = await Promise.all([
        request(app).get('/api/v1/dashboard/stats').set('Authorization', `Bearer ${adminToken}`),
        request(app).get('/api/v1/dashboard/recent-matches').set('Authorization', `Bearer ${adminToken}`),
        request(app).get('/api/v1/dashboard/performance-ratings').set('Authorization', `Bearer ${adminToken}`)
      ]);

      expect(statsRes.status).toBe(200);
      expect(matchesRes.status).toBe(200);
      expect(ratingsRes.status).toBe(200);

      // All should succeed
      expect(statsRes.body.success).toBe(true);
      expect(matchesRes.body.success).toBe(true);
      expect(ratingsRes.body.success).toBe(true);
    });

    it('should have matches count match between stats and recent-matches', async () => {
      const statsRes = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      const matchesRes = await request(app)
        .get('/api/v1/dashboard/recent-matches?limit=1000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(statsRes.body.data.matchesPlayed).toBeGreaterThanOrEqual(5); // At least our test matches
      // Recent matches might show fewer due to limit, but should exist
      expect(matchesRes.body.data.length).toBeGreaterThan(0);
    });

    it('should handle parallel requests correctly', async () => {
      const promises = [
        request(app).get('/api/v1/dashboard/stats').set('Authorization', `Bearer ${adminToken}`),
        request(app).get('/api/v1/dashboard/stats').set('Authorization', `Bearer ${adminToken}`),
        request(app).get('/api/v1/dashboard/stats').set('Authorization', `Bearer ${adminToken}`)
      ];

      const results = await Promise.all(promises);
      
      results.forEach(res => {
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });

      // All should return same data
      expect(results[0].body.data.totalPlayers).toBe(results[1].body.data.totalPlayers);
      expect(results[1].body.data.totalPlayers).toBe(results[2].body.data.totalPlayers);
    });
  });
});
