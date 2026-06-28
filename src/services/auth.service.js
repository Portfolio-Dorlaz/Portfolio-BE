import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { signAccessToken } from "../utils/jwt.js";

export const registerService = async ({ fullName, email, password }) => {
  if (!fullName || !email || !password) {
    throw new Error("Missing information register!");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("The email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: "USER",
    },
  });

  const accessToken = signAccessToken(user);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    accessToken,
  };
};

export const loginService = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Missing email or password");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Email or password incorrect!");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Email or password incorrect!");
  }

  const accessToken = signAccessToken(user);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    accessToken,
  };
};

export const getMeService = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};