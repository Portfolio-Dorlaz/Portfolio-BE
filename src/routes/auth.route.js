import express from "express";
import {
  registerController,
  loginController,
  meController,
  refreshController,
  logoutController,
  registerAdminControllers,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/register/admin", registerAdminControllers);
router.post("/login", loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);
router.get("/me", authMiddleware, meController);

export default router;