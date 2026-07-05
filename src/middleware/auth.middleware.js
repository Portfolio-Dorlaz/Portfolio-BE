import { getBearerTokenFromHeader, verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
      return res.status(401).json({ message: "Access token is required" });
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: error.message || "Invalid access token",
    });
  }
};