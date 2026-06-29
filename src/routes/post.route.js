import express from "express";
import {
  createPostController,
  getPublishedPostsController,
  getPostBySlugController,
  getAllPostsAdminController,
  updatePostController,
  deletePostController,
} from "../controllers/post.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", getPublishedPostsController);
router.get("/admin/all", authMiddleware, requireAdmin, getAllPostsAdminController);
router.get("/:slug", getPostBySlugController);

router.post( "/", authMiddleware, requireAdmin, upload.single("thumbnail"), createPostController);

router.post("/", authMiddleware, requireAdmin, createPostController);
router.patch("/:id", authMiddleware, updatePostController);
router.delete("/:id", authMiddleware, deletePostController);

export default router;