import express from "express";
import {
  createPostController,
  getPublishedPostsController,
  getPostBySlugController,
  getAllPostsAdminController,
  updatePostController,
  deletePostController,
} from "../controllers/post.controller.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { uploadSingleImage } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", getPublishedPostsController);
router.get("/admin/all", verifyAccessToken, getAllPostsAdminController);
router.get("/:slug", getPostBySlugController);

router.post("/", verifyAccessToken, uploadSingleImage, createPostController);
router.put("/:id", verifyAccessToken, uploadSingleImage, updatePostController);
router.delete("/:id", verifyAccessToken, deletePostController);

export default router;