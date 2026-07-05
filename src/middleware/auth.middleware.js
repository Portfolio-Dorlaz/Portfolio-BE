import { getBearerTokenFromHeader, verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  try {
    const token = getBearerTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Access token is required" });
    }

    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    return res.status(401).json({
      message: error.message || "Invalid access token",
    });
  }
};