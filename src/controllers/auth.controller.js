import {
  registerService,
  loginService,
  getMeService,
} from "../services/auth.service.js";

export const registerController = async (req, res) => {
  try {
    const data = await registerService(req.body);
    return res.status(201).json(data);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const loginController = async (req, res) => {
  try {
    const data = await loginService(req.body);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(401).json({ message: error.message });
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