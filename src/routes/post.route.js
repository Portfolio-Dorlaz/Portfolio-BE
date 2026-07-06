import express from "express";
import {
  createPostController,
  getPublishedPostsController,
  getPostBySlugController,
  getAllPostsAdminController,
  updatePostController,
  deletePostController,
} from "../controllers/post.controller.js";
import { uploadPostImages  } from "../middleware/upload.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getPublishedPostsController);
router.get("/admin/all", authMiddleware, getAllPostsAdminController);
router.get("/:slug", getPostBySlugController);

router.post("/", authMiddleware, uploadPostImages , createPostController);
router.put("/:id", authMiddleware, uploadPostImages , updatePostController);
router.delete("/:id", authMiddleware, deletePostController);

export default router;