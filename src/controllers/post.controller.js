import {
  createPostService,
  getPublishedPostsService,
  getPostBySlugService,
  getAllPostsAdminService,
  updatePostService,
  deletePostService,
} from "../services/post.service.js";

export const createPostController = async (req, res) => {
  try {
    const post = await createPostService(req.user?.userId, req.body, req.file);
    return res.status(201).json(post);
  } catch (error) {
    const message = error.message || "Tạo bài viết thất bại";

    if (message === "Không xác định được người tạo bài viết") {
      return res.status(401).json({ message });
    }

    if (message === "Thiếu title, slug hoặc content") {
      return res.status(400).json({ message });
    }

    if (message === "Slug đã tồn tại") {
      return res.status(409).json({ message });
    }

    return res.status(500).json({ message });
  }
};

export const getPublishedPostsController = async (req, res) => {
  try {
    const posts = await getPublishedPostsService();
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPostBySlugController = async (req, res) => {
  try {
    const post = await getPostBySlugService(req.params.slug);
    return res.status(200).json(post);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

export const getAllPostsAdminController = async (req, res) => {
  try {
    const posts = await getAllPostsAdminService();
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePostController = async (req, res) => {
  try {
    const post = await updatePostService(req.params.id, req.user, req.body, req.file);
    return res.status(200).json(post);
  } catch (error) {
    console.error("updatePostController error:", error);

    const status =
      error.message === "Bài viết không tồn tại"
        ? 404
        : error.message === "Bạn không có quyền sửa bài này"
        ? 403
        : error.message === "Slug đã tồn tại"
        ? 409
        : 400;

    return res.status(status).json({ message: error.message });
  }
};

export const deletePostController = async (req, res) => {
  try {
    const result = await deletePostService(req.params.id, req.user);
    return res.status(200).json(result);
  } catch (error) {
    const status =
      error.message === "Bài viết không tồn tại"
        ? 404
        : error.message === "Bạn không có quyền xóa bài này"
        ? 403
        : 400;

    return res.status(status).json({ message: error.message });
  }
};