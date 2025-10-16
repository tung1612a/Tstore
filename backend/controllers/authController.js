import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, role, active, avatarURL } = req.body;

    if (!fullName || !email || !password) return res.status(400).json({ message: "fullName, email and password are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Validate role if provided
    const allowedRoles = ["customer", "seller", "admin"];
    const finalRole = role && allowedRoles.includes(role) ? role : undefined;

    const user = await User.create({ fullName, email, password, phone, role: finalRole, active, avatarURL });

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    res.status(201).json(userObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    // Accept either email or username from frontend (frontend may send `username` field)
    const { email, username, password } = req.body;
    const identifier = email || username;
    if (!identifier || !password) return res.status(400).json({ message: "Email/username and password are required" });

    // Try to find user by email or fullName (username maps to fullName in the user model)
    const user = await User.findOne({ $or: [{ email: identifier }, { fullName: identifier }] });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Remove password before returning user object
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
