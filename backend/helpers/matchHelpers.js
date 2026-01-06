const normalize = (s) => typeof s === 'string' ? s.trim().replace(/\s+/g, ' ').toLowerCase() : null;

// Helper: normalize a DB row into a consistent API payload
const formatMatch = (r) => ({
  id: r.id,
  date: r.date ? (r.date instanceof Date ? r.date.toISOString() : r.date) : null,
  scheduled_start: r.scheduled_start ? (r.scheduled_start instanceof Date ? r.scheduled_start.toISOString() : r.scheduled_start) : null,
  duration_minutes: r.duration_minutes != null ? Number(r.duration_minutes) : null,
  opponent: r.opponent,
  location: r.location,
  competition: r.competition,
  team_id: r.team_id ?? null,
  team_name: r.team_name ?? null,
  team_goals: Number(r.team_goals) ?? 0,
  opponent_goals: Number(r.opponent_goals) ?? 0,
  participant_home_id: r.participant_home_id ?? null,
  participant_away_id: r.participant_away_id ?? null,
  created_at: r.created_at ? (r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at) : null,
  updated_at: r.updated_at ? (r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at) : null,
});

const resolveTeamName = async (conn, teamId, participantHomeId, providedTeamName) => {
  let name = providedTeamName ?? null;
  if (teamId != null && teamId !== '') {
    const [teamRows] = await conn.query('SELECT name FROM Teams WHERE id = ?', [teamId]);
    if (teamRows && teamRows.length > 0) return teamRows[0].name;
    return null;
  }

  if ((teamId == null || teamId === '') && participantHomeId != null) {
    const [pRows] = await conn.query('SELECT p.external_name, c.name AS club_name FROM Participants p LEFT JOIN Clubs c ON p.club_id = c.id WHERE p.id = ?', [participantHomeId]);
    if (pRows && pRows.length > 0) return pRows[0].club_name ?? pRows[0].external_name ?? name;
  }

  return name;
};

const getHomeParticipantForTeam = async (conn, teamId) => {
  if (teamId == null) return null;
  const [pMatch] = await conn.query('SELECT id FROM Participants WHERE club_id = ? LIMIT 1', [teamId]);
  if (pMatch && pMatch.length > 0) return pMatch[0].id;
  return null;
};

const resolveOrCreateAwayParticipant = async (conn, opponent) => {
  const normalizedOpponent = normalize(opponent);
  if (!normalizedOpponent) return null;

  // 1) club by normalized name
  const [clubRows] = await conn.query('SELECT id FROM Clubs WHERE LOWER(name) = ? LIMIT 1', [normalizedOpponent]);
  if (clubRows && clubRows.length > 0) {
    const clubId = clubRows[0].id;
    const [pRows] = await conn.query('SELECT id FROM Participants WHERE club_id = ? LIMIT 1', [clubId]);
    if (pRows && pRows.length > 0) return pRows[0].id;
    try {
      const [ins] = await conn.query('INSERT INTO Participants (club_id, external_name) VALUES (?, NULL)', [clubId]);
      return ins.insertId;
    } catch (err) {
      // If another transaction inserted the same participant concurrently, select it
      if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
        const [retry] = await conn.query('SELECT id FROM Participants WHERE club_id = ? LIMIT 1', [clubId]);
        if (retry && retry.length > 0) return retry[0].id;
      }
      throw err;
    }
  }

  // 2) participant by normalized external_key (generated column)
  const [pExt] = await conn.query('SELECT id FROM Participants WHERE external_key = ? LIMIT 1', [normalizedOpponent]);
  if (pExt && pExt.length > 0) return pExt[0].id;

  // 3) create external participant storing original opponent string
  try {
    const [ins] = await conn.query('INSERT INTO Participants (club_id, external_name) VALUES (NULL, ?)', [opponent]);
    return ins.insertId;
  } catch (err) {
    if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
      // Another transaction created it concurrently — find the existing by normalized external_key
      const [retry] = await conn.query('SELECT id FROM Participants WHERE external_key = ? LIMIT 1', [normalizedOpponent]);
      if (retry && retry.length > 0) return retry[0].id;
    }
    throw err;
  }
};

