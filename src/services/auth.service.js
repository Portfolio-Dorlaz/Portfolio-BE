import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { signAccessToken } from "../utils/jwt.js";

export const registerService = async ({ fullName, email, password }) => {
  if (!fullName || !email || !password) {
    throw new Error("Thiếu thông tin đăng ký");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email đã tồn tại");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
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
    throw new Error("Thiếu email hoặc mật khẩu");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Email hoặc mật khẩu không đúng");
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
    throw new Error("Không tìm thấy user");
  }

  return user;
};