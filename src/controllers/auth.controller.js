import {
  registerService,
  loginService,
  getMeService,
  refreshTokenService,
} from "../services/auth.service.js";
import { refreshCookieOptions } from "../utils/cookie.js";

export const registerController = async (req, res) => {
  try {
    const data = await registerService(req.body);

    res.cookie("refreshToken", data.refreshToken, refreshCookieOptions);

    return res.status(201).json({
      user: data.user,
      accessToken: data.accessToken,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const loginController = async (req, res) => {
  try {
    const data = await loginService(req.body);

    res.cookie("refreshToken", data.refreshToken, refreshCookieOptions);

    return res.status(200).json({
      user: data.user,
      accessToken: data.accessToken,
    });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

export const refreshController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const data = await refreshTokenService(refreshToken);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const meController = async (req, res) => {
  try {
    const user = await getMeService(req.user.userId);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};