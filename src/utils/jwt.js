import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret) {
  throw new Error("Missing JWT_ACCESS_SECRET");
}

if (!refreshSecret) {
  throw new Error("Missing JWT_REFRESH_SECRET");
}

export const signAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    accessSecret,
    { expiresIn: "15m" }
  );
};

export const signRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
    },
    refreshSecret,
    { expiresIn: "7d" }
  );
};

export const verifyAccessToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Access token is required");
  }

  return jwt.verify(token.trim(), accessSecret);
};

export const verifyRefreshToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Refresh token is required");
  }

  return jwt.verify(token.trim(), refreshSecret);
};

export const getBearerTokenFromHeader = (authorization) => {
  if (!authorization || typeof authorization !== "string") {
    return null;
  }

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice(7).trim();
  return token || null;
};