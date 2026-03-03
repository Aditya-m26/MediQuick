const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helper: sign a JWT ───────────────────────────────────────────────────────
const signToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

// ─── Helper: safe user object (no password) ───────────────────────────────────
const safeUser = (user) => {
    const obj = user.toObject();
    delete obj.password;
    return obj;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
    try {
        const { role, email, password } = req.body;

        // Basic validation
        if (!role || !email || !password) {
            return res.status(400).json({ message: "role, email and password are required." });
        }
        if (!["patient", "manager"].includes(role)) {
            return res.status(400).json({ message: "Invalid role." });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters." });
        }

        // Duplicate email check
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Build user data
        const userData = { ...req.body, password: hashedPassword };

        const user = await User.create(userData);
        const token = signToken(user);

        return res.status(201).json({
            message: "Account created successfully.",
            token,
            user: safeUser(user),
        });
    } catch (err) {
        console.error("Register error:", err.message);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const { role, email, password } = req.body;

        if (!role || !email || !password) {
            return res.status(400).json({ message: "role, email and password are required." });
        }

        // Find user by email & role
        const user = await User.findOne({ email: email.toLowerCase().trim(), role });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = signToken(user);

        return res.status(200).json({
            message: "Login successful.",
            token,
            user: safeUser(user),
        });
    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
});


// ─── Middleware: verify JWT ──────────────────────────────────────────────
const authenticate = (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token provided.' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  – fetch own profile
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.json({ user });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/auth/me  – update own profile (only safe fields)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/me', authenticate, async (req, res) => {
    const ALLOWED = [
        'fullName', 'mobile', 'gender', 'age', 'city', 'state', 'healthCondition',
        'dob', 'address', 'pin', 'blood', 'weight', 'height',
        'allergy', 'meds',
        'ecName', 'ecRel', 'ecPhone',
        'drName', 'drSpec', 'drPhone', 'drHosp',
    ];
    const updates = {};
    ALLOWED.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: false }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.json({ message: 'Profile updated.', user });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
