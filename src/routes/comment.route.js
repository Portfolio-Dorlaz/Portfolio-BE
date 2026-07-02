import express from "express";
import {
  createCommentController,
  getCommentsByPostController,
  getCommentByIdController,
  getAllCommentsAdminController,
  updateCommentController,
  deleteCommentController,
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/admin", authMiddleware, getAllCommentsAdminController);
router.get("/post/:postId", getCommentsByPostController);
router.get("/:commentId", getCommentByIdController);
router.post("/", authMiddleware, createCommentController);
router.put("/:commentId", authMiddleware, updateCommentController);
router.delete("/:commentId", authMiddleware, deleteCommentController);

export default router;