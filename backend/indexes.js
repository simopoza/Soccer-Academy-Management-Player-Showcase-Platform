// indexes.js
const db = require("./db");

const DEFAULT_INDEXES = [
  // =====================
  // Users
  // =====================
  {
    name: "idx_users_role",
    table: "Users",
    column: "role",
  },

  // =====================
  // Teams
  // =====================
  {
    name: "idx_teams_name",
    table: "Teams",
    column: "name",
  },
  {
    name: "idx_teams_age_limit",
    table: "Teams",
    column: "age_limit",
  },

  // =====================
  // Players
  // =====================
  {
    name: "idx_players_team_id",
    table: "Players",
    column: "team_id",
  },
  {
    name: "idx_players_position",
    table: "Players",
    column: "position",
  },
  {
    name: "idx_players_strong_foot",
    table: "Players",
    column: "strong_foot",
  },
  {
    name: "idx_players_birth",
    table: "Players",
    column: "date_of_birth",
  },

  // ⭐ NEW recommended composite index
  {
    name: "idx_players_team_position",
    table: "Players",
    column: "(team_id, position)", // Composite
    composite: true,
  },

  // =====================
  // Matches
  // =====================
  {
    name: "idx_matches_team_id",
    table: "Matches",
    column: "team_id",
  },
  {
    name: "idx_matches_date",
    table: "Matches",
    column: "date",
  },

  // ⭐ NEW recommended composite index
  {
    name: "idx_matches_team_date",
    table: "Matches",
    column: "(team_id, date)",
    composite: true,
  },

  // =====================
  // Stats
  // =====================
  {
    name: "idx_stats_player_id",
    table: "Stats",
    column: "player_id",
  },
  {
    name: "idx_stats_match_id",
    table: "Stats",
    column: "match_id",
  },
  {
    name: "idx_stats_goals",
    table: "Stats",
    column: "goals",
  },
  {
    name: "idx_stats_assists",
    table: "Stats",
    column: "assists",
  },
  {
    name: "idx_stats_rating",
    table: "Stats",
    column: "rating",
  },
];

const checkIfIndexExists = async (table, indexName) => {
  const [rows] = await db.execute(`SHOW INDEX FROM ${table} WHERE Key_name = ?`, [indexName]);
  return rows.length > 0;
};

const createIndex = async (table, column, indexName, composite = false) => {
  console.log(`📌 Creating index ${indexName} on ${table}(${column})...`);
  const sql = composite
    ? `CREATE INDEX ${indexName} ON ${table} ${column}`
    : `CREATE INDEX ${indexName} ON ${table} (${column})`;

  await db.execute(sql);
  console.log(`✅ Index created: ${indexName}`);
};

const ensureIndexes = async () => {
  console.log("🔍 Creating database indexes (if not existing)...");

  for (const { name, table, column, composite } of DEFAULT_INDEXES) {
    const exists = await checkIfIndexExists(table, name);

    if (exists) {
      console.log(`✔ Index already exists: ${name}`);
    } else {
      await createIndex(table, column, name, composite);
    }
  }

  console.log("✅ All indexes verified / created successfully!");
};


module.exports = ensureIndexes;
