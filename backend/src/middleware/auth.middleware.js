import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyToken(token);
    req.user = decoded; // { userId, companyId, role, email }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}
