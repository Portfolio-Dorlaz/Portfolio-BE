import express from "express";
import {
  createPostController,
  getPublishedPostsController,
  getPostBySlugController,
  getAllPostsAdminController,
  updatePostController,
  deletePostController,
} from "../controllers/post.controller.js";
import { uploadSingleImage } from "../middleware/upload.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getPublishedPostsController);
router.get("/admin/all", authMiddleware, getAllPostsAdminController);
router.get("/:slug", getPostBySlugController);

router.post("/", authMiddleware, uploadSingleImage, createPostController);
router.put("/:id", authMiddleware, uploadSingleImage, updatePostController);
router.delete("/:id", authMiddleware, deletePostController);

export default router;