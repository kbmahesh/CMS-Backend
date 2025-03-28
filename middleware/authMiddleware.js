const jwt = require("jsonwebtoken");
const User = require("../models/Student"); // Ensure you have a User model
// General authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Access Denied! No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const email = decoded.email;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "User not found!" });
        }

        req.user = user; // Attach user data to request
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Token!" });
    }
};

// Role-based access middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden! You do not have permission." });
        }
        next();
    };
};

module.exports = { authenticate, authorizeRoles };
