const jwt = require("jsonwebtoken");

/**
 * Protect routes – verifies the Bearer JWT in the Authorization header.
 * Attaches { id, role } to req.user on success.
 */
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, authorisation denied." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token is invalid or expired." });
    }
};

module.exports = { protect };
