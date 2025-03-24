import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authenticate } from "../middleware/authMiddleware.js"

const router = express.Router();

// Create Admin
router.post("/create-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required!" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters long" });
    }

    // Check if admin already exists
    let admin = await User.findOne({ email });
    if (admin) return res.status(400).json({ msg: "Admin already exists!" });

    // // Hash the password
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin user
    admin = new User({
      name,
      email,
      password: password,
      role: "admin",
    });

    await admin.save();
    res.status(201).json({ msg: "Admin created successfully!" });

  } catch (error) {
    console.error("Error in /create-admin:", error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Register User
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
    });
  } catch (error) {
    console.error("Error in /login:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
      res.json(req.user); // Return user data from middleware
  } catch (error) {
      res.status(500).json({ message: "Server error" });
  }
});

export default router;