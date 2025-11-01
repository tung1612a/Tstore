import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (err) {
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    res.status(401).json({ message: "No token provided" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "devadmin")) next();
  else res.status(403).json({ message: "Admin access required" });
};

export const sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === "seller") next();
  else res.status(403).json({ message: "Seller access required" });
};

export const adminOrSeller = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "seller")) next();
  else res.status(403).json({ message: "Admin or Seller access required" });
};

export const shipperOnly = (req, res, next) => {
  if (req.user && req.user.role === "shipper") next();
  else res.status(403).json({ message: "Shipper access required" });
};

export const adminOrShipper = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "shipper")) next();
  else res.status(403).json({ message: "Admin or Shipper access required" });
};