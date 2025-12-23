const db = require("../db");

const getTeams = async (req, res) => {
  try {
    // return teams along with player count (computed) and map age_limit to ageCategory for frontend
    const sql = `
      SELECT t.id, t.name, t.age_limit, t.coach, t.founded, t.status, COUNT(p.id) AS playerCount
      FROM Teams t
      LEFT JOIN Players p ON p.team_id = t.id
      GROUP BY t.id
      ORDER BY t.name ASC
    `;
    const [rows] = await db.query(sql);

    const mapped = rows.map(r => ({
      id: r.id,
      name: r.name,
      // frontend expects an `ageCategory` like 'U16'
      ageCategory: r.age_limit ? `U${r.age_limit}` : null,
      coach: r.coach || '',
      founded: r.founded || '',
      status: r.status || 'Active',
      playerCount: Number(r.playerCount) || 0,
    }));

    res.status(200).json(mapped);
  } catch (err) {
    console.error("Error in fetching teams: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTeamById = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
      SELECT t.id, t.name, t.age_limit, t.coach, t.founded, t.status, COUNT(p.id) AS playerCount
      FROM Teams t
      LEFT JOIN Players p ON p.team_id = t.id
      WHERE t.id = ?
      GROUP BY t.id
    `;
    const [rows] = await db.query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }
    const r = rows[0];
    const mapped = {
      id: r.id,
      name: r.name,
      ageCategory: r.age_limit ? `U${r.age_limit}` : null,
      coach: r.coach || '',
      founded: r.founded || '',
      status: r.status || 'Active',
      playerCount: Number(r.playerCount) || 0,
    };
    res.status(200).json(mapped);
  } catch (err) {
    console.error("Error fetching team by id : ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addTeam = async (req, res) => {
  const {
    name,
    age_limit,
    coach,
    founded,
    status
  } = req.body;

  try {
    const query = "INSERT INTO Teams (name, age_limit, coach, founded, status) VALUES (?, ?, ?, ?, ?)";
    const value = [name, age_limit, coach || null, founded || null, status || 'Active'];
    const [ result ] = await db.query(query, value);

    res.status(201).json({ 
      message: "Team added successfully",
      id: result.insertId
    });
  } catch (err) {
    console.error("Error adding team: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateTeam = async (req, res) => {
  const { id } = req.params;

  try {
    const [ rows ] = await db.query("SELECT * FROM Teams WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    const fieldsToUpdate = {};
    const allowedFields = ["name", "age_limit", "coach", "founded", "status"];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: "No fields provided to update"});
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const sql = `UPDATE Teams SET ${setClause} WHERE id = ?`;

    await db.query(sql, values);

    res.status(200).json({ message: "Team updated successfully" });
  } catch (err) {
    console.error("Error updating team: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTeam = async (req, res) => {
  const { id } = req.params;

  try {
    const [ result ] = await db.query("DELETE FROM Teams WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json({ message: "Team deleted successfully" });
  } catch (err) {
    console.error("Error deleting team: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getTeams,
  getTeamById,
  addTeam,
  updateTeam,
  deleteTeam,
};