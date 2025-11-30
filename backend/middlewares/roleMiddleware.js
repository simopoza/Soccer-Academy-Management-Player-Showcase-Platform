// middlewares/roleMiddleware.js

const hasRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: "Forbidden: No role found" });
    }

    const { role, id: userId } = req.user;
    const paramId = req.params.id ? parseInt(req.params.id, 10) : null;

    if (role === 'player' && paramId !== null && isNaN(paramId)) {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    if (allowedRoles.includes(role) || (role === "player" && paramId !== null && userId === paramId)) {
      return next();
    }

    return res.status(403).json({ 
      error: `Forbidden: Role '${role}' cannot access this resource` 
    });
  };
};

module.exports = { hasRole };