const findExistingMatch = async (conn, { date, opponent, location, competition, teamId, teamName, participantHomeId, participantAwayId }) => {
  const [existing] = await conn.query(`
    SELECT m.id
    FROM Matches m
    WHERE m.date <=> ? AND m.opponent = ? AND m.location <=> ? AND m.competition = ?
      AND (m.team_id <=> ? AND m.team_name <=> ?) 
      AND m.participant_home_id <=> ? AND m.participant_away_id <=> ?
  `, [date, opponent, location, competition, teamId, teamName, participantHomeId, participantAwayId]);
  if (existing && existing.length > 0) return existing[0].id;
  return null;
};

const insertAndFetchMatch = async (conn, values) => {
  const query = "INSERT INTO Matches (date, scheduled_start, duration_minutes, opponent, location, competition, team_goals, opponent_goals, team_id, team_name, participant_home_id, participant_away_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const [result] = await conn.query(query, values);
  const [rows] = await conn.query(`
    SELECT m.*, COALESCE(m.team_name, t.name) AS team_name
    FROM Matches m
    LEFT JOIN Teams t ON m.team_id = t.id
    WHERE m.id = ?
  `, [result.insertId]);
  return rows[0];
};

const fetchMatchById = async (conn, id) => {
  const [rows] = await conn.query(`
    SELECT m.*, COALESCE(m.team_name, t.name) AS team_name
    FROM Matches m
    LEFT JOIN Teams t ON m.team_id = t.id
    WHERE m.id = ?
    LIMIT 1
  `, [id]);
  return rows && rows.length ? rows[0] : null;
};

const buildUpdateClause = (fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return { setClause: '', values: [] };
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => fields[k]);
  return { setClause, values };
};

const prepareUpdateFields = async (conn, fieldsToUpdate, existingRow) => {
  // Copy to avoid accidental external mutation
  const out = { ...fieldsToUpdate };

  // If team_id is being updated, resolve team_name and auto-link participant_home_id if missing
  if (out.hasOwnProperty('team_id')) {
    const newTeamId = out.team_id ?? null;
    const resolvedTeamName = await resolveTeamName(conn, newTeamId, out.participant_home_id ?? existingRow.participant_home_id, out.team_name ?? existingRow.team_name);
    out.team_name = resolvedTeamName;

    if (!out.hasOwnProperty('participant_home_id')) {
      const homePid = await getHomeParticipantForTeam(conn, newTeamId);
      if (homePid != null) out.participant_home_id = homePid;
    }
  }

  // If participant_home_id updated and team_name not provided, resolve it from participant
  if (out.hasOwnProperty('participant_home_id') && !out.hasOwnProperty('team_name')) {
    const newHome = out.participant_home_id ?? null;
    if (newHome != null) {
      const [pRows] = await conn.query('SELECT p.external_name, c.name AS club_name FROM Participants p LEFT JOIN Clubs c ON p.club_id = c.id WHERE p.id = ?', [newHome]);
      if (pRows && pRows.length > 0) {
        out.team_name = pRows[0].club_name ?? pRows[0].external_name ?? null;
      }
    } else if (!out.hasOwnProperty('team_id')) {
      out.team_name = null;
    }
  }

  // If opponent updated and participant_away_id not provided, resolve/create away participant
  if (out.hasOwnProperty('opponent') && !out.hasOwnProperty('participant_away_id')) {
    const newOpponent = out.opponent ?? null;
    const awayPid = await resolveOrCreateAwayParticipant(conn, newOpponent);
    if (awayPid != null) out.participant_away_id = awayPid;
  }

  return out;
};

module.exports = {
  normalize,
  resolveTeamName,
  getHomeParticipantForTeam,
  resolveOrCreateAwayParticipant,
  findExistingMatch,
  insertAndFetchMatch,
  fetchMatchById,
  buildUpdateClause,
  prepareUpdateFields,
  formatMatch,
};
