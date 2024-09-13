const jwt = require("jsonwebtoken");

const SECRET_KEY = "secret_insurolife";

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Access denied");

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user;
    next();
  });
}

module.exports = { SECRET_KEY, authenticateToken };
