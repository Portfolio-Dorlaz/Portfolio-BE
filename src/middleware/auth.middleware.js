import { getBearerTokenFromHeader, verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  try {
    const token = getBearerTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        message: "Thiếu access token",
      });
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: error.message || "Token không hợp lệ",
    });
  }
};