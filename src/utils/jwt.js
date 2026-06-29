import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret) {
  throw new Error('Missing JWT_ACCESS_SECRET');
}

if (!refreshSecret) {
  throw new Error('Missing JWT_REFRESH_SECRET');
}

export const signAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    accessSecret,
    { expiresIn: '15m' }
  );
};

export const signRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
    },
    refreshSecret,
    { expiresIn: '7d' }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, accessSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshSecret);
};